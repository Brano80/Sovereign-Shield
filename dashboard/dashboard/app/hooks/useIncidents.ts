"use client";

import { useState, useEffect } from "react";
import { complianceApi } from "@/app/lib/api-client";
import { UnifiedIncidentsData, Incident } from "@/app/types/incidents";

// Helper function to parse backend date strings safely
function parseBackendDate(dateStr: any): Date {
  if (!dateStr) return new Date();
  try {
    const parsed = new Date(dateStr);
    return isNaN(parsed.getTime()) ? new Date() : parsed;
  } catch {
    return new Date();
  }
}

// Helper function to calculate regulatory deadline
function calculateRegulatoryDeadline(incidentType: string, detectionTime: Date): Date {
  // Default 72-hour deadline for GDPR breaches
  const deadlineHours = incidentType.includes('BREACH') ? 72 :
                       incidentType.includes('MAJOR_INCIDENT') ? 24 :
                       incidentType.includes('ICT_DISRUPTION') ? 4 : 72;

  const deadline = new Date(detectionTime);
  deadline.setHours(deadline.getHours() + deadlineHours);
  return deadline;
}

export interface UseIncidentsReturn {
  incidents: Incident[];
  data: Incident[]; // Alias for incidents to match React Query pattern
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useIncidents(): UseIncidentsReturn {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIncidents = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('Fetching incidents using complianceApi');
      const responseData = await complianceApi.get<any>('/incidents');

      // Extract incidents array from response object
      const backendIncidents = responseData.incidents || [];
      console.log('Received incidents:', backendIncidents.length);

      // Transform backend data to frontend format
      const incidentsList = Array.isArray(backendIncidents) ? backendIncidents : [];
      const transformedIncidents: Incident[] = incidentsList.map(backend => {
        // Map incident type to regulation
        const regulationMap: { [key: string]: 'GDPR' | 'DORA' | 'AI_ACT' | 'NIS2' } = {
          'DATA_BREACH': 'GDPR',
          'ICT_DISRUPTION': 'DORA',
          'MAJOR_INCIDENT': 'DORA',
          'SYSTEM_FAILURE': 'DORA',
          'AI_SAFETY_INCIDENT': 'AI_ACT',
          'AI_BIAS_INCIDENT': 'AI_ACT',
          'AI_FAILURE': 'AI_ACT',
          'SECURITY_INCIDENT': 'GDPR'
        };

        const regulation = regulationMap[backend.incident_type] || backend.regulatory_framework || 'GDPR';

        // Calculate regulatory deadline
        const detectionTime = parseBackendDate(backend.detection_timestamp);
        const deadlineTime = calculateRegulatoryDeadline(backend.incident_type, detectionTime);

        return {
          id: backend.id,
          incidentId: backend.incident_id || `INC-${backend.id.slice(-6)}`,
          title: backend.title || `${backend.incident_type.replace(/_/g, ' ')} Incident`,
          description: backend.description || 'Incident reported',
          regulation,
          severity: backend.severity_level || 'MEDIUM',
          status: backend.status || 'ACTIVE',
          createdAt: parseBackendDate(backend.created_at),
          updatedAt: parseBackendDate(backend.updated_at),
          detectionTime,
          regulatoryDeadline: deadlineTime,
          affectedSystems: backend.affected_systems || [],
          dataSubjects: backend.data_subjects_affected || 0,
          financialImpact: backend.financial_impact || 0,
          reported: backend.reported || false,
          reportDeadline: deadlineTime,
          category: backend.category || backend.incident_type,
          tags: backend.tags || [],
          metadata: backend.metadata || {}
        };
      });

      setIncidents(transformedIncidents);
    } catch (err) {
      console.error('Failed to fetch incidents:', err);
      setError(err instanceof Error ? err.message : 'Failed to load incidents');
      setIncidents([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  return {
    incidents,
    data: incidents, // Alias for incidents to match React Query pattern
    isLoading,
    error,
    refetch: fetchIncidents
  };
}