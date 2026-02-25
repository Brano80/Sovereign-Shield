// ═══════════════════════════════════════════════════════════════
// ICT ASSET CORE
// ═══════════════════════════════════════════════════════════════

export type AssetStatus = "ACTIVE" | "INACTIVE" | "DECOMMISSIONING" | "DECOMMISSIONED" | "PENDING_APPROVAL";
export type AssetCriticality = "CRITICAL" | "IMPORTANT" | "STANDARD" | "LOW";
export type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED" | "EXPIRED" | "REVOKED";

export type ICTAssetCategory = 
  | "HARDWARE"
  | "SOFTWARE"
  | "NETWORK"
  | "DATA"
  | "CLOUD_SERVICE"
  | "API"
  | "PROTOCOL"
  | "TOOL"
  | "THIRD_PARTY_SERVICE";

export type ICTAssetSubcategory = 
  // Hardware
  | "SERVER" | "WORKSTATION" | "NETWORK_DEVICE" | "STORAGE" | "MOBILE_DEVICE" | "IOT_DEVICE"
  // Software
  | "OPERATING_SYSTEM" | "DATABASE" | "APPLICATION" | "MIDDLEWARE" | "SECURITY_SOFTWARE"
  // Network
  | "FIREWALL" | "LOAD_BALANCER" | "VPN" | "DNS" | "PROXY"
  // Data
  | "DATABASE_INSTANCE" | "DATA_WAREHOUSE" | "DATA_LAKE" | "FILE_STORAGE"
  // Cloud
  | "IAAS" | "PAAS" | "SAAS" | "FAAS"
  // API
  | "REST_API" | "GRAPHQL_API" | "SOAP_API" | "GRPC_API" | "WEBHOOK"
  // Protocol
  | "COMMUNICATION_PROTOCOL" | "SECURITY_PROTOCOL" | "DATA_PROTOCOL"
  // Tool
  | "MONITORING_TOOL" | "DEPLOYMENT_TOOL" | "SECURITY_TOOL" | "DEVELOPMENT_TOOL"
  // Third Party
  | "EXTERNAL_SERVICE" | "VENDOR_PLATFORM" | "PARTNER_INTEGRATION";

export interface ICTAsset {
  id: string;
  
  // Identity
  assetId: string;                    // e.g., "ICT-HW-001"
  name: string;
  description: string;
  
  // Classification
  category: ICTAssetCategory;
  subcategory: ICTAssetSubcategory;
  criticality: AssetCriticality;
  
  // Status
  status: AssetStatus;
  approvalStatus: ApprovalStatus;
  
  // Version Information
  version: string;
  versionHistory: AssetVersion[];
  
  // Technical Details
  technicalDetails: {
    vendor?: string;
    product?: string;
    model?: string;
    serialNumber?: string;
    licenseType?: string;
    licenseExpiry?: string;
  };
  
  // Location & Environment
  location: {
    type: "ON_PREMISE" | "CLOUD" | "HYBRID" | "EDGE";
    datacenter?: string;
    region?: string;
    zone?: string;
    rack?: string;
  };
  
  environment: "PRODUCTION" | "STAGING" | "DEVELOPMENT" | "TEST" | "DR";
  
  // Business Context
  businessContext: {
    businessFunction: string;
    supportsCriticalFunction: boolean;
    criticalFunctionIds: string[];
    businessOwner: string;
    technicalOwner: string;
    department: string;
  };
  
  // Data Classification
  dataClassification: {
    handlesPersonalData: boolean;
    dataCategories: string[];
    highestDataClassification: "PUBLIC" | "INTERNAL" | "CONFIDENTIAL" | "RESTRICTED";
  };
  
  // Dependencies
  dependencies: AssetDependency[];
  
  // External Interactions (DORA Art.7(8))
  externalInteractions: ExternalInteraction[];
  
  // Compliance
  compliance: {
    whitelistId?: string;
    approvedAt?: string;
    approvedBy?: string;
    approvalExpiry?: string;
    complianceStatus: "COMPLIANT" | "NON_COMPLIANT" | "PENDING_REVIEW" | "EXEMPTED";
    lastComplianceCheck?: string;
    nextComplianceCheck: string;
  };
  
