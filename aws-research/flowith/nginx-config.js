// This file contains the Nginx configuration for the self-hosted AI agent setup
// It provides a template for creating a reverse proxy with SSL for Ollama and other services

const generateNginxConfig = (domain, service, port) => {
  return `server {
    listen 80;
    server_name ${domain};

    location / {
        proxy_pass http://localhost:${port};
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket support
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # Increase timeouts for long-running AI queries
        proxy_read_timeout 300s;
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
    }

    # Security headers
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
}`;
};

// Example: Ollama configuration
const ollamaConfig = generateNginxConfig('ai.yourdomain.com', 'ollama', 11434);

// Example: Code-Server configuration
const codeServerConfig = generateNginxConfig('code.yourdomain.com', 'code-server', 8080);

// SSL configuration commands
const sslCommands = `
# Enable the site
sudo ln -s /etc/nginx/sites-available/service_name /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com
`;

// Basic authentication configuration
const basicAuthConfig = `
# Install apache2-utils for htpasswd
sudo apt install -y apache2-utils

# Create password file
sudo htpasswd -c /etc/nginx/.htpasswd yourusername

# Add to your Nginx config inside the location block:
auth_basic "Restricted Access";
auth_basic_user_file /etc/nginx/.htpasswd;
`;

console.log('Nginx configurations generated successfully.');

// Nginx configuration copy functionality
document.addEventListener('DOMContentLoaded', function () {
  const copyNginxConfigBtn = document.getElementById('copyNginxConfigBtn');

  if (copyNginxConfigBtn) {
    copyNginxConfigBtn.addEventListener('click', function () {
      // Get all the script content from the nginx section
      const nginxSection = document.getElementById('nginx');
      const codeBlocks = nginxSection.querySelectorAll('pre code');

      // Combine all code blocks into one string
      let allConfig = '';
      codeBlocks.forEach(block => {
        allConfig += block.textContent + '\n\n';
      });

      // Copy to clipboard
      navigator.clipboard.writeText(allConfig)
        .then(() => {
          // Change button text temporarily
          const originalText = copyNginxConfigBtn.innerHTML;
          copyNginxConfigBtn.innerHTML = '<i data-lucide="check" class="h-4 w-4 mr-2"></i> Copied!';

          // Reinitialize the icon
          lucide.createIcons();

          // Restore button text after 2 seconds
          setTimeout(() => {
            copyNginxConfigBtn.innerHTML = originalText;
            lucide.createIcons();
          }, 2000);
        })
        .catch(err => {
          console.error('Failed to copy text: ', err);
          alert('Failed to copy text. Please try again.');
        });
    });
  }
});
