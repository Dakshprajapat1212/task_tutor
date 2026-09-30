terraform {
  required_version = ">= 1.0.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# --- Data Sources ---
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"]

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

data "aws_vpc" "default" {
  default = true
}

# Filter default subnets excluding us-east-1e (which lacks t3.micro hardware)
data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }

  filter {
    name   = "availability-zone"
    values = ["us-east-1a", "us-east-1b", "us-east-1c", "us-east-1d", "us-east-1f"]
  }
}

# --- SSH Key Pair ---
resource "aws_key_pair" "deployer_key" {
  key_name   = "task-tutor-deployer-key"
  public_key = file("~/.ssh/task_tutor_key.pub")
}

# --- Secrets & SSM Parameter Store ---
resource "random_password" "db_password" {
  length  = 16
  special = false
}

resource "aws_ssm_parameter" "db_password" {
  name        = "/tasktutor/production/db_password"
  description = "Database master password for TaskTutor Laravel Backend"
  type        = "SecureString"
  value       = random_password.db_password.result
}

# Generate base64 APP_KEY for Laravel Sanctum & API Encryption
resource "random_bytes" "app_key_bytes" {
  length = 32
}

resource "aws_ssm_parameter" "app_key" {
  name        = "/tasktutor/production/app_key"
  description = "Laravel Application Encryption Key"
  type        = "SecureString"
  value       = "base64:${random_bytes.app_key_bytes.base64}"
}

# --- IAM Role & Instance Profile ---
resource "aws_iam_role" "ec2_ecr_role" {
  name = "task_tutor_ec2_ecr_role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "ecr_read_only" {
  role       = aws_iam_role.ec2_ecr_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
}

resource "aws_iam_role_policy_attachment" "ssm_read_only" {
  role       = aws_iam_role.ec2_ecr_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMReadOnlyAccess"
}

resource "aws_iam_role_policy_attachment" "ssm_managed_instance" {
  role       = aws_iam_role.ec2_ecr_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_iam_instance_profile" "ec2_ecr_profile" {
  name = "task_tutor_ec2_ecr_profile"
  role = aws_iam_role.ec2_ecr_role.name
}

# --- Security Groups ---

# 1. ALB Security Group (Public HTTP/HTTPS)
resource "aws_security_group" "alb_sg" {
  name        = "task-tutor-alb-sg"
  description = "Allow inbound HTTP/HTTPS traffic to Load Balancer"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "TaskTutor-ALB-SG"
  }
}

# 2. EC2 Security Group (Traffic from ALB + SSH)
resource "aws_security_group" "ec2_sg" {
  name        = "task-tutor-ec2-sg"
  description = "Allow HTTP traffic from ALB and SSH"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    from_port       = 80
    to_port         = 80
    protocol        = "tcp"
    security_groups = [aws_security_group.alb_sg.id]
  }

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "TaskTutor-EC2-SG"
  }
}

# 3. RDS Database Security Group (Inbound MySQL 3306 from EC2 instances only)
resource "aws_security_group" "db_sg" {
  name        = "task-tutor-db-sg"
  description = "Allow MySQL access from EC2 instances"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    from_port       = 3306
    to_port         = 3306
    protocol        = "tcp"
    security_groups = [aws_security_group.ec2_sg.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "TaskTutor-DB-SG"
  }
}

# --- AWS Managed RDS MySQL Database ---
resource "aws_db_instance" "production_db" {
  allocated_storage      = 20
  max_allocated_storage  = 50
  engine                 = "mysql"
  engine_version         = "8.0"
  instance_class         = "db.t3.micro"
  db_name                = "tasktutor_db"
  username               = "tasktutor_user"
  password               = random_password.db_password.result
  parameter_group_name   = "default.mysql8.0"
  publicly_accessible    = false
  vpc_security_group_ids = [aws_security_group.db_sg.id]
  skip_final_snapshot    = true

  tags = {
    Name        = "TaskTutor-Production-RDS"
    Environment = "Production"
    ManagedBy   = "Terraform"
  }
}

# --- Application Load Balancer (ALB) ---
resource "aws_lb" "production_alb" {
  name               = "task-tutor-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb_sg.id]
  subnets            = data.aws_subnets.default.ids

  tags = {
    Name        = "TaskTutor-ALB"
    Environment = "Production"
    ManagedBy   = "Terraform"
  }
}

resource "aws_lb_target_group" "production_tg" {
  name        = "task-tutor-tg"
  port        = 80
  protocol    = "HTTP"
  vpc_id      = data.aws_vpc.default.id
  target_type = "instance"

  health_check {
    path                = "/"
    protocol            = "HTTP"
    matcher             = "200-399"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 3
  }
}

resource "aws_lb_listener" "front_end" {
  load_balancer_arn = aws_lb.production_alb.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.production_tg.arn
  }
}

