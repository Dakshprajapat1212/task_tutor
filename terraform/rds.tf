# 1. DB Subnet Group across Private Data Subnets
resource "aws_db_subnet_group" "rds" {
  name        = "${var.environment}-db-subnet-group"
  description = "Subnet group spanning Private Data Subnets across AZ-a and AZ-b"
  subnet_ids  = aws_subnet.private_data[*].id

  tags = {
    Name = "${var.environment}-db-subnet-group"
  }
}

# 2. RDS MySQL Parameter Group with tuned InnoDB Buffers
resource "aws_db_parameter_group" "mysql8" {
  name   = "${var.environment}-mysql8-custom-params"
  family = "mysql8.0"

  # Enforce connection limits and character sets
  parameter {
    name  = "max_connections"
    value = "1000"
  }

  parameter {
    name  = "character_set_server"
    value = "utf8mb4"
  }

  parameter {
    name  = "collation_server"
    value = "utf8mb4_unicode_ci"
  }

  tags = {
    Name = "${var.environment}-mysql8-custom-params"
  }
}

# 3. RDS MySQL Multi-AZ Production Database
resource "aws_db_instance" "mysql" {
  identifier        = "${var.environment}-task-tutor-mysql"
  engine            = "mysql"
  engine_version    = "8.0.35"
  instance_class    = var.db_instance_class
  allocated_storage = var.db_allocated_storage
  storage_type      = "gp3"
  iops              = 3000
  storage_throughput = 125

  db_name  = var.db_name
  username = var.db_username
  password = var.db_password

  db_subnet_group_name   = aws_db_subnet_group.rds.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  parameter_group_name   = aws_db_parameter_group.mysql8.name

  # Multi-AZ enabled for synchronous replication & instant failover
  multi_az            = true
  publicly_accessible = false
  skip_final_snapshot = true # In production, set to false and configure final_snapshot_identifier

  backup_retention_period = 7
  backup_window           = "03:00-04:00"
  maintenance_window      = "Sun:04:30-Sun:05:30"

  tags = {
    Name = "${var.environment}-task-tutor-mysql"
  }
}
