// ═══════════════════════════════════════════════════════════════
// DORA ART.14 STAKEHOLDER COMMUNICATION - DATA TYPES
// ═══════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════
// STAKEHOLDER TYPES
// ═══════════════════════════════════════════════════════════════

export type StakeholderType = 
  | "INTERNAL"           // Internal employees
  | "MANAGEMENT"         // Board, C-level
  | "CUSTOMER"           // Affected customers
  | "REGULATOR"          // Regulatory authorities
  | "VENDOR"             // Third-party providers
  | "PARTNER"            // Business partners
  | "MEDIA"              // Press/media
  | "PUBLIC";            // General public

export type StakeholderRole = 
  | "CISO"
  | "CTO"
  | "CEO"
  | "CFO"
  | "COO"
  | "BOARD_MEMBER"
  | "DPO"                // Data Protection Officer
  | "INCIDENT_MANAGER"
  | "OPERATIONS_TEAM"
  | "SECURITY_TEAM"
  | "LEGAL_TEAM"
  | "PR_TEAM"
  | "CUSTOMER_SERVICE"
  | "AFFECTED_DEPARTMENT"
  | "NCA"                // National Competent Authority
  | "CSIRT"              // Computer Security Incident Response Team
  | "ECB"                // European Central Bank
  | "ENISA";             // EU Agency for Cybersecurity

export interface Stakeholder {
  id: string;
  
  // Identity
  name: string;
  type: StakeholderType;
  role: StakeholderRole;
  organization?: string;
  department?: string;
  
  // Contact
  contacts: {
    primary: ContactMethod;
    secondary?: ContactMethod;
    emergency?: ContactMethod;
  };
  
  // Preferences
  preferences: {
    preferredChannel: CommunicationChannel;
    language: string;
    timezone: string;
    quietHours?: { start: string; end: string };
  };
  
  // Authorization
  clearanceLevel: "PUBLIC" | "INTERNAL" | "CONFIDENTIAL" | "RESTRICTED";
  canReceiveClassified: boolean;
  
  // Status
  isActive: boolean;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}

export interface ContactMethod {
  type: "EMAIL" | "PHONE" | "SMS" | "SLACK" | "TEAMS" | "WEBHOOK" | "PORTAL";
  value: string;
  verified: boolean;
  lastVerifiedAt?: string;
}

export type CommunicationChannel = 
  | "EMAIL"
  | "SMS"
  | "PHONE"
  | "SLACK"
  | "TEAMS"
  | "PORTAL"
  | "WEBHOOK"
  | "OFFICIAL_LETTER"
  | "PRESS_RELEASE";

// ═══════════════════════════════════════════════════════════════
// ESCALATION MATRIX
// ═══════════════════════════════════════════════════════════════

export type EscalationTrigger = 
  | "INCIDENT_CREATED"
  | "SEVERITY_UPGRADE"
  | "THRESHOLD_BREACH"
  | "SLA_VIOLATION"
  | "CUSTOMER_IMPACT"
  | "DATA_BREACH"
  | "SERVICE_OUTAGE"
  | "REGULATORY_DEADLINE"
  | "NO_RESPONSE"
  | "MANUAL";

export interface EscalationRule {
  id: string;
  
  // Rule identity
  name: string;
  description: string;
  isActive: boolean;
  
  // Trigger conditions
  triggers: {
    trigger: EscalationTrigger;
    conditions: {
      field: string;
      operator: "EQUALS" | "NOT_EQUALS" | "GREATER_THAN" | "LESS_THAN" | "CONTAINS" | "IN";
      value: any;
    }[];
  }[];
  
  // Severity-based rules
  severityRules: {
    severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
    stakeholderRoles: StakeholderRole[];
    channels: CommunicationChannel[];
    timeToNotify: number;          // minutes
    requireAcknowledgment: boolean;
    escalateIfNoAck: number;       // minutes, 0 = no escalation
    escalateTo?: StakeholderRole[];
  }[];
  
  // Regulatory requirements
  regulatoryRequirements?: {
    regulation: "DORA" | "GDPR" | "NIS2";
    article: string;
    deadline: number;              // hours
    mandatoryRecipients: StakeholderRole[];
  }[];
  
  // Priority
  priority: number;                // Lower = higher priority
  
  // Metadata
  createdAt: string;
  createdBy: string;
  updatedAt: string;
}

export interface EscalationPath {
  id: string;
  incidentId: string;
  
  // Current state
  currentLevel: number;
  maxLevel: number;
  
  // Levels
  levels: {
    level: number;
    stakeholderRoles: StakeholderRole[];
    triggerAfterMinutes: number;
    triggered: boolean;
    triggeredAt?: string;
    acknowledgedAt?: string;
    acknowledgedBy?: string;
  }[];
  
  // Status
  status: "ACTIVE" | "ACKNOWLEDGED" | "RESOLVED" | "EXPIRED";
  
  // Timestamps
  startedAt: string;
  lastEscalatedAt?: string;
  resolvedAt?: string;
}

// ═══════════════════════════════════════════════════════════════
// COMMUNICATION RECORDS
// ═══════════════════════════════════════════════════════════════

export type CommunicationStatus = 
  | "DRAFT"
  | "SCHEDULED"
  | "SENDING"
  | "SENT"
  | "DELIVERED"
  | "READ"
  | "ACKNOWLEDGED"
  | "FAILED"
  | "BOUNCED";