# --- Launch Template ---
resource "aws_launch_template" "production_lt" {
  name_prefix            = "task-tutor-lt-"
  image_id               = data.aws_ami.ubuntu.id
  instance_type          = var.instance_type
  key_name               = aws_key_pair.deployer_key.key_name
  vpc_security_group_ids = [aws_security_group.ec2_sg.id]

  iam_instance_profile {
    name = aws_iam_instance_profile.ec2_ecr_profile.name
  }

  user_data = base64encode(<<-EOF
              #!/bin/bash
              set -e
              apt-get update -y
              apt-get install -y docker.io awscli jq

              systemctl start docker
              systemctl enable docker
              usermod -aG docker ubuntu

              # Authenticate Docker to ECR via IAM Instance Profile
              aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 347181052564.dkr.ecr.us-east-1.amazonaws.com

              # Fetch APP_KEY and DB Password from SSM Parameter Store
              APP_KEY=$(aws ssm get-parameter --name "/tasktutor/production/app_key" --with-decryption --region us-east-1 --query "Parameter.Value" --output text)
              DB_PASS=$(aws ssm get-parameter --name "/tasktutor/production/db_password" --with-decryption --region us-east-1 --query "Parameter.Value" --output text)

              # DB Host from RDS Endpoint
              DB_HOST="${aws_db_instance.production_db.address}"

              # Create Shared Docker Network
              docker network create task_tutor_net || true

              # Pull Latest Images from ECR
              docker pull 347181052564.dkr.ecr.us-east-1.amazonaws.com/task-tutor-backend:latest
              docker pull 347181052564.dkr.ecr.us-east-1.amazonaws.com/task-tutor-frontend:latest

              # Run Backend Container (PHP-FPM) connected to AWS RDS with APP_KEY
              docker run -d \
                --name backend \
                --network task_tutor_net \
                -e APP_KEY="$APP_KEY" \
                -e APP_ENV=production \
                -e APP_DEBUG=false \
                -e DB_CONNECTION=mysql \
                -e DB_HOST=$DB_HOST \
                -e DB_PORT=3306 \
                -e DB_DATABASE=tasktutor_db \
                -e DB_USERNAME=tasktutor_user \
                -e DB_PASSWORD=$DB_PASS \
                --restart always \
                347181052564.dkr.ecr.us-east-1.amazonaws.com/task-tutor-backend:latest

              # Ensure storage framework directories exist with proper permissions
              docker exec backend mkdir -p /var/www/storage/framework/sessions /var/www/storage/framework/views /var/www/storage/framework/cache /var/www/storage/logs
              docker exec backend chown -R www-data:www-data /var/www/storage
              docker exec backend chmod -R 775 /var/www/storage

              # Execute database migrations on AWS RDS automatically
              sleep 5
              docker exec backend php artisan migrate --force || true

              # Run Frontend Container (React + Nginx) on Port 80
              docker run -d \
                --name frontend \
                --network task_tutor_net \
                -p 80:80 \
                --restart always \
                347181052564.dkr.ecr.us-east-1.amazonaws.com/task-tutor-frontend:latest
              EOF
  )

  tag_specifications {
    resource_type = "instance"
    tags = {
      Name        = "TaskTutor-ASG-Instance"
      Environment = "Production"
      ManagedBy   = "Terraform"
    }
  }
}

# --- Auto Scaling Group (ASG) ---
resource "aws_autoscaling_group" "production_asg" {
  name_prefix         = "task-tutor-asg-"
  vpc_zone_identifier = data.aws_subnets.default.ids
  target_group_arns   = [aws_lb_target_group.production_tg.arn]

  min_size         = 1
  max_size         = 3
  desired_capacity = 2

  health_check_type         = "ELB"
  health_check_grace_period = 300

  launch_template {
    id      = aws_launch_template.production_lt.id
    version = "$Latest"
  }

  tag {
    key                 = "Name"
    value               = "TaskTutor-ASG-Node"
    propagate_at_launch = true
  }

  lifecycle {
    create_before_destroy = true
  }
}

# --- Auto Scaling Policy 1: CPU > 70% Target Tracking ---
resource "aws_autoscaling_policy" "cpu_target_tracking" {
  name                   = "task-tutor-cpu-70-policy"
  autoscaling_group_name = aws_autoscaling_group.production_asg.name
  policy_type            = "TargetTrackingScaling"

  target_tracking_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ASGAverageCPUUtilization"
    }

    target_value = 70.0
  }
}

# --- Auto Scaling Policy 2: Real User Traffic (ALB Request Count Per Target) ---
resource "aws_autoscaling_policy" "alb_traffic_target_tracking" {
  name                   = "task-tutor-alb-traffic-policy"
  autoscaling_group_name = aws_autoscaling_group.production_asg.name
  policy_type            = "TargetTrackingScaling"

  target_tracking_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ALBRequestCountPerTarget"
      resource_label         = "${aws_lb.production_alb.arn_suffix}/${aws_lb_target_group.production_tg.arn_suffix}"
    }

    target_value = 1000.0
  }
}
