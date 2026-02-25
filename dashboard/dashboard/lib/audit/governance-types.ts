// ═══════════════════════════════════════════════════════════════
// GOVERNANCE TYPES (DORA Art.5)
// ═══════════════════════════════════════════════════════════════

export type PolicyCategory =
  | 'ICT_RISK_MANAGEMENT'
  | 'ICT_SECURITY'
  | 'ICT_OPERATIONS'
  | 'ICT_CONTINUITY'
  | 'INCIDENT_MANAGEMENT'
  | 'THIRD_PARTY_RISK'
  | 'ACCESS_CONTROL'
  | 'DATA_PROTECTION'
  | 'AI_GOVERNANCE'
  | 'CHANGE_MANAGEMENT'
  | 'TESTING'
  | 'AUDIT'
  | 'COMMUNICATION';

export type PolicyStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'ACTIVE' | 'DEPRECATED' | 'ARCHIVED';

export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'DEFERRED';

export type OversightType =
  | 'BOARD_MEETING'
  | 'COMMITTEE_MEETING'
  | 'QUARTERLY_REVIEW'
  | 'ANNUAL_REVIEW'
  | 'AD_HOC_REVIEW'
  | 'AUDIT_REVIEW'
  | 'RISK_ASSESSMENT';

export type TrainingType =
  | 'ICT_SECURITY_AWARENESS'
  | 'INCIDENT_RESPONSE'
  | 'DATA_PROTECTION'
  | 'AI_ETHICS'
  | 'DORA_COMPLIANCE'
  | 'NIS2_COMPLIANCE'
  | 'ROLE_SPECIFIC';

export type RoleType =
  | 'DPO'
  | 'CISO'
  | 'CTO'
  | 'CIO'
  | 'CEO'
  | 'CFO'
  | 'BOARD_MEMBER'
  | 'RISK_COMMITTEE_MEMBER'
  | 'AUDIT_COMMITTEE_MEMBER'
  | 'INCIDENT_MANAGER'
  | 'SECURITY_ANALYST'
  | 'COMPLIANCE_OFFICER';

// ═══════════════════════════════════════════════════════════════
// POLICY
// ═══════════════════════════════════════════════════════════════

export interface Policy {
  policyId: string;
  name: string;
  description: string;
  category: PolicyCategory;
  version: string;
  status: PolicyStatus;

  // Content
  documentUrl?: string;
  summary: string;
  scope: string[];

  // Ownership
  ownerId: string;
  ownerRole: RoleType;

  // Review cycle
  reviewFrequency: 'QUARTERLY' | 'SEMI_ANNUAL' | 'ANNUAL' | 'BIENNIAL';
  lastReviewedAt?: string;
  nextReviewDue?: string;

  // Regulatory mapping
  regulations: string[];
  articles: string[];

  // Approvals
  requiredApprovalLevel: 'MANAGER' | 'EXECUTIVE' | 'BOARD';
  approvals: PolicyApproval[];

  // Timestamps
  createdAt: string;
  updatedAt: string;
  effectiveFrom?: string;
  effectiveUntil?: string;
}

export interface PolicyApproval {
  approvalId: string;
  policyId: string;
  version: string;

  status: ApprovalStatus;

  approverId: string;
  approverRole: RoleType;
  approverName: string;

  comments?: string;
  conditions?: string;

  requestedAt: string;
  respondedAt?: string;
}

// ═══════════════════════════════════════════════════════════════
// OVERSIGHT ACTIVITY
// ═══════════════════════════════════════════════════════════════

export interface OversightActivity {
  activityId: string;
  activityType: OversightType;

  title: string;
  description: string;

  // Timing
  scheduledAt: string;
  conductedAt?: string;
  duration?: number; // minutes

  // Participants
  participants: {
    actorId: string;
    name: string;
    role: RoleType;
    attended: boolean;
  }[];

  // Agenda & Outcomes
  agendaItems: string[];
  decisions: string[];
  actionItems: {
    description: string;
    assignedTo: string;
    dueDate: string;
    status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED';
  }[];

  // Documentation
  minutesUrl?: string;
  attachments?: string[];

  // Evidence
  evidenceEventId?: string;
  artifactId?: string;

  // Regulatory
  regulations: string[];
  articles: string[];

  createdAt: string;
  updatedAt: string;
}

// ═══════════════════════════════════════════════════════════════
// TRAINING
// ═══════════════════════════════════════════════════════════════

export interface TrainingProgram {
  programId: string;
  name: string;
  description: string;
  trainingType: TrainingType;

  // Requirements
  targetRoles: RoleType[];
  mandatory: boolean;
  frequency: 'ONE_TIME' | 'ANNUAL' | 'SEMI_ANNUAL' | 'QUARTERLY';

  // Content
  duration: number; // minutes
  contentUrl?: string;
  assessmentRequired: boolean;
  passingScore?: number;

  // Regulatory
  regulations: string[];
  articles: string[];

  createdAt: string;
  updatedAt: string;
}

export interface TrainingCompletion {
  completionId: string;
  programId: string;

  // Participant
  actorId: string;
  actorName: string;
  actorRole: RoleType;

  // Status
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'EXPIRED';
  startedAt?: string;
  completedAt?: string;
  expiresAt?: string;

  // Assessment
  score?: number;
  passed?: boolean;

  // Evidence
  certificateUrl?: string;
  evidenceEventId?: string;

  createdAt: string;
  updatedAt: string;
}

// ═══════════════════════════════════════════════════════════════
// ROLE ASSIGNMENT
// ═══════════════════════════════════════════════════════════════

export interface RoleAssignment {
  assignmentId: string;

  actorId: string;
  actorName: string;
  actorEmail: string;

  role: RoleType;
  department: string;

  // Authority
  authorityLevel: 'OPERATOR' | 'MANAGER' | 'EXECUTIVE' | 'BOARD';
  canApprove: boolean;
  canEscalate: boolean;

  // Validity
  effectiveFrom: string;
  effectiveUntil?: string;
  isActive: boolean;

  // Backup
  backupActorId?: string;
  backupActorName?: string;

  createdAt: string;
  updatedAt: string;
}

// ═══════════════════════════════════════════════════════════════
// GOVERNANCE DASHBOARD STATS
// ═══════════════════════════════════════════════════════════════

export interface GovernanceStats {
  policies: {
    total: number;
    active: number;
    pendingApproval: number;
    overdueReview: number;
  };
  approvals: {
    pending: number;
    approved: number;
    rejected: number;
  };
  oversight: {
    scheduled: number;
    completed: number;
    upcoming: OversightActivity[];
  };
  training: {
    programs: number;
    completionRate: number;
    overdueCount: number;
  };
  roles: {
    assigned: number;
    vacant: number;
  };
}
