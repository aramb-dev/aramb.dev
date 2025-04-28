#!/bin/bash

# Nginx Installation and Configuration Script for AWS EC2
# This script installs Nginx and configures it as a reverse proxy for Ollama and Code-Server
# It also sets up Let's Encrypt SSL certificates

set -e

echo "===== Nginx Installation and Configuration Script ====="
echo "Installing Nginx and configuring SSL on AWS EC2..."

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo "Please run this script as root or with sudo"
  exit 1
fi

# Check if domain name is provided
if [ -z "$1" ]; then
  echo "Please provide your domain name as an argument"
  echo "Usage: $0 yourdomain.com"
  exit 1
fi

DOMAIN=$1
EMAIL=${2:-"admin@$DOMAIN"}

echo "Using domain: $DOMAIN"
echo "Using email: $EMAIL"

# Install Nginx and Certbot
echo "Installing Nginx and Certbot..."
apt-get update
apt-get install -y nginx certbot python3-certbot-nginx

# Configure Nginx for Ollama and Code-Server
echo "Configuring Nginx..."
cat > /etc/nginx/sites-available/$DOMAIN << EOF
server {
    server_name $DOMAIN;

    # Code-Server configuration
    location / {
        proxy_pass http://localhost:8080/;
        proxy_set_header Host \$host;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection upgrade;
        proxy_set_header Accept-Encoding gzip;
    }

    # Ollama API configuration
    location /ollama/ {
        proxy_pass http://localhost:11434/;
        proxy_set_header Host \$host;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection upgrade;
        proxy_set_header Accept-Encoding gzip;
        client_max_body_size 20M;
    }

    # Security headers
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options SAMEORIGIN;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
}
EOF

# Enable the site
ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/

# Test Nginx configuration
nginx -t

# Restart Nginx
systemctl restart nginx

# Allow HTTP and HTTPS through firewall
echo "Configuring firewall..."
ufw allow 'Nginx Full'
ufw status

# Obtain SSL certificate
echo "Obtaining SSL certificate from Let's Encrypt..."
certbot --non-interactive --agree-tos --nginx -d $DOMAIN -m $EMAIL

# Set up auto-renewal for SSL certificates
echo "Setting up auto-renewal for SSL certificates..."
echo "0 3 * * * root certbot renew --quiet" > /etc/cron.d/certbot-renew

echo "===== Nginx Installation and Configuration Complete ====="
echo "Nginx is now configured as a reverse proxy with SSL for:"
echo "- Code-Server: https://$DOMAIN/"
echo "- Ollama API: https://$DOMAIN/ollama/"
echo ""
echo "Your SSL certificate will auto-renew when needed."
