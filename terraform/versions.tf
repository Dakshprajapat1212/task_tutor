terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Production Remote State Backend with S3 + DynamoDB State Locking
  # Note: For initial bootstrap, the S3 bucket and DynamoDB table are created once manually or via bootstrap module.
  backend "s3" {
    bucket         = "task-tutor-terraform-state-prod"
    key            = "prod/infrastructure.tfstate"
    region         = "us-east-1"
    dynamodb_table = "task-tutor-tf-locks"
    encrypt        = true
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "TaskTutor-LMS"
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}
