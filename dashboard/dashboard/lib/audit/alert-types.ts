// ═══════════════════════════════════════════════════════════════
// ALERT TYPES
// ═══════════════════════════════════════════════════════════════

export type AlertSeverity = 'INFO' | 'WARNING' | 'CRITICAL' | 'BREACH';

export type AlertChannel = 'DASHBOARD' | 'EMAIL' | 'SLACK' | 'WEBHOOK';

export type AlertStatus = 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED' | 'ESCALATED';

export type AlertCategory =
  | 'CLOCK_WARNING'      // Clock approaching deadline
  | 'CLOCK_BREACH'       // Clock deadline breached
  | 'COMPLIANCE_GAP'     // Compliance query failed
  | 'SECURITY_INCIDENT'  // Security-related event
  | 'AI_BLOCKED'         // AI prohibited practice blocked
  | 'SYSTEM_HEALTH'      // System health issue
  | 'GOVERNANCE'         // Governance action required
  | 'DATA_BREACH';       // GDPR data breach detected

export interface Alert {
  alertId: string;
  category: AlertCategory;
  severity: AlertSeverity;
  status: AlertStatus;

  // Content
  title: string;
  message: string;
  details?: Record<string, any>;

  // Source
  sourceType: 'CLOCK' | 'EVENT' | 'QUERY' | 'SYSTEM';
  sourceId: string;
  correlationId?: string;

  // Regulatory context
  regulation?: string;
  article?: string;

  // Assignment
  assignedTo: string[];      // Actor IDs or roles
  assignedRoles: string[];   // Roles that should see this

  // Channels
  channels: AlertChannel[];

  // Timing
  createdAt: string;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  expiresAt?: string;

  // Escalation
  escalationLevel: number;
  escalatedAt?: string;
  escalatedTo?: string[];

  // Actions
  actionRequired: boolean;
  actionUrl?: string;
  actionLabel?: string;
}

export interface AlertRule {
  ruleId: string;
  name: string;
  description: string;

  // Trigger conditions
  category: AlertCategory;
  conditions: {
    field: string;
    operator: 'EQUALS' | 'NOT_EQUALS' | 'GREATER_THAN' | 'LESS_THAN' | 'CONTAINS';
    value: any;
  }[];

  // Alert configuration
  severity: AlertSeverity;
  channels: AlertChannel[];
  assignedRoles: string[];

  // Escalation
  escalationRules: {
    afterMinutes: number;
    escalateTo: string[];
    newSeverity?: AlertSeverity;
  }[];

  // Status
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AlertSummary {
  total: number;
  bySeverity: Record<AlertSeverity, number>;
  byCategory: Record<AlertCategory, number>;
  byStatus: Record<AlertStatus, number>;
  critical: Alert[];
  recentlyCreated: Alert[];
  requiresAction: Alert[];
}

// ═══════════════════════════════════════════════════════════════
// NOTIFICATION TEMPLATES
// ═══════════════════════════════════════════════════════════════

export interface NotificationTemplate {
  templateId: string;
  category: AlertCategory;
  channel: AlertChannel;

  subject: string;        // For email
  body: string;           // Main content with {{placeholders}}
  actionButton?: {
    label: string;
    url: string;
  };
}

export const DEFAULT_TEMPLATES: NotificationTemplate[] = [
  // Clock Warning Templates
  {
    templateId: 'CLOCK_WARNING_EMAIL',
    category: 'CLOCK_WARNING',
    channel: 'EMAIL',
    subject: '⚠️ Regulatory Deadline Approaching: {{clockType}} for {{correlationId}}',
    body: `
      <h2>Regulatory Deadline Warning</h2>
      <p><strong>Clock Type:</strong> {{clockType}}</p>
      <p><strong>Related To:</strong> {{correlationId}}</p>
      <p><strong>Time Remaining:</strong> {{timeRemaining}}</p>
      <p><strong>Deadline:</strong> {{deadline}}</p>
      <p>Please take action to meet this regulatory requirement.</p>
    `,
    actionButton: {
      label: 'View Details',
      url: '{{actionUrl}}',
    },
  },
  {
    templateId: 'CLOCK_WARNING_SLACK',
    category: 'CLOCK_WARNING',
    channel: 'SLACK',
    subject: '',
    body: '⚠️ *{{clockType}}* deadline approaching for `{{correlationId}}`\n⏰ *{{timeRemaining}}* remaining\n📅 Deadline: {{deadline}}',
    actionButton: {
      label: 'View in Dashboard',
      url: '{{actionUrl}}',
    },
  },

  // Clock Breach Templates
  {
    templateId: 'CLOCK_BREACH_EMAIL',
    category: 'CLOCK_BREACH',
    channel: 'EMAIL',
    subject: '🚨 URGENT: Regulatory Deadline BREACHED - {{clockType}}',
    body: `
      <h2 style="color: red;">⚠️ Regulatory Deadline Breached</h2>
      <p><strong>Clock Type:</strong> {{clockType}}</p>
      <p><strong>Related To:</strong> {{correlationId}}</p>
      <p><strong>Breached At:</strong> {{breachedAt}}</p>
      <p><strong>Overdue By:</strong> {{overdueBy}}</p>
      <p style="color: red;"><strong>IMMEDIATE ACTION REQUIRED</strong></p>
      <p>This deadline has been breached. Please document the reason and take remediation steps immediately.</p>
    `,
    actionButton: {
      label: 'Take Action Now',
      url: '{{actionUrl}}',
    },
  },

  // AI Blocked Templates
  {
    templateId: 'AI_BLOCKED_EMAIL',
    category: 'AI_BLOCKED',
    channel: 'EMAIL',
    subject: '🤖 AI Prohibited Practice Blocked - {{prohibitedCategory}}',
    body: `
      <h2>AI Act Art.5 Enforcement</h2>
      <p>A prohibited AI practice has been blocked by the system.</p>
      <p><strong>Category:</strong> {{prohibitedCategory}}</p>
      <p><strong>AI System:</strong> {{aiSystemId}}</p>
      <p><strong>Detection Method:</strong> {{detectionMethod}}</p>
      <p><strong>Risk Score:</strong> {{riskScore}}</p>
      <p>Please review this blocked request and confirm the action.</p>
    `,
    actionButton: {
      label: 'Review Block',
      url: '{{actionUrl}}',
    },
  },

  // Data Breach Templates
  {
    templateId: 'DATA_BREACH_EMAIL',
    category: 'DATA_BREACH',
    channel: 'EMAIL',
    subject: '🚨 DATA BREACH DETECTED - {{breachId}}',
    body: `
      <h2 style="color: red;">⚠️ Data Breach Detected</h2>
      <p><strong>Breach ID:</strong> {{breachId}}</p>
      <p><strong>Description:</strong> {{description}}</p>
      <p><strong>Affected Data Types:</strong> {{affectedDataTypes}}</p>
      <p><strong>Affected Subjects:</strong> {{affectedSubjects}}</p>
      <p><strong>GDPR 72h Notification Clock:</strong> Started</p>
      <p style="color: red;"><strong>You have 72 hours to notify the supervisory authority.</strong></p>
    `,
    actionButton: {
      label: 'Manage Breach',
      url: '{{actionUrl}}',
    },
  },
];
