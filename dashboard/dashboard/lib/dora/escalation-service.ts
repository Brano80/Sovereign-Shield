import 'server-only';
import {
  EscalationRule,
  EscalationPath,
  StakeholderRole,
  CommunicationChannel,
  EscalationTrigger,
} from "./communication-types";
import prisma from "@/lib/prisma";
import { createEvidenceEvent } from "@/lib/audit/evidence-graph";
import { notificationService } from "./notification-service";

// ═══════════════════════════════════════════════════════════════
// DEFAULT ESCALATION MATRIX
// ═══════════════════════════════════════════════════════════════

export const DEFAULT_ESCALATION_MATRIX: EscalationRule[] = [
  {
    id: "rule-critical-incidents",
    name: "Critical Incident Escalation",
    description: "Immediate escalation for critical severity incidents",
    isActive: true,
    triggers: [
      {
        trigger: "INCIDENT_CREATED",
        conditions: [{ field: "severity", operator: "EQUALS", value: "CRITICAL" }],
      },
      {
        trigger: "SEVERITY_UPGRADE",
        conditions: [{ field: "newSeverity", operator: "EQUALS", value: "CRITICAL" }],
      },
    ],
    severityRules: [
      {
        severity: "CRITICAL",
        stakeholderRoles: [
          "INCIDENT_MANAGER",
          "SECURITY_TEAM",
          "OPERATIONS_TEAM",
          "CISO",
          "CTO",
        ],
        channels: ["EMAIL", "SMS", "SLACK"],
        timeToNotify: 0,              // Immediate
        requireAcknowledgment: true,
        escalateIfNoAck: 15,          // 15 minutes
        escalateTo: ["CEO", "BOARD_MEMBER"],
      },
    ],
    regulatoryRequirements: [
      {
        regulation: "DORA",
        article: "Art.19",
        deadline: 4,                   // 4 hours to regulators
        mandatoryRecipients: ["NCA", "CISO"],
      },
      {
        regulation: "NIS2",
        article: "Art.23",
        deadline: 24,                  // 24 hours early warning
        mandatoryRecipients: ["CSIRT", "NCA"],
      },
    ],
    priority: 1,
    createdAt: new Date().toISOString(),
    createdBy: "system",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "rule-high-incidents",
    name: "High Severity Escalation",
    description: "Escalation for high severity incidents",
    isActive: true,
    triggers: [
      {
        trigger: "INCIDENT_CREATED",
        conditions: [{ field: "severity", operator: "EQUALS", value: "HIGH" }],
      },
    ],
    severityRules: [
      {
        severity: "HIGH",
        stakeholderRoles: [
          "INCIDENT_MANAGER",
          "SECURITY_TEAM",
          "OPERATIONS_TEAM",
        ],
        channels: ["EMAIL", "SLACK"],
        timeToNotify: 5,              // 5 minutes
        requireAcknowledgment: true,
        escalateIfNoAck: 30,          // 30 minutes
        escalateTo: ["CISO", "CTO"],
      },
    ],
    priority: 2,
    createdAt: new Date().toISOString(),
    createdBy: "system",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "rule-data-breach",
    name: "Data Breach Escalation",
    description: "Mandatory escalation for data breaches",
    isActive: true,
    triggers: [
      {
        trigger: "DATA_BREACH",
        conditions: [],
      },
      {
        trigger: "INCIDENT_CREATED",
        conditions: [{ field: "type", operator: "CONTAINS", value: "DATA_BREACH" }],
      },
    ],
    severityRules: [
      {
        severity: "CRITICAL",
        stakeholderRoles: [
          "DPO",
          "LEGAL_TEAM",
          "CISO",
          "CEO",
        ],
        channels: ["EMAIL", "SMS", "PHONE"],
        timeToNotify: 0,
        requireAcknowledgment: true,
        escalateIfNoAck: 15,
        escalateTo: ["BOARD_MEMBER"],
      },
    ],
    regulatoryRequirements: [
      {
        regulation: "GDPR",
        article: "Art.33",
        deadline: 72,                  // 72 hours to DPA
        mandatoryRecipients: ["DPO", "NCA"],
      },
    ],
    priority: 1,
    createdAt: new Date().toISOString(),
    createdBy: "system",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "rule-customer-impact",
    name: "Customer Impact Escalation",
    description: "Escalation when customers are affected",
    isActive: true,
    triggers: [
      {
        trigger: "CUSTOMER_IMPACT",
        conditions: [{ field: "affectedCustomers", operator: "GREATER_THAN", value: 100 }],
      },
    ],
    severityRules: [
      {
        severity: "HIGH",
        stakeholderRoles: [
          "CUSTOMER_SERVICE",
          "PR_TEAM",
          "COO",
        ],
        channels: ["EMAIL", "SLACK"],
        timeToNotify: 10,
        requireAcknowledgment: true,
        escalateIfNoAck: 30,
        escalateTo: ["CEO"],
      },
    ],
    priority: 2,
    createdAt: new Date().toISOString(),
    createdBy: "system",
    updatedAt: new Date().toISOString(),
  },
];

