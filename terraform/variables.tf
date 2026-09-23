variable "aws_region" {
  description = "The AWS Region where resources are deployed"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name (prod, staging, dev)"
  type        = string
  default     = "prod"
}

variable "vpc_cidr" {
  description = "Base CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  description = "List of Availability Zones for high availability"
  type        = list(string)
  default     = ["us-east-1a", "us-east-1b"]
}

variable "public_subnet_cidrs" {
  description = "CIDR blocks for Public Subnets (ALB & NAT Gateways)"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "private_app_subnet_cidrs" {
  description = "CIDR blocks for Private App Subnets (EC2 Laravel nodes)"
  type        = list(string)
  default     = ["10.0.10.0/24", "10.0.20.0/24"]
}

variable "private_data_subnet_cidrs" {
  description = "CIDR blocks for Private Data Subnets (RDS MySQL & Redis)"
  type        = list(string)
  default     = ["10.0.100.0/24", "10.0.200.0/24"]
}

variable "db_instance_class" {
  description = "RDS MySQL instance class sized for 20k concurrent users"
  type        = string
  default     = "db.r6g.xlarge" # 4 vCPU, 32GB RAM (Memory-optimized for InnoDB Buffer Pool)
}

variable "db_allocated_storage" {
  description = "Allocated storage in GB for RDS MySQL (gp3)"
  type        = number
  default     = 100
}

variable "db_name" {
  description = "MySQL database name"
  type        = string
  default     = "task_tutor_db"
}

variable "db_username" {
  description = "Master DB username"
  type        = string
  default     = "tutor_admin"
  sensitive   = true
}

variable "db_password" {
  description = "Master DB password (must be provided via secure SSM/TF_VAR/Vault)"
  type        = string
  sensitive   = true
}
