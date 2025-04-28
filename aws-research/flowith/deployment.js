/**
 * Deployment scripts for setting up Ollama, LocalGPT, and other AI services
 * on AWS EC2 instances
 */

// Initial server setup commands
const initialSetup = `
# Update system and install dependencies
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl wget build-essential cmake nvidia-driver-525
`;

// Docker and NVIDIA Container Toolkit setup
const dockerSetup = `
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install NVIDIA Container Toolkit
distribution=$(. /etc/os-release;echo $ID$VERSION_ID)
curl -s -L https://nvidia.github.io/nvidia-docker/gpgkey | sudo apt-key add -
curl -s -L https://nvidia.github.io/nvidia-docker/$distribution/nvidia-docker.list | sudo tee /etc/apt/sources.list.d/nvidia-docker.list
sudo apt-get update && sudo apt-get install -y nvidia-container-toolkit
sudo systemctl restart docker

# Verify installation
docker run --rm --gpus all nvidia/cuda:11.8.0-base-ubuntu22.04 nvidia-smi
`;

// Ollama setup commands
const ollamaSetup = `
# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Start Ollama service
systemctl --user enable ollama
systemctl --user start ollama

# Pull models (examples)
ollama pull llama3
ollama pull phi3
ollama pull deepseek-coder
`;

// LocalGPT setup commands
const localGPTSetup = `
# Clone the LocalGPT repository
git clone https://github.com/PromtEngineer/localGPT.git
cd localGPT

# Set up with Docker
docker build -t localgpt .
docker run -d --gpus all -p 5000:5000 -v $(pwd):/app localgpt
`;

// Code-Server setup commands
const codeServerSetup = `
# Install Code-Server
curl -fsSL https://code-server.dev/install.sh | sh

# Start and enable the service
sudo systemctl enable --now code-server@$USER

# Configure Code-Server
mkdir -p ~/.config/code-server
cat > ~/.config/code-server/config.yaml << EOF
bind-addr: 127.0.0.1:8080
auth: password
password: your_secure_password
cert: false
EOF

# Restart Code-Server
sudo systemctl restart code-server@$USER

# Install useful extensions
code-server --install-extension ms-python.python
code-server --install-extension ms-toolsai.jupyter
code-server --install-extension ms-azuretools.vscode-docker
code-server --install-extension visualstudioexptteam.vscodeintellicode
`;

// Systemd service file for Ollama
const ollamaSystemdService = `
[Unit]
Description=Ollama AI Service
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu
ExecStart=/usr/local/bin/ollama serve
Restart=always
RestartSec=10
Environment=HOME=/home/ubuntu

[Install]
WantedBy=multi-user.target
`;

// Function to run a full deployment
function runFullDeployment() {
  console.log("Starting full deployment...");

  // These would be actual shell commands in a real environment
  console.log("Step 1: Initial system setup");
  console.log(initialSetup);

  console.log("Step 2: Docker and NVIDIA setup");
  console.log(dockerSetup);

  console.log("Step 3: Ollama setup");
  console.log(ollamaSetup);

  console.log("Step 4: Systemd service creation");
  console.log(`Creating /etc/systemd/system/ollama.service with content:`);
  console.log(ollamaSystemdService);

  console.log("Step 5 (Optional): LocalGPT setup");
  console.log(localGPTSetup);

  console.log("Step 6: Code-Server setup");
  console.log(codeServerSetup);

  console.log("Deployment complete!");
}

// Export deployment components
module.exports = {
  initialSetup,
  dockerSetup,
  ollamaSetup,
  localGPTSetup,
  codeServerSetup,
  ollamaSystemdService,
  runFullDeployment
};

// Deployment scripts copy functionality
document.addEventListener('DOMContentLoaded', function () {
  const copyDeploymentBtn = document.getElementById('copyDeploymentBtn');

  if (copyDeploymentBtn) {
    copyDeploymentBtn.addEventListener('click', function () {
      // Get all the script content from the deployment section
      const deploymentSection = document.getElementById('deployment');
      const codeBlocks = deploymentSection.querySelectorAll('pre code');

      // Combine all code blocks into one string
      let allCommands = '';
      codeBlocks.forEach(block => {
        allCommands += block.textContent + '\n\n';
      });

      // Copy to clipboard
      navigator.clipboard.writeText(allCommands)
        .then(() => {
          // Change button text temporarily
          const originalText = copyDeploymentBtn.innerHTML;
          copyDeploymentBtn.innerHTML = '<i data-lucide="check" class="h-4 w-4 mr-2"></i> Copied!';

          // Reinitialize the icon
          lucide.createIcons();

          // Restore button text after 2 seconds
          setTimeout(() => {
            copyDeploymentBtn.innerHTML = originalText;
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
