// ═══════════════════════════════════════════════════════════════
// INCIDENT PATTERN RECOGNITION
// ═══════════════════════════════════════════════════════════════

export type PatternType = 
  | "RECURRING"           // Same type of incident repeating
  | "SEASONAL"            // Time-based patterns (monthly, quarterly)
  | "CASCADE"             // One incident causing others
  | "CORRELATED"          // Incidents occurring together
  | "ESCALATING"          // Increasing severity over time
  | "SYSTEMIC"            // Affecting multiple systems
  | "VENDOR_RELATED"      // Third-party related patterns
  | "HUMAN_ERROR"         // Human factor patterns
  | "CONFIGURATION"       // Configuration-related patterns
  | "CAPACITY";           // Resource/capacity patterns

export type PatternConfidence = "HIGH" | "MEDIUM" | "LOW";
export type PatternStatus = "ACTIVE" | "MITIGATED" | "MONITORING" | "CLOSED";

export interface IncidentPattern {
  id: string;
  
  // Pattern identification
  patternId: string;              // e.g., "PAT-2025-0042"
  name: string;
  description: string;
  type: PatternType;
  
  // Detection details
  confidence: PatternConfidence;
  confidenceScore: number;        // 0-100
  detectionMethod: "ML_CLUSTERING" | "RULE_BASED" | "ANOMALY_DETECTION" | "MANUAL";
  
  // Pattern characteristics
  characteristics: {
    frequency: string;            // e.g., "2-3 times per month"
    averageInterval: number;      // days between occurrences
    typicalDuration: number;      // minutes
    typicalSeverity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
    affectedCategories: string[];
    affectedSystems: string[];
    affectedServices: string[];
    commonRootCauses: string[];
    timePatterns?: {
      dayOfWeek?: number[];       // 0-6 (Sunday-Saturday)
      hourOfDay?: number[];       // 0-23
      monthOfYear?: number[];     // 1-12
    };
  };
  
  // Related incidents
  relatedIncidents: {
    incidentId: string;
    occurredAt: string;
    severity: string;
    matchScore: number;           // 0-100 similarity
  }[];
  
  // Impact assessment
  cumulativeImpact: {
    totalIncidents: number;
    totalDowntimeMinutes: number;
    affectedUsers: number;
    financialImpact?: number;
    reputationalImpact?: "HIGH" | "MEDIUM" | "LOW";
  };
  
  // Risk linkage
  riskImplications: {
    riskCategoryId?: string;
    riskScoreContribution: number;
    linkedAssetIds: string[];
  };
  
  // Status
  status: PatternStatus;
  
  // Timestamps
  firstDetectedAt: string;
  lastOccurrenceAt: string;
  lastAnalyzedAt: string;
  createdAt: string;
  updatedAt: string;
}

// ═══════════════════════════════════════════════════════════════
// ROOT CAUSE ANALYSIS
// ═══════════════════════════════════════════════════════════════

export type RootCauseCategory = 
  | "TECHNICAL_FAILURE"
  | "HUMAN_ERROR"
  | "PROCESS_GAP"
  | "EXTERNAL_FACTOR"
  | "VENDOR_ISSUE"
  | "CAPACITY_ISSUE"
  | "CONFIGURATION_ERROR"
  | "SECURITY_BREACH"
  | "DEPENDENCY_FAILURE"
  | "UNKNOWN";

export interface RootCauseAnalysis {
  id: string;
  incidentId: string;
  
  // Analysis details
  analysisType: "AUTOMATED" | "MANUAL" | "HYBRID";
  analysisMethod: string;         // e.g., "5-Whys", "Fishbone", "ML-Assisted"
  
  // Root causes identified
  rootCauses: {
    id: string;
    category: RootCauseCategory;
    description: string;
    confidence: number;           // 0-100
    isPrimary: boolean;
    
    // Contributing factors
    contributingFactors: {
      factor: string;
      weight: number;             // 0-1
    }[];
    
    // Evidence
    evidence: string[];
    
    // Linked entities
    linkedAssetIds?: string[];
    linkedProcessIds?: string[];
    linkedVendorIds?: string[];
  }[];
  
  // Timeline analysis
  timeline: {
    timestamp: string;
    event: string;
    significance: "TRIGGER" | "CONTRIBUTOR" | "SYMPTOM" | "CONSEQUENCE";
  }[];
  
  // Analysis metadata
  analyzedBy: string;
  analyzedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  
  // Evidence linkage
  evidenceEventId?: string;
}

// ═══════════════════════════════════════════════════════════════
// LESSONS LEARNED
// ═══════════════════════════════════════════════════════════════

export type LessonCategory = 
  | "PREVENTION"
  | "DETECTION"
  | "RESPONSE"
  | "RECOVERY"
  | "COMMUNICATION"
  | "PROCESS"
  | "TECHNICAL"
  | "ORGANIZATIONAL";

export type LessonStatus = "DRAFT" | "REVIEWED" | "APPROVED" | "PUBLISHED" | "ARCHIVED";

export interface LessonLearned {
  id: string;
  
  // Identification
  lessonId: string;               // e.g., "LL-2025-0015"
  title: string;
  description: string;
  category: LessonCategory;
  
  // Source
  sourceIncidentId?: string;
  sourcePatternId?: string;
  sourceType: "INCIDENT" | "PATTERN" | "AUDIT" | "EXERCISE" | "EXTERNAL";
  
