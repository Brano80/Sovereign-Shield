import 'server-only';

// ═══════════════════════════════════════════════════════════════
// NOTIFICATION SERVICE
// ═══════════════════════════════════════════════════════════════
// Handles sending notifications through various channels
// Used by EscalationService for stakeholder communications
//
// NOTE: This service still uses Prisma. Migrate to Rust backend when incident management is updated.

import {
  Communication,
  CommunicationRecipient,
  CommunicationType,
  CommunicationChannel,
  CommunicationTemplate,
  Stakeholder,
  CommunicationStatus,
} from "./communication-types";
import prisma from "@/lib/prisma";
import { createEvidenceEvent } from "@/lib/audit/evidence-graph";

interface NotificationRequest {
  incidentId: string;
  stakeholderId: string;
  channel: CommunicationChannel;
  type: CommunicationType;
  requireAcknowledgment?: boolean;
  escalationPathId?: string;
  isEscalation?: boolean;
  escalationLevel?: number;
  templateId?: string;
  customContent?: {
    subject: string;
    body: string;
  };
}

export class NotificationService {
  /**
   * Send notification to stakeholder
   */
  async sendNotification(request: NotificationRequest): Promise<Communication> {
    // Get stakeholder
    const stakeholder = await (prisma as any).stakeholder.findUnique({
      where: { id: request.stakeholderId },
    });

    if (!stakeholder) {
      throw new Error("Stakeholder not found");
    }

    // Get incident (try dora_incidents first, fallback to dora_lite_incidents)
    const incident = await this.getIncident(request.incidentId);

    if (!incident) {
      throw new Error("Incident not found");
    }

    // Get or generate content
    let subject: string;
    let body: string;

    if (request.customContent) {
      subject = request.customContent.subject;
      body = request.customContent.body;
    } else if (request.templateId) {
      const rendered = await this.renderTemplate(request.templateId, incident, stakeholder);
      subject = rendered.subject;
      body = rendered.body;
    } else {
      const rendered = await this.getDefaultContent(request.type, incident, stakeholder, request);
      subject = rendered.subject;
      body = rendered.body;
    }

    // Create communication record
    const communicationId = await this.generateCommunicationId();

    const recipient: CommunicationRecipient = {
      stakeholderId: stakeholder.id,
      stakeholderName: stakeholder.name,
      stakeholderType: stakeholder.type as any,
      stakeholderRole: stakeholder.role as any,
      channel: request.channel,
      contactValue: this.getContactValue(stakeholder, request.channel),
      status: "SENDING",
    };

    const communication = await (prisma as any).communication.create({
      data: {
        communicationId,
        incidentId: request.incidentId,
        type: request.type,
        channel: request.channel,
        subject,
        content: body,
        contentFormat: "HTML",
        classification: "INTERNAL",
        recipients: [recipient] as any,
        sentBy: "system",
        status: "SENDING",
        deliveryStats: {
          total: 1,
          sent: 0,
          delivered: 0,
          read: 0,
          acknowledged: 0,
          failed: 0,
        } as any,
        createdAt: new Date().toISOString(),
        createdBy: "system",
        updatedAt: new Date().toISOString(),
      },
    });

    // Send through channel
    try {
      await this.dispatchNotification(communication, recipient);

      // Update status
      const updatedRecipient = { ...recipient, status: "SENT" as CommunicationStatus, sentAt: new Date().toISOString() };

      await (prisma as any).communication.update({
        where: { id: communication.id },
        data: {
          status: "SENT",
          sentAt: new Date().toISOString(),
          recipients: [updatedRecipient] as any,
          deliveryStats: {
            total: 1,
            sent: 1,
            delivered: 0,
            read: 0,
            acknowledged: 0,
            failed: 0,
          } as any,
        },
      });

      // Add to timeline
      await this.addToTimeline(request.incidentId, {
        eventType: "COMMUNICATION_SENT",
        communicationId: communication.id,
        description: `${request.type} sent to ${stakeholder.name} via ${request.channel}`,
        stakeholderName: stakeholder.name,
        stakeholderRole: stakeholder.role,
        channel: request.channel,
      });

      // Create Evidence Graph event
      await createEvidenceEvent({
        eventType: "COMMUNICATION.NOTIFICATION.SENT",
        severity: "INFO",
        regulatoryTags: ["DORA"],
        articles: ["Art.14"],
        metadata: {
          communicationId,
          incidentId: request.incidentId,
          incidentNumber: incident.incidentNumber || incident.id,
          type: request.type,
          channel: request.channel,
          stakeholderName: stakeholder.name,
          stakeholderRole: stakeholder.role,
        },
      });

      return communication as any;
    } catch (error) {
      // Update as failed
      const failedRecipient = {
        ...recipient,
        status: "FAILED" as CommunicationStatus,
        failureReason: String(error),
      };

      await (prisma as any).communication.update({
        where: { id: communication.id },
        data: {
          status: "FAILED",
          recipients: [failedRecipient] as any,
          deliveryStats: {
            total: 1,
            sent: 0,
            delivered: 0,
            read: 0,
            acknowledged: 0,
            failed: 1,
          } as any,
        },
      });

      throw error;
    }
  }

