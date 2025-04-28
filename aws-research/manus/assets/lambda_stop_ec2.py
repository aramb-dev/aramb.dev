import boto3
import os

# AWS Lambda Function to Stop EC2 Instances
# This function stops the EC2 instances specified in the INSTANCE_IDS environment variable

def lambda_handler(event, context):
    # Retrieve instance IDs and region from environment variables
    instance_ids_str = os.environ.get("INSTANCE_IDS")
    region = os.environ.get("AWS_REGION")

    if not instance_ids_str or not region:
        print("Error: INSTANCE_IDS and AWS_REGION environment variables must be set.")
        return {
            "statusCode": 400,
            "body": "INSTANCE_IDS and AWS_REGION environment variables must be set."
        }

    instance_ids = [instance_id.strip() for instance_id in instance_ids_str.split(",")]

    if not instance_ids:
        print("No instance IDs provided in INSTANCE_IDS environment variable.")
        return {
            "statusCode": 400,
            "body": "No instance IDs provided."
        }

    ec2 = boto3.client("ec2", region_name=region)

    try:
        print(f"Attempting to stop instances: {instance_ids} in region {region}")
        ec2.stop_instances(InstanceIds=instance_ids)
        print(f"Successfully initiated stop for instances: {instance_ids}")
        return {
            "statusCode": 200,
            "body": f"Successfully initiated stop for instances: {instance_ids}"
        }
    except Exception as e:
        print(f"Error stopping instances: {e}")
        return {
            "statusCode": 500,
            "body": f"Error stopping instances: {e}"
        }
