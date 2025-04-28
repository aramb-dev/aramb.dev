#!/bin/bash

# Ollama Installation Script for AWS EC2
# This script installs Ollama and sets it up as a systemd service
# It also configures the firewall to allow access to Ollama's API port

set -e

echo "===== Ollama Installation Script ====="
echo "Installing Ollama on AWS EC2..."

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo "Please run this script as root or with sudo"
  exit 1
fi

# Install dependencies
echo "Installing dependencies..."
apt-get update
apt-get install -y curl wget git

# Install Ollama
echo "Installing Ollama..."
curl -fsSL https://ollama.com/install.sh | sh

# Create systemd service file for Ollama
echo "Setting up Ollama as a systemd service..."
cat > /etc/systemd/system/ollama.service << 'EOF'
[Unit]
Description=Ollama Service
After=network.target

[Service]
Environment="OLLAMA_HOST=0.0.0.0"
ExecStart=/usr/local/bin/ollama serve
Restart=always
RestartSec=3
User=ubuntu
Group=ubuntu

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd, enable and start Ollama service
systemctl daemon-reload
systemctl enable ollama
systemctl start ollama

# Allow Ollama API port through firewall
echo "Configuring firewall..."
ufw allow 11434/tcp
ufw status

echo "===== Ollama Installation Complete ====="
echo "Ollama is now running as a service on port 11434"
echo "You can pull models using: ollama pull <model-name>"
echo "Example models to try:"
echo "  - ollama pull qwen2:7b-coder"
echo "  - ollama pull deepseek-coder:6.7b"
echo "  - ollama pull phi3:mini-instruct"
echo "  - ollama pull mistral:7b-instruct"
echo "  - ollama pull mixtral:8x7b-instruct"
echo "  - ollama pull starcoder2:15b"
echo ""
echo "To check status: systemctl status ollama"
