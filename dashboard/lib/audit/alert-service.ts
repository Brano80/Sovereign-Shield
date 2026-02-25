import { v4 as uuidv4 } from 'uuid';
import { eventIngestionService } from './event-ingestion-service';
import {
  Alert,
  AlertSeverity,
  AlertChannel,
  AlertStatus,
  AlertCategory,
  AlertSummary,
  AlertRule,
  NotificationTemplate,
  DEFAULT_TEMPLATES,
} from './alert-types';
import { API_BASE } from '@/utils/api-config';

// ═══════════════════════════════════════════════════════════════
// ALERT SERVICE
// ═══════════════════════════════════════════════════════════════

export class AlertService {
  private templates: Map<string, NotificationTemplate>;

  constructor() {
    this.templates = new Map(
      DEFAULT_TEMPLATES.map(t => [`${t.category}_${t.channel}`, t])
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // ALERT CREATION
  // ═══════════════════════════════════════════════════════════════

  /**
   * Create a new alert
   */
  async createAlert(params: {
    category: AlertCategory;
    severity: AlertSeverity;
    title: string;
    message: string;
    details?: Record<string, any>;
    sourceType: Alert['sourceType'];
    sourceId: string;
    correlationId?: string;
    regulation?: string;
    article?: string;
    assignedRoles?: string[];
    channels?: AlertChannel[];
    actionUrl?: string;
    actionLabel?: string;
    expiresAt?: string;
  }): Promise<Alert> {
    const alertId = `ALR-${Date.now()}-${uuidv4().substring(0, 8)}`;
    const now = new Date().toISOString();

    // Determine default channels based on severity
    const channels = params.channels || this.getDefaultChannels(params.severity);

    // Determine assigned roles based on category
    const assignedRoles = params.assignedRoles || this.getDefaultRoles(params.category);

    const alert: Alert = {
      alertId,
      category: params.category,
      severity: params.severity,
      status: 'ACTIVE',
      title: params.title,
      message: params.message,
      details: params.details,
      sourceType: params.sourceType,
      sourceId: params.sourceId,
      correlationId: params.correlationId,
      regulation: params.regulation,
      article: params.article,
      assignedTo: [],
      assignedRoles,
      channels,
      createdAt: now,
      expiresAt: params.expiresAt,
      escalationLevel: 0,
      actionRequired: params.severity !== 'INFO',
      actionUrl: params.actionUrl,
      actionLabel: params.actionLabel,
    };

    // Store alert via API
    await this.storeAlert(alert);

    // Send notifications
    await this.sendNotifications(alert);

    // Create audit event
    await this.createAlertEvent(alert);

    return alert;
  }

  /**
   * Create clock warning alert
   */
  async createClockWarningAlert(clock: {
    clock_id: string;
    clock_type: string;
    regulation: string;
    article: string;
    deadline: string;
    related_event_id: string;
  }, hoursRemaining: number): Promise<Alert> {
    const severity: AlertSeverity = hoursRemaining <= 1 ? 'CRITICAL' : 'WARNING';

    return this.createAlert({
      category: 'CLOCK_WARNING',
      severity,
      title: `${clock.clock_type} deadline approaching`,
      message: `Regulatory deadline in ${hoursRemaining} hours for ${clock.related_event_id}`,
      details: {
        clockId: clock.clock_id,
        clockType: clock.clock_type,
        deadline: clock.deadline,
        hoursRemaining,
        relatedEventId: clock.related_event_id,
      },
      sourceType: 'CLOCK',
      sourceId: clock.clock_id,
      correlationId: clock.related_event_id,
      regulation: clock.regulation,
      article: clock.article,
      actionUrl: `/dashboard/audit-evidence?tab=clocks&id=${clock.clock_id}`,
      actionLabel: 'View Clock',
    });
  }

  /**
   * Create clock breach alert
   */
  async createClockBreachAlert(clock: {
    clock_id: string;
    clock_type: string;
    regulation: string;
    article: string;
    deadline: string;
    related_event_id: string;
  }, overdueHours: number): Promise<Alert> {
    return this.createAlert({
      category: 'CLOCK_BREACH',
      severity: 'BREACH',
      title: `🚨 ${clock.clock_type} DEADLINE BREACHED`,
      message: `Regulatory deadline breached ${overdueHours} hours ago for ${clock.related_event_id}`,
      details: {
        clockId: clock.clock_id,
        clockType: clock.clock_type,
        deadline: clock.deadline,
        overdueHours,
        relatedEventId: clock.related_event_id,
      },
      sourceType: 'CLOCK',
      sourceId: clock.clock_id,
      correlationId: clock.related_event_id,
      regulation: clock.regulation,
      article: clock.article,
      channels: ['DASHBOARD', 'EMAIL', 'SLACK'], // All channels for breach
      actionUrl: `/dashboard/audit-evidence?tab=clocks&id=${clock.clock_id}`,
      actionLabel: 'Take Action',
    });
  }

  /**
   * Create AI blocked alert
   */
  async createAIBlockedAlert(block: {
    blockId: string;
    aiSystemId: string;
    prohibitedCategory: string;
    detectionMethod: string;
    riskScore: number;
    details: string;
  }): Promise<Alert> {
    return this.createAlert({
      category: 'AI_BLOCKED',
      severity: 'WARNING',
      title: `AI Prohibited Practice Blocked: ${block.prohibitedCategory}`,
      message: `Blocked ${block.prohibitedCategory} attempt from ${block.aiSystemId}`,
      details: block,
      sourceType: 'EVENT',
      sourceId: block.blockId,
      regulation: 'AI_ACT',
      article: 'Art.5',
      actionUrl: `/dashboard/lenses/ai-act-art5?review=${block.blockId}`,
      actionLabel: 'Review Block',
    });
  }

  /**
   * Create data breach alert
   */
  async createDataBreachAlert(breach: {
    breachId: string;
    description: string;
    affectedDataTypes: string[];
    affectedSubjects: number;
    severity: string;
  }): Promise<Alert> {
    return this.createAlert({
      category: 'DATA_BREACH',
      severity: 'CRITICAL',
      title: `🚨 Data Breach Detected`,
      message: `${breach.affectedSubjects} data subjects potentially affected`,
      details: breach,
      sourceType: 'EVENT',
      sourceId: breach.breachId,
      correlationId: breach.breachId,
      regulation: 'GDPR',
      article: 'Art.33',
      channels: ['DASHBOARD', 'EMAIL', 'SLACK'],
      actionUrl: `/dashboard/incidents?breach=${breach.breachId}`,
      actionLabel: 'Manage Breach',
    });
  }

  /**
   * Create compliance gap alert
   */
  async createComplianceGapAlert(query: {
    queryId: string;
    queryName: string;
    regulation: string;
    articles: string[];
    result: string;
    gaps: { description: string; recommendation: string }[];
  }): Promise<Alert> {
    const severity: AlertSeverity = query.result === 'NOT_PROVEN' ? 'WARNING' : 'INFO';

    return this.createAlert({
      category: 'COMPLIANCE_GAP',
      severity,
      title: `Compliance Gap: ${query.queryName}`,
      message: `${query.gaps.length} gap(s) identified in ${query.regulation} compliance`,
      details: {
        queryId: query.queryId,
        result: query.result,
        gaps: query.gaps,
      },
      sourceType: 'QUERY',
      sourceId: query.queryId,
      regulation: query.regulation,
      article: query.articles[0],
      actionUrl: `/dashboard/audit-evidence?tab=explorer&query=${query.queryId}`,
      actionLabel: 'View Details',
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // ALERT MANAGEMENT
  // ═══════════════════════════════════════════════════════════════

  /**
   * Acknowledge an alert
   */
  async acknowledgeAlert(alertId: string, userId: string): Promise<void> {
    const alert = await this.getAlert(alertId);
    if (!alert) throw new Error('Alert not found');

    alert.status = 'ACKNOWLEDGED';
    alert.acknowledgedAt = new Date().toISOString();
    alert.acknowledgedBy = userId;

    await this.storeAlert(alert);
  }

  /**
   * Resolve an alert
   */
  async resolveAlert(alertId: string, userId: string, resolution?: string): Promise<void> {
    const alert = await this.getAlert(alertId);
    if (!alert) throw new Error('Alert not found');

    alert.status = 'RESOLVED';
    alert.resolvedAt = new Date().toISOString();
    alert.resolvedBy = userId;
    if (resolution) {
      alert.details = { ...alert.details, resolution };
    }

    await this.storeAlert(alert);
  }

  /**
   * Escalate an alert
   */
  async escalateAlert(alertId: string, escalateTo: string[]): Promise<void> {
    const alert = await this.getAlert(alertId);
    if (!alert) throw new Error('Alert not found');

    alert.status = 'ESCALATED';
    alert.escalationLevel += 1;
    alert.escalatedAt = new Date().toISOString();
    alert.escalatedTo = escalateTo;

    // Increase severity if not already at max
    if (alert.severity === 'WARNING') alert.severity = 'CRITICAL';
    else if (alert.severity === 'CRITICAL') alert.severity = 'BREACH';

    await this.storeAlert(alert);

    // Send escalation notifications
    await this.sendNotifications(alert);
  }

  /**
   * Get active alerts
   */
  async getActiveAlerts(): Promise<Alert[]> {
    return this.getAlertsByStatus(['ACTIVE', 'ESCALATED']);
  }

  /**
   * Get alert summary
   */
  async getAlertSummary(): Promise<AlertSummary> {
    const alerts = await this.getAllAlerts();

    const bySeverity: Record<AlertSeverity, number> = {
      INFO: 0, WARNING: 0, CRITICAL: 0, BREACH: 0
    };
    const byCategory: Record<AlertCategory, number> = {
      CLOCK_WARNING: 0, CLOCK_BREACH: 0, COMPLIANCE_GAP: 0,
      SECURITY_INCIDENT: 0, AI_BLOCKED: 0, SYSTEM_HEALTH: 0,
      GOVERNANCE: 0, DATA_BREACH: 0
    };
    const byStatus: Record<AlertStatus, number> = {
      ACTIVE: 0, ACKNOWLEDGED: 0, RESOLVED: 0, ESCALATED: 0
    };

    alerts.forEach(alert => {
      bySeverity[alert.severity]++;
      byCategory[alert.category]++;
      byStatus[alert.status]++;
    });

    const activeAlerts = alerts.filter(a => a.status === 'ACTIVE' || a.status === 'ESCALATED');

    return {
      total: alerts.length,
      bySeverity,
      byCategory,
      byStatus,
      critical: activeAlerts.filter(a => a.severity === 'CRITICAL' || a.severity === 'BREACH'),
      recentlyCreated: alerts
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10),
      requiresAction: activeAlerts.filter(a => a.actionRequired),
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // NOTIFICATION SENDING
  // ═══════════════════════════════════════════════════════════════

  private async sendNotifications(alert: Alert): Promise<void> {
    for (const channel of alert.channels) {
      try {
        switch (channel) {
          case 'DASHBOARD':
            // Dashboard notifications are handled by polling/websocket
            // The alert is already stored, so UI can fetch it
            break;
          case 'EMAIL':
            await this.sendEmailNotification(alert);
            break;
          case 'SLACK':
            await this.sendSlackNotification(alert);
            break;
          case 'WEBHOOK':
            await this.sendWebhookNotification(alert);
            break;
        }
      } catch (error) {
        console.error(`Failed to send ${channel} notification for alert ${alert.alertId}:`, error);
      }
    }
  }

  private async sendEmailNotification(alert: Alert): Promise<void> {
    const template = this.templates.get(`${alert.category}_EMAIL`);
    if (!template) {
      console.warn(`No email template for category ${alert.category}`);
      return;
    }

    const subject = this.renderTemplate(template.subject, alert);
    const body = this.renderTemplate(template.body, alert);

    // TODO: Integrate with actual email service (SendGrid, SES, etc.)
    console.log(`📧 EMAIL NOTIFICATION:`);
    console.log(`   Subject: ${subject}`);
    console.log(`   To: ${alert.assignedRoles.join(', ')}`);

    // For now, log the email content
    // In production, call email service API
  }

  private async sendSlackNotification(alert: Alert): Promise<void> {
    const template = this.templates.get(`${alert.category}_SLACK`);

    const message = template
      ? this.renderTemplate(template.body, alert)
      : `${this.getSeverityEmoji(alert.severity)} *${alert.title}*\n${alert.message}`;

    // TODO: Integrate with Slack webhook
    console.log(`💬 SLACK NOTIFICATION:`);
    console.log(`   ${message}`);

    // For production:
    // const webhookUrl = process.env.SLACK_WEBHOOK_URL;
    // await fetch(webhookUrl, {
    //   method: 'POST',
    //   body: JSON.stringify({ text: message }),
    // });
  }

  private async sendWebhookNotification(alert: Alert): Promise<void> {
    // TODO: Send to configured webhook endpoints
    console.log(`🔗 WEBHOOK NOTIFICATION:`);
    console.log(`   Alert: ${alert.alertId}`);
  }

  // ═══════════════════════════════════════════════════════════════
  // HELPER METHODS
  // ═══════════════════════════════════════════════════════════════

  private getDefaultChannels(severity: AlertSeverity): AlertChannel[] {
    switch (severity) {
      case 'BREACH':
        return ['DASHBOARD', 'EMAIL', 'SLACK'];
      case 'CRITICAL':
        return ['DASHBOARD', 'EMAIL'];
      case 'WARNING':
        return ['DASHBOARD'];
      default:
        return ['DASHBOARD'];
    }
  }

  private getDefaultRoles(category: AlertCategory): string[] {
    switch (category) {
      case 'CLOCK_WARNING':
      case 'CLOCK_BREACH':
        return ['INCIDENT_MANAGER', 'COMPLIANCE_OFFICER'];
      case 'DATA_BREACH':
        return ['DPO', 'CISO', 'INCIDENT_MANAGER'];
      case 'AI_BLOCKED':
        return ['COMPLIANCE_OFFICER', 'CTO'];
      case 'COMPLIANCE_GAP':
        return ['COMPLIANCE_OFFICER', 'DPO'];
      case 'SECURITY_INCIDENT':
        return ['CISO', 'INCIDENT_MANAGER'];
      case 'GOVERNANCE':
        return ['BOARD_MEMBER', 'CTO', 'CISO'];
      default:
        return ['COMPLIANCE_OFFICER'];
    }
  }

  private getSeverityEmoji(severity: AlertSeverity): string {
    switch (severity) {
      case 'BREACH': return '🚨';
      case 'CRITICAL': return '❗';
      case 'WARNING': return '⚠️';
      default: return 'ℹ️';
    }
  }

  private renderTemplate(template: string, alert: Alert): string {
    let result = template;

    // Replace alert fields
    result = result.replace(/\{\{alertId\}\}/g, alert.alertId);
    result = result.replace(/\{\{title\}\}/g, alert.title);
    result = result.replace(/\{\{message\}\}/g, alert.message);
    result = result.replace(/\{\{severity\}\}/g, alert.severity);
    result = result.replace(/\{\{category\}\}/g, alert.category);
    result = result.replace(/\{\{correlationId\}\}/g, alert.correlationId || '');
    result = result.replace(/\{\{regulation\}\}/g, alert.regulation || '');
    result = result.replace(/\{\{article\}\}/g, alert.article || '');
    result = result.replace(/\{\{actionUrl\}\}/g, alert.actionUrl || '');

    // Replace detail fields
    if (alert.details) {
      for (const [key, value] of Object.entries(alert.details)) {
        const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
        result = result.replace(regex, String(value));
      }
    }

    return result;
  }

  // ═══════════════════════════════════════════════════════════════
  // STORAGE METHODS (VIA API)
  // ═══════════════════════════════════════════════════════════════

  private async storeAlert(alert: Alert): Promise<void> {
    try {
      const response = await fetch(`${API_BASE}/audit/alerts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(alert),
      });

      if (!response.ok) {
        throw new Error(`Failed to store alert: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to store alert via API:', error);
      // Fallback: store in localStorage for demo purposes
      this.storeAlertLocally(alert);
    }
  }

  private async getAlert(alertId: string): Promise<Alert | null> {
    try {
      const response = await fetch(`${API_BASE}/audit/alerts/${alertId}`);

      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`Failed to get alert: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get alert via API:', error);
      // Fallback: get from localStorage
      return this.getAlertLocally(alertId);
    }
  }

  private async getAllAlerts(): Promise<Alert[]> {
    try {
      const response = await fetch(`${API_BASE}/audit/alerts`);

      if (!response.ok) {
        throw new Error(`Failed to get alerts: ${response.statusText}`);
      }

      const data = await response.json();
      return data.alerts || [];
    } catch (error) {
      console.error('Failed to get alerts via API:', error);
      // Fallback: get from localStorage
      return this.getAllAlertsLocally();
    }
  }

  private async getAlertsByStatus(statuses: AlertStatus[]): Promise<Alert[]> {
    const all = await this.getAllAlerts();
    return all.filter(a => statuses.includes(a.status));
  }

  // Fallback local storage methods for demo/development
  private storeAlertLocally(alert: Alert): void {
    try {
      const alerts = this.getAllAlertsLocally();
      const existingIndex = alerts.findIndex(a => a.alertId === alert.alertId);

      if (existingIndex >= 0) {
        alerts[existingIndex] = alert;
      } else {
        alerts.push(alert);
      }

      localStorage.setItem('veridion-alerts', JSON.stringify(alerts));
    } catch (error) {
      console.error('Failed to store alert locally:', error);
    }
  }

  private getAlertLocally(alertId: string): Alert | null {
    try {
      const alerts = this.getAllAlertsLocally();
      return alerts.find(a => a.alertId === alertId) || null;
    } catch (error) {
      console.error('Failed to get alert locally:', error);
      return null;
    }
  }

  private getAllAlertsLocally(): Alert[] {
    try {
      const stored = localStorage.getItem('veridion-alerts');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to get alerts locally:', error);
      return [];
    }
  }

  private async createAlertEvent(alert: Alert): Promise<void> {
    // Import here to avoid circular dependency
    const { eventIngestionService } = await import('./event-ingestion-service');

    await eventIngestionService.createEvent({
      eventType: `ALERT.${alert.category}`,
      sourceSystem: 'alert-service',
      correlationId: alert.correlationId || alert.alertId,
      severity: (alert.severity === 'BREACH' ? 'CRITICAL' : alert.severity) as 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
      payload: {
        alertId: alert.alertId,
        title: alert.title,
        category: alert.category,
        assignedRoles: alert.assignedRoles,
      },
      regulatoryTags: alert.regulation ? [alert.regulation as 'GDPR' | 'DORA' | 'NIS2' | 'AI_ACT'] : [],
      articles: alert.article ? [alert.article] : [],
    });
  }
}

// Singleton instance
export const alertService = new AlertService();