  // Risk Linkage (to Art.6)
  riskProfile?: {
    riskAssessmentId?: string;
    currentRiskScore?: number;
    riskLevel?: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "MINIMAL";
    lastAssessedAt?: string;
  };
  
  // Lifecycle
  lifecycle: {
    acquisitionDate?: string;
    deploymentDate?: string;
    lastMaintenanceDate?: string;
    endOfLifeDate?: string;
    decommissionDate?: string;
  };
  
  // Documentation
  documentation: {
    technicalDocUrl?: string;
    operationalDocUrl?: string;
    securityDocUrl?: string;
  };
  
  // Audit
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
  lastReviewedAt?: string;
  lastReviewedBy?: string;
  nextReviewDate: string;
}

// ═══════════════════════════════════════════════════════════════
// VERSION TRACKING
// ═══════════════════════════════════════════════════════════════

export interface AssetVersion {
  id: string;
  assetId: string;
  
  // Version details
  version: string;
  previousVersion?: string;
  versionType: "MAJOR" | "MINOR" | "PATCH" | "SECURITY";
  
  // Change details
  changeDescription: string;
  changeType: "UPGRADE" | "DOWNGRADE" | "PATCH" | "CONFIGURATION" | "MIGRATION";
  changeReason: string;
  
  // Approval
  approvalStatus: ApprovalStatus;
  approvedBy?: string;
  approvedAt?: string;
  changeRequestId?: string;
  
  // Deployment
  deployedAt?: string;
  deployedBy?: string;
  rollbackVersion?: string;
  
  // Evidence
  evidenceEventId?: string;
  
  // Timestamps
  createdAt: string;
  createdBy: string;
}

export interface VersionComplianceRule {
  id: string;
  
  // Scope
  assetCategory?: ICTAssetCategory;
  assetSubcategory?: ICTAssetSubcategory;
  vendor?: string;
  product?: string;
  
  // Version requirements
  minimumVersion?: string;
  maximumVersion?: string;
  allowedVersions?: string[];
  blockedVersions?: string[];
  
  // EOL/EOS tracking
  endOfLifeDate?: string;
  endOfSupportDate?: string;
  
  // Compliance
  isActive: boolean;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  remediationDeadlineDays: number;
  
  // Metadata
  createdAt: string;
  createdBy: string;
  updatedAt: string;
}

// ═══════════════════════════════════════════════════════════════
// DEPENDENCIES (DORA Art.7(4))
// ═══════════════════════════════════════════════════════════════

export type DependencyType = 
  | "DEPENDS_ON"        // This asset depends on target
  | "REQUIRED_BY"       // This asset is required by target
  | "COMMUNICATES_WITH" // Bidirectional communication
  | "DATA_FLOW_TO"      // Data flows from this to target
  | "DATA_FLOW_FROM"    // Data flows from target to this
  | "BACKUP_OF"         // This is backup/DR of target
  | "REPLICATED_FROM";  // This is replica of target

export interface AssetDependency {
  id: string;
  sourceAssetId: string;
  targetAssetId: string;
  
  // Dependency details
  dependencyType: DependencyType;
  criticality: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  description: string;
  
  // Technical details
  protocol?: string;
  port?: number;
  connectionType?: "SYNC" | "ASYNC" | "BATCH";
  
  // SLA
  requiredAvailability?: number;  // e.g., 99.9
  maxLatencyMs?: number;
  
  // Status
  status: "ACTIVE" | "INACTIVE" | "DEPRECATED";
  lastVerifiedAt?: string;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}

// ═══════════════════════════════════════════════════════════════
// EXTERNAL INTERACTIONS (DORA Art.7(8))
// ═══════════════════════════════════════════════════════════════

export type ExternalPartyType = 
  | "THIRD_PARTY_PROVIDER"
  | "CUSTOMER"
  | "PARTNER"
  | "REGULATOR"
  | "VENDOR"
  | "SUBSIDIARY"
  | "OTHER";

export interface ExternalInteraction {
  id: string;
  assetId: string;
  
  // External party
  externalPartyType: ExternalPartyType;
  externalPartyId?: string;          // Link to third-party registry
  externalPartyName: string;
  
