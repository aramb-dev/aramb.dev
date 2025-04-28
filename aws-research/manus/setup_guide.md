# Self-Hosted AI Agent on AWS EC2: Comprehensive Setup Guide

This guide provides detailed instructions for setting up a self-hosted AI agent on AWS EC2, including Ollama for running AI models, Code-Server for remote development, and Nginx with SSL for secure access. It also includes auto-shutdown functionality to manage costs.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [EC2 Instance Selection](#ec2-instance-selection)
3. [Initial EC2 Setup](#initial-ec2-setup)
4. [Installing Ollama](#installing-ollama)
5. [Installing Code-Server](#installing-code-server)
6. [Configuring Nginx with SSL](#configuring-nginx-with-ssl)
7. [Setting Up Auto-Shutdown](#setting-up-auto-shutdown)
8. [Loading and Using AI Models](#loading-and-using-ai-models)
9. [Troubleshooting](#troubleshooting)
10. [Cost Management](#cost-management)

## Prerequisites

Before you begin, you'll need:

- An AWS account with permissions to create EC2 instances, IAM roles, Lambda functions, and EventBridge rules
- A domain name for SSL configuration (optional but recommended)
- Basic familiarity with Linux command line and AWS services
- SSH client for connecting to your EC2 instance

## EC2 Instance Selection

Based on the AI models you plan to use (Qwen2.5-Coder-7B/3B, deepseek-coder-6.7B, WaveCoder-Ultra-6.7B, Phi-3.5-mini-instruct, Llama 3 70B Instruct, Mistral 7B & Mixtral 8X7B, StarCoder), we recommend the following instance types:

### For Smaller Models (up to 7B parameters)
- **g4dn.xlarge**: 1x NVIDIA T4 GPU (16 GB VRAM), 4 vCPU, 16 GiB RAM
  - Good for models like Qwen2.5-Coder-3B, deepseek-coder-6.7B, Phi-3.5-mini-instruct, Mistral 7B

### For Medium Models (up to 13B parameters)
- **g4dn.2xlarge**: 1x NVIDIA T4 GPU (16 GB VRAM), 8 vCPU, 32 GiB RAM
  - Better CPU performance for the same GPU as g4dn.xlarge

### For Larger Models (Mixtral 8X7B, quantized Llama 3 70B)
- **g5.xlarge**: 1x NVIDIA A10G GPU (24 GB VRAM), 4 vCPU, 16 GiB RAM
  - Better for Mixtral 8X7B with appropriate quantization
- **g5.12xlarge**: 4x NVIDIA A10G GPUs (96 GB total VRAM), 48 vCPU, 192 GiB RAM
  - Required for running Llama 3 70B with minimal quantization

For this guide, we'll assume you've selected a g4dn.xlarge or g5.xlarge instance, which offers a good balance of performance and cost for most use cases.

## Initial EC2 Setup

1. **Launch an EC2 Instance**:
   - Sign in to the AWS Management Console
   - Navigate to EC2 and click "Launch Instance"
   - Choose Ubuntu Server 22.04 LTS as the AMI
   - Select your preferred instance type (g4dn.xlarge or g5.xlarge)
   - Configure instance details (default settings are usually fine)
   - Add storage (recommend at least 200 GB gp3 EBS volume)
   - Add tags (optional)
   - Configure security group to allow:
     - SSH (port 22) from your IP
     - HTTP (port 80) from anywhere
     - HTTPS (port 443) from anywhere
   - Review and launch with your key pair

2. **Connect to Your Instance**:
   ```bash
   ssh -i /path/to/your-key.pem ubuntu@your-instance-public-ip
   ```

3. **Update System Packages**:
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

4. **Install NVIDIA Drivers** (required for GPU instances):
   ```bash
   sudo apt install -y build-essential
   sudo apt install -y linux-headers-$(uname -r)
   sudo apt install -y nvidia-driver-535 nvidia-utils-535
   ```

5. **Install Docker** (optional, but useful for some AI models):
   ```bash
   sudo apt install -y apt-transport-https ca-certificates curl software-properties-common
   curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
   sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
   sudo apt update
   sudo apt install -y docker-ce
   sudo usermod -aG docker ubuntu
   ```

6. **Reboot the instance**:
   ```bash
   sudo reboot
   ```

## Installing Ollama

1. **Copy the Ollama installation script** to your EC2 instance using SCP:
   ```bash
   scp -i /path/to/your-key.pem /path/to/install_ollama.sh ubuntu@your-instance-public-ip:~/
   ```

2. **Make the script executable and run it**:
   ```bash
   chmod +x install_ollama.sh
   sudo ./install_ollama.sh
   ```

3. **Verify Ollama installation**:
   ```bash
   systemctl status ollama
   ```

4. **Pull a test model**:
   ```bash
   ollama pull phi3:mini-instruct
   ```

## Installing Code-Server

1. **Copy the Code-Server installation script** to your EC2 instance:
   ```bash
   scp -i /path/to/your-key.pem /path/to/install_code_server.sh ubuntu@your-instance-public-ip:~/
   ```

2. **Make the script executable and run it**:
   ```bash
   chmod +x install_code_server.sh
   sudo ./install_code_server.sh
   ```

3. **Get the Code-Server password**:
   ```bash
   cat ~/.config/code-server/config.yaml | grep password
   ```

4. **Access Code-Server** by navigating to `http://your-instance-public-ip:8080` in your browser and entering the password.

## Configuring Nginx with SSL

1. **Register a domain name** and point it to your EC2 instance's public IP address by creating an A record in your DNS settings.

2. **Copy the Nginx installation script** to your EC2 instance:
   ```bash
   scp -i /path/to/your-key.pem /path/to/install_nginx_ssl.sh ubuntu@your-instance-public-ip:~/
   ```

3. **Make the script executable and run it with your domain name**:
   ```bash
   chmod +x install_nginx_ssl.sh
   sudo ./install_nginx_ssl.sh yourdomain.com your-email@example.com
   ```

4. **Verify Nginx and SSL configuration**:
   ```bash
   sudo nginx -t
   ```

5. **Access your services** securely:
   - Code-Server: `https://yourdomain.com/`
   - Ollama API: `https://yourdomain.com/ollama/`

## Setting Up Auto-Shutdown

To minimize costs, you can set up automatic shutdown and startup of your EC2 instance during non-usage hours.

1. **Create an IAM Role** with the following permissions:
   - AmazonEC2FullAccess
   - CloudWatchEventsFullAccess
   - AWSLambda_FullAccess

2. **Copy the Lambda function scripts and setup script** to your EC2 instance:
   ```bash
   scp -i /path/to/your-key.pem /path/to/lambda_stop_ec2.py /path/to/lambda_start_ec2.py /path/to/setup_auto_shutdown.sh ubuntu@your-instance-public-ip:~/
   ```

3. **Make the script executable and run it**:
   ```bash
   chmod +x setup_auto_shutdown.sh
   ./setup_auto_shutdown.sh your-instance-id your-aws-region your-iam-role-name
   ```

4. **Verify the EventBridge rules** in the AWS Management Console:
   - Navigate to Amazon EventBridge > Rules
   - You should see two rules: `StartEC2InstancesRule` and `StopEC2InstancesRule`

## Loading and Using AI Models

### Loading Models in Ollama

1. **Pull your desired models**:
   ```bash
   ollama pull qwen2:7b-coder
   ollama pull deepseek-coder:6.7b
   ollama pull phi3:mini-instruct
   ollama pull mistral:7b-instruct
   ollama pull mixtral:8x7b-instruct
   ollama pull starcoder2:15b
   ```

2. **Test a model**:
   ```bash
   ollama run phi3:mini-instruct "Write a hello world program in Python"
   ```

### Using Models via API

You can interact with your models via the Ollama API:

```bash
curl -X POST https://yourdomain.com/ollama/api/generate -d '{
  "model": "phi3:mini-instruct",
  "prompt": "Write a hello world program in Python"
}'
```

### Using Models in Code-Server

1. Create a new Python file in Code-Server
2. Install the Ollama Python client:
   ```bash
   pip install ollama
   ```
3. Use the following code to interact with your models:
   ```python
   import ollama

   response = ollama.chat(model='phi3:mini-instruct', messages=[
       {
           'role': 'user',
           'content': 'Write a hello world program in Python'
       }
   ])

   print(response['message']['content'])
   ```

## Troubleshooting

### Ollama Issues

- **Service not starting**: Check logs with `journalctl -u ollama`
- **GPU not detected**: Verify NVIDIA drivers with `nvidia-smi`
- **Out of memory errors**: Try using a smaller model or increase instance size

### Code-Server Issues

- **Service not starting**: Check logs with `journalctl -u code-server`
- **Can't access interface**: Verify firewall settings and that the service is running

### Nginx Issues

- **SSL certificate errors**: Ensure your domain is correctly pointing to your EC2 instance
- **502 Bad Gateway**: Check that the backend services (Ollama, Code-Server) are running

## Cost Management

To manage costs effectively:

1. **Use the auto-shutdown functionality** to stop the instance during non-usage hours
2. **Monitor your usage** with AWS Cost Explorer
3. **Consider Reserved Instances** for long-term usage to save 30-60% compared to On-Demand pricing
4. **Use smaller models** when possible to allow for smaller instance types
5. **Delete unused EBS volumes** and release Elastic IPs when not in use

For detailed cost estimates, refer to the `cost_estimate.md` document.

---

This guide provides a comprehensive setup for a self-hosted AI agent on AWS EC2. By following these instructions, you'll have a secure, cost-effective environment for running AI models and remote development.
