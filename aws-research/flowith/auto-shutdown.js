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