  // Interaction details
  interactionType: "INBOUND" | "OUTBOUND" | "BIDIRECTIONAL";
  purpose: string;
  dataExchanged: string[];
  
  // Technical
  protocol: string;
  endpoint?: string;
  authenticationMethod: string;
  encryptionMethod: string;
  
  // Contract
  contractReference?: string;
  slaReference?: string;
  
  // Risk
  riskAssessmentRequired: boolean;
  lastRiskAssessment?: string;
  
  // Status
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}

// ═══════════════════════════════════════════════════════════════
// WHITELIST & APPROVAL
// ═══════════════════════════════════════════════════════════════

export interface WhitelistEntry {
  id: string;
  
  // Component identification
  category: ICTAssetCategory;
  subcategory?: ICTAssetSubcategory;
  vendor: string;
  product: string;
  
  // Approved versions
  approvedVersions: {
    version: string;
    approvedAt: string;
    approvedBy: string;
    expiresAt?: string;
    notes?: string;
  }[];
  
  // Blocked versions
  blockedVersions: {
    version: string;
    reason: string;
    blockedAt: string;
    blockedBy: string;
  }[];
  
  // Approval scope
  approvalScope: {
    environments: ("PRODUCTION" | "STAGING" | "DEVELOPMENT" | "TEST" | "DR")[];
    departments?: string[];
    useCases?: string[];
  };
  
  // Security requirements
  securityRequirements: {
    requiredSecurityConfigs?: string[];
    requiredPatches?: string[];
    securityReviewRequired: boolean;
    lastSecurityReview?: string;
  };
  
  // Status
  status: "ACTIVE" | "DEPRECATED" | "REVOKED";
  
  // Metadata
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
  reviewCycle: "QUARTERLY" | "SEMI_ANNUAL" | "ANNUAL";
  nextReviewDate: string;
}

export interface WhitelistViolation {
  id: string;
  assetId: string;
  assetName: string;
  
  // Violation details
  violationType: "UNAPPROVED_COMPONENT" | "BLOCKED_VERSION" | "EXPIRED_APPROVAL" | "WRONG_ENVIRONMENT";
  description: string;
  
  // Current state
  currentVendor: string;
  currentProduct: string;
  currentVersion: string;
  
  // Expected state
  whitelistEntryId?: string;
  allowedVersions?: string[];
  
  // Severity
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  
  // Status
  status: "OPEN" | "ACKNOWLEDGED" | "REMEDIATED" | "EXEMPTED" | "FALSE_POSITIVE";
  
  // Resolution
  resolutionDeadline: string;
  resolvedAt?: string;
  resolvedBy?: string;
  resolutionNotes?: string;
  exemptionReason?: string;
  exemptionApprovedBy?: string;
  
  // Evidence
  evidenceEventId: string;
  
  // Timestamps
  detectedAt: string;
  createdAt: string;
  updatedAt: string;
}

// ═══════════════════════════════════════════════════════════════
// INVENTORY SUMMARY
// ═══════════════════════════════════════════════════════════════

export interface InventorySummary {
  // Asset counts
  totalAssets: number;
  assetsByCategory: Record<ICTAssetCategory, number>;
  assetsByCriticality: Record<AssetCriticality, number>;
  assetsByStatus: Record<AssetStatus, number>;
  assetsByEnvironment: Record<string, number>;
  
  // Approval status
  approvalStats: {
    approved: number;
    pending: number;
    rejected: number;
    expired: number;
  };
  
  // Compliance
  complianceStats: {
    compliant: number;
    nonCompliant: number;
    pendingReview: number;
    exempted: number;
  };
  
  // Whitelist violations
  violations: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    open: number;
  };
  
  // Version compliance
  versionCompliance: {
    upToDate: number;
    outdated: number;
    endOfLife: number;
    unknown: number;
  };
  
  // External interactions
  externalInteractions: {
    total: number;
    byType: Record<ExternalPartyType, number>;
    active: number;
  };
  
  // Dependencies
  dependencies: {
    total: number;
    critical: number;
  };
  
  // Review status
  reviewStatus: {
    overdueReviews: number;
    upcomingReviews: number;
  };
  
  // Timestamps
  calculatedAt: string;
}

