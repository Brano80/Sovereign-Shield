// ═══════════════════════════════════════════════════════════════
// COMPLIANCE SCORE TYPES
// ═══════════════════════════════════════════════════════════════

export type Regulation = 'GDPR' | 'DORA' | 'NIS2' | 'AI_ACT';

export type ComplianceStatus = 'COMPLIANT' | 'PARTIAL' | 'NON_COMPLIANT' | 'NOT_ASSESSED';

export type TrendDirection = 'UP' | 'DOWN' | 'STABLE';

// ═══════════════════════════════════════════════════════════════
// ARTICLE SCORE
// ═══════════════════════════════════════════════════════════════

export interface ArticleScore {
  articleId: string;           // e.g., "GDPR-33", "DORA-19"
  articleName: string;         // e.g., "Breach Notification"
  regulation: Regulation;

  // Score
  score: number;               // 0-100
  status: ComplianceStatus;
  confidence: number;          // 0-100 (how certain we are)

  // Query results
  queryId: string;             // Related compliance query
  queryResult: 'PROVEN' | 'PARTIAL' | 'NOT_PROVEN';
  evidenceCount: number;

  // Gaps
  gaps: {
    description: string;
    recommendation: string;
    severity: 'HIGH' | 'MEDIUM' | 'LOW';
  }[];

  // Timing
  lastAssessedAt: string;
  nextAssessmentDue?: string;

  // Trend
  previousScore?: number;
  trend: TrendDirection;
}

// ═══════════════════════════════════════════════════════════════
// REGULATION SCORE
// ═══════════════════════════════════════════════════════════════

export interface RegulationScore {
  regulation: Regulation;
  regulationName: string;      // e.g., "General Data Protection Regulation"

  // Overall score
  score: number;               // 0-100 (weighted average of articles)
  status: ComplianceStatus;

  // Article breakdown
  totalArticles: number;
  compliantArticles: number;
  partialArticles: number;
  nonCompliantArticles: number;
  notAssessedArticles: number;

  // Detailed scores
  articles: ArticleScore[];

  // Critical items
  criticalGaps: ArticleScore['gaps'];
  activeClocks: {
    clockId: string;
    clockType: string;
    deadline: string;
    status: string;
  }[];

  // Trend
  previousScore?: number;
  trend: TrendDirection;
  trendPercentage?: number;    // e.g., +5% or -3%

  // Timing
  lastUpdatedAt: string;
}

// ═══════════════════════════════════════════════════════════════
// OVERALL COMPLIANCE SCORE
// ═══════════════════════════════════════════════════════════════

export interface OverallComplianceScore {
  // Overall metrics
  overallScore: number;        // 0-100
  overallStatus: ComplianceStatus;

  // Per-regulation scores
  regulations: RegulationScore[];

  // Summary stats
  totalArticles: number;
  compliantArticles: number;
  partialArticles: number;
  nonCompliantArticles: number;
  notAssessedArticles: number;

  // Critical items across all regulations
  criticalGaps: {
    regulation: Regulation;
    articleId: string;
    description: string;
    recommendation: string;
  }[];

  activeClocks: {
    regulation: Regulation;
    clockId: string;
    clockType: string;
    deadline: string;
    hoursRemaining: number;
    status: string;
  }[];

  // Alerts summary
  activeAlerts: {
    total: number;
    critical: number;
    warning: number;
  };

  // Trend
  previousScore?: number;
  trend: TrendDirection;
  trendPercentage?: number;

  // Timing
  calculatedAt: string;
  dataRange: {
    from: string;
    to: string;
  };
}

// ═══════════════════════════════════════════════════════════════
// MONTHLY SUMMARY
// ═══════════════════════════════════════════════════════════════

export interface MonthlyComplianceSummary {
  month: string;               // e.g., "2025-01"

  // Request counts
  totalRequests: number;
  blockedRequests: number;
  dataSubjectRequests: number;
  breachNotifications: number;
  incidentReports: number;

  // Scores at end of month
  overallScore: number;
  regulationScores: {
    regulation: Regulation;
    score: number;
  }[];

