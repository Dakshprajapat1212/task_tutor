# --- 1. SNS Alerting Topic & Email Subscription ---
resource "aws_sns_topic" "alerts" {
  name = "task-tutor-alerts-topic"

  tags = {
    Name        = "TaskTutor-Alerts-Topic"
    Environment = "Production"
    ManagedBy   = "Terraform"
  }
}

resource "aws_sns_topic_subscription" "email_alerts" {
  topic_arn = aws_sns_topic.alerts.arn
  protocol  = "email"
  endpoint  = "dakshprajapat1212@gmail.com" # 👈 REPLACE WITH YOUR REAL EMAIL
}

# --- 2. Alarm: ALB 5xx Server Errors ---
resource "aws_cloudwatch_metric_alarm" "alb_5xx_alarm" {
  alarm_name          = "TaskTutor-ALB-5xx-High"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "HTTPCode_Target_5XX_Count"
  namespace           = "AWS/ApplicationELB"
  period              = 60 # 1 minute
  statistic           = "Sum"
  threshold           = 1 # Triggers if 1 or more 5xx errors occur in 1 min
  alarm_description   = "Triggers when ALB encounters 5xx backend server errors."
  alarm_actions       = [aws_sns_topic.alerts.arn]

  dimensions = {
    TargetGroup  = aws_lb_target_group.production_tg.arn_suffix
    LoadBalancer = aws_lb.production_alb.arn_suffix
  }
}

# --- 3. Alarm: ASG High CPU Utilization (> 85%) ---
resource "aws_cloudwatch_metric_alarm" "asg_high_cpu" {
  alarm_name          = "TaskTutor-ASG-CPU-High"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = 2
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = 120 # 2 minutes
  statistic           = "Average"
  threshold           = 85.0
  alarm_description   = "Triggers when ASG cluster CPU exceeds 85% for 4 minutes."
  alarm_actions       = [aws_sns_topic.alerts.arn]

  dimensions = {
    AutoScalingGroupName = aws_autoscaling_group.production_asg.name
  }
}

# --- 4. Alarm: RDS Database High CPU (> 80%) ---
resource "aws_cloudwatch_metric_alarm" "rds_high_cpu" {
  alarm_name          = "TaskTutor-RDS-CPU-High"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = 2
  metric_name         = "CPUUtilization"
  namespace           = "AWS/RDS"
  period              = 300 # 5 minutes
  statistic           = "Average"
  threshold           = 80.0
  alarm_description   = "Triggers when RDS MySQL CPU exceeds 80%."
  alarm_actions       = [aws_sns_topic.alerts.arn]

  dimensions = {
    DBInstanceIdentifier = aws_db_instance.production_db.identifier
  }
}

