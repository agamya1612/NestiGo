const { exec } = require('child_process');

const CONTAINERS = [
  'order-service',
  'pricing-service',
  'dispatch-service',
  'catalog-service',
  'nestigo-kafka-prod' // A piece of infrastructure
];

const CHAOS_INTERVAL_MS = 15000; // Kill a container every 15 seconds
const OUTAGE_DURATION_MS = 5000; // Keep it dead for 5 seconds

function runCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.warn(`[WARNING] Command failed: ${command} - ${stderr || error.message}`);
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
}

async function getContainerName(serviceName) {
  return new Promise((resolve) => {
    exec(`docker ps --format "{{.Names}}" | findstr ${serviceName}`, (error, stdout) => {
      if (error || !stdout.trim()) {
        resolve(serviceName); // Fallback to literal
      } else {
        resolve(stdout.trim().split('\n')[0].replace('\r', ''));
      }
    });
  });
}

async function unleashChaos() {
  console.log('🌪️  Chaos Engineering Runner started! 🌪️');
  console.log(`Targeting services: ${CONTAINERS.join(', ')}`);

  setInterval(async () => {
    // Pick a random service
    const targetService = CONTAINERS[Math.floor(Math.random() * CONTAINERS.length)];
    const target = await getContainerName(targetService);
    
    console.log(`\n[CHAOS EVENT] 💥 Killing ${target}...`);
    const stopped = await runCommand(`docker stop ${target}`);
    
    if (stopped) {
      console.log(`[CHAOS EVENT] 💀 ${target} is down. Waiting ${OUTAGE_DURATION_MS}ms...`);
      
      setTimeout(async () => {
        console.log(`[CHAOS EVENT] ⚡ Reviving ${target}...`);
        await runCommand(`docker start ${target}`);
        console.log(`[CHAOS EVENT] 🟢 ${target} is back online!`);
      }, OUTAGE_DURATION_MS);
    }
  }, CHAOS_INTERVAL_MS);
}

unleashChaos();
