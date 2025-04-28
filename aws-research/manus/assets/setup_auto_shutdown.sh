#!/bin/bash

# AWS EC2 Auto-Shutdown Setup Script
# This script sets up AWS Lambda functions and EventBridge rules to automatically
# start and stop EC2 instances based on a schedule

set -e

echo "===== AWS EC2 Auto-Shutdown Setup Script ====="
echo "Setting up auto-shutdown for AWS EC2 instances..."

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "AWS CLI is not installed. Installing..."
    apt-get update
    apt-get install -y python3-pip
    pip3 install awscli
fi

# Check if required parameters are provided
if [ -z "$1" ] || [ -z "$2" ] || [ -z "$3" ]; then
    echo "Usage: $0 <instance-id> <aws-region> <role-name>"
    echo "Example: $0 i-0123456789abcdef0 us-east-1 LambdaEC2Role"
    exit 1
fi

INSTANCE_ID=$1
AWS_REGION=$2
ROLE_NAME=$3

echo "Using Instance ID: $INSTANCE_ID"
echo "Using AWS Region: $AWS_REGION"
echo "Using IAM Role: $ROLE_NAME"

# Create temporary directory for Lambda function code
TEMP_DIR=$(mktemp -d)
echo "Created temporary directory: $TEMP_DIR"

# Copy Lambda function code
cp lambda_stop_ec2.py $TEMP_DIR/lambda_stop_ec2.py
cp lambda_start_ec2.py $TEMP_DIR/lambda_start_ec2.py

# Create ZIP files for Lambda functions
echo "Creating ZIP files for Lambda functions..."
cd $TEMP_DIR
zip stop_ec2_function.zip lambda_stop_ec2.py
zip start_ec2_function.zip lambda_start_ec2.py

# Create Lambda functions
echo "Creating Lambda functions..."
aws lambda create-function \
    --region $AWS_REGION \
    --function-name StopEC2Instances \
    --zip-file fileb://stop_ec2_function.zip \
    --handler lambda_stop_ec2.lambda_handler \
    --runtime python3.9 \
    --role arn:aws:iam::$(aws sts get-caller-identity --query Account --output text):role/$ROLE_NAME \
    --environment "Variables={INSTANCE_IDS=$INSTANCE_ID,AWS_REGION=$AWS_REGION}" \
    --timeout 10

aws lambda create-function \
    --region $AWS_REGION \
    --function-name StartEC2Instances \
    --zip-file fileb://start_ec2_function.zip \
    --handler lambda_start_ec2.lambda_handler \
    --runtime python3.9 \
    --role arn:aws:iam::$(aws sts get-caller-identity --query Account --output text):role/$ROLE_NAME \
    --environment "Variables={INSTANCE_IDS=$INSTANCE_ID,AWS_REGION=$AWS_REGION}" \
    --timeout 10

# Create EventBridge rules for automatic shutdown (weekdays at 8 PM)
echo "Creating EventBridge rule for automatic shutdown (weekdays at 8 PM)..."
aws events put-rule \
    --region $AWS_REGION \
    --name StopEC2InstancesRule \
    --schedule-expression "cron(0 20 ? * MON-FRI *)" \
    --state ENABLED

# Create EventBridge rules for automatic startup (weekdays at 8 AM)
echo "Creating EventBridge rule for automatic startup (weekdays at 8 AM)..."
aws events put-rule \
    --region $AWS_REGION \
    --name StartEC2InstancesRule \
    --schedule-expression "cron(0 8 ? * MON-FRI *)" \
    --state ENABLED

# Add Lambda functions as targets for EventBridge rules
echo "Adding Lambda functions as targets for EventBridge rules..."
aws events put-targets \
    --region $AWS_REGION \
    --rule StopEC2InstancesRule \
    --targets "Id"="1","Arn"="arn:aws:lambda:$AWS_REGION:$(aws sts get-caller-identity --query Account --output text):function:StopEC2Instances"

aws events put-targets \
    --region $AWS_REGION \
    --rule StartEC2InstancesRule \
    --targets "Id"="1","Arn"="arn:aws:lambda:$AWS_REGION:$(aws sts get-caller-identity --query Account --output text):function:StartEC2Instances"

# Add permissions for EventBridge to invoke Lambda functions
echo "Adding permissions for EventBridge to invoke Lambda functions..."
aws lambda add-permission \
    --region $AWS_REGION \
    --function-name StopEC2Instances \
    --statement-id StopEC2InstancesRulePermission \
    --action 'lambda:InvokeFunction' \
    --principal events.amazonaws.com \
    --source-arn arn:aws:events:$AWS_REGION:$(aws sts get-caller-identity --query Account --output text):rule/StopEC2InstancesRule

aws lambda add-permission \
    --region $AWS_REGION \
    --function-name StartEC2Instances \
    --statement-id StartEC2InstancesRulePermission \
    --action 'lambda:InvokeFunction' \
    --principal events.amazonaws.com \
    --source-arn arn:aws:events:$AWS_REGION:$(aws sts get-caller-identity --query Account --output text):rule/StartEC2InstancesRule

# Clean up temporary directory
echo "Cleaning up temporary directory..."
rm -rf $TEMP_DIR

echo "===== AWS EC2 Auto-Shutdown Setup Complete ====="
echo "Your EC2 instance will automatically:"
echo "- Start at 8 AM on weekdays"
echo "- Stop at 8 PM on weekdays"
echo ""
echo "To modify the schedule, use the AWS Management Console or AWS CLI to update the EventBridge rules."
