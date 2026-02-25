// ═══════════════════════════════════════════════════════════════
// POLICY MANAGEMENT
// ═══════════════════════════════════════════════════════════════

export type PolicyStatus = "DRAFT" | "PENDING_APPROVAL" | "APPROVED" | "ACTIVE" | "DEPRECATED" | "ARCHIVED";
export type PolicyCategory = 
  | "ICT_SECURITY"
  | "ICT_OPERATIONS"
  | "ICT_RISK"
  | "INCIDENT_MANAGEMENT"
  | "BUSINESS_CONTINUITY"
  | "THIRD_PARTY"
  | "ACCESS_CONTROL"
  | "CHANGE_MANAGEMENT"
  | "DATA_GOVERNANCE"
  | "CRYPTOGRAPHY";

export interface Policy {
  id: string;
  
  // Identity
  policyNumber: string;           // e.g., "POL-ICT-001"
  name: string;
  description: string;
  category: PolicyCategory;
  
  // Classification
  scope: string[];                // Departments, systems affected
  regulatoryReferences: {
    regulation: "DORA" | "GDPR" | "NIS2" | "AI_ACT";
    articles: string[];
  }[];
  
  // Current version
  currentVersion: string;
  status: PolicyStatus;
  effectiveDate?: string;
  expiryDate?: string;
  
  // Content
  documentUrl?: string;
  documentHash?: string;
  
  // Ownership
  owner: string;                  // Actor ID
  ownerDepartment: string;
  reviewers: string[];            // Actor IDs
  approvers: string[];            // Actor IDs (multi-level)
  
  // Review cycle
  reviewFrequency: "QUARTERLY" | "SEMI_ANNUAL" | "ANNUAL" | "BIENNIAL";
  lastReviewDate?: string;
  nextReviewDate: string;
  
  // Metadata
  createdAt: string;
  createdBy: string;
  updatedAt: string;
}

export interface PolicyVersion {
  id: string;
  policyId: string;
  
  // Version info
  version: string;               // e.g., "2.1"
  versionType: "MAJOR" | "MINOR" | "PATCH";
  
  // Content
  documentUrl: string;
  documentHash: string;
  changelog: string;
  
  // Status
  status: PolicyStatus;
  
  // Approval
  approvalRequestId?: string;
  approvedBy?: string;
  approvedAt?: string;
  
  // Timestamps
  createdAt: string;
  createdBy: string;
  effectiveFrom?: string;
  effectiveUntil?: string;
}

// ═══════════════════════════════════════════════════════════════
// CHANGE REQUESTS & APPROVAL WORKFLOWS
// ═══════════════════════════════════════════════════════════════

export type ChangeRequestType = 
  | "NEW_POLICY"
  | "POLICY_UPDATE"
  | "POLICY_DEPRECATION"
  | "EXCEPTION_REQUEST"
  | "ROLE_CHANGE"
  | "ACCESS_CHANGE"
  | "SYSTEM_CHANGE";

export type ChangeRequestStatus = 
  | "DRAFT"
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "PENDING_APPROVAL"
  | "APPROVED"
  | "REJECTED"
  | "WITHDRAWN"
  | "IMPLEMENTED";

export type ApprovalDecision = "PENDING" | "APPROVED" | "REJECTED" | "DELEGATED";

export interface ChangeRequest {
  id: string;
  
  // Request details
  requestNumber: string;         // e.g., "CR-2025-0042"
  type: ChangeRequestType;
  title: string;
  description: string;
  justification: string;
  
  // Impact assessment
  impactAssessment: {
    riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    affectedSystems: string[];
    affectedDepartments: string[];
    businessImpact: string;
    securityImpact: string;
    complianceImpact: string;
  };
  
  // Related entities
  relatedPolicyId?: string;
  relatedAssetIds?: string[];
  
  // Regulatory tags
  regulatoryTags: ("DORA" | "GDPR" | "NIS2" | "AI_ACT")[];
  articles: string[];
  
  // Workflow
  status: ChangeRequestStatus;
  currentApprovalLevel: number;
  totalApprovalLevels: number;
  
  // Requestor
  requestedBy: string;
  requestedAt: string;
  
  // Implementation
  implementedBy?: string;
  implementedAt?: string;
  implementationNotes?: string;
  
  // Evidence
  evidenceEventId?: string;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface ApprovalLevel {
  level: number;
  name: string;                  // e.g., "Department Head", "CISO", "Board"
  approvers: string[];           // Actor IDs who can approve at this level
  requiredApprovals: number;     // How many approvals needed (for quorum)
  escalationTimeout?: number;    // Hours before auto-escalation
}

export interface ApprovalWorkflow {
  id: string;
  changeRequestId: string;
  
  // Workflow definition
  levels: ApprovalLevel[];
  currentLevel: number;
  
  // Decisions at each level
  decisions: ApprovalDecision[];
  
