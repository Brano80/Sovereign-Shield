// ═══════════════════════════════════════════════════════════════
// ICT ASSET RISK PROFILE
// ═══════════════════════════════════════════════════════════════

export type RiskLevel = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "MINIMAL";
export type RiskTrend = "INCREASING" | "STABLE" | "DECREASING";
export type ThresholdStatus = "EXCEEDED" | "WARNING" | "NORMAL";

export interface ICTAsset {
  id: string;
  name: string;
  type: ICTAssetType;
  criticality: "CRITICAL" | "IMPORTANT" | "STANDARD";
  owner: string;
  department: string;
  
  // Classification (DORA Art.6(2))
  classification: {
    dataClassification: "PUBLIC" | "INTERNAL" | "CONFIDENTIAL" | "RESTRICTED";
    businessFunction: string;
    supportsCriticalFunction: boolean;
    criticalFunctionId?: string;
  };
  
  // Dependencies
  dependencies: {
    upstreamAssets: string[];
    downstreamAssets: string[];
    thirdPartyProviders: string[];
  };
  
  // Current risk profile
  riskProfile: ICTRiskProfile;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  lastAssessedAt: string;
}

export type ICTAssetType = 
  | "APPLICATION"
  | "DATABASE" 
  | "SERVER"
  | "NETWORK"
  | "CLOUD_SERVICE"
  | "API"
  | "DATA_STORE"
  | "ENDPOINT"
  | "THIRD_PARTY_SERVICE";

export interface ICTRiskProfile {
  assetId: string;
  
  // Overall risk score (0-100)
  overallScore: number;
  riskLevel: RiskLevel;
  trend: RiskTrend;
  
  // Individual risk factors
  factors: RiskFactor[];
  
  // Threshold status
  thresholdStatus: ThresholdStatus;
  thresholdBreaches: ThresholdBreach[];
  
  // Historical
  previousScore: number;
  scoreChange: number;
  
  // Timestamps
  assessedAt: string;
  nextAssessmentDue: string;
}

// ═══════════════════════════════════════════════════════════════
// RISK FACTORS (Multi-dimensional assessment)
// ═══════════════════════════════════════════════════════════════

export interface RiskFactor {
  id: string;
  category: RiskFactorCategory;
  name: string;
  description: string;
  
  // Scoring
  score: number;           // 0-100
  weight: number;          // 0-1 (contribution to overall score)
  weightedScore: number;   // score * weight
  
  // Assessment
  likelihood: "RARE" | "UNLIKELY" | "POSSIBLE" | "LIKELY" | "ALMOST_CERTAIN";
  impact: "NEGLIGIBLE" | "MINOR" | "MODERATE" | "MAJOR" | "SEVERE";
  
  // Evidence
  evidenceSource: string;
  lastUpdated: string;
  
  // Mitigation
  mitigationStatus: "NONE" | "PARTIAL" | "FULL";
  mitigationControls: string[];
}

export type RiskFactorCategory =
  | "AVAILABILITY"        // System uptime, resilience
  | "INTEGRITY"           // Data integrity, accuracy
  | "CONFIDENTIALITY"     // Data protection, access control
  | "CONTINUITY"          // Business continuity, recovery
  | "THIRD_PARTY"         // Vendor/supplier risks
  | "CHANGE"              // Change management risks
  | "VULNERABILITY"       // Security vulnerabilities
  | "COMPLIANCE"          // Regulatory compliance gaps
  | "CONCENTRATION"       // Concentration risk (single points of failure)
  | "OBSOLESCENCE";       // Technology obsolescence

// ═══════════════════════════════════════════════════════════════
// RISK THRESHOLDS (DORA Art.6(5))
// ═══════════════════════════════════════════════════════════════

export interface RiskThreshold {
  id: string;
  name: string;
  description: string;
  
  // Scope
  scope: ThresholdScope;
  
