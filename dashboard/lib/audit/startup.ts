import { clockMonitoringService } from './clock-monitoring-job';
import { merkleAnchorService } from './merkle-anchor-service';

// ═══════════════════════════════════════════════════════════════
// AUDIT SYSTEM STARTUP
// ═══════════════════════════════════════════════════════════════

let isInitialized = false;

export async function initializeAuditSystem(): Promise<void> {
  if (isInitialized) {
    console.log('Audit system already initialized');
    return;
  }

  console.log('Initializing Veridion Audit System...');

  try {
    // Start clock monitoring (every 5 minutes)
    clockMonitoringService.start(5);
    console.log('✓ Clock monitoring started');

    // Schedule daily Merkle anchoring
    scheduleDailyMerkleAnchor();
    console.log('✓ Daily Merkle anchoring scheduled');

    isInitialized = true;
    console.log('Veridion Audit System initialized successfully');
  } catch (error) {
    console.error('Failed to initialize audit system:', error);
    throw error;
  }
}

export function shutdownAuditSystem(): void {
  console.log('Shutting down Veridion Audit System...');
  clockMonitoringService.stop();
  isInitialized = false;
  console.log('Audit system shutdown complete');
}

function scheduleDailyMerkleAnchor(): void {
  // Run at midnight each day
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  const msUntilMidnight = midnight.getTime() - now.getTime();

  // First run at next midnight
  setTimeout(async () => {
    await createDailyAnchor();
    
    // Then run every 24 hours
    setInterval(createDailyAnchor, 24 * 60 * 60 * 1000);
  }, msUntilMidnight);
}

async function createDailyAnchor(): Promise<void> {
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const result = await merkleAnchorService.createDailyAnchor(yesterday);
    console.log(`Daily Merkle anchor created: ${result.anchorId} (${result.eventCount} events)`);
  } catch (error) {
    console.error('Failed to create daily Merkle anchor:', error);
  }
}