  /**
   * Send bulk notification to multiple stakeholders
   */
  async sendBulkNotification(
    incidentId: string,
    stakeholderRoles: string[],
    type: CommunicationType,
    channel: CommunicationChannel,
    templateId?: string
  ): Promise<Communication> {
    // Get stakeholders
    const stakeholders = await (prisma as any).stakeholder.findMany({
      where: {
        role: { in: stakeholderRoles },
        isActive: true,
      },
    });

    if (stakeholders.length === 0) {
      throw new Error("No stakeholders found for specified roles");
    }

    // Get incident
    const incident = await this.getIncident(incidentId);

    if (!incident) {
      throw new Error("Incident not found");
    }

    // Get content
    let subject: string;
    let body: string;

    if (templateId) {
      const rendered = await this.renderTemplate(templateId, incident, stakeholders[0]);
      subject = rendered.subject;
      body = rendered.body;
    } else {
      const rendered = await this.getDefaultContent(type, incident, stakeholders[0], { type, channel, incidentId });
      subject = rendered.subject;
      body = rendered.body;
    }

    // Create recipients
    const recipients: CommunicationRecipient[] = stakeholders.map((s: any) => ({
      stakeholderId: s.id,
      stakeholderName: s.name,
      stakeholderType: s.type as any,
      stakeholderRole: s.role as any,
      channel,
      contactValue: this.getContactValue(s, channel),
      status: "SENDING" as CommunicationStatus,
    }));

    // Create communication
    const communicationId = await this.generateCommunicationId();

    const communication = await (prisma as any).communication.create({
      data: {
        communicationId,
        incidentId,
        type,
        channel,
        subject,
        content: body,
        contentFormat: "HTML",
        classification: "INTERNAL",
        recipients: recipients as any,
        sentBy: "system",
        status: "SENDING",
        deliveryStats: {
          total: recipients.length,
          sent: 0,
          delivered: 0,
          read: 0,
          acknowledged: 0,
          failed: 0,
        } as any,
        createdAt: new Date().toISOString(),
        createdBy: "system",
        updatedAt: new Date().toISOString(),
      },
    });

    // Send to all recipients
    const results = await Promise.allSettled(
      recipients.map((r) => this.dispatchNotification(communication as any, r))
    );

    // Update delivery stats
    let sent = 0;
    let failed = 0;
    const updatedRecipients = recipients.map((r, i) => {
      if (results[i].status === "fulfilled") {
        sent++;
        return { ...r, status: "SENT" as CommunicationStatus, sentAt: new Date().toISOString() };
      } else {
        failed++;
        return {
          ...r,
          status: "FAILED" as CommunicationStatus,
          failureReason: String((results[i] as PromiseRejectedResult).reason),
        };
      }
    });

    await (prisma as any).communication.update({
      where: { id: communication.id },
      data: {
        status: failed === recipients.length ? "FAILED" : "SENT",
        sentAt: new Date().toISOString(),
        recipients: updatedRecipients as any,
        deliveryStats: {
          total: recipients.length,
          sent,
          delivered: 0,
          read: 0,
          acknowledged: 0,
          failed,
        } as any,
      },
    });

    // Add to timeline
    await this.addToTimeline(incidentId, {
      eventType: "COMMUNICATION_SENT",
      communicationId: communication.id,
      description: `${type} sent to ${sent}/${recipients.length} stakeholders via ${channel}`,
      channel,
    });

    return communication as any;
  }

