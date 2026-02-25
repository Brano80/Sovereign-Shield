import 'server-only';
import prisma from "@/lib/prisma";
import { createEvidenceEvent } from "@/lib/audit/evidence-graph";

export class AssetComplianceService {
  private isRunning: boolean = false;
  private intervalId: ReturnType<typeof setInterval> | null = null;

  /**
   * Start compliance monitoring
   */
  async start(intervalHours: number = 24) {
    if (this.isRunning) {
      console.log("Asset compliance monitoring already running");
      return;
    }

    this.isRunning = true;
    console.log(`Starting asset compliance monitoring (interval: ${intervalHours}h)`);

    // Run immediately
    await this.runComplianceCheck();

    // Schedule periodic runs
    this.intervalId = setInterval(async () => {
      if (this.isRunning) {
        await this.runComplianceCheck();
      }
    }, intervalHours * 60 * 60 * 1000);
  }

  /**
   * Stop monitoring
   */
  stop() {
    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    console.log("Asset compliance monitoring stopped");
  }

  /**
   * Run full compliance check
   */
  async runComplianceCheck() {
    console.log("Starting asset compliance check...");
    const startTime = Date.now();

    const results = {
      assetsChecked: 0,
      newViolations: 0,
      resolvedViolations: 0,
      expiredApprovals: 0,
      errors: 0,
    };

    try {
      // 1. Check all active assets against whitelist
      const assets = await (prisma as any).iCTAsset.findMany({
        where: {
          status: { not: "DECOMMISSIONED" },
        },
      });

      for (const asset of assets) {
        try {
          const violationCreated = await this.checkAssetCompliance(asset);
          if (violationCreated) {
            results.newViolations++;
          }
          results.assetsChecked++;
        } catch (error) {
          console.error(`Error checking asset ${asset.assetId}:`, error);
          results.errors++;
        }
      }

      // 2. Check for expired approvals
      results.expiredApprovals = await this.checkExpiredApprovals();

      // 3. Check for resolved violations
      results.resolvedViolations = await this.checkResolvedViolations();

      // 4. Log completion
      const duration = Date.now() - startTime;
      console.log(`Asset compliance check completed in ${duration}ms:`, results);

      // 5. Create Evidence Graph event
      await createEvidenceEvent({
        eventType: "ASSET.COMPLIANCE.CHECK_COMPLETED",
        severity: "INFO",
        regulatoryTags: ["DORA"],
        articles: ["Art.7"],
        metadata: {
          assetsChecked: results.assetsChecked,
          newViolations: results.newViolations,
          resolvedViolations: results.resolvedViolations,
          expiredApprovals: results.expiredApprovals,
          errors: results.errors,
          durationMs: duration,
        },
      });
    } catch (error) {
      console.error("Asset compliance check failed:", error);
    }
  }

  /**
   * Check individual asset compliance
   * Returns true if violation was created
   */
  private async checkAssetCompliance(asset: any): Promise<boolean> {
    const vendor = asset.technicalDetails?.vendor;
    const product = asset.technicalDetails?.product;
    const version = asset.version;

    if (!vendor || !product) return false;

    // Check whitelist
    const whitelistEntry = await (prisma as any).whitelistEntry.findFirst({
      where: {
        vendor,
        product,
        status: "ACTIVE",
      },
    });

    if (!whitelistEntry) {
      // Component not on whitelist
      await this.ensureViolationExists(asset, "UNAPPROVED_COMPONENT", "Component not on whitelist");
      return true;
    }

    // Check if version is blocked
    const blockedVersions = whitelistEntry.blockedVersions as any[] || [];
    const isBlocked = blockedVersions.some((v) => v.version === version);
    if (isBlocked) {
      const blockedVersion = blockedVersions.find((v) => v.version === version);
      await this.ensureViolationExists(
        asset,
        "BLOCKED_VERSION",
        `Version ${version} is blocked: ${blockedVersion?.reason || "Unknown reason"}`
      );
      return true;
    }

    // Check if version is approved
    const approvedVersions = whitelistEntry.approvedVersions as any[] || [];
    const approvedVersion = approvedVersions.find((v) => v.version === version);
    if (!approvedVersion) {
      await this.ensureViolationExists(asset, "UNAPPROVED_COMPONENT", `Version ${version} is not approved`);
      return true;
    }

    // Check if approval expired
    if (approvedVersion.expiresAt && new Date(approvedVersion.expiresAt) < new Date()) {
      await this.ensureViolationExists(asset, "EXPIRED_APPROVAL", "Version approval has expired");
      return true;
    }

    // Asset is compliant - close any existing violations
    await this.closeViolationsForAsset(asset.id);

    // Update compliance status
    await (prisma as any).iCTAsset.update({
      where: { id: asset.id },
      data: {
        compliance: {
          ...asset.compliance,
          complianceStatus: "COMPLIANT",
          lastComplianceCheck: new Date().toISOString(),
        },
      },
    });

    return false;
  }