  // Status
  status: "IN_PROGRESS" | "COMPLETED" | "REJECTED" | "ESCALATED";
  
  // Timestamps
  startedAt: string;
  completedAt?: string;
}

export interface ApprovalAction {
  id: string;
  workflowId: string;
  changeRequestId: string;
  
  // Approval details
  level: number;
  levelName: string;
  
  // Actor
  actorId: string;
  actorName: string;
  actorRole: string;
  
  // Decision
  decision: ApprovalDecision;
  comments?: string;
  conditions?: string[];         // Approval with conditions
  
  // Delegation
  delegatedTo?: string;
  delegationReason?: string;
  
  // Timestamps
  decidedAt: string;
  
  // Evidence
  evidenceEventId: string;
}

// ═══════════════════════════════════════════════════════════════
// MANAGEMENT ACCOUNTABILITY (DORA Art.5(5))
// ═══════════════════════════════════════════════════════════════

export interface ManagementOversight {
  id: string;
  
  // Oversight activity
  activityType: 
    | "POLICY_APPROVAL"
    | "RISK_REVIEW"
    | "INCIDENT_ESCALATION"
    | "BUDGET_APPROVAL"
    | "STRATEGY_REVIEW"
    | "AUDIT_REVIEW"
    | "TRAINING_COMPLETION";
  
  // Actor (management body member)
  actorId: string;
  actorName: string;
  actorRole: string;
  authorityLevel: "EXECUTIVE" | "BOARD" | "COMMITTEE";
  
  // Activity details
  description: string;
  relatedEntityType?: "POLICY" | "INCIDENT" | "RISK" | "BUDGET" | "AUDIT";
  relatedEntityId?: string;
  
  // Decision/outcome
  decision?: string;
  outcome?: string;
  
  // Regulatory mapping
  regulatoryTags: string[];
  articles: string[];
  
  // Evidence
  evidenceEventId: string;
  documentReferences?: string[];
  
  // Timestamps
  occurredAt: string;
  recordedAt: string;
}

export interface RoleAssignment {
  id: string;
  
  // Actor
  actorId: string;
  actorName: string;
  
  // Role details
  role: string;
  roleType: "ICT_GOVERNANCE" | "ICT_RISK" | "ICT_OPERATIONS" | "COMPLIANCE" | "AUDIT";
  department: string;
  
  // Authority
  authorityLevel: "OPERATOR" | "MANAGER" | "EXECUTIVE" | "BOARD";
  canApprove: boolean;
  approvalLimit?: number;        // Max value they can approve
  
  // Segregation of duties
  incompatibleRoles: string[];   // Roles this person cannot hold simultaneously
  
  // Validity
  effectiveFrom: string;
  effectiveUntil?: string;
  status: "ACTIVE" | "SUSPENDED" | "REVOKED";
  
  // Evidence
  assignedBy: string;
  assignedAt: string;
  evidenceEventId: string;
}

export interface TrainingRecord {
  id: string;
  
  // Actor
  actorId: string;
  actorName: string;
  actorRole: string;
  
  // Training details
  trainingType: 
    | "ICT_GOVERNANCE"
    | "ICT_RISK"
    | "CYBERSECURITY"
    | "DORA_COMPLIANCE"
    | "INCIDENT_MANAGEMENT"
    | "DATA_PROTECTION";
  trainingName: string;
  provider: string;
  
  // Completion
  completedAt: string;
  validUntil: string;
  score?: number;
  certificateUrl?: string;
  
  // Regulatory
  regulatoryRequirement?: string;  // e.g., "DORA Art.5(8)"
  
  // Evidence
  evidenceEventId: string;
}

// ═══════════════════════════════════════════════════════════════
// GOVERNANCE DASHBOARD AGGREGATES
// ═══════════════════════════════════════════════════════════════

// Legacy type for backward compatibility
export interface GovernanceSummary {
  // Policy metrics
  policies: {
    total: number;
    byStatus: Record<PolicyStatus, number>;
    pendingReview: number;
    overdueReview: number;
  };

  // Change request metrics
  changeRequests: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    avgApprovalTime: number;     // hours
  };

  // Approval queue
  approvalQueue: {
    pendingMyApproval: number;
    pendingTotal: number;
    overdueApprovals: number;
  };

  // Management oversight
  oversight: {
    totalActivities: number;
    thisMonth: number;
    byType: Record<string, number>;
  };

  // Training compliance
  training: {
    totalRequired: number;
    completed: number;
    overdue: number;
    complianceRate: number;
  };

  // Timestamps
  calculatedAt: string;
}

// New type matching Rust backend response
export interface GovernanceStatus {
  total_policies: number;
  active_policies: number;
  pending_approvals: number;
  overdue_reviews: number;
  board_reviews_completed: number;
  acknowledgment_rate: number;
  last_updated: string;
  compliance_score: number;
}

