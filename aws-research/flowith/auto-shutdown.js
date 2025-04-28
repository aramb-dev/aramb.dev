/**
 * AWS EC2 Auto-Shutdown Script
 * This script can be used to automatically shut down idle EC2 instances to save costs
 * It monitors CPU usage, user activity, and running processes to determine if an instance is idle
 */

// Configuration
const CONFIG = {
  idleTimeThreshold: 30, // Minutes of inactivity before shutdown
  loadThreshold: 0.1,    // Load average threshold (1-minute)
  excludeProcesses: ["ollama", "code-server"], // Processes to exclude from activity check
  cpuThreshold: 5.0,     // CPU usage percentage threshold for active processes
  idleCpuPercentage: 95.0 // CPU idle percentage threshold for system idle check
};

/**
 * Check if a specific process is actively using CPU
 * @param {string} processName - The name of the process to check
 * @returns {boolean} - True if the process is active, false otherwise
 */
function isProcessActive(processName) {
  // In a real environment, this would use child_process.exec to run:
  // ps aux | grep processName | grep -v grep | awk '{sum+=$3} END {print sum}'
  console.log(`Checking if ${processName} is active...`);
  return false; // Simulated result
}

/**
 * Check if there are active SSH connections
 * @returns {boolean} - True if active SSH connections exist, false otherwise
 */
function hasActiveSshConnections() {
  // In a real environment, this would use child_process.exec to run:
  // netstat -tn | grep :22 | grep ESTABLISHED | wc -l
  console.log('Checking for active SSH connections...');
  return false; // Simulated result
}

/**
 * Check if the system load is below the threshold
 * @returns {boolean} - True if the system load is below threshold, false otherwise
 */
function isSystemLoadBelowThreshold() {
  // In a real environment, this would read from /proc/loadavg
  console.log('Checking system load...');
  return true; // Simulated result
}

/**
 * Check if any users are logged in
 * @returns {boolean} - True if users are logged in, false otherwise
 */
function areUsersLoggedIn() {
  // In a real environment, this would use child_process.exec to run:
  // w -i | grep -v JCPU | awk '{print $5}'
  console.log('Checking for logged in users...');
  return false; // Simulated result
}

/**
 * Check if the CPU has been idle for a significant period
 * @returns {boolean} - True if CPU is idle, false otherwise
 */
function isCpuIdle() {
  // In a real environment, this would read from /proc/stat
  console.log('Checking if CPU is idle...');
  return true; // Simulated result
}

/**
 * Main function to check if the instance should be shut down
 */
function checkAndShutdown() {
  console.log('Starting shutdown check...');

  // Check if any excluded processes are active
  for (const process of CONFIG.excludeProcesses) {
    if (isProcessActive(process)) {
      console.log(`Process ${process} is active. Aborting shutdown.`);
      return;
    }
  }

  // Check if system load is below threshold
  if (isSystemLoadBelowThreshold()) {
    console.log(`System load is below threshold (${CONFIG.loadThreshold}).`);

    // Check for active SSH connections
    if (hasActiveSshConnections()) {
      console.log('Active SSH connections found. Aborting shutdown.');
      return;
    }

    // Check if users are logged in
    if (areUsersLoggedIn()) {
      console.log('Active users detected. Aborting shutdown.');
      return;
    }

    // Check if CPU is idle
    if (isCpuIdle()) {
      console.log(`System is idle (CPU idle > ${CONFIG.idleCpuPercentage}%). Initiating shutdown...`);
      // In a real environment, this would use child_process.exec to run:
      // sudo shutdown -h now
      console.log('Auto-shutdown initiated.');
    } else {
      console.log('System not idle enough. Aborting shutdown.');
    }
  } else {
    console.log(`System load is above threshold (${CONFIG.loadThreshold}). Aborting shutdown.`);
  }
}

// In a real implementation, this would be called by a cron job
checkAndShutdown();

console.log(`
# To set up as a cron job:
# Run: crontab -e
# Add the following line to run the check every 15 minutes:
*/15 * * * * /home/ubuntu/auto-shutdown.sh >> /home/ubuntu/auto-shutdown.log 2>&1
`);