  /**
   * Ensure violation exists (don't create duplicates)
   */
  private async ensureViolationExists(asset: any, violationType: string, description: string) {
    const existingViolation = await (prisma as any).whitelistViolation.findFirst({
      where: {
        assetId: asset.id,
        violationType,
        status: "OPEN",
      },
    });

    if (existingViolation) return;

    // Create new violation
    const violation = await (prisma as any).whitelistViolation.create({
      data: {
        assetId: asset.id,
        assetName: asset.name,
        violationType,
        description,
        currentVendor: asset.technicalDetails?.vendor || "Unknown",
        currentProduct: asset.technicalDetails?.product || "Unknown",
        currentVersion: asset.version,
        severity: asset.criticality === "CRITICAL" ? "CRITICAL" : "HIGH",
        status: "OPEN",
        resolutionDeadline: this.calculateResolutionDeadline(asset.criticality),
        detectedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });

    // Create Evidence Graph event
    const evidenceEventId = await createEvidenceEvent({
      eventType: "ASSET.WHITELIST.VIOLATION",
      severity: violation.severity,
      regulatoryTags: ["DORA"],
      articles: ["Art.7"],
      metadata: {
        assetId: asset.assetId,
        assetName: asset.name,
        violationType: violation.violationType,
        description,
        severity: violation.severity,
        resolutionDeadline: violation.resolutionDeadline,
      },
    });

    // Update violation with evidence event ID
    await (prisma as any).whitelistViolation.update({
      where: { id: violation.id },
      data: { evidenceEventId },
    });

    // Update asset compliance status
    await (prisma as any).iCTAsset.update({
      where: { id: asset.id },
      data: {
        compliance: {
          ...asset.compliance,
          complianceStatus: "NON_COMPLIANT",
          lastComplianceCheck: new Date().toISOString(),
        },
      },
    });
  }

  /**
   * Close violations for compliant asset
   */
  private async closeViolationsForAsset(assetId: string) {
    const openViolations = await (prisma as any).whitelistViolation.findMany({
      where: {
        assetId,
        status: "OPEN",
      },
    });

    for (const violation of openViolations) {
      await (prisma as any).whitelistViolation.update({
        where: { id: violation.id },
        data: {
          status: "REMEDIATED",
          resolvedAt: new Date().toISOString(),
          resolutionNotes: "Automatically resolved - asset now compliant",
          updatedAt: new Date().toISOString(),
        },
      });
    }
  }

  /**
   * Check for expired whitelist approvals
   */
  private async checkExpiredApprovals(): Promise<number> {
    const entries = await (prisma as any).whitelistEntry.findMany({
      where: { status: "ACTIVE" },
    });

    let expiredCount = 0;
    const now = new Date();

    for (const entry of entries) {
      const approvedVersions = entry.approvedVersions as any[] || [];
      const hasExpired = approvedVersions.some((v) => v.expiresAt && new Date(v.expiresAt) < now);

      if (hasExpired) {
        expiredCount++;
        // Note: We don't automatically remove expired versions, just track them
        // Assets using expired versions will be flagged in compliance check
      }
    }

    return expiredCount;
  }

  /**
   * Check for violations that can be auto-resolved
   */
  private async checkResolvedViolations(): Promise<number> {
    // Check if any open violations have passed their resolution deadline without resolution
    const overdueViolations = await (prisma as any).whitelistViolation.findMany({
      where: {
        status: "OPEN",
        resolutionDeadline: { lt: new Date().toISOString() },
      },
    });

    // For now, we just return count - actual resolution logic can be added later
    return overdueViolations.length;
  }

  private calculateResolutionDeadline(criticality: string): string {
    const daysMap: Record<string, number> = {
      CRITICAL: 7,
      IMPORTANT: 14,
      STANDARD: 30,
      LOW: 90,
    };

    const deadline = new Date();
    deadline.setDate(deadline.getDate() + (daysMap[criticality] || 30));
    return deadline.toISOString();
  }
}

// Singleton instance
export const assetComplianceService = new AssetComplianceService();


