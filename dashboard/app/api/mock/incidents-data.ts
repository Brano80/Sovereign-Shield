import { UnifiedIncidentsData, Incident, IncidentDeadline, calculateUrgencyLevel, calculateRemainingSeconds } from '@/app/types/incidents';

const now = new Date();

// Helper to create incident with calculated deadline
function createIncident(
  id: string,
  incidentNumber: string,
  title: string,
  regulation: 'GDPR' | 'DORA' | 'AI_ACT' | 'NIS2',
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW',
  status: 'ACTIVE' | 'INVESTIGATING' | 'RESOLVED' | 'OVERDUE',
  deadlineOffsetSeconds: number, // negative for overdue, positive for upcoming
  affectedSystems: string[] = [],
  evidenceCount: number = 0,
  complianceImpact: number = 0
): Incident {
  const createdAt = new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000); // Random within last week
  const deadlineAt = new Date(now.getTime() + deadlineOffsetSeconds * 1000);
  const remainingSeconds = calculateRemainingSeconds(deadlineAt);

  const deadline: IncidentDeadline = {
    id: `${id}-deadline`,
    incidentId: id,
    regulation,
    deadlineType: 'REPORTING',
    deadlineAt,
    createdAt,
    status: remainingSeconds < 0 ? 'OVERDUE' : remainingSeconds < 14400 ? 'PENDING' : 'MET',
    remainingSeconds,
    urgencyLevel: calculateUrgencyLevel(remainingSeconds)
  };

  return {
    id,
    incidentNumber,
    title,
    description: `Incident ${incidentNumber} - ${title}`,
    regulation,
    severity,
    status,
    createdAt,
    updatedAt: createdAt,
    deadlines: [deadline],
    affectedSystems,
    tags: [regulation.toLowerCase(), severity.toLowerCase()],
    evidenceCount,
    complianceImpact
  };
}

export const mockIncidentsData: UnifiedIncidentsData = {
  incidents: [
    // INC-2025-047 (GDPR): Status OVERDUE (-02:15:33)
    createIncident(
      'inc-2025-047',
      'INC-2025-047',
      'Unauthorized data access detected',
      'GDPR',
      'HIGH',
      'OVERDUE',
      -8133, // -2h 15m 33s
      ['user-database', 'authentication-service'],
      5,
      75
    ),

    // INC-2025-052 (DORA): Status URGENT (18:44:27)
    createIncident(
      'inc-2025-052',
      'INC-2025-052',
      'Service disruption in payment processing',
      'DORA',
      'CRITICAL',
      'ACTIVE',
      67467, // 18h 44m 27s
      ['payment-gateway', 'transaction-processor', 'backup-systems'],
      12,
      90
    ),

    // INC-2025-053 (DORA): Status ON TRACK (67:22:15)
    createIncident(
      'inc-2025-053',
      'INC-2025-053',
      'Minor SLA degradation detected',
      'DORA',
      'MEDIUM',
      'INVESTIGATING',
      241335, // 67h 22m 15s
      ['monitoring-service', 'load-balancer'],
      3,
      45
    )
  ],

  summary: {
    total: 3,
    active: 2,
    critical: 1,
    resolved: 0,
    overdue: 1
  },

  deadlines: {
    upcoming: 2,
    overdue: 1,
    met: 0
  },

  regulations: {
    GDPR: {
      incidents: 1,
      compliance: 0.87,
      overdueCount: 1
    },
    DORA: {
      incidents: 2,
      compliance: 0.72,
      overdueCount: 0
    },
    AI_ACT: {
      incidents: 0,
      compliance: 0.94,
      overdueCount: 0
    },
    NIS2: {
      incidents: 0,
      compliance: 0.89,
      overdueCount: 0
    }
  },

  lastUpdated: now
};

// Export individual incidents for easier access
export const mockIncidents = mockIncidentsData.incidents;

// Helper functions for working with mock data
export function getIncidentsByStatus(status: string): Incident[] {
  return mockIncidents.filter(incident => incident.status === status);
}

export function getIncidentsByRegulation(regulation: string): Incident[] {
  return mockIncidents.filter(incident => incident.regulation === regulation);
}

export function getOverdueIncidents(): Incident[] {
  return mockIncidents.filter(incident =>
    incident.deadlines?.some(deadline => deadline.urgencyLevel === 'OVERDUE')
  );
}

export function getUrgentIncidents(): Incident[] {
  return mockIncidents.filter(incident =>
    incident.deadlines?.some(deadline => deadline.urgencyLevel === 'URGENT')
  );
}
