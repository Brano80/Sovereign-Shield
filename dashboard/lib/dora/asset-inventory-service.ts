import 'server-only';
import {
  ICTAsset,
  AssetVersion,
  AssetDependency,
  ExternalInteraction,
  WhitelistEntry,
  WhitelistViolation,
  ICTAssetCategory,
  AssetCriticality,
  ApprovalStatus,
} from "./asset-inventory-types";
import prisma from "@/lib/prisma";
import { createEvidenceEvent } from "@/lib/audit/evidence-graph";
import { AssetAuditHelpers } from "@/lib/audit/lens-helpers";

export class AssetInventoryService {
  // ═══════════════════════════════════════════════════════════════
  // ASSET MANAGEMENT
  // ═══════════════════════════════════════════════════════════════

  /**
   * Register new ICT asset
   */
  async registerAsset(
    data: Omit<ICTAsset, "id" | "assetId" | "status" | "approvalStatus" | "createdAt" | "updatedAt">
  ): Promise<ICTAsset> {
    // Generate asset ID
    const assetId = await this.generateAssetId(data.category);

    // Check whitelist
    const whitelistCheck = await this.checkWhitelist(data);

    const asset = await (prisma as any).iCTAsset.create({
      data: {
        ...data,
        assetId,
        status: "PENDING_APPROVAL",
        approvalStatus: whitelistCheck.approved ? "APPROVED" : "PENDING",
        compliance: {
          ...data.compliance,
          whitelistId: whitelistCheck.whitelistEntryId,
          complianceStatus: whitelistCheck.approved ? "COMPLIANT" : "PENDING_REVIEW",
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });

    // Create Evidence Graph event
    await createEvidenceEvent({
      eventType: "ASSET.REGISTERED",
      severity: data.criticality === "CRITICAL" ? "HIGH" : "MEDIUM",
      regulatoryTags: ["DORA"],
      articles: ["Art.7"],
      metadata: {
        assetId: asset.assetId,
        assetName: asset.name,
        category: asset.category,
        subcategory: asset.subcategory,
        criticality: asset.criticality,
        whitelistApproved: whitelistCheck.approved,
        createdBy: data.createdBy,
      },
    });

    // Audit logging using AssetAuditHelpers
    await AssetAuditHelpers.logAssetRegistered({
      assetId: asset.assetId,
      name: asset.name,
      category: asset.category,
      criticality: asset.criticality,
      owner: data.createdBy || "system",
    }).catch((error) => {
      console.error("Asset registration audit logging failed:", error);
    });

    // If not approved, create violation
    if (!whitelistCheck.approved) {
      await this.createWhitelistViolation(asset, whitelistCheck.reason || "Not on whitelist");
    }

    return asset;
  }

  /**
   * Update asset
   */
  async updateAsset(
    id: string,
    data: Partial<ICTAsset>,
    updatedBy: string
  ): Promise<ICTAsset> {
    const existingAsset = await (prisma as any).iCTAsset.findUnique({
      where: { id },
    });

    if (!existingAsset) {
      throw new Error("Asset not found");
    }

    // Check if version changed
    const versionChanged = data.version && data.version !== existingAsset.version;

    const asset = await (prisma as any).iCTAsset.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date().toISOString(),
        updatedBy,
      },
    });

    // Create Evidence Graph event
    await createEvidenceEvent({
      eventType: "ASSET.UPDATED",
      severity: "INFO",
      regulatoryTags: ["DORA"],
      articles: ["Art.7"],
      metadata: {
        assetId: asset.assetId,
        assetName: asset.name,
        updatedFields: Object.keys(data),
        versionChanged,
        updatedBy,
      },
    });

    // If version changed, check whitelist again
    if (versionChanged) {
      await this.checkVersionCompliance(asset);
    }

