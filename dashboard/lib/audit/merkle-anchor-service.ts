import 'server-only';
import crypto from 'crypto';
import prisma from '@/lib/prisma';

// ═══════════════════════════════════════════════════════════════
// MERKLE ANCHOR SERVICE
// ═══════════════════════════════════════════════════════════════

export class MerkleAnchorService {
  /**
   * Build Merkle tree from event hashes
   */
  buildMerkleTree(hashes: string[]): { root: string; tree: string[][] } {
    if (hashes.length === 0) {
      return { root: '0'.repeat(64), tree: [] };
    }

    const tree: string[][] = [hashes];
    let currentLevel = hashes;

    while (currentLevel.length > 1) {
      const nextLevel: string[] = [];

      for (let i = 0; i < currentLevel.length; i += 2) {
        const left = currentLevel[i];
        const right = currentLevel[i + 1] || left; // Duplicate if odd

        const combined = crypto
          .createHash('sha256')
          .update(left + right)
          .digest('hex');

        nextLevel.push(combined);
      }

      tree.push(nextLevel);
      currentLevel = nextLevel;
    }

    return {
      root: currentLevel[0],
      tree,
    };
  }

  /**
   * Create daily Merkle anchor
   */
  async createDailyAnchor(date: Date): Promise<{
    anchorId: string;
    merkleRoot: string;
    eventCount: number;
  }> {
    const periodStart = new Date(date);
    periodStart.setHours(0, 0, 0, 0);

    const periodEnd = new Date(date);
    periodEnd.setHours(23, 59, 59, 999);

    // Get all events for the period
    const events = await (prisma as any).evidenceEvent.findMany({
      where: {
        occurredAt: {
          gte: periodStart,
          lte: periodEnd,
        },
      },
      orderBy: { sequenceNumber: 'asc' },
      select: { payloadHash: true },
    });

    const hashes = events.map((e: any) => e.payloadHash);
    const { root } = this.buildMerkleTree(hashes);

    const anchorId = `ANCHOR-${date.toISOString().split('T')[0]}-${Date.now()}`;

    // Store anchor
    await (prisma as any).merkleAnchor.create({
      data: {
        anchorId: anchorId,
        periodStart: periodStart,
        periodEnd: periodEnd,
        eventCount: events.length,
        merkleRoot: root,
        witnesses: [],
        createdAt: new Date(),
      },
    });

    return {
      anchorId,
      merkleRoot: root,
      eventCount: events.length,
    };
  }

  /**
   * Add external witness to anchor
   */
  async addWitness(
    anchorId: string,
    witness: {
      target: string;
      timestamp: string;
      proof: string;
      provider?: string;
    }
  ): Promise<void> {
    const anchor = await (prisma as any).merkleAnchor.findUnique({
      where: { anchorId: anchorId },
    });

    if (!anchor) {
      throw new Error('Anchor not found');
    }

    const witnesses = anchor.witnesses as any[];
    witnesses.push(witness);

    await (prisma as any).merkleAnchor.update({
      where: { anchorId: anchorId },
      data: { witnesses },
    });
  }

  /**
   * Verify Merkle proof
   */
  verifyProof(
    leafHash: string,
    proof: string[],
    positions: ('left' | 'right')[],
    root: string
  ): boolean {
    let currentHash = leafHash;

    for (let i = 0; i < proof.length; i++) {
      const siblingHash = proof[i];
      const position = positions[i];

      if (position === 'left') {
        currentHash = crypto
          .createHash('sha256')
          .update(siblingHash + currentHash)
          .digest('hex');
      } else {
        currentHash = crypto
          .createHash('sha256')
          .update(currentHash + siblingHash)
          .digest('hex');
      }
    }

    return currentHash === root;
  }
}

// Singleton instance
export const merkleAnchorService = new MerkleAnchorService();