  // Threshold values
  warningThreshold: number;    // Yellow zone
  criticalThreshold: number;   // Red zone
  
  // Actions
  warningActions: ThresholdAction[];
  criticalActions: ThresholdAction[];
  
  // Status
  isActive: boolean;
  lastTriggeredAt?: string;
  
  // Metadata
  createdBy: string;
  approvedBy: string;
  approvedAt: string;
}

export interface ThresholdScope {
  type: "GLOBAL" | "ASSET_TYPE" | "CRITICALITY" | "DEPARTMENT" | "SPECIFIC_ASSET";
  assetTypes?: ICTAssetType[];
  criticalities?: ("CRITICAL" | "IMPORTANT" | "STANDARD")[];
  departments?: string[];
  assetIds?: string[];
}

export interface ThresholdAction {
  type: "ALERT" | "ESCALATE" | "NOTIFY" | "AUTO_REMEDIATE" | "BLOCK";
  target: string;           // Who/what to notify/escalate to
  template?: string;        // Notification template
  automationId?: string;    // For auto-remediation
}

export interface ThresholdBreach {
  id: string;
  thresholdId: string;
  thresholdName: string;
  
  assetId: string;
  assetName: string;
  
  breachType: "WARNING" | "CRITICAL";
  thresholdValue: number;
  actualValue: number;
  
  // Response
  status: "OPEN" | "ACKNOWLEDGED" | "MITIGATED" | "ACCEPTED" | "CLOSED";
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  
  // Actions taken
  actionsTaken: {
    action: string;
    takenBy: string;
    takenAt: string;
    result: string;
  }[];
  
  // Timestamps
  detectedAt: string;
  resolvedAt?: string;
}

// ═══════════════════════════════════════════════════════════════
// RISK ASSESSMENT
// ═══════════════════════════════════════════════════════════════

export interface RiskAssessment {
  id: string;
  assetId: string;
  
  // Assessment details
  assessmentType: "AUTOMATED" | "MANUAL" | "HYBRID";
  assessmentDate: string;
  assessor: string;
  
  // Scores
  previousScore: number;
  newScore: number;
  scoreChange: number;
  
  // Factors assessed
  factorsAssessed: RiskFactor[];
  
  // Findings
  findings: {
    category: RiskFactorCategory;
    finding: string;
    severity: RiskLevel;
    recommendation: string;
  }[];
  
  // Next steps
  remediationPlan?: {
    actions: string[];
    dueDate: string;
    owner: string;
  };
  
  // Evidence Graph linkage
  evidenceEventId: string;
}

// ═══════════════════════════════════════════════════════════════
// AGGREGATED RISK VIEWS
// ═══════════════════════════════════════════════════════════════

export interface OrganizationRiskSummary {
  // Overall metrics
  overallRiskScore: number;
  overallRiskLevel: RiskLevel;
  trend: RiskTrend;
  
  // Asset breakdown
  totalAssets: number;
  assetsByRiskLevel: Record<RiskLevel, number>;
  
  // Threshold status
  totalBreaches: number;
  criticalBreaches: number;
  warningBreaches: number;
  
  // Category breakdown
  riskByCategory: {
    category: RiskFactorCategory;
    averageScore: number;
    assetCount: number;
    trend: RiskTrend;
  }[];
  
  // Top risks
  topRisks: {
    assetId: string;
    assetName: string;
    score: number;
    primaryRiskFactor: string;
  }[];
  
  // Historical
  historicalScores: {
    date: string;
    score: number;
  }[];
  
  // Timestamps
  calculatedAt: string;
}

export interface RiskHeatmapData {
  cells: {
    x: string;           // Asset type or category
    y: string;           // Risk factor category
    value: number;       // Average risk score
    count: number;       // Number of assets
    level: RiskLevel;
  }[];
  
  xAxis: {
    label: string;
    categories: string[];
  };
  
  yAxis: {
    label: string;
    categories: string[];
  };
}