  /**
   * Record acknowledgment
   */
  async acknowledgeNotification(
    communicationId: string,
    stakeholderId: string
  ): Promise<void> {
    const communication = await (prisma as any).communication.findUnique({
      where: { id: communicationId },
    });

    if (!communication) {
      throw new Error("Communication not found");
    }

    const recipients = (communication.recipients as any) as CommunicationRecipient[];
    const recipientIndex = recipients.findIndex((r) => r.stakeholderId === stakeholderId);

    if (recipientIndex === -1) {
      throw new Error("Recipient not found");
    }

    recipients[recipientIndex] = {
      ...recipients[recipientIndex],
      status: "ACKNOWLEDGED",
      acknowledgedAt: new Date().toISOString(),
      response: {
        type: "ACKNOWLEDGED",
        respondedAt: new Date().toISOString(),
      },
    };

    const ackCount = recipients.filter((r) => r.status === "ACKNOWLEDGED").length;

    await (prisma as any).communication.update({
      where: { id: communicationId },
      data: {
        status: ackCount === recipients.length ? "ACKNOWLEDGED" : communication.status,
        recipients: recipients as any,
        deliveryStats: {
          ...(communication.deliveryStats as any),
          acknowledged: ackCount,
        } as any,
      },
    });

    // Add to timeline
    await this.addToTimeline(communication.incidentId, {
      eventType: "COMMUNICATION_ACKNOWLEDGED",
      communicationId,
      description: `Notification acknowledged by ${recipients[recipientIndex].stakeholderName}`,
      stakeholderName: recipients[recipientIndex].stakeholderName,
      stakeholderRole: recipients[recipientIndex].stakeholderRole,
    });

    // Create Evidence Graph event
    await createEvidenceEvent({
      eventType: "COMMUNICATION.NOTIFICATION.ACKNOWLEDGED",
      severity: "INFO",
      regulatoryTags: ["DORA"],
      articles: ["Art.14"],
      metadata: {
        communicationId: communication.communicationId,
        incidentId: communication.incidentId,
        stakeholderId,
        stakeholderName: recipients[recipientIndex].stakeholderName,
      },
    });
  }

  /**
   * Dispatch notification through specific channel
   */
  private async dispatchNotification(
    communication: Communication,
    recipient: CommunicationRecipient
  ): Promise<void> {
    switch (recipient.channel) {
      case "EMAIL":
        await this.sendEmail(recipient.contactValue, communication.subject, communication.content);
        break;
      case "SMS":
        await this.sendSMS(recipient.contactValue, communication.content);
        break;
      case "SLACK":
        await this.sendSlack(recipient.contactValue, communication.subject, communication.content);
        break;
      case "TEAMS":
        await this.sendTeams(recipient.contactValue, communication.subject, communication.content);
        break;
      case "WEBHOOK":
        await this.sendWebhook(recipient.contactValue, communication);
        break;
      default:
        console.log(`Channel ${recipient.channel} not implemented, logging only`);
    }
  }

  // Channel implementations (placeholders)
  private async sendEmail(to: string, subject: string, body: string): Promise<void> {
    console.log(`[EMAIL] To: ${to}, Subject: ${subject}`);
    // TODO: Implement email sending (e.g., nodemailer, SendGrid, etc.)
  }

  private async sendSMS(to: string, message: string): Promise<void> {
    console.log(`[SMS] To: ${to}, Message: ${message.substring(0, 160)}`);
    // TODO: Implement SMS sending (e.g., Twilio)
  }

  private async sendSlack(channel: string, title: string, message: string): Promise<void> {
    console.log(`[SLACK] Channel: ${channel}, Title: ${title}`);
    // TODO: Implement Slack webhook
  }

  private async sendTeams(webhook: string, title: string, message: string): Promise<void> {
    console.log(`[TEAMS] Webhook: ${webhook}, Title: ${title}`);
    // TODO: Implement Teams webhook
  }

