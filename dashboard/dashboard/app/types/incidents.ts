export interface IncidentDeadline {
  id: string;
  incidentId: string;
  regulation: 'GDPR' | 'DORA' | 'AI_ACT' | 'NIS2';
  deadlineType: 'REPORTING' | 'NOTIFICATION' | 'RESOLUTION';
  deadlineAt: Date;
  createdAt: Date;
  status: 'PENDING' | 'MET' | 'OVERDUE';
  remainingSeconds: number;
  urgencyLevel: 'ON_TRACK' | 'URGENT' | 'OVERDUE';
}

export interface Incident {
  id: string;
  incidentNumber?: string; // e.g., "INC-2025-047"
  incidentId?: string; // backend id alias
  title: string;
  description: string;
  regulation: 'GDPR' | 'DORA' | 'AI_ACT' | 'NIS2';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  deadlines?: IncidentDeadline[];
  affectedSystems?: string[];
  assignedTo?: string;
  tags?: string[];
  evidenceCount?: number;
  complianceImpact?: number; // percentage 0-100
  runtimeMode?: string; // 'SHADOW' or 'PRODUCTION'
  // Additional fields from backend transformation
  detectionTime?: Date;
  regulatoryDeadline?: Date;
  dataSubjects?: number;
  financialImpact?: number;
  reported?: boolean;
  reportDeadline?: Date;
  category?: string;
  metadata?: any;
}

export interface UnifiedIncidentsData {
  incidents: Incident[];
  summary: {
    total: number;
    active: number;
    critical: number;
    resolved: number;
    overdue: number;
  };
  deadlines: {
    upcoming: number;
    overdue: number;
    met: number;
  };
  regulations: {
    [key: string]: {
      incidents: number;
      compliance: number;
      overdueCount: number;
    };
  };
  lastUpdated: Date;
}

// Helper function to calculate urgency level
export function calculateUrgencyLevel(remainingSeconds: number): 'ON_TRACK' | 'URGENT' | 'OVERDUE' {
  if (remainingSeconds < 0) {
    return 'OVERDUE';
  } else if (remainingSeconds < 14400) { // 4 hours in seconds
    return 'URGENT';
  } else {
    return 'ON_TRACK';
  }
}

// Helper function to calculate remaining seconds from deadline
export function calculateRemainingSeconds(deadline: Date): number {
  return Math.floor((deadline.getTime() - Date.now()) / 1000);
}
