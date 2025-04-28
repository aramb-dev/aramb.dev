#!/bin/bash

# Code-Server Installation Script for AWS EC2
# This script installs Code-Server and sets it up as a systemd service

set -e

echo "===== Code-Server Installation Script ====="
echo "Installing Code-Server on AWS EC2..."

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo "Please run this script as root or with sudo"
  exit 1
fi

# Install dependencies
echo "Installing dependencies..."
apt-get update
apt-get install -y curl wget git unzip

# Install Code-Server
echo "Installing Code-Server..."
curl -fsSL https://code-server.dev/install.sh | sh

# Create config directory if it doesn't exist
mkdir -p /home/ubuntu/.config/code-server

# Create config file
echo "Configuring Code-Server..."
cat > /home/ubuntu/.config/code-server/config.yaml << 'EOF'
bind-addr: 0.0.0.0:8080
auth: password
password: $(openssl rand -hex 16)
cert: false
EOF

# Fix permissions
chown -R ubuntu:ubuntu /home/ubuntu/.config

# Create systemd service file for Code-Server
echo "Setting up Code-Server as a systemd service..."
cat > /etc/systemd/system/code-server.service << 'EOF'
[Unit]
Description=Code Server Service
After=network.target

[Service]
Type=simple
User=ubuntu
ExecStart=/usr/bin/code-server
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd, enable and start Code-Server service
systemctl daemon-reload
systemctl enable code-server
systemctl start code-server

# Allow Code-Server port through firewall
echo "Configuring firewall..."
ufw allow 8080/tcp
ufw status

# Display password
echo "===== Code-Server Installation Complete ====="
echo "Code-Server is now running as a service on port 8080"
echo "Your password is stored in /home/ubuntu/.config/code-server/config.yaml"
echo "To view your password, run: cat /home/ubuntu/.config/code-server/config.yaml | grep password"
echo "To check status: systemctl status code-server"
echo ""
echo "IMPORTANT: This setup uses HTTP. For production use, configure Nginx with SSL as described in the setup guide."