export type CommunicationType = 
  | "INITIAL_NOTIFICATION"
  | "STATUS_UPDATE"
  | "ESCALATION"
  | "RESOLUTION"
  | "POST_INCIDENT"
  | "REGULATORY_REPORT"
  | "CUSTOMER_ADVISORY"
  | "PUBLIC_STATEMENT"
  | "INTERNAL_BRIEFING";

export interface Communication {
  id: string;
  
  // Reference
  communicationId: string;        // e.g., "COM-2025-0042"
  incidentId: string;
  
  // Type
  type: CommunicationType;
  channel: CommunicationChannel;
  
  // Content
  subject: string;
  content: string;
  contentFormat: "PLAIN" | "HTML" | "MARKDOWN";
  templateId?: string;
  
  // Classification
  classification: "PUBLIC" | "INTERNAL" | "CONFIDENTIAL" | "RESTRICTED";
  
  // Recipients
  recipients: CommunicationRecipient[];
  
  // Sender
  sentBy: string;
  sentOnBehalfOf?: string;
  
  // Status
  status: CommunicationStatus;
  
  // Delivery tracking
  deliveryStats: {
    total: number;
    sent: number;
    delivered: number;
    read: number;
    acknowledged: number;
    failed: number;
  };
  
  // Timing
  scheduledAt?: string;
  sentAt?: string;
  
  // Regulatory
  regulatoryDeadline?: string;
  meetsDeadline?: boolean;
  
  // Evidence
  evidenceEventId?: string;
  
  // Metadata
  createdAt: string;
  createdBy: string;
  updatedAt: string;
}

export interface CommunicationRecipient {
  stakeholderId: string;
  stakeholderName: string;
  stakeholderType: StakeholderType;
  stakeholderRole: StakeholderRole;
  
  // Contact used
  channel: CommunicationChannel;
  contactValue: string;
  
  // Status
  status: CommunicationStatus;
  
  // Tracking
  sentAt?: string;
  deliveredAt?: string;
  readAt?: string;
  acknowledgedAt?: string;
  failureReason?: string;
  
  // Response
  response?: {
    type: "ACKNOWLEDGED" | "REPLIED" | "ESCALATED" | "DELEGATED";
    content?: string;
    respondedAt: string;
  };
}

// ═══════════════════════════════════════════════════════════════
// COMMUNICATION TEMPLATES
// ═══════════════════════════════════════════════════════════════

export interface CommunicationTemplate {
  id: string;
  
  // Identity
  templateId: string;             // e.g., "TPL-INC-INIT-001"
  name: string;
  description: string;
  
  // Scope
  type: CommunicationType;
  stakeholderTypes: StakeholderType[];
  channels: CommunicationChannel[];
  severities: ("CRITICAL" | "HIGH" | "MEDIUM" | "LOW")[];
  
  // Content
  subject: string;                // Supports {{variables}}
  body: string;                   // Supports {{variables}}
  bodyFormat: "PLAIN" | "HTML" | "MARKDOWN";
  
  // Available variables
  variables: {
    name: string;
    description: string;
    required: boolean;
    defaultValue?: string;
  }[];
  
  // Localization
  translations: {
    language: string;
    subject: string;
    body: string;
  }[];
  
  // Regulatory
  regulatoryCompliant: boolean;
  regulations?: string[];
  
  // Status
  isActive: boolean;
  version: string;
  
  // Metadata
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  approvedBy?: string;
  approvedAt?: string;
}

// ═══════════════════════════════════════════════════════════════
// COMMUNICATION TIMELINE
// ═══════════════════════════════════════════════════════════════

export interface CommunicationTimelineEntry {
  id: string;
  incidentId: string;
  
  // Event
  eventType: 
    | "COMMUNICATION_SENT"
    | "COMMUNICATION_DELIVERED"
    | "COMMUNICATION_READ"
    | "COMMUNICATION_ACKNOWLEDGED"
    | "COMMUNICATION_FAILED"
    | "ESCALATION_TRIGGERED"
    | "ESCALATION_ACKNOWLEDGED"
    | "REGULATORY_DEADLINE_WARNING"
    | "REGULATORY_DEADLINE_MET"
    | "REGULATORY_DEADLINE_MISSED";
  
  // Reference
  communicationId?: string;
  escalationId?: string;
  
  // Details
  description: string;
  stakeholderName?: string;
  stakeholderRole?: StakeholderRole;
  channel?: CommunicationChannel;
  
  // Metadata
  timestamp: string;
  actorId?: string;
  actorName?: string;
  
  // Evidence
  evidenceEventId?: string;
}

// ═══════════════════════════════════════════════════════════════
// COMMUNICATION DASHBOARD SUMMARY
// ═══════════════════════════════════════════════════════════════

export interface CommunicationSummary {
  // Overview
  totalCommunications: number;
  byType: Record<CommunicationType, number>;
  byChannel: Record<CommunicationChannel, number>;
  byStatus: Record<CommunicationStatus, number>;
  
  // Delivery stats
  deliveryRate: number;
  readRate: number;
  acknowledgmentRate: number;
  averageResponseTime: number;    // minutes
  
  // Escalations
  activeEscalations: number;
  escalationsTriggeredToday: number;
  escalationAcknowledgmentRate: number;
  
  // Regulatory
  regulatoryNotifications: number;
  deadlinesMet: number;
  deadlinesMissed: number;
  upcomingDeadlines: {
    incidentId: string;
    regulation: string;
    deadline: string;
    hoursRemaining: number;
  }[];
  
  // Timestamps
  calculatedAt: string;
}