// ═══════════════════════════════════════════════════════════════
// ESCALATION SERVICE
// ═══════════════════════════════════════════════════════════════

export class EscalationService {
  private escalationMatrix: EscalationRule[];

  constructor() {
    this.escalationMatrix = DEFAULT_ESCALATION_MATRIX;
  }

  /**
   * Initialize escalation matrix from database
   */
  async initialize() {
    try {
      const rules = await (prisma as any).escalationRule.findMany({
        where: { isActive: true },
        orderBy: { priority: "asc" },
      });

      if (rules.length > 0) {
        this.escalationMatrix = rules.map((rule: any) => ({
          ...rule,
          triggers: rule.triggers as any,
          severityRules: rule.severityRules as any,
          regulatoryRequirements: rule.regulatoryRequirements as any,
        }));
      }
    } catch (error) {
      console.error("Failed to load escalation rules from database, using defaults:", error);
    }
  }

  /**
   * Evaluate incident and trigger appropriate escalations
   */
  async evaluateIncident(
    incident: any,
    trigger: EscalationTrigger
  ): Promise<EscalationPath | null> {
    console.log(`Evaluating escalation for incident ${incident.id}, trigger: ${trigger}`);

    // Find matching rules
    const matchingRules = this.findMatchingRules(incident, trigger);

    if (matchingRules.length === 0) {
      console.log("No matching escalation rules found");
      return null;
    }

    // Use highest priority rule
    const rule = matchingRules[0];
    const severityRule = rule.severityRules.find((r) => r.severity === incident.severity);

    if (!severityRule) {
      console.log("No severity rule found for incident severity");
      return null;
    }

    // Create escalation path
    const escalationPath = await this.createEscalationPath(incident, rule, severityRule);

    // Trigger initial notifications
    await this.triggerNotifications(incident, severityRule, escalationPath);

    // Create Evidence Graph event
    await createEvidenceEvent({
      eventType: "COMMUNICATION.ESCALATION.TRIGGERED",
      severity: incident.severity === "CRITICAL" ? "CRITICAL" : "HIGH",
      regulatoryTags: ["DORA"],
      articles: ["Art.14"],
      metadata: {
        incidentId: incident.id,
        incidentNumber: incident.incidentNumber || incident.id,
        trigger,
        ruleName: rule.name,
        stakeholderRoles: severityRule.stakeholderRoles,
        channels: severityRule.channels,
      },
    });

    // Schedule regulatory notifications if required
    if (rule.regulatoryRequirements) {
      await this.scheduleRegulatoryNotifications(incident, rule.regulatoryRequirements);
    }

    return escalationPath;
  }

  /**
   * Find matching escalation rules
   */
  private findMatchingRules(incident: any, trigger: EscalationTrigger): EscalationRule[] {
    return this.escalationMatrix.filter((rule: any) => {
      if (!rule.isActive) return false;

      return rule.triggers.some((t: any) => {
        if (t.trigger !== trigger) return false;

        // Check all conditions
        return t.conditions.every((condition: any) => {
          const fieldValue = this.getFieldValue(incident, condition.field);
          return this.evaluateCondition(fieldValue, condition.operator, condition.value);
        });
      });
    });
  }

