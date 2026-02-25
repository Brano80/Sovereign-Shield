import {
  RiskThreshold,
  ThresholdBreach,
  ThresholdAction,
  ICTAsset,
} from "./ict-risk-types";
import { RiskAuditHelpers } from "@/lib/audit/lens-helpers";

export class RiskThresholdService {
  /**
   * Get default thresholds (DORA-aligned)
   */
  static getDefaultThresholds(): RiskThreshold[] {
    return [
      // Global critical asset threshold
      {
        id: "threshold-critical-assets",
        name: "Critical Asset Risk Threshold",
        description: "Risk threshold for business-critical ICT assets",
        scope: {
          type: "CRITICALITY",
          criticalities: ["CRITICAL"],
        },
        warningThreshold: 50,
        criticalThreshold: 70,
        warningActions: [
          { type: "ALERT", target: "ict-risk-team" },
          { type: "NOTIFY", target: "asset-owner" },
        ],
        criticalActions: [
          { type: "ALERT", target: "ict-risk-team" },
          { type: "ESCALATE", target: "ciso" },
          { type: "NOTIFY", target: "management-body" },
        ],
        isActive: true,
        createdBy: "system",
        approvedBy: "ciso",
        approvedAt: new Date().toISOString(),
      },

      // Important asset threshold
      {
        id: "threshold-important-assets",
        name: "Important Asset Risk Threshold",
        description: "Risk threshold for important ICT assets",
        scope: {
          type: "CRITICALITY",
          criticalities: ["IMPORTANT"],
        },
        warningThreshold: 60,
        criticalThreshold: 80,
        warningActions: [
          { type: "ALERT", target: "ict-risk-team" },
        ],
        criticalActions: [
          { type: "ALERT", target: "ict-risk-team" },
          { type: "ESCALATE", target: "it-manager" },
        ],
        isActive: true,
        createdBy: "system",
        approvedBy: "ciso",
        approvedAt: new Date().toISOString(),
      },

      // Third-party concentration risk
      {
        id: "threshold-third-party",
        name: "Third-Party Concentration Risk",
        description: "Threshold for third-party service provider risks",
        scope: {
          type: "ASSET_TYPE",
          assetTypes: ["THIRD_PARTY_SERVICE", "CLOUD_SERVICE"],
        },
        warningThreshold: 55,
        criticalThreshold: 75,
        warningActions: [
          { type: "ALERT", target: "vendor-management" },
        ],
        criticalActions: [
          { type: "ALERT", target: "vendor-management" },
          { type: "ESCALATE", target: "ciso" },
          { type: "NOTIFY", target: "management-body" },
        ],
        isActive: true,
        createdBy: "system",
        approvedBy: "ciso",
        approvedAt: new Date().toISOString(),
      },

      // Global organization threshold
      {
        id: "threshold-global",
        name: "Organization-Wide Risk Threshold",
        description: "Overall ICT risk tolerance for the organization",
        scope: {
          type: "GLOBAL",
        },
        warningThreshold: 65,
        criticalThreshold: 85,
        warningActions: [
          { type: "ALERT", target: "ict-risk-team" },
        ],
        criticalActions: [
          { type: "ESCALATE", target: "management-body" },
          { type: "NOTIFY", target: "board" },
        ],
        isActive: true,
        createdBy: "system",
        approvedBy: "board",
        approvedAt: new Date().toISOString(),
      },
    ];
  }

  /**
   * Execute threshold actions
   */
  static async executeActions(
    breach: ThresholdBreach,
    actions: ThresholdAction[]
  ): Promise<void> {
    // Audit logging - threshold breach detected
    await RiskAuditHelpers.logThresholdBreach({
      breachId: breach.id,
      assetId: breach.assetId,
      thresholdType: (breach as any).thresholdType,
      currentValue: (breach as any).currentValue,
      thresholdValue: breach.thresholdValue,
    }).catch((error) => {
      console.error("Audit logging failed for threshold breach:", error);
    });

    for (const action of actions) {
      switch (action.type) {
        case "ALERT":
          await this.sendAlert(breach, action.target);
          break;
        case "ESCALATE":
          await this.escalate(breach, action.target);
          break;
        case "NOTIFY":
          await this.notify(breach, action.target, action.template);
          break;
        case "AUTO_REMEDIATE":
          await this.autoRemediate(breach, action.automationId);
          break;
        case "BLOCK":
          await this.blockAsset(breach);
          break;
      }
    }
  }

  private static async sendAlert(breach: ThresholdBreach, target: string): Promise<void> {
    // Implement alert sending (e.g., to notification service)
    console.log(`ALERT: ${breach.thresholdName} breached for ${breach.assetName} -> ${target}`);
  }

  private static async escalate(breach: ThresholdBreach, target: string): Promise<void> {
    // Implement escalation (e.g., create escalation event in Evidence Graph)
    console.log(`ESCALATE: ${breach.thresholdName} to ${target}`);
  }

  private static async notify(
    breach: ThresholdBreach,
    target: string,
    template?: string
  ): Promise<void> {
    // Implement notification (e.g., email, Slack)
    console.log(`NOTIFY: ${target} about ${breach.thresholdName}`);
  }

  private static async autoRemediate(
    breach: ThresholdBreach,
    automationId?: string
  ): Promise<void> {
    // Implement auto-remediation
    console.log(`AUTO-REMEDIATE: ${breach.assetId} via ${automationId}`);
  }

  private static async blockAsset(breach: ThresholdBreach): Promise<void> {
    // Implement asset blocking
    console.log(`BLOCK: ${breach.assetId}`);
  }
}

