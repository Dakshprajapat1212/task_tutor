# 1. Security Group for Application Load Balancer (Public Facing)
resource "aws_security_group" "alb" {
  name        = "${var.environment}-alb-sg"
  description = "Allows incoming HTTP/HTTPS traffic from anywhere on the internet"
  vpc_id      = aws_vpc.main.id

  ingress {
    description = "HTTP from Internet"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS from Internet"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    description = "Allow all outbound traffic to instances"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.environment}-alb-sg"
  }
}

# 2. Security Group for EC2 Backend Instances (Zero-Trust)
resource "aws_security_group" "app" {
  name        = "${var.environment}-app-sg"
  description = "Allows HTTP traffic strictly from ALB security group"
  vpc_id      = aws_vpc.main.id

  # Ingress strictly chained to the ALB SG: NO direct public access!
  ingress {
    description     = "HTTP from ALB Only"
    from_port       = 80
    to_port         = 80
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  egress {
    description = "Outbound to internet via NAT Gateway (updates, external APIs)"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.environment}-app-sg"
  }
}

# 3. Security Group for RDS MySQL Database (Chained to App SG)
resource "aws_security_group" "rds" {
  name        = "${var.environment}-rds-sg"
  description = "Allows MySQL traffic strictly from EC2 Backend instances"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "MySQL from App Instances Only"
    from_port       = 3306
    to_port         = 3306
    protocol        = "tcp"
    security_groups = [aws_security_group.app.id]
  }

  egress {
    description = "No outbound access required"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.environment}-rds-sg"
  }
}

# 4. Security Group for Redis ElastiCache (Chained to App SG)
resource "aws_security_group" "redis" {
  name        = "${var.environment}-redis-sg"
  description = "Allows Redis traffic strictly from EC2 Backend instances"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "Redis from App Instances Only"
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [aws_security_group.app.id]
  }

  egress {
    description = "No outbound access required"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.environment}-redis-sg"
  }
}
