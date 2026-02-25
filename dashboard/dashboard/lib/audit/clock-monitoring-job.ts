import 'server-only';
import prisma from '@/lib/prisma';
import { eventIngestionService } from './event-ingestion-service';
import { alertService } from './alert-service';

// ═══════════════════════════════════════════════════════════════
// CLOCK MONITORING SERVICE
// ═══════════════════════════════════════════════════════════════

export class ClockMonitoringService {
  private intervalId: NodeJS.Timeout | null = null;
  private warningThresholds: Record<string, number> = {
    GDPR_72H: 12,    // 12 hours before deadline
    DORA_4H: 1,      // 1 hour before deadline
    DORA_24H: 4,     // 4 hours before deadline
    NIS2_24H: 4,     // 4 hours before deadline
    NIS2_72H: 12,    // 12 hours before deadline
  };

  /**
   * Start clock monitoring
   */
  start(intervalMinutes: number = 5) {
    console.log(`Starting clock monitoring (every ${intervalMinutes} minutes)`);

    // Run immediately
    this.checkClocks();

    // Schedule periodic checks
    this.intervalId = setInterval(
      () => this.checkClocks(),
      intervalMinutes * 60 * 1000
    );
  }

  /**
   * Stop clock monitoring
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Check all running clocks
   */
  async checkClocks() {
    try {
      const runningClocks = await (prisma as any).evidenceClock.findMany({
        where: { status: 'RUNNING' },
      });

      const now = new Date();

      for (const clock of runningClocks) {
        const deadline = new Date(clock.deadline);
        const hoursRemaining = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);

        // Check for breach
        if (hoursRemaining <= 0) {
          await this.handleBreach(clock);
          continue;
        }

        // Check for warning
        const warningThreshold = this.warningThresholds[clock.clockType] || 2;
        if (hoursRemaining <= warningThreshold && !clock.warningSent) {
          await this.sendWarning(clock, hoursRemaining);
        }
      }
    } catch (error) {
      console.error('Clock monitoring error:', error);
    }
  }

  /**
   * Handle clock breach
   */
  private async handleBreach(clock: any) {
    console.log(`Clock BREACHED: ${clock.clockId} (${clock.clockType})`);

    await eventIngestionService.updateClockStatus(clock.clockId, 'BREACHED');

    // Calculate overdue hours
    const now = new Date();
    const deadline = new Date(clock.deadline);
    const overdueHours = (now.getTime() - deadline.getTime()) / (1000 * 60 * 60);

    // Create breach alert
    try {
      await alertService.createClockBreachAlert({
        clock_id: clock.clockId,
        clock_type: clock.clockType,
        regulation: clock.regulation,
        article: clock.article,
        deadline: clock.deadline,
        related_event_id: clock.relatedEventId,
      }, overdueHours);
    } catch (error) {
      console.error('Failed to create breach alert:', error);
    }
  }

  /**
   * Send warning before deadline
   */
  private async sendWarning(clock: any, hoursRemaining: number) {
    console.log(`Clock WARNING: ${clock.clockId} - ${hoursRemaining.toFixed(1)}h remaining`);

    // Mark warning as sent
    await (prisma as any).evidenceClock.update({
      where: { clockId: clock.clockId },
      data: {
        warningSent: true,
        warningSentAt: new Date(),
      },
    });

    // Create warning alert
    try {
      await alertService.createClockWarningAlert({
        clock_id: clock.clockId,
        clock_type: clock.clockType,
        regulation: clock.regulation,
        article: clock.article,
        deadline: clock.deadline,
        related_event_id: clock.relatedEventId,
      }, hoursRemaining);
    } catch (error) {
      console.error('Failed to create warning alert:', error);
    }

    // Create warning event
    await eventIngestionService.createEvent({
      eventType: 'CLOCK.WARNING',
      sourceSystem: 'audit',
      correlationId: clock.relatedEventId,
      severity: 'HIGH',
      payload: {
        clockId: clock.clockId,
        clockType: clock.clockType,
        hoursRemaining: hoursRemaining.toFixed(1),
        deadline: clock.deadline,
      },
      autoTriggerClocks: false,
    });
  }
}

// Singleton instance
export const clockMonitoringService = new ClockMonitoringService();

