output "alb_dns_name" {
  description = "Public URL of the Application Load Balancer"
  value       = aws_lb.production_alb.dns_name
}

output "rds_endpoint" {
  description = "Connection endpoint for the AWS RDS MySQL database"
  value       = aws_db_instance.production_db.endpoint
}
