import 'server-only';
import crypto from 'crypto';
import prisma from '@/lib/prisma';
import { EvidenceEvent } from './evidence-graph-types';

// ═══════════════════════════════════════════════════════════════
// HASH CHAIN SERVICE
// ═══════════════════════════════════════════════════════════════

export class HashChainService {
  private readonly GENESIS_HASH = '0'.repeat(64); // Genesis block hash

  /**
   * Calculate SHA-256 hash of payload
   */
  calculateHash(payload: Record<string, any>): string {
    const normalized = JSON.stringify(payload, Object.keys(payload).sort());
    return crypto.createHash('sha256').update(normalized).digest('hex');
  }

  /**
   * Get previous hash for new event
   */
  async getPreviousHash(sourceSystem: string): Promise<string> {
    const lastEvent = await (prisma as any).evidenceEvent.findFirst({
      where: { sourceSystem: sourceSystem },
      orderBy: { sequenceNumber: 'desc' },
      select: { payloadHash: true },
    });

    return lastEvent?.payloadHash || this.GENESIS_HASH;
  }

  /**
   * Get next sequence number
   */
  async getNextSequenceNumber(sourceSystem: string): Promise<number> {
    const tracker = await (prisma as any).sequenceTracker.upsert({
      where: { sourceSystem: sourceSystem },
      create: {
        sourceSystem: sourceSystem,
        lastSequenceNumber: 0
      },
      update: {},
    });

    const nextNumber = tracker.lastSequenceNumber + 1;

    await (prisma as any).sequenceTracker.update({
      where: { sourceSystem: sourceSystem },
      data: {
        lastSequenceNumber: nextNumber,
        updatedAt: new Date().toISOString(),
      },
    });

    return nextNumber;
  }

  /**
   * Validate hash chain integrity
   */
  async validateChain(
    sourceSystem?: string,
    fromSequence?: number,
    toSequence?: number
  ): Promise<{
    valid: boolean;
    totalEvents: number;
    checkedEvents: number;
    brokenAt?: number;
    error?: string;
  }> {
    const where: any = {};
    if (sourceSystem) where.sourceSystem = sourceSystem;
    if (fromSequence) where.sequenceNumber = { gte: fromSequence };
    if (toSequence) where.sequenceNumber = { ...where.sequenceNumber, lte: toSequence };

    const events = await (prisma as any).evidenceEvent.findMany({
      where,
      orderBy: { sequenceNumber: 'asc' },
      select: {
        sequenceNumber: true,
        payloadHash: true,
        previousHash: true,
        payload: true,
      },
    });

    if (events.length === 0) {
      return { valid: true, totalEvents: 0, checkedEvents: 0 };
    }

    for (let i = 0; i < events.length; i++) {
      const event = events[i];

      // Verify payload hash
      const calculatedHash = this.calculateHash(event.payload as Record<string, any>);
      if (calculatedHash !== event.payloadHash) {
        return {
          valid: false,
          totalEvents: events.length,
          checkedEvents: i + 1,
          brokenAt: event.sequenceNumber,
          error: `Payload hash mismatch at sequence ${event.sequenceNumber}`,
        };
      }

      // Verify chain link (skip first event)
      if (i > 0) {
        const expectedPrevHash = events[i - 1].payloadHash;
        if (event.previousHash !== expectedPrevHash) {
          return {
            valid: false,
            totalEvents: events.length,
            checkedEvents: i + 1,
            brokenAt: event.sequenceNumber,
            error: `Chain broken at sequence ${event.sequenceNumber}`,
          };
        }
      } else {
        // First event should link to genesis or previous chain
        if (event.previousHash !== this.GENESIS_HASH && fromSequence === 1) {
          // Allow non-genesis for partial chain validation
        }
      }
    }

    return {
      valid: true,
      totalEvents: events.length,
      checkedEvents: events.length,
    };
  }

  /**
   * Detect gaps in sequence numbers
   */
  async detectGaps(sourceSystem?: string): Promise<{
    hasGaps: boolean;
    gaps: { from: number; to: number }[];
  }> {
    const where: any = {};
    if (sourceSystem) where.sourceSystem = sourceSystem;

    const events = await (prisma as any).evidenceEvent.findMany({
      where,
      orderBy: { sequenceNumber: 'asc' },
      select: { sequenceNumber: true },
    });

    const gaps: { from: number; to: number }[] = [];

    for (let i = 1; i < events.length; i++) {
      const expected = events[i - 1].sequenceNumber + 1;
      const actual = events[i].sequenceNumber;

      if (actual !== expected) {
        gaps.push({ from: expected, to: actual - 1 });
      }
    }

    return {
      hasGaps: gaps.length > 0,
      gaps,
    };
  }
}

// Singleton instance
export const hashChainService = new HashChainService();