  /**
   * Create escalation path
   */
  private async createEscalationPath(
    incident: any,
    rule: EscalationRule,
    severityRule: any
  ): Promise<EscalationPath> {
    const levels = [
      {
        level: 1,
        stakeholderRoles: severityRule.stakeholderRoles,
        triggerAfterMinutes: severityRule.timeToNotify,
        triggered: true,
        triggeredAt: new Date().toISOString(),
      },
    ];

    // Add escalation level if defined
    if (severityRule.escalateTo && severityRule.escalateIfNoAck > 0) {
      levels.push({
        level: 2,
        stakeholderRoles: severityRule.escalateTo,
        triggerAfterMinutes: severityRule.escalateIfNoAck,
        triggered: false,
        triggeredAt: '',
      });
    }

    const escalationPath = await (prisma as any).escalationPath.create({
      data: {
        incidentId: incident.id,
        currentLevel: 1,
        maxLevel: levels.length,
        levels: levels as any,
        status: "ACTIVE",
        startedAt: new Date().toISOString(),
      },
    });

    // Schedule next level escalation if needed
    if (levels.length > 1) {
      await this.scheduleEscalationCheck(
        escalationPath.id,
        severityRule.escalateIfNoAck
      );
    }

    return {
      ...escalationPath,
      levels: levels as any,
    };
  }

  /**
   * Trigger notifications for current escalation level
   */
  private async triggerNotifications(
    incident: any,
    severityRule: any,
    escalationPath: EscalationPath
  ) {
    // Get stakeholders for this level
    const stakeholders = await (prisma as any).stakeholder.findMany({
      where: {
        role: { in: severityRule.stakeholderRoles },
        isActive: true,
      },
    });

    // Send notifications through each channel
    for (const stakeholder of stakeholders) {
      for (const channel of severityRule.channels) {
        await notificationService.sendNotification({
          incidentId: incident.id,
          stakeholderId: stakeholder.id,
          channel,
          type: "ESCALATION",
          requireAcknowledgment: severityRule.requireAcknowledgment,
          escalationPathId: escalationPath.id,
          isEscalation: true,
          escalationLevel: escalationPath.currentLevel,
        });
      }
    }
  }

  /**
   * Schedule regulatory notifications
   */
  private async scheduleRegulatoryNotifications(
    incident: any,
    requirements: EscalationRule["regulatoryRequirements"]
  ) {
    if (!requirements) return;

    for (const req of requirements) {
      const occurredAt = incident.occurredAt || incident.createdAt || new Date().toISOString();
      const deadline = new Date(occurredAt);
      deadline.setHours(deadline.getHours() + req.deadline);

      // Create scheduled notification
      await (prisma as any).scheduledNotification.create({
        data: {
          incidentId: incident.id,
          type: "REGULATORY_REPORT",
          regulation: req.regulation,
          article: req.article,
          deadline: deadline.toISOString(),
          mandatoryRecipients: req.mandatoryRecipients as any,
          status: "PENDING",
          createdAt: new Date().toISOString(),
        },
      });

      // Schedule reminder (e.g., 2 hours before deadline)
      const reminderTime = new Date(deadline);
      reminderTime.setHours(reminderTime.getHours() - 2);

      await this.scheduleDeadlineReminder(incident.id, req.regulation, reminderTime);
    }
  }

  /**
   * Check and process escalation
   */
  async checkEscalation(escalationPathId: string) {
    const escalationPath = await (prisma as any).escalationPath.findUnique({
      where: { id: escalationPathId },
    });

    if (!escalationPath || escalationPath.status !== "ACTIVE") return;

    const levels = escalationPath.levels as any[];
    const currentLevel = levels[escalationPath.currentLevel - 1];

    // Check if acknowledged
    if (currentLevel.acknowledgedAt) {
      // No escalation needed
      return;
    }

    // Check if we should escalate to next level
    if (escalationPath.currentLevel < escalationPath.maxLevel) {
      const nextLevel = levels[escalationPath.currentLevel];

      // Trigger next level
      const stakeholders = await (prisma as any).stakeholder.findMany({
        where: {
          role: { in: nextLevel.stakeholderRoles },
          isActive: true,
        },
      });

      for (const stakeholder of stakeholders) {
        await notificationService.sendNotification({
          incidentId: escalationPath.incidentId,
          stakeholderId: stakeholder.id,
          channel: "EMAIL",
          type: "ESCALATION",
          requireAcknowledgment: true,
          escalationPathId: escalationPath.id,
          isEscalation: true,
          escalationLevel: escalationPath.currentLevel + 1,
        });
      }

      // Update escalation path
      const updatedLevels = [...levels];
      updatedLevels[escalationPath.currentLevel] = {
        ...nextLevel,
        triggered: true,
        triggeredAt: new Date().toISOString(),
      };

      await (prisma as any).escalationPath.update({
        where: { id: escalationPathId },
        data: {
          currentLevel: escalationPath.currentLevel + 1,
          levels: updatedLevels as any,
          lastEscalatedAt: new Date().toISOString(),
        },
      });

      // Create Evidence Graph event
      await createEvidenceEvent({
        eventType: "COMMUNICATION.ESCALATION.LEVEL_TRIGGERED",
        severity: "HIGH",
        regulatoryTags: ["DORA"],
        articles: ["Art.14"],
        metadata: {
          incidentId: escalationPath.incidentId,
          escalationPathId,
          previousLevel: escalationPath.currentLevel,
          newLevel: escalationPath.currentLevel + 1,
          reason: "No acknowledgment received",
          stakeholderRoles: nextLevel.stakeholderRoles,
        },
      });
    }
  }

