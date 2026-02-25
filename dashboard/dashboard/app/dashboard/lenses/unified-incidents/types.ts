export interface Incident {
  id: string;
  incidentNumber: string; // INC-2026-XXX
  title: string;
  description: string;

  // Classification
  regulations: ('GDPR' | 'DORA' | 'NIS2' | 'AI_ACT')[];
  primaryRegulation: 'GDPR' | 'DORA' | 'NIS2' | 'AI_ACT';
  incidentType: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'NEW' | 'INVESTIGATING' | 'ACTIVE' | 'REPORTING' | 'RESOLVED' | 'CLOSED';

  // Timestamps
  detectedAt: Date | string;
  classifiedAt?: Date | string;
  resolvedAt?: Date | string;
  closedAt?: Date | string;

  // GDPR specific
  gdprDataCategories?: string[];
  gdprSubjectsAffected?: number;
  gdprRiskLevel?: 'UNLIKELY' | 'RISK' | 'HIGH_RISK';

  // DORA specific
  doraClassificationCriteria?: string[];
  doraIsMajor?: boolean;
  doraServicesAffected?: string[];
  doraClientsAffected?: number;
  doraEconomicImpact?: number;

  // NIS2 specific
  nis2IsSignificant?: boolean;
  nis2CrossBorder?: boolean;

  // AI Act specific
  aiActSystemId?: string;
  aiActIsSerious?: boolean;

  // Assignments
  assigneeId: string;
  assignee?: string; // display name alias
  teamIds: string[];

  // Evidence
  evidenceGraphNodeId?: string;
  sealLevel: 'L1' | 'L2' | 'L3' | 'L4';
  evidenceSealLevel?: 'L1' | 'L2' | 'L3' | 'L4'; // alias for sealLevel

  // Reporting
  deadline?: IncidentDeadline; // convenience alias for nearest deadline
  reportType?: string;

  // Metadata
  createdAt: Date | string;
  updatedAt: Date | string;
  createdBy: string;
}

export interface IncidentDeadline {
  id: string;
  incidentId: string;
  regulation: 'GDPR' | 'DORA' | 'NIS2' | 'AI_ACT';
  reportType: 'INITIAL' | 'INTERMEDIATE' | 'FINAL' | 'EARLY_WARNING' | 'CLIENT_NOTIFICATION' | 'SUBJECT_NOTIFICATION' | 'BREACH_NOTIFICATION' | 'MAJOR_INCIDENT' | 'INCIDENT_NOTIFICATION';
  article: string;
  description?: string;
  dueAt: Date | string;
  submittedAt?: Date | string;
  status: 'PENDING' | 'SUBMITTED' | 'OVERDUE' | 'WAIVED';
  reportId?: string;
}

export interface IncidentReport {
  id: string;
  incidentId: string;
  deadlineId: string;
  regulation: 'GDPR' | 'DORA' | 'NIS2' | 'AI_ACT';
  reportType: string;
  status: 'DRAFT' | 'REVIEW' | 'SUBMITTED' | 'ACKNOWLEDGED';
  content: any;
  completeness: number; // 0-100%
  submittedAt?: Date | string;
  authorityId?: string;
  acknowledgedAt?: string;
  evidenceGraphNodeId?: string;
}

export interface UnifiedIncidentsData {
  totalIncidents: number;
  activeIncidents: number;
  criticalIncidents: number;
  overdueIncidents: number;
  incidents: Incident[];
  deadlines: IncidentDeadline[];
}

export interface IncidentsStats {
  totalIncidents: number;
  activeIncidents: number;
  criticalIncidents: number;
  overdueIncidents: number;
  avgResponseTime: number; // hours
  slaCompliance: number; // percentage
  gdprDeadlines: number;
  doraDeadlines: number;
  nis2Deadlines: number;
  aiActIncidents: number;
}

export type Regulation = 'GDPR' | 'DORA' | 'NIS2' | 'AI_ACT';
export type IncidentSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type IncidentStatus = 'NEW' | 'INVESTIGATING' | 'ACTIVE' | 'REPORTING' | 'RESOLVED' | 'CLOSED' | 'OVERDUE';
export type DeadlineStatus = 'PENDING' | 'SUBMITTED' | 'OVERDUE' | 'WAIVED';
export type ReportType = 'INITIAL' | 'INTERMEDIATE' | 'FINAL' | 'EARLY_WARNING' | 'CLIENT_NOTIFICATION' | 'SUBJECT_NOTIFICATION';
export type SealLevel = 'L1' | 'L2' | 'L3' | 'L4';

export interface PendingReport {
  id: string;
  incidentId: string;
  regulation: Regulation;
  reportType: string;
  dueDate?: Date | string;
  status?: string;
}
