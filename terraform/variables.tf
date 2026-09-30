variable "aws_region" {
  description = "AWS Cloud Region"
  type        = string
  default     = "us-east-1"
}

variable "instance_type" {
  description = "AWS EC2 Instance Type (Free Tier Eligible)"
  type        = string
  default     = "t3.micro"
}
