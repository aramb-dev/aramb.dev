/**
 * AWS Cost Estimator for Self-Hosted AI Solutions
 * This calculator helps estimate the monthly cost of running AI models on AWS EC2
 */

// Base instance pricing (On-Demand, us-east-1 region)
const instancePricing = {
  // G4dn instances (NVIDIA T4 GPUs)
  "g4dn.xlarge": { vCPUs: 4, ram: 16, gpu: "1 x T4 (16GB)", price: 0.526 },
  "g4dn.2xlarge": { vCPUs: 8, ram: 32, gpu: "1 x T4 (16GB)", price: 0.752 },
  "g4dn.4xlarge": { vCPUs: 16, ram: 64, gpu: "1 x T4 (16GB)", price: 1.204 },
  "g4dn.8xlarge": { vCPUs: 32, ram: 128, gpu: "1 x T4 (16GB)", price: 2.176 },
  "g4dn.metal": { vCPUs: 96, ram: 384, gpu: "8 x T4 (16GB each)", price: 7.824 },
  
  // G5 instances (NVIDIA A10G GPUs)
  "g5.xlarge": { vCPUs: 4, ram: 16, gpu: "1 x A10G (24GB)", price: 1.006 },
  "g5.2xlarge": { vCPUs: 8, ram: 32, gpu: "1 x A10G (24GB)", price: 1.13 },
  "g5.4xlarge": { vCPUs: 16, ram: 64, gpu: "1 x A10G (24GB)", price: 1.352 },
  "g5.8xlarge": { vCPUs: 32, ram: 128, gpu: "1 x A10G (24GB)", price: 2.704 },
  "g5.12xlarge": { vCPUs: 48, ram: 192, gpu: "4 x A10G (24GB each)", price: 4.08 },
  "g5.16xlarge": { vCPUs: 64, ram: 256, gpu: "1 x A10G (24GB)", price: 5.408 },
  "g5.24xlarge": { vCPUs: 96, ram: 384, gpu: "4 x A10G (24GB each)", price: 8.112 },
  "g5.48xlarge": { vCPUs: 192, ram: 768, gpu: "8 x A10G (24GB each)", price: 16.288 }
};

// EBS storage pricing
const ebsPricing = {
  "gp3": { price: 0.08, iops: 3000, throughput: 125 }, // price per GB-month
  "gp2": { price: 0.10 }, // price per GB-month
  "io2": { price: 0.125 } // price per GB-month
};

// Data transfer pricing
const dataTransferPricing = {
  inbound: 0, // Free
  outbound: [
    { limit: 1, price: 0 }, // First 1 GB free
    { limit: 10000, price: 0.09 }, // Up to 10 TB
    { limit: 40000, price: 0.085 }, // Next 40 TB
    { limit: 100000, price: 0.07 }, // Next 100 TB
    { limit: Infinity, price: 0.05 } // Beyond 150 TB
  ]
};

/**
 * Calculate monthly EC2 instance cost
 * @param {string} instanceType - The EC2 instance type
 * @param {number} hoursPerDay - Average hours per day the instance will run
 * @param {number} daysPerMonth - Number of days per month (default: 30)
 * @returns {number} Monthly cost in USD
 */
function calculateInstanceCost(instanceType, hoursPerDay, daysPerMonth = 30) {
  if (!instancePricing[instanceType]) {
    throw new Error(`Unknown instance type: ${instanceType}`);
  }
  
  const hourlyRate = instancePricing[instanceType].price;
  const monthlyHours = hoursPerDay * daysPerMonth;
  
  return hourlyRate * monthlyHours;
}

/**
 * Calculate monthly EBS storage cost
 * @param {number} sizeGB - Storage size in GB
 * @param {string} volumeType - EBS volume type (default: 'gp3')
 * @returns {number} Monthly cost in USD
 */
function calculateStorageCost(sizeGB, volumeType = 'gp3') {
  if (!ebsPricing[volumeType]) {
    throw new Error(`Unknown volume type: ${volumeType}`);
  }
  
  return sizeGB * ebsPricing[volumeType].price;
}

/**
 * Calculate data transfer cost
 * @param {number} outboundGB - Outbound data in GB
 * @returns {number} Monthly cost in USD
 */
function calculateDataTransferCost(outboundGB) {
  if (outboundGB <= 0) return 0;
  
  let cost = 0;
  let remainingGB = outboundGB;
  
  for (let i = 0; i < dataTransferPricing.outbound.length; i++) {
    const tier = dataTransferPricing.outbound[i];
    const nextTier = dataTransferPricing.outbound[i + 1];
    
    if (!nextTier) {
      // This is the last tier
      cost += remainingGB * tier.price;
      break;
    }
    
    const tierLimit = tier.limit;
    const nextTierLimit = nextTier.limit;
    const tierSize = nextTierLimit - tierLimit;
    
    if (remainingGB <= tierSize) {
      cost += remainingGB * tier.price;
      break;
    } else {
      cost += tierSize * tier.price;
      remainingGB -= tierSize;
    }
  }
  
  return cost;
}

/**
 * Calculate total monthly cost
 * @param {Object} options - Calculation options
 * @param {string} options.instanceType - EC2 instance type
 * @param {number} options.hoursPerDay - Hours per day the instance runs
 * @param {number} options.storageGB - EBS storage in GB
 * @param {string} options.volumeType - EBS volume type
 * @param {number} options.dataTransferGB - Outbound data transfer in GB
 * @returns {Object} Cost breakdown and total
 */
function calculateTotalCost(options) {
  const {
    instanceType = 'g5.4xlarge',
    hoursPerDay = 8,
    storageGB = 250,
    volumeType = 'gp3',
    dataTransferGB = 50
  } = options;
  
  const instanceCost = calculateInstanceCost(instanceType, hoursPerDay);
  const storageCost = calculateStorageCost(storageGB, volumeType);
  const dataTransferCost = calculateDataTransferCost(dataTransferGB);
  
  const totalCost = instanceCost + storageCost + dataTransferCost;
  
  return {
    breakdown: {
      instance: instanceCost.toFixed(2),
      storage: storageCost.toFixed(2),
      dataTransfer: dataTransferCost.toFixed(2)
    },
    total: totalCost.toFixed(2),
    instanceDetails: instancePricing[instanceType]
  };
}

// Example usage:
// const cost = calculateTotalCost({
//   instanceType: 'g5.4xlarge',
//   hoursPerDay: 8,
//   storageGB: 250,
//   dataTransferGB: 50
// });
// console.log(cost);

// Export the cost calculator functions
module.exports = {
  calculateInstanceCost,
  calculateStorageCost,
  calculateDataTransferCost,
  calculateTotalCost,
  instancePricing,
  ebsPricing,
  dataTransferPricing
};