  // Trends
  gdprTrend: TrendDirection;
  doraTrend: TrendDirection;
  aiActTrend: TrendDirection;
  nis2Trend: TrendDirection;
}

// ═══════════════════════════════════════════════════════════════
// ARTICLE MAPPING
// ═══════════════════════════════════════════════════════════════

export interface ArticleMapping {
  articleId: string;
  articleNumber: string;       // e.g., "33", "5"
  articleName: string;
  regulation: Regulation;
  queryIds: string[];          // Compliance queries that verify this article
  weight: number;              // Weight in regulation score (0-1)
  isCritical: boolean;
  description: string;
}

// Pre-defined article mappings
export const ARTICLE_MAPPINGS: ArticleMapping[] = [
  // GDPR Articles
  { articleId: 'GDPR-6', articleNumber: '6', articleName: 'Lawfulness of Processing', regulation: 'GDPR', queryIds: ['GDPR-6-LAWFUL-BASIS'], weight: 0.1, isCritical: true, description: 'Legal basis for processing personal data' },
  { articleId: 'GDPR-7', articleNumber: '7', articleName: 'Conditions for Consent', regulation: 'GDPR', queryIds: ['GDPR-7-CONSENT-CONDITIONS'], weight: 0.08, isCritical: false, description: 'Requirements for valid consent' },
  { articleId: 'GDPR-15', articleNumber: '15', articleName: 'Right of Access', regulation: 'GDPR', queryIds: ['GDPR-15-ACCESS-RIGHTS'], weight: 0.08, isCritical: false, description: 'Data subject access requests' },
  { articleId: 'GDPR-17', articleNumber: '17', articleName: 'Right to Erasure', regulation: 'GDPR', queryIds: ['GDPR-17-ERASURE'], weight: 0.08, isCritical: false, description: 'Right to be forgotten' },
  { articleId: 'GDPR-20', articleNumber: '20', articleName: 'Right to Data Portability', regulation: 'GDPR', queryIds: ['GDPR-20-PORTABILITY'], weight: 0.06, isCritical: false, description: 'Data portability requests' },
  { articleId: 'GDPR-25', articleNumber: '25', articleName: 'Data Protection by Design', regulation: 'GDPR', queryIds: ['GDPR-25-DPbD'], weight: 0.08, isCritical: false, description: 'Privacy by design and default' },
  { articleId: 'GDPR-30', articleNumber: '30', articleName: 'Records of Processing', regulation: 'GDPR', queryIds: ['GDPR-30-RECORDS'], weight: 0.08, isCritical: true, description: 'Processing activities register' },
  { articleId: 'GDPR-32', articleNumber: '32', articleName: 'Security of Processing', regulation: 'GDPR', queryIds: ['GDPR-32-SECURITY'], weight: 0.1, isCritical: true, description: 'Technical and organizational security measures' },
  { articleId: 'GDPR-33', articleNumber: '33', articleName: 'Breach Notification to Authority', regulation: 'GDPR', queryIds: ['GDPR-33-BREACH-NOTIFICATION'], weight: 0.12, isCritical: true, description: '72-hour breach notification requirement' },
  { articleId: 'GDPR-34', articleNumber: '34', articleName: 'Breach Notification to Subjects', regulation: 'GDPR', queryIds: ['GDPR-34-SUBJECT-NOTIFICATION'], weight: 0.1, isCritical: true, description: 'High-risk breach notification to data subjects' },
  { articleId: 'GDPR-35', articleNumber: '35', articleName: 'Data Protection Impact Assessment', regulation: 'GDPR', queryIds: ['GDPR-35-DPIA'], weight: 0.08, isCritical: true, description: 'DPIA for high-risk processing' },
  { articleId: 'GDPR-44', articleNumber: '44-49', articleName: 'International Transfers', regulation: 'GDPR', queryIds: ['GDPR-44-TRANSFERS'], weight: 0.04, isCritical: false, description: 'Cross-border data transfer safeguards' },

  // DORA Articles
  { articleId: 'DORA-5', articleNumber: '5', articleName: 'ICT Governance', regulation: 'DORA', queryIds: ['DORA-5-ICT-GOVERNANCE'], weight: 0.1, isCritical: true, description: 'Management body ICT oversight' },
  { articleId: 'DORA-6', articleNumber: '6', articleName: 'ICT Risk Management Framework', regulation: 'DORA', queryIds: ['DORA-6-ICT-RISK-MANAGEMENT'], weight: 0.1, isCritical: true, description: 'ICT risk management framework' },
  { articleId: 'DORA-7', articleNumber: '7', articleName: 'ICT Systems Inventory', regulation: 'DORA', queryIds: ['DORA-7-ICT-SYSTEMS-INVENTORY'], weight: 0.06, isCritical: false, description: 'ICT systems and assets inventory' },
  { articleId: 'DORA-8', articleNumber: '8', articleName: 'Critical Asset Identification', regulation: 'DORA', queryIds: ['DORA-8-ASSET-IDENTIFICATION'], weight: 0.06, isCritical: false, description: 'Critical ICT asset identification' },
  { articleId: 'DORA-9', articleNumber: '9', articleName: 'ICT Data Protection', regulation: 'DORA', queryIds: ['DORA-9-DATA-PROTECTION'], weight: 0.06, isCritical: false, description: 'Protection of ICT data' },
  { articleId: 'DORA-10', articleNumber: '10', articleName: 'Detection Capabilities', regulation: 'DORA', queryIds: ['DORA-10-DETECTION'], weight: 0.06, isCritical: false, description: 'Anomaly detection mechanisms' },
  { articleId: 'DORA-11', articleNumber: '11', articleName: 'Response Capabilities', regulation: 'DORA', queryIds: ['DORA-11-RESPONSE'], weight: 0.06, isCritical: false, description: 'ICT incident response' },
  { articleId: 'DORA-12', articleNumber: '12', articleName: 'Backup and Recovery', regulation: 'DORA', queryIds: ['DORA-12-BACKUP'], weight: 0.06, isCritical: false, description: 'ICT backup and restoration' },
  { articleId: 'DORA-13', articleNumber: '13', articleName: 'Learning and Communication', regulation: 'DORA', queryIds: ['DORA-13-LEARNING'], weight: 0.04, isCritical: false, description: 'Lessons learned from incidents' },
  { articleId: 'DORA-14', articleNumber: '14', articleName: 'Communication', regulation: 'DORA', queryIds: ['DORA-14-COMMUNICATION'], weight: 0.04, isCritical: false, description: 'ICT incident communication' },
  { articleId: 'DORA-17', articleNumber: '17', articleName: 'Incident Classification', regulation: 'DORA', queryIds: ['DORA-17-INCIDENT-CLASSIFICATION'], weight: 0.08, isCritical: true, description: 'ICT incident classification' },
  { articleId: 'DORA-19', articleNumber: '19', articleName: 'Major Incident Reporting', regulation: 'DORA', queryIds: ['DORA-19-MAJOR-INCIDENT-REPORTING'], weight: 0.1, isCritical: true, description: '4h/24h major incident reporting' },
  { articleId: 'DORA-28', articleNumber: '28', articleName: 'TPRM Policy', regulation: 'DORA', queryIds: ['DORA-28-TPRM-POLICY'], weight: 0.06, isCritical: false, description: 'Third-party risk management policy' },
  { articleId: 'DORA-29', articleNumber: '29', articleName: 'Vendor Assessment', regulation: 'DORA', queryIds: ['DORA-29-VENDOR-ASSESSMENT'], weight: 0.06, isCritical: false, description: 'ICT third-party assessment' },
  { articleId: 'DORA-30', articleNumber: '30', articleName: 'Critical ICT Providers', regulation: 'DORA', queryIds: ['DORA-30-CRITICAL-PROVIDERS'], weight: 0.06, isCritical: true, description: 'Critical ICT third-party oversight' },

  // NIS2 Articles
  { articleId: 'NIS2-20', articleNumber: '20', articleName: 'Management Accountability', regulation: 'NIS2', queryIds: ['NIS2-20-MANAGEMENT-ACCOUNTABILITY'], weight: 0.15, isCritical: true, description: 'Management body cybersecurity accountability' },
  { articleId: 'NIS2-21', articleNumber: '21', articleName: 'Security Measures', regulation: 'NIS2', queryIds: ['NIS2-21-SECURITY-MEASURES', 'NIS2-21-SUPPLY-CHAIN', 'NIS2-21-NETWORK-SECURITY', 'NIS2-21-INCIDENT-HANDLING', 'NIS2-21-BUSINESS-CONTINUITY', 'NIS2-21-HR-SECURITY'], weight: 0.35, isCritical: true, description: 'Cybersecurity risk management measures' },
  { articleId: 'NIS2-23-24H', articleNumber: '23', articleName: 'Early Warning (24h)', regulation: 'NIS2', queryIds: ['NIS2-23-INCIDENT-NOTIFICATION-24H'], weight: 0.2, isCritical: true, description: '24-hour early warning notification' },
  { articleId: 'NIS2-23-72H', articleNumber: '23', articleName: 'Incident Notification (72h)', regulation: 'NIS2', queryIds: ['NIS2-23-INCIDENT-NOTIFICATION-72H'], weight: 0.15, isCritical: true, description: '72-hour incident notification' },
  { articleId: 'NIS2-23-1M', articleNumber: '23', articleName: 'Final Report (1 month)', regulation: 'NIS2', queryIds: ['NIS2-23-FINAL-REPORT'], weight: 0.15, isCritical: false, description: '1-month final incident report' },

  // AI Act Articles
  { articleId: 'AI-ACT-5', articleNumber: '5', articleName: 'Prohibited Practices', regulation: 'AI_ACT', queryIds: ['AI-ACT-5-PROHIBITED-PRACTICES'], weight: 0.2, isCritical: true, description: 'Prohibited AI practices enforcement' },
  { articleId: 'AI-ACT-9', articleNumber: '9', articleName: 'Risk Management', regulation: 'AI_ACT', queryIds: ['AI-ACT-9-RISK-MANAGEMENT'], weight: 0.15, isCritical: true, description: 'AI risk management system' },
  { articleId: 'AI-ACT-11', articleNumber: '11', articleName: 'Technical Documentation', regulation: 'AI_ACT', queryIds: ['AI-ACT-11-TECHNICAL-DOCUMENTATION'], weight: 0.1, isCritical: false, description: 'AI system technical documentation' },
  { articleId: 'AI-ACT-12', articleNumber: '12', articleName: 'Record Keeping', regulation: 'AI_ACT', queryIds: ['AI-ACT-12-RECORD-KEEPING'], weight: 0.1, isCritical: false, description: 'AI system logging and records' },
  { articleId: 'AI-ACT-13', articleNumber: '13', articleName: 'Transparency', regulation: 'AI_ACT', queryIds: ['AI-ACT-13-TRANSPARENCY'], weight: 0.15, isCritical: true, description: 'AI system transparency requirements' },
  { articleId: 'AI-ACT-14', articleNumber: '14', articleName: 'Human Oversight', regulation: 'AI_ACT', queryIds: ['AI-ACT-14-HUMAN-OVERSIGHT'], weight: 0.15, isCritical: true, description: 'Human oversight of AI systems' },
  { articleId: 'AI-ACT-15', articleNumber: '15', articleName: 'Accuracy & Robustness', regulation: 'AI_ACT', queryIds: ['AI-ACT-15-ACCURACY'], weight: 0.1, isCritical: false, description: 'AI system accuracy monitoring' },
  { articleId: 'AI-ACT-52', articleNumber: '52', articleName: 'Chatbot Disclosure', regulation: 'AI_ACT', queryIds: ['AI-ACT-52-CHATBOT-DISCLOSURE'], weight: 0.05, isCritical: false, description: 'AI chatbot interaction disclosure' },
];

// Helper to get articles by regulation
export const getArticlesByRegulation = (regulation: Regulation): ArticleMapping[] => {
  return ARTICLE_MAPPINGS.filter(a => a.regulation === regulation);
};

// Helper to get article by ID
export const getArticleById = (articleId: string): ArticleMapping | undefined => {
  return ARTICLE_MAPPINGS.find(a => a.articleId === articleId);
};
