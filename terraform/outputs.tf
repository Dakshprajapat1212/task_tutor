output "server_public_ip" {
  description = "Public IP address of the deployed EC2 server"
  value       = aws_instance.production_server.public_ip
}