  private async sendWebhook(url: string, payload: any): Promise<void> {
    console.log(`[WEBHOOK] URL: ${url}`);
    // TODO: Implement generic webhook
  }

  /**
   * Render template with variables
   */
  private async renderTemplate(
    templateId: string,
    incident: any,
    stakeholder: Stakeholder
  ): Promise<{ subject: string; body: string }> {
    const template = await (prisma as any).communicationTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      throw new Error("Template not found");
    }

    const variables: Record<string, string> = {
      incidentNumber: incident.incidentNumber || incident.id,
      incidentTitle: incident.title || incident.incident_type || "Incident",
      incidentSeverity: incident.severity || "UNKNOWN",
      incidentStatus: incident.status || "UNKNOWN",
      incidentDescription: incident.description || "",
      occurredAt: incident.occurredAt 
        ? new Date(incident.occurredAt).toLocaleString()
        : incident.detected_at 
        ? new Date(incident.detected_at).toLocaleString()
        : new Date().toLocaleString(),
      stakeholderName: stakeholder.name,
      stakeholderRole: stakeholder.role,
      currentTime: new Date().toLocaleString(),
    };

    let subject = template.subject;
    let body = template.body;

    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, "g");
      subject = subject.replace(regex, value || "");
      body = body.replace(regex, value || "");
    }

    return { subject, body };
  }

  /**
   * Get default content for notification type
   */
  private async getDefaultContent(
    type: CommunicationType,
    incident: any,
    stakeholder: Stakeholder,
    request: any
  ): Promise<{ subject: string; body: string }> {
    const incidentNumber = incident.incidentNumber || incident.id;
    const incidentTitle = incident.title || incident.incident_type || "Incident";
    const incidentSeverity = incident.severity || "UNKNOWN";
    const incidentStatus = incident.status || "UNKNOWN";
    const incidentDescription = incident.description || "";
    const occurredAt = incident.occurredAt 
      ? new Date(incident.occurredAt).toLocaleString()
      : incident.detected_at 
      ? new Date(incident.detected_at).toLocaleString()
      : new Date().toLocaleString();

    const templates: Record<CommunicationType, { subject: string; body: string }> = {
      INITIAL_NOTIFICATION: {
        subject: `[${incidentSeverity}] Incident ${incidentNumber}: ${incidentTitle}`,
        body: `
          <h2>Incident Notification</h2>
          <p>Dear ${stakeholder.name},</p>
          <p>A new ${incidentSeverity} severity incident has been reported:</p>
          <ul>
            <li><strong>Incident ID:</strong> ${incidentNumber}</li>
            <li><strong>Title:</strong> ${incidentTitle}</li>
            <li><strong>Severity:</strong> ${incidentSeverity}</li>
            <li><strong>Occurred At:</strong> ${occurredAt}</li>
            <li><strong>Description:</strong> ${incidentDescription}</li>
          </ul>
          <p>Please acknowledge receipt of this notification.</p>
        `,
      },
      ESCALATION: {
        subject: `[ESCALATION] Incident ${incidentNumber} - Level ${request.escalationLevel || "N/A"}`,
        body: `
          <h2>⚠️ Escalation Notice</h2>
          <p>Dear ${stakeholder.name},</p>
          <p>This incident has been escalated to your attention:</p>
          <ul>
            <li><strong>Incident ID:</strong> ${incidentNumber}</li>
            <li><strong>Title:</strong> ${incidentTitle}</li>
            <li><strong>Severity:</strong> ${incidentSeverity}</li>
            <li><strong>Escalation Level:</strong> ${request.escalationLevel || "N/A"}</li>
          </ul>
          <p><strong>Immediate acknowledgment and action required.</strong></p>
        `,
      },
      STATUS_UPDATE: {
        subject: `[UPDATE] Incident ${incidentNumber}: ${incidentStatus}`,
        body: `
          <h2>Incident Status Update</h2>
          <p>Dear ${stakeholder.name},</p>
          <p>Status update for incident ${incidentNumber}:</p>
          <ul>
            <li><strong>New Status:</strong> ${incidentStatus}</li>
            <li><strong>Updated At:</strong> ${new Date().toLocaleString()}</li>
          </ul>
        `,
      },
      RESOLUTION: {
        subject: `[RESOLVED] Incident ${incidentNumber}`,
        body: `
          <h2>Incident Resolved</h2>
          <p>Dear ${stakeholder.name},</p>
          <p>Incident ${incidentNumber} has been resolved.</p>
          <p>A post-incident report will follow.</p>
        `,
      },
      POST_INCIDENT: {
        subject: `[POST-INCIDENT] Report for ${incidentNumber}`,
        body: `<h2>Post-Incident Report</h2><p>Please see attached report.</p>`,
      },
      REGULATORY_REPORT: {
        subject: `[REGULATORY] ${incidentNumber} - Incident Report`,
        body: `<h2>Regulatory Incident Report</h2><p>This is an official incident report as required by regulation.</p>`,
      },
      CUSTOMER_ADVISORY: {
        subject: `Service Advisory: ${incidentTitle}`,
        body: `<h2>Service Advisory</h2><p>We are aware of an issue affecting our services.</p>`,
      },
      PUBLIC_STATEMENT: {
        subject: `Public Statement: ${incidentTitle}`,
        body: `<h2>Public Statement</h2><p>Official statement regarding the incident.</p>`,
      },
      INTERNAL_BRIEFING: {
        subject: `[INTERNAL] Briefing: ${incidentNumber}`,
        body: `<h2>Internal Briefing</h2><p>Internal stakeholder briefing.</p>`,
      },
    };

    return templates[type] || templates.INITIAL_NOTIFICATION;
  }

  /**
   * Add entry to communication timeline
   */
  private async addToTimeline(incidentId: string, entry: any): Promise<void> {
    await (prisma as any).communicationTimeline.create({
      data: {
        incidentId,
        ...entry,
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * Get incident (try dora_incidents first, fallback to dora_lite_incidents)
   */
  private async getIncident(incidentId: string): Promise<any> {
    try {
      // Try dora_incidents first
      const incident = await prisma.$queryRaw<any[]>`
        SELECT 
          id,
          title,
          description,
          severity,
          status,
          detected_at as "detectedAt",
          resolved_at as "resolvedAt",
          mitigation_steps as "mitigationSteps"
        FROM dora_incidents
        WHERE id = ${incidentId}::uuid
        LIMIT 1
      `.catch(() => null);

      if (incident && incident.length > 0) {
        return {
          ...incident[0],
          incidentNumber: incident[0].id,
          occurredAt: incident[0].detectedAt,
        };
      }

      // Fallback to dora_lite_incidents
      const liteIncident = await prisma.$queryRaw<any[]>`
        SELECT 
          id,
          incident_type as title,
          description,
          severity,
          status,
          detected_at as "detectedAt",
          resolved_at as "resolvedAt",
          mitigation_steps as "mitigationSteps"
        FROM dora_lite_incidents
        WHERE id = ${incidentId}::uuid
        LIMIT 1
      `.catch(() => null);

      if (liteIncident && liteIncident.length > 0) {
        return {
          ...liteIncident[0],
          incidentNumber: liteIncident[0].id,
          occurredAt: liteIncident[0].detectedAt,
        };
      }

      return null;
    } catch (error) {
      console.error("Error fetching incident:", error);
      return null;
    }
  }

  private getContactValue(stakeholder: Stakeholder, channel: CommunicationChannel): string {
    const contacts = stakeholder.contacts as any;
    switch (channel) {
      case "EMAIL":
        return contacts.primary?.type === "EMAIL" ? contacts.primary.value : "";
      case "SMS":
      case "PHONE":
        return contacts.primary?.type === "PHONE" ? contacts.primary.value : "";
      case "SLACK":
        return contacts.primary?.type === "SLACK" ? contacts.primary.value : "";
      default:
        return contacts.primary?.value || "";
    }
  }

  private async generateCommunicationId(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await (prisma as any).communication.count({
      where: {
        createdAt: { gte: new Date(`${year}-01-01`).toISOString() },
      },
    });
    return `COM-${year}-${String(count + 1).padStart(4, "0")}`;
  }
}

// Singleton instance
export const notificationService = new NotificationService();