// Auto-shutdown script handler
document.addEventListener('DOMContentLoaded', function () {
  // Generate the auto-shutdown script based on user inputs
  function generateShutdownScript(idleTime = 30, excludeUsers = ['root', 'ubuntu']) {
    const scriptTemplate = `#!/bin/bash
# Auto Shutdown Script for Idle EC2 Instance
# This script will shutdown the instance after ${idleTime} minutes of no active SSH connections
# Excluding monitoring from users: ${excludeUsers.join(', ')}

# Create log file
LOGFILE="/var/log/auto-shutdown.log"
touch $LOGFILE
echo "$(date): Auto-shutdown service started" >> $LOGFILE

# Function to check if any excluded users are logged in
function check_excluded_users() {
  for user in ${excludeUsers.map(u => `"${u}"`).join(' ')}; do
    if who | grep -q "$user"; then
      return 0
    fi
  done
  return 1
}

# Function to check if anyone is logged in via SSH
function check_ssh_connections() {
  # Count SSH connections excluding the excluded users
  connections=$(who | grep -v "${excludeUsers.map(u => `${u}`).join('\\|')}" | wc -l)
  echo "$(date): Detected $connections active SSH connections" >> $LOGFILE
  return $connections
}

# Monitor loop
while true; do
  # Check if any excluded users are logged in (skip shutdown check if yes)
  if check_excluded_users; then
    echo "$(date): Excluded user logged in, skipping idle check" >> $LOGFILE
    sleep 60
    continue
  fi

  # Check for SSH connections
  check_ssh_connections
  if [ $? -eq 0 ]; then
    echo "$(date): No active SSH connections, waiting ${idleTime} minutes before shutdown" >> $LOGFILE

    # Sleep for the idle time, checking every minute if someone connects
    for ((i=1; i<=${idleTime}; i++)); do
      sleep 60
      check_ssh_connections
      if [ $? -gt 0 ]; then
        echo "$(date): New SSH connection detected, cancelling shutdown" >> $LOGFILE
        break
      fi

      # Check if we've reached the end of the wait period
      if [ $i -eq ${idleTime}; then
        echo "$(date): No activity after ${idleTime} minutes, shutting down" >> $LOGFILE
        sudo shutdown -h now
      fi
    done
  else
    echo "$(date): Active SSH connections found, waiting 5 minutes before checking again" >> $LOGFILE
    sleep 300
  fi
done`;

    return scriptTemplate;
  }

  // Generate install script
  function generateInstallScript(idleTime = 30, excludeUsers = ['root', 'ubuntu']) {
    return `#!/bin/bash
# Auto Shutdown Setup Script

# Create the auto-shutdown script
cat > /usr/local/bin/auto-shutdown.sh << 'EOL'
${generateShutdownScript(idleTime, excludeUsers)}
EOL

# Make the script executable
chmod +x /usr/local/bin/auto-shutdown.sh

# Create systemd service file
cat > /etc/systemd/system/auto-shutdown.service << 'EOL'
[Unit]
Description=Auto shutdown EC2 instance when idle
After=network.target

[Service]
Type=simple
ExecStart=/usr/local/bin/auto-shutdown.sh
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOL

# Enable and start the service
systemctl daemon-reload
systemctl enable auto-shutdown.service
systemctl start auto-shutdown.service

echo "Auto-shutdown service has been installed and started"
echo "The instance will automatically shutdown after ${idleTime} minutes without SSH connections"
echo "Excluded users: ${excludeUsers.join(', ')}"
`;
  }

  // Add handlers for the auto-shutdown form
  const shutdownForm = document.getElementById('shutdownForm');
  if (shutdownForm) {
    shutdownForm.addEventListener('submit', function (e) {
      e.preventDefault();

      // Get form values
      const idleTime = document.getElementById('idleTime')?.value || 30;
      const excludeUsersInput = document.getElementById('excludeUsers')?.value || 'root,ubuntu';
      const excludeUsers = excludeUsersInput.split(',').map(user => user.trim()).filter(user => user);

      // Generate script
      const script = generateInstallScript(idleTime, excludeUsers);

      // Update script content
      const scriptContainer = document.getElementById('shutdownScript');
      if (scriptContainer) {
        scriptContainer.textContent = script;

        // If using syntax highlighting, update it
        if (window.Prism) {
          Prism.highlightElement(scriptContainer);
        }
      }
    });
  }

  const copyShutdownScriptBtn = document.getElementById('copyShutdownScriptBtn');

  if (copyShutdownScriptBtn) {
    copyShutdownScriptBtn.addEventListener('click', function () {
      // Get the script content from the pre tag
      const scriptContent = document.querySelector('#auto-shutdown pre code').textContent;

      // Copy to clipboard
      navigator.clipboard.writeText(scriptContent)
        .then(() => {
          // Change button text temporarily
          const originalText = copyShutdownScriptBtn.innerHTML;
          copyShutdownScriptBtn.innerHTML = '<i data-lucide="check" class="h-4 w-4 mr-2"></i> Copied!';

          // Reinitialize the icon
          lucide.createIcons();

          // Restore button text after 2 seconds
          setTimeout(() => {
            copyShutdownScriptBtn.innerHTML = originalText;
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
