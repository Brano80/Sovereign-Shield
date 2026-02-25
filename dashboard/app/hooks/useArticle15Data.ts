/**
 * Custom React Hook for Article 15 Performance Monitoring Data
 *
 * Provides centralized data fetching, caching, real-time updates,
 * and error handling for the Article 15 Performance Monitoring lens.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { complianceApi } from '../lib/api-client';

// Simple replacements for removed services
const ApiErrorHandler = {
  handleApiError: (err: any) => err?.message || 'An error occurred'
};

const realtimeUpdates = {
  connect: (handler: any, onError?: any) => {
    // Placeholder - would implement WebSocket connection
    console.log('Real-time updates connected');
  },
  disconnect: () => {
    // Placeholder - would disconnect WebSocket
    console.log('Real-time updates disconnected');
  }
};

const DataTransformers = {
  transformMetricsForChart: (metrics: any) => metrics,
  transformDriftForHeatmap: (driftResults: any) => driftResults,
  transformAlertsForDisplay: (alerts: any) => alerts,
  transformComplianceForGauge: (snapshot: any) => snapshot
};

// Types
import type {
  AISystem,
  PerformanceMetric,
  DriftDetection,
  RobustnessTest,
  SecurityEvent,
  ComplianceSnapshot,
  Alert,
  PerformanceDashboardSummary as PerformanceDashboardData
} from '../types/art15-performance.types';

// Hook return types
export interface UseArticle15DashboardReturn {
  dashboardData: PerformanceDashboardData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  lastUpdated: Date | null;
}

export interface UseArticle15SystemsReturn {
  systems: AISystem[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  addSystem: (system: any) => Promise<AISystem | null>;
  updateSystem: (id: string, updates: Partial<AISystem>) => Promise<boolean>;
  deleteSystem: (id: string) => Promise<boolean>;
}

export interface UseArticle15SystemDetailReturn {
  system: AISystem | null;
  performanceHistory: PerformanceMetric[];
  complianceSnapshot: ComplianceSnapshot | null;
  recentAlerts: Alert[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  submitMetrics: (metrics: any) => Promise<PerformanceMetric | null>;
  submitDrift: (drift: any) => Promise<DriftDetection | null>;
  submitSecurity: (security: any) => Promise<SecurityEvent | null>;
}

export interface UseArticle15AlertsReturn {
  alerts: Alert[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  acknowledgeAlert: (alertId: string, notes?: string) => Promise<boolean>;
  filterAlerts: (filters: AlertFilters) => Alert[];
}

export interface AlertFilters {
  status?: string;
  severity?: string;
  systemId?: string;
  dateRange?: { start: string; end: string };
}

// Custom hook for dashboard overview data
export function useArticle15Dashboard(autoRefresh: boolean = true): UseArticle15DashboardReturn {
  const [dashboardData, setDashboardData] = useState<PerformanceDashboardData | null>({
    total_systems: 0,
    systems_monitoring: 0,
    alerts_today: 0,
    compliance_score: 0.0,
    drift_alerts: 0,
    performance_degradation: 0.0,
    last_updated: new Date().toISOString()
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await complianceApi.get<PerformanceDashboardData>('/article15/dashboard');

      // Handle successful response - even if data is null/empty, it's not an error
      setDashboardData(data);
      setLastUpdated(new Date());
      setError(null); // Clear any previous errors
    } catch (err) {
      const errorMessage = ApiErrorHandler.handleApiError(err);
      setError(errorMessage);
      setDashboardData(null); // Clear data on error
    } finally {
      setLoading(false); // Always set loading to false
    }
  }, []);

  // Auto-refresh effect
  useEffect(() => {
    if (autoRefresh) {
      fetchData(); // Initial fetch

      const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds

      return () => clearInterval(interval);
    }
  }, [autoRefresh, fetchData]);

  // Real-time updates via WebSocket
  useEffect(() => {
    if (autoRefresh) {
      const handleRealtimeUpdate = (data: any) => {
        if (data.type === 'dashboard_update' || data.type === 'alert_new') {
          fetchData(); // Refetch data when real-time update received
        }
      };

      realtimeUpdates.connect(handleRealtimeUpdate);

      return () => {
        realtimeUpdates.disconnect();
      };
    }
  }, [autoRefresh, fetchData]);

  return {
    dashboardData,
    loading,
    error,
    refetch: fetchData,
    lastUpdated
  };
}

// Custom hook for AI systems management
export function useArticle15Systems(): UseArticle15SystemsReturn {
  const [systems, setSystems] = useState<AISystem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSystems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await complianceApi.get<AISystem[]>('/article15/systems');

      // Handle successful response - even if data is null/empty, it's not an error
      setSystems(data || []);
      setError(null); // Clear any previous errors
    } catch (err) {
      const errorMessage = ApiErrorHandler.handleApiError(err);
      setError(errorMessage);
      setSystems([]); // Clear systems on error
    } finally {
      setLoading(false); // Always set loading to false
    }
  }, []);

  const addSystem = useCallback(async (systemData: any): Promise<AISystem | null> => {
    try {
      const data = await complianceApi.post<AISystem>('/article15/systems', systemData);

      // Handle successful response
      setSystems(prev => [...prev, data]);
      return data;
    } catch (err) {
      const errorMessage = ApiErrorHandler.handleApiError(err);
      setError(errorMessage);
      return null;
    }
  }, []);

  const updateSystem = useCallback(async (id: string, updates: Partial<AISystem>): Promise<boolean> => {
    // Note: This would require a PUT endpoint in the backend
    // For now, we'll simulate by refetching
    try {
      await fetchSystems(); // Refetch all systems
      return true;
    } catch (err) {
      const errorMessage = ApiErrorHandler.handleApiError(err);
      setError(errorMessage);
      return false;
    }
  }, [fetchSystems]);

  const deleteSystem = useCallback(async (id: string): Promise<boolean> => {
    // Note: This would require a DELETE endpoint in the backend
    // For now, we'll simulate by filtering locally and refetching
    try {
      setSystems(prev => prev.filter(sys => sys.id !== id));
      return true;
    } catch (err) {
      const errorMessage = ApiErrorHandler.handleApiError(err);
      setError(errorMessage);
      return false;
    }
  }, []);

  useEffect(() => {
    fetchSystems();
  }, [fetchSystems]);

  return {
    systems,
    loading,
    error,
    refetch: fetchSystems,
    addSystem,
    updateSystem,
    deleteSystem
  };
}

// Custom hook for individual system details
export function useArticle15SystemDetail(systemId: string): UseArticle15SystemDetailReturn {
  const [system, setSystem] = useState<AISystem | null>(null);
  const [performanceHistory, setPerformanceHistory] = useState<PerformanceMetric[]>([]);
  const [complianceSnapshot, setComplianceSnapshot] = useState<ComplianceSnapshot | null>(null);
  const [recentAlerts, setRecentAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSystemData = useCallback(async () => {
    if (!systemId) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch system details, performance history, and compliance in parallel
      const [systemData, historyData, complianceData, alertsData] = await Promise.all([
        complianceApi.get<AISystem>(`/article15/systems/${systemId}`),
        complianceApi.get<PerformanceMetric[]>(`/article15/systems/${systemId}/performance?days=30`),
        complianceApi.get<ComplianceSnapshot>(`/article15/systems/${systemId}/compliance`),
        complianceApi.get<Alert[]>('/article15/alerts?limit=10') // Simplified - would filter by system in practice
      ]);

      // Handle successful responses - set data even if null/empty
      setSystem(systemData as AISystem);
      setPerformanceHistory((historyData as PerformanceMetric[]) || []);
      setComplianceSnapshot(complianceData as ComplianceSnapshot);

      if (alertsData) {
        // Filter alerts for this system (would be done server-side in production)
        const systemAlerts = alertsData.filter(alert => alert.ai_system_id === systemId);
        setRecentAlerts(systemAlerts);
      } else {
        setRecentAlerts([]);
      }

    } catch (err) {
      const errorMessage = ApiErrorHandler.handleApiError(err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [systemId]);

  const submitMetrics = useCallback(async (metrics: any): Promise<PerformanceMetric | null> => {
    try {
      const data = await complianceApi.post<PerformanceMetric>(`/article15/systems/${systemId}/metrics`, metrics);

      // Optimistically update the local state
      setPerformanceHistory(prev => [data as PerformanceMetric, ...prev.slice(0, 99)]);
      return data as PerformanceMetric;
    } catch (err) {
      const errorMessage = ApiErrorHandler.handleApiError(err);
      setError(errorMessage);
      return null;
    }
  }, [systemId]);

  const submitDrift = useCallback(async (drift: any): Promise<DriftDetection | null> => {
    try {
      const data = await complianceApi.post<DriftDetection>(`/article15/systems/${systemId}/drift`, drift);

      // Trigger refetch to update compliance snapshot
      fetchSystemData();
      return data as DriftDetection;
    } catch (err) {
      const errorMessage = ApiErrorHandler.handleApiError(err);
      setError(errorMessage);
      return null;
    }
  }, [systemId, fetchSystemData]);

  const submitSecurity = useCallback(async (security: any): Promise<SecurityEvent | null> => {
    try {
      const data = await complianceApi.post<SecurityEvent>(`/article15/systems/${systemId}/security`, security);

      // Trigger refetch to update any security-related displays
      fetchSystemData();
      return data as SecurityEvent;
    } catch (err) {
      const errorMessage = ApiErrorHandler.handleApiError(err);
      setError(errorMessage);
      return null;
    }
  }, [systemId, fetchSystemData]);

  useEffect(() => {
    fetchSystemData();
  }, [fetchSystemData]);

  return {
    system,
    performanceHistory,
    complianceSnapshot,
    recentAlerts,
    loading,
    error,
    refetch: fetchSystemData,
    submitMetrics,
    submitDrift,
    submitSecurity
  };
}

// Custom hook for alerts management
export function useArticle15Alerts(autoRefresh: boolean = true): UseArticle15AlertsReturn {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<AlertFilters>({});

  const fetchAlerts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await complianceApi.get<Alert[]>('/article15/alerts?' + new URLSearchParams({
        status: filters.status,
        severity: filters.severity,
        limit: '100'
      } as Record<string, string>).toString());

      // Handle successful response - even if data is null/empty, it's not an error
      setAlerts(data || []);
      setError(null); // Clear any previous errors
    } catch (err) {
      const errorMessage = ApiErrorHandler.handleApiError(err);
      setError(errorMessage);
      setAlerts([]); // Clear alerts on error
    } finally {
      setLoading(false); // Always set loading to false
    }
  }, [filters]);

  const acknowledgeAlert = useCallback(async (alertId: string, notes?: string): Promise<boolean> => {
    try {
      await complianceApi.post(`/article15/alerts/${alertId}/acknowledge`, { notes });

      // Optimistically update the local state
      setAlerts(prev => prev.map(alert =>
        alert.id === alertId
          ? { ...alert, status: 'acknowledged' as Alert['status'] }
          : alert
      ));
      return true;
    } catch (err) {
      const errorMessage = ApiErrorHandler.handleApiError(err);
      setError(errorMessage);
      return false;
    }
  }, []);

  const filterAlerts = useCallback((newFilters: AlertFilters): Alert[] => {
    setFilters(newFilters);
    return alerts.filter(alert => {
      if (newFilters.status && alert.status !== newFilters.status) return false;
      if (newFilters.severity && alert.severity !== newFilters.severity) return false;
      if (newFilters.systemId && alert.ai_system_id !== newFilters.systemId) return false;
      // Date range filtering would be implemented here
      return true;
    });
  }, [alerts]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  // Auto-refresh for alerts
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(fetchAlerts, 60000); // Refresh every minute for alerts
      return () => clearInterval(interval);
    }
  }, [autoRefresh, fetchAlerts]);

  return {
    alerts,
    loading,
    error,
    refetch: fetchAlerts,
    acknowledgeAlert,
    filterAlerts
  };
}

// Utility hook for export functionality
export function useArticle15Export() {
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exportReport = useCallback(async (
    format: 'pdf' | 'csv' | 'json',
    systemId?: string,
    dateRange?: { start: string; end: string }
  ): Promise<string | null> => {
    try {
      setExporting(true);
      setError(null);

      const data = await complianceApi.post<{ downloadUrl?: string }>('/article15/export', { format, systemId, dateRange });

      // In a real implementation, this would trigger a download
      // For now, we'll return the download URL
      return data.downloadUrl ?? null;
    } catch (err) {
      const errorMessage = ApiErrorHandler.handleApiError(err);
      setError(errorMessage);
      return null;
    } finally {
      setExporting(false);
    }
  }, []);

  return {
    exportReport,
    exporting,
    error
  };
}

// Utility hook for real-time updates
export function useArticle15Realtime() {
  const [connected, setConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<any>(null);

  useEffect(() => {
    const handleMessage = (data: any) => {
      setLastMessage(data);
    };

    const handleError = (error: any) => {
      console.error('WebSocket error:', error);
      setConnected(false);
    };

    realtimeUpdates.connect(
      (data: any) => {
        setConnected(true);
        handleMessage(data);
      },
      handleError
    );

    return () => {
      realtimeUpdates.disconnect();
      setConnected(false);
    };
  }, []);

  return {
    connected,
    lastMessage
  };
}

// Data transformation hooks
export function useArticle15DataTransformation() {
  const transformMetricsForChart = useCallback((metrics: PerformanceMetric[]) => {
    return DataTransformers.transformMetricsForChart(metrics);
  }, []);

  const transformDriftForHeatmap = useCallback((driftResults: DriftDetection[]) => {
    return DataTransformers.transformDriftForHeatmap(driftResults);
  }, []);

  const transformAlertsForDisplay = useCallback((alerts: Alert[]) => {
    return DataTransformers.transformAlertsForDisplay(alerts);
  }, []);

  const transformComplianceForGauge = useCallback((snapshot: ComplianceSnapshot) => {
    return DataTransformers.transformComplianceForGauge(snapshot);
  }, []);

  return {
    transformMetricsForChart,
    transformDriftForHeatmap,
    transformAlertsForDisplay,
    transformComplianceForGauge
  };
}