  /**
   * Acknowledge escalation
   */
  async acknowledgeEscalation(
    escalationPathId: string,
    acknowledgedBy: string
  ): Promise<void> {
    const escalationPath = await (prisma as any).escalationPath.findUnique({
      where: { id: escalationPathId },
    });

    if (!escalationPath) {
      throw new Error("Escalation path not found");
    }

    const levels = escalationPath.levels as any[];
    const updatedLevels = [...levels];
    updatedLevels[escalationPath.currentLevel - 1] = {
      ...updatedLevels[escalationPath.currentLevel - 1],
      acknowledgedAt: new Date().toISOString(),
      acknowledgedBy,
    };

    await (prisma as any).escalationPath.update({
      where: { id: escalationPathId },
      data: {
        levels: updatedLevels as any,
        status: "ACKNOWLEDGED",
      },
    });

    // Create Evidence Graph event
    await createEvidenceEvent({
      eventType: "COMMUNICATION.ESCALATION.ACKNOWLEDGED",
      severity: "INFO",
      regulatoryTags: ["DORA"],
      articles: ["Art.14"],
      metadata: {
        incidentId: escalationPath.incidentId,
        escalationPathId,
        level: escalationPath.currentLevel,
        acknowledgedBy,
      },
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // HELPER METHODS
  // ═══════════════════════════════════════════════════════════════

  private getFieldValue(incident: any, field: string): any {
    const parts = field.split(".");
    let value = incident;
    for (const part of parts) {
      value = value?.[part];
    }
    return value;
  }

  private evaluateCondition(fieldValue: any, operator: string, value: any): boolean {
    switch (operator) {
      case "EQUALS":
        return fieldValue === value;
      case "NOT_EQUALS":
        return fieldValue !== value;
      case "GREATER_THAN":
        return fieldValue > value;
      case "LESS_THAN":
        return fieldValue < value;
      case "CONTAINS":
        return String(fieldValue).toLowerCase().includes(String(value).toLowerCase());
      case "IN":
        return Array.isArray(value) && value.includes(fieldValue);
      default:
        return false;
    }
  }

  private async scheduleEscalationCheck(
    escalationPathId: string,
    delayMinutes: number
  ) {
    // In production, use a job queue (Bull, BullMQ, etc.)
    setTimeout(async () => {
      await this.checkEscalation(escalationPathId);
    }, delayMinutes * 60 * 1000);
  }

  private async scheduleDeadlineReminder(
    incidentId: string,
    regulation: string,
    reminderTime: Date
  ) {
    const delay = reminderTime.getTime() - Date.now();
    if (delay <= 0) return;

    // In production, use a job queue
    setTimeout(async () => {
      // Create deadline warning
      await createEvidenceEvent({
        eventType: "COMMUNICATION.REGULATORY_DEADLINE_WARNING",
        severity: "HIGH",
        regulatoryTags: [regulation as any],
        articles: ["Art.14"],
        metadata: {
          incidentId,
          regulation,
          hoursRemaining: 2,
        },
      });
    }, delay);
  }
}

// Singleton instance
export const escalationService = new EscalationService();



