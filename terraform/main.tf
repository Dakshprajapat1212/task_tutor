terraform {
  required_version = ">= 1.0.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

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

resource "aws_key_pair" "deployer_key" {
  key_name   = "task-tutor-deployer-key"
  public_key = file("~/.ssh/task_tutor_key.pub")
}

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

resource "aws_iam_instance_profile" "ec2_ecr_profile" {
  name = "task_tutor_ec2_ecr_profile"
  role = aws_iam_role.ec2_ecr_role.name
}

resource "aws_security_group" "production_sg" {
  name        = "task-tutor-production-sg"
  description = "Allow HTTP, HTTPS, and SSH traffic"

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 9000
    to_port     = 9000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
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
}

resource "aws_instance" "production_server" {
  ami                  = data.aws_ami.ubuntu.id
  instance_type        = "t3.micro"
  key_name             = aws_key_pair.deployer_key.key_name
  security_groups      = [aws_security_group.production_sg.name]
  iam_instance_profile = aws_iam_instance_profile.ec2_ecr_profile.name

  user_data = <<-EOF
              #!/bin/bash
              set -e
              apt-get update -y
              apt-get install -y docker.io awscli

              systemctl start docker
              systemctl enable docker
              usermod -aG docker ubuntu

              # Authenticate Docker to ECR via IAM Instance Profile
              aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 347181052564.dkr.ecr.us-east-1.amazonaws.com

              # Create Shared Docker Network
              docker network create task_tutor_net || true

              # Pull Latest Images
              docker pull 347181052564.dkr.ecr.us-east-1.amazonaws.com/task-tutor-backend:latest
              docker pull 347181052564.dkr.ecr.us-east-1.amazonaws.com/task-tutor-frontend:latest

              # Run Backend Container (PHP-FPM)
              docker run -d \
                --name backend \
                --network task_tutor_net \
                --restart always \
                347181052564.dkr.ecr.us-east-1.amazonaws.com/task-tutor-backend:latest

              # Run Frontend Container (React + Nginx)
              docker run -d \
                --name frontend \
                --network task_tutor_net \
                -p 80:80 \
                --restart always \
                347181052564.dkr.ecr.us-east-1.amazonaws.com/task-tutor-frontend:latest
              EOF

  tags = {
    Name        = "TaskTutor-Production-Server"
    Environment = "Production"
    ManagedBy   = "Terraform"
  }
}