  // Content
  whatHappened: string;
  whyItHappened: string;
  whatWasLearned: string;
  
  // Applicability
  applicability: {
    departments: string[];
    assetCategories: string[];
    incidentTypes: string[];
    regulations: string[];
  };
  
  // Status
  status: LessonStatus;
  
  // Review
  createdBy: string;
  reviewedBy?: string;
  approvedBy?: string;
  
  // Sharing
  sharedWith: string[];           // Departments/teams
  sharedAt?: string;
  
  // Effectiveness
  implementationStatus: "NOT_STARTED" | "IN_PROGRESS" | "IMPLEMENTED" | "VERIFIED";
  effectivenessRating?: number;   // 1-5
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

// ═══════════════════════════════════════════════════════════════
// IMPROVEMENT RECOMMENDATIONS
// ═══════════════════════════════════════════════════════════════

export type RecommendationType = 
  | "PREVENTIVE"
  | "DETECTIVE"
  | "CORRECTIVE"
  | "PROCESS_IMPROVEMENT"
  | "TRAINING"
  | "POLICY_UPDATE"
  | "TECHNICAL_CONTROL"
  | "VENDOR_ACTION";

export type RecommendationPriority = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
export type RecommendationStatus = 
  | "PROPOSED"
  | "APPROVED"
  | "IN_PROGRESS"
  | "IMPLEMENTED"
  | "VERIFIED"
  | "REJECTED"
  | "DEFERRED";

export interface ImprovementRecommendation {
  id: string;
  
  // Identification
  recommendationId: string;       // e.g., "REC-2025-0078"
  title: string;
  description: string;
  type: RecommendationType;
  priority: RecommendationPriority;
  
  // Source
  sourceType: "PATTERN" | "ROOT_CAUSE" | "LESSON_LEARNED" | "AUDIT" | "MANUAL";
  sourceId?: string;
  generatedBy: "ML_ENGINE" | "RULE_ENGINE" | "ANALYST";
  
  // Recommendation details
  rationale: string;
  expectedBenefit: string;
  
  // Impact prediction
  impactPrediction: {
    incidentReduction: number;    // Percentage
    riskReduction: number;        // Percentage
    confidenceLevel: number;      // 0-100
    affectedPatterns: string[];
  };
  
  // Implementation
  implementation: {
    effort: "LOW" | "MEDIUM" | "HIGH";
    estimatedDays: number;
    requiredResources: string[];
    dependencies: string[];
    responsibleTeam: string;
  };
  
  // Status tracking
  status: RecommendationStatus;
  statusHistory: {
    status: RecommendationStatus;
    changedBy: string;
    changedAt: string;
    reason?: string;
  }[];
  
  // Approval
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  
  // Implementation tracking
  implementedAt?: string;
  implementedBy?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  
  // Effectiveness measurement
  effectiveness?: {
    measuredAt: string;
    incidentsBeforeCount: number;
    incidentsAfterCount: number;
    actualReduction: number;
    notes: string;
  };
  
  // Linkages
  linkedPolicyIds?: string[];
  linkedAssetIds?: string[];
  linkedControlIds?: string[];
  
  // Evidence
  evidenceEventId?: string;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
}

// ═══════════════════════════════════════════════════════════════
// PATTERN ANALYSIS RESULTS
// ═══════════════════════════════════════════════════════════════

export interface PatternAnalysisResult {
  analysisId: string;
  analyzedAt: string;
  
  // Input
  incidentsAnalyzed: number;
  timeRangeStart: string;
  timeRangeEnd: string;
  
  // Discovered patterns
  patternsFound: {
    new: number;
    updated: number;
    total: number;
  };
  
  // Patterns by type
  patternsByType: Record<PatternType, number>;
  
  // Top patterns
  topPatterns: {
    patternId: string;
    name: string;
    type: PatternType;
    incidentCount: number;
    confidence: number;
  }[];
  
  // Recommendations generated
  recommendationsGenerated: number;
  
  // Anomalies detected
  anomalies: {
    type: string;
    description: string;
    severity: string;
  }[];
  
  // Analysis metadata
  modelVersion: string;
  processingTimeMs: number;
}

// ═══════════════════════════════════════════════════════════════
// LEARNING DASHBOARD SUMMARY
// ═══════════════════════════════════════════════════════════════

export interface LearningSummary {
  // Pattern metrics
  patterns: {
    total: number;
    active: number;
    newThisMonth: number;
    mitigated: number;
    byType: Record<PatternType, number>;
  };
  
  // Root cause metrics
  rootCauses: {
    totalAnalyses: number;
    thisMonth: number;
    topCategories: {
      category: RootCauseCategory;
      count: number;
      percentage: number;
    }[];
  };
  
  // Lessons learned metrics
  lessons: {
    total: number;
    published: number;
    implemented: number;
    pendingReview: number;
  };
  
  // Recommendations metrics
  recommendations: {
    total: number;
    proposed: number;
    inProgress: number;
    implemented: number;
    verified: number;
    averageEffectiveness: number;
  };
  
  // Improvement trends
  trends: {
    incidentReduction: number;        // Percentage vs previous period
    mttrImprovement: number;          // Percentage
    recurrenceReduction: number;      // Percentage
  };
  
  // Timestamps
  calculatedAt: string;
}