    return asset;
  }

  /**
   * Update asset version
   */
  async updateVersion(
    assetId: string,
    versionData: {
      newVersion: string;
      versionType: "MAJOR" | "MINOR" | "PATCH" | "SECURITY";
      changeDescription: string;
      changeReason: string;
      changeRequestId?: string;
      updatedBy: string;
    }
  ): Promise<AssetVersion> {
    const asset = await (prisma as any).iCTAsset.findUnique({
      where: { id: assetId },
    });

    if (!asset) {
      throw new Error("Asset not found");
    }

    // Create version record
    const version = await (prisma as any).assetVersion.create({
      data: {
        assetId,
        version: versionData.newVersion,
        previousVersion: asset.version,
        versionType: versionData.versionType,
        changeDescription: versionData.changeDescription,
        changeType: "UPGRADE",
        changeReason: versionData.changeReason,
        approvalStatus: "PENDING",
        changeRequestId: versionData.changeRequestId,
        createdAt: new Date().toISOString(),
        createdBy: versionData.updatedBy,
      },
    });

    // Check whitelist for new version
    const whitelistCheck = await this.checkVersionWhitelist(
      asset.technicalDetails.vendor || "",
      asset.technicalDetails.product || "",
      versionData.newVersion
    );

    if (whitelistCheck.approved) {
      // Auto-approve if on whitelist
      await (prisma as any).assetVersion.update({
        where: { id: version.id },
        data: {
          approvalStatus: "APPROVED",
          approvedBy: "system/whitelist",
          approvedAt: new Date().toISOString(),
        },
      });

      // Update asset version
      await (prisma as any).iCTAsset.update({
        where: { id: assetId },
        data: {
          version: versionData.newVersion,
          updatedAt: new Date().toISOString(),
          updatedBy: versionData.updatedBy,
        },
      });
    } else {
      // Create violation
      await this.createWhitelistViolation(
        { ...asset, version: versionData.newVersion },
        whitelistCheck.reason || "Version not on whitelist"
      );
    }

    // Create Evidence Graph event
    await createEvidenceEvent({
      eventType: "ASSET.VERSION.UPDATED",
      severity: versionData.versionType === "SECURITY" ? "HIGH" : "MEDIUM",
      regulatoryTags: ["DORA"],
      articles: ["Art.7"],
      metadata: {
        assetId: asset.assetId,
        assetName: asset.name,
        previousVersion: asset.version,
        newVersion: versionData.newVersion,
        versionType: versionData.versionType,
        whitelistApproved: whitelistCheck.approved,
        changeRequestId: versionData.changeRequestId,
        updatedBy: versionData.updatedBy,
      },
    });

    return version;
  }

  /**
   * Decommission asset
   */
  async decommissionAsset(
    id: string,
    reason: string,
    decommissionedBy: string
  ): Promise<ICTAsset> {
    const asset = await (prisma as any).iCTAsset.update({
      where: { id },
      data: {
        status: "DECOMMISSIONED",
        lifecycle: {
          decommissionDate: new Date().toISOString(),
        },
        updatedAt: new Date().toISOString(),
        updatedBy: decommissionedBy,
      },
    });

    // Deactivate all dependencies
    await (prisma as any).assetDependency.updateMany({
      where: {
        OR: [{ sourceAssetId: id }, { targetAssetId: id }],
      },
      data: {
        status: "INACTIVE",
        updatedAt: new Date().toISOString(),
      },
    });

    // Deactivate external interactions
    await (prisma as any).externalInteraction.updateMany({
      where: { assetId: id },
      data: {
        status: "INACTIVE",
        updatedAt: new Date().toISOString(),
      },
    });

    // Create Evidence Graph event
    await createEvidenceEvent({
      eventType: "ASSET.DECOMMISSIONED",
      severity: asset.criticality === "CRITICAL" ? "HIGH" : "MEDIUM",
      regulatoryTags: ["DORA"],
      articles: ["Art.7"],
      metadata: {
        assetId: asset.assetId,
        assetName: asset.name,
        category: asset.category,
        criticality: asset.criticality,
        reason,
        decommissionedBy,
      },
    });

    return asset;
  }

  // ═══════════════════════════════════════════════════════════════
  // DEPENDENCY MANAGEMENT
  // ═══════════════════════════════════════════════════════════════

  /**
   * Add asset dependency
   */
  async addDependency(
    data: Omit<AssetDependency, "id" | "createdAt" | "updatedAt">
  ): Promise<AssetDependency> {
    // Verify both assets exist
    const [sourceAsset, targetAsset] = await Promise.all([
      (prisma as any).iCTAsset.findUnique({ where: { id: data.sourceAssetId } }),
      (prisma as any).iCTAsset.findUnique({ where: { id: data.targetAssetId } }),
    ]);

    if (!sourceAsset || !targetAsset) {
      throw new Error("Source or target asset not found");
    }

    // Check for circular dependency
    const hasCircular = await this.checkCircularDependency(
      data.sourceAssetId,
      data.targetAssetId
    );

    if (hasCircular) {
      throw new Error("Circular dependency detected");
    }

    const dependency = await (prisma as any).assetDependency.create({
      data: {
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });

    // Create Evidence Graph event
    await createEvidenceEvent({
      eventType: "ASSET.DEPENDENCY.ADDED",
      severity: data.criticality === "CRITICAL" ? "HIGH" : "INFO",
      regulatoryTags: ["DORA"],
      articles: ["Art.7"],
      metadata: {
        sourceAssetId: sourceAsset.assetId,
        sourceAssetName: sourceAsset.name,
        targetAssetId: targetAsset.assetId,
        targetAssetName: targetAsset.name,
        dependencyType: data.dependencyType,
        criticality: data.criticality,
      },
    });

    return dependency;
  }

  /**
   * Get dependency graph for an asset
   */
  async getDependencyGraph(assetId: string, depth: number = 3): Promise<{
    nodes: { id: string; name: string; category: string; criticality: string }[];
    edges: { source: string; target: string; type: string; criticality: string }[];
  }> {
    const nodes: Map<string, any> = new Map();
    const edges: any[] = [];
    const visited = new Set<string>();

    const traverse = async (currentId: string, currentDepth: number) => {
      if (currentDepth > depth || visited.has(currentId)) return;
      visited.add(currentId);

      const asset = await (prisma as any).iCTAsset.findUnique({
        where: { id: currentId },
      });

      if (!asset) return;

      nodes.set(currentId, {
        id: asset.assetId,
        name: asset.name,
        category: asset.category,
        criticality: asset.criticality,
      });

      const dependencies = await (prisma as any).assetDependency.findMany({
        where: {
          OR: [{ sourceAssetId: currentId }, { targetAssetId: currentId }],
          status: "ACTIVE",
        },
      });

      for (const dep of dependencies) {
        const sourceAsset = await (prisma as any).iCTAsset.findUnique({
          where: { id: dep.sourceAssetId },
        });
        const targetAsset = await (prisma as any).iCTAsset.findUnique({
          where: { id: dep.targetAssetId },
        });

        if (sourceAsset && targetAsset) {
          edges.push({
            source: sourceAsset.assetId,
            target: targetAsset.assetId,
            type: dep.dependencyType,
            criticality: dep.criticality,
          });

          const nextId = dep.sourceAssetId === currentId ? dep.targetAssetId : dep.sourceAssetId;
          await traverse(nextId, currentDepth + 1);
        }
      }
    };

    await traverse(assetId, 0);

    return {
      nodes: Array.from(nodes.values()),
      edges,
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // WHITELIST MANAGEMENT
  // ═══════════════════════════════════════════════════════════════

  /**
   * Check if asset is on whitelist
   */
  async checkWhitelist(asset: Partial<ICTAsset>): Promise<{
    approved: boolean;
    whitelistEntryId?: string;
    reason?: string;
  }> {
    const vendor = asset.technicalDetails?.vendor;
    const product = asset.technicalDetails?.product;
    const version = asset.version;

    if (!vendor || !product) {
      return { approved: false, reason: "Missing vendor or product information" };
    }

    const whitelistEntry = await (prisma as any).whitelistEntry.findFirst({
      where: {
        vendor,
        product,
        status: "ACTIVE",
      },
    });

    if (!whitelistEntry) {
      return { approved: false, reason: "Component not on whitelist" };
    }

    // Check if version is approved
    const approvedVersion = whitelistEntry.approvedVersions.find(
      (v: any) => v.version === version && (!v.expiresAt || new Date(v.expiresAt) > new Date())
    );

    if (!approvedVersion) {
      // Check if version is blocked
      const blockedVersion = whitelistEntry.blockedVersions.find(
        (v: any) => v.version === version
      );

      if (blockedVersion) {
        return {
          approved: false,
          whitelistEntryId: whitelistEntry.id,
          reason: `Version ${version} is blocked: ${blockedVersion.reason}`,
        };
      }

      return {
        approved: false,
        whitelistEntryId: whitelistEntry.id,
        reason: `Version ${version} is not approved`,
      };
    }

    // Check environment scope
    if (
      whitelistEntry.approvalScope.environments &&
      asset.environment &&
      !whitelistEntry.approvalScope.environments.includes(asset.environment)
    ) {
      return {
        approved: false,
        whitelistEntryId: whitelistEntry.id,
        reason: `Not approved for ${asset.environment} environment`,
      };
    }

    return {
      approved: true,
      whitelistEntryId: whitelistEntry.id,
    };
  }

  /**
   * Check version against whitelist
   */
  async checkVersionWhitelist(
    vendor: string,
    product: string,
    version: string
  ): Promise<{ approved: boolean; reason?: string }> {
    const whitelistEntry = await (prisma as any).whitelistEntry.findFirst({
      where: {
        vendor,
        product,
        status: "ACTIVE",
      },
    });

    if (!whitelistEntry) {
      return { approved: false, reason: "Component not on whitelist" };
    }

    // Check blocked versions first
    const blockedVersion = whitelistEntry.blockedVersions.find(
      (v: any) => v.version === version
    );

    if (blockedVersion) {
      return { approved: false, reason: `Version blocked: ${blockedVersion.reason}` };
    }

    // Check approved versions
    const approvedVersion = whitelistEntry.approvedVersions.find(
      (v: any) => v.version === version && (!v.expiresAt || new Date(v.expiresAt) > new Date())
    );

    if (!approvedVersion) {
      return { approved: false, reason: "Version not approved" };
    }

    return { approved: true };
  }

  /**
   * Create whitelist violation
   */
  private async createWhitelistViolation(
    asset: ICTAsset,
    reason: string
  ): Promise<WhitelistViolation> {
    const violation = await (prisma as any).whitelistViolation.create({
      data: {
        assetId: asset.id,
        assetName: asset.name,
        violationType: "UNAPPROVED_COMPONENT",
        description: reason,
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
        reason,
        severity: violation.severity,
        resolutionDeadline: violation.resolutionDeadline,
      },
    });

    // Audit logging using AssetAuditHelpers
    await AssetAuditHelpers.logWhitelistViolation({
      violationId: violation.id,
      assetId: asset.assetId,
      violationType: violation.violationType,
      component: violation.currentProduct,
      version: violation.currentVersion,
    }).catch((error) => {
      console.error("Whitelist violation audit logging failed:", error);
    });

    await (prisma as any).whitelistViolation.update({
      where: { id: violation.id },
      data: { evidenceEventId },
    });

    return violation;
  }

  // ═══════════════════════════════════════════════════════════════
  // HELPER METHODS
  // ═══════════════════════════════════════════════════════════════

  private async generateAssetId(category: ICTAssetCategory): Promise<string> {
    const prefix = category.substring(0, 2).toUpperCase();
    const count = await (prisma as any).iCTAsset.count({ where: { category } });
    return `ICT-${prefix}-${String(count + 1).padStart(4, "0")}`;
  }

  private async checkCircularDependency(
    sourceId: string,
    targetId: string
  ): Promise<boolean> {
    const visited = new Set<string>();
    const queue = [targetId];

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      if (currentId === sourceId) return true;
      if (visited.has(currentId)) continue;
      visited.add(currentId);

      const dependencies = await (prisma as any).assetDependency.findMany({
        where: {
          sourceAssetId: currentId,
          status: "ACTIVE",
        },
      });

      for (const dep of dependencies) {
        queue.push(dep.targetAssetId);
      }
    }

    return false;
  }

  private async checkVersionCompliance(asset: ICTAsset): Promise<void> {
    const whitelistCheck = await this.checkWhitelist(asset);

    if (!whitelistCheck.approved) {
      await this.createWhitelistViolation(asset, whitelistCheck.reason || "Version not approved");

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
    } else {
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
    }
  }

  private calculateResolutionDeadline(criticality: AssetCriticality): string {
    const daysMap: Record<AssetCriticality, number> = {
      CRITICAL: 7,
      IMPORTANT: 14,
      STANDARD: 30,
      LOW: 90,
    };

    const deadline = new Date();
    deadline.setDate(deadline.getDate() + daysMap[criticality]);
    return deadline.toISOString();
  }
}

// Singleton instance
export const assetInventoryService = new AssetInventoryService();



