/**
 * Article 15 Performance Monitoring API Integration
 *
 * Provides a complete API client for EU AI Act Article 15 Performance Monitoring
 * backend services, including data fetching, real-time updates, and export functionality.
 */

import { API_BASE } from '../../utils/api-config';

// Types (import locally and re-export)
import type {
  AISystem,
  PerformanceMetric,
  DriftDetection,
  RobustnessTest,
  SecurityEvent,
  ComplianceSnapshot,
  Alert,
  PerformanceDashboardSummary,
  CreateAISystemRequest,
  ReportSecurityEventRequest
} from '../../types/art15-performance.types';

export type {
  AISystem,
  PerformanceMetric,
  DriftDetection,
  RobustnessTest,
  SecurityEvent,
  ComplianceSnapshot,
  Alert,
  PerformanceDashboardSummary as PerformanceDashboardData,
  CreateAISystemRequest as RegisterAISystemRequest,
  ReportSecurityEventRequest as RecordSecurityEventRequest
} from '../../types/art15-performance.types';

type PerformanceDashboardData = PerformanceDashboardSummary;
type RegisterAISystemRequest = CreateAISystemRequest;
type RecordSecurityEventRequest = ReportSecurityEventRequest;

// Request types not in the types file - define here
export interface RecordPerformanceMetricRequest {
  [key: string]: any;
}
export interface DetectDriftRequest {
  [key: string]: any;
}
export interface RecordRobustnessTestRequest {
  [key: string]: any;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ExportResponse {
  downloadUrl: string;
  expiresAt: string;
  fileName: string;
}

// HTTP Client utilities
class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// API Client instance
const apiClient = new ApiClient();

// Article 15 Performance Monitoring API
export class Art15PerformanceApi {
  /**
   * Get dashboard overview data
   */
  static async getDashboardData(): Promise<ApiResponse<PerformanceDashboardData>> {
    return apiClient.get<PerformanceDashboardData>('/ai-act/art15/dashboard');
  }

  /**
   * Get all AI systems
   */
  static async getSystems(): Promise<ApiResponse<AISystem[]>> {
    return apiClient.get<AISystem[]>('/ai-act/art15/systems');
  }

  /**
   * Get a specific AI system by ID
   */
  static async getSystem(systemId: string): Promise<ApiResponse<AISystem>> {
    return apiClient.get<AISystem>(`/ai-act/art15/systems/${systemId}`);
  }

  /**
   * Register a new AI system
   */
  static async registerSystem(systemData: RegisterAISystemRequest): Promise<ApiResponse<AISystem>> {
    return apiClient.post<AISystem>('/ai-act/art15/systems', systemData);
  }

  /**
   * Submit performance metrics for a system
   */
  static async submitPerformanceMetrics(
    systemId: string,
    metrics: RecordPerformanceMetricRequest
  ): Promise<ApiResponse<PerformanceMetric>> {
    return apiClient.post<PerformanceMetric>(
      `/ai-act/art15/systems/${systemId}/metrics`,
      metrics
    );
  }

  /**
   * Submit drift detection data
   */
  static async submitDriftDetection(
    systemId: string,
    driftData: DetectDriftRequest
  ): Promise<ApiResponse<DriftDetection>> {
    return apiClient.post<DriftDetection>(
      `/ai-act/art15/systems/${systemId}/drift`,
      driftData
    );
  }

  /**
   * Submit robustness test results
   */
  static async submitRobustnessTest(
    systemId: string,
    testData: RecordRobustnessTestRequest
  ): Promise<ApiResponse<RobustnessTest>> {
    return apiClient.post<RobustnessTest>(
      `/ai-act/art15/systems/${systemId}/robustness`,
      testData
    );
  }

  /**
   * Report a security event
   */
  static async reportSecurityEvent(
    systemId: string,
    eventData: RecordSecurityEventRequest
  ): Promise<ApiResponse<SecurityEvent>> {
    return apiClient.post<SecurityEvent>(
      `/ai-act/art15/systems/${systemId}/security`,
      eventData
    );
  }

  /**
   * Get compliance snapshot for a system
   */
  static async getComplianceSnapshot(systemId: string): Promise<ApiResponse<ComplianceSnapshot>> {
    return apiClient.get<ComplianceSnapshot>(`/ai-act/art15/systems/${systemId}/compliance`);
  }

  /**
   * Get performance history for a system
   */
  static async getPerformanceHistory(
    systemId: string,
    params?: {
      days?: number;
      metric_type?: string;
      limit?: number;
    }
  ): Promise<ApiResponse<PerformanceMetric[]>> {
    const queryParams = new URLSearchParams();
    if (params?.days) queryParams.set('days', params.days.toString());
    if (params?.metric_type) queryParams.set('metric_type', params.metric_type);
    if (params?.limit) queryParams.set('limit', params.limit.toString());

    const query = queryParams.toString();
    const endpoint = `/ai-act/art15/systems/${systemId}/performance-history${query ? `?${query}` : ''}`;

    return apiClient.get<PerformanceMetric[]>(endpoint);
  }

  /**
   * Get active alerts
   */
  static async getAlerts(params?: {
    status?: string;
    severity?: string;
    limit?: number;
  }): Promise<ApiResponse<Alert[]>> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.set('status', params.status);
    if (params?.severity) queryParams.set('severity', params.severity);
    if (params?.limit) queryParams.set('limit', params.limit.toString());

    const query = queryParams.toString();
    const endpoint = `/ai-act/art15/alerts${query ? `?${query}` : ''}`;

    return apiClient.get<Alert[]>(endpoint);
  }

  /**
   * Acknowledge an alert
   */
  static async acknowledgeAlert(alertId: string, notes?: string): Promise<ApiResponse<void>> {
    return apiClient.put<void>(`/ai-act/art15/alerts/${alertId}/acknowledge`, { notes });
  }

  /**
   * Export compliance report
   */
  static async exportComplianceReport(
    format: 'pdf' | 'csv' | 'json',
    systemId?: string,
    dateRange?: { start: string; end: string }
  ): Promise<ApiResponse<ExportResponse>> {
    const params = new URLSearchParams();
    params.set('format', format);
    if (systemId) params.set('systemId', systemId);
    if (dateRange) {
      params.set('startDate', dateRange.start);
      params.set('endDate', dateRange.end);
    }

    return apiClient.get<ExportResponse>(`/ai-act/art15/report?${params.toString()}`);
  }

  /**
   * Get system performance summary (for overview tabs)
   */
  static async getSystemPerformanceSummary(systemId: string): Promise<ApiResponse<{
    latestMetrics: PerformanceMetric;
    driftStatus: DriftDetection;
    complianceScore: number;
    activeAlerts: number;
  }>> {
    // This would typically be a single endpoint, but for now we'll aggregate
    const [metrics, drift, compliance] = await Promise.all([
      this.getPerformanceHistory(systemId, { limit: 1 }),
      this.getSystemDriftSummary(systemId),
      this.getComplianceSnapshot(systemId)
    ]);

    if (!metrics.success || !drift.success || !compliance.success) {
      return {
        success: false,
        error: 'Failed to fetch system performance summary'
      };
    }

    const activeAlerts = await this.getAlerts({ status: 'pending' });
    const alertCount = activeAlerts.success ? activeAlerts.data!.length : 0;

    return {
      success: true,
      data: {
        latestMetrics: metrics.data![0],
        driftStatus: drift.data!,
        complianceScore: compliance.data!.overall_compliance_score,
        activeAlerts: alertCount
      }
    };
  }

  /**
   * Get drift summary for a system (simplified endpoint)
   */
  private static async getSystemDriftSummary(systemId: string): Promise<ApiResponse<DriftDetection>> {
    // This is a placeholder - in practice, you'd have a dedicated endpoint
    // For now, we'll simulate by getting recent drift data
    return apiClient.get<DriftDetection>(`/ai-act/art15/systems/${systemId}/drift-summary`);
  }
}

// Utility functions for data transformation
export class DataTransformers {
  /**
   * Transform raw performance metrics into chart-ready format
   */
  static transformMetricsForChart(metrics: PerformanceMetric[]): Array<{
    timestamp: string;
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
  }> {
    return metrics.map(metric => ({
      timestamp: metric.evaluated_at,
      accuracy: metric.metric_type === 'accuracy' ? metric.metric_value : 0,
      precision: metric.metric_type === 'precision' ? metric.metric_value : 0,
      recall: metric.metric_type === 'recall' ? metric.metric_value : 0,
      f1Score: metric.metric_type === 'f1_score' ? metric.metric_value : 0,
    }));
  }

  /**
   * Transform drift detection results for visualization
   */
  static transformDriftForHeatmap(driftResults: DriftDetection[]): Array<{
    feature: string;
    driftScore: number;
    severity: string;
    timestamp: string;
  }> {
    return driftResults.flatMap(drift =>
      drift.affected_features.map((feature: string) => ({
        feature,
        driftScore: drift.drift_score,
        severity: drift.drift_severity,
        timestamp: drift.detected_at
      }))
    );
  }

  /**
   * Transform alerts for notification display
   */
  static transformAlertsForDisplay(alerts: Alert[]): Array<{
    id: string;
    title: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    status: string;
    timestamp: string;
    systemName?: string;
    description: string;
  }> {
    return alerts.map(alert => ({
      id: alert.id,
      title: alert.title,
      severity: alert.severity as 'low' | 'medium' | 'high' | 'critical',
      status: alert.status,
      timestamp: alert.triggered_at,
      systemName: alert.ai_system_id ? 'AI System' : undefined, // Would need to resolve system name
      description: alert.description
    }));
  }

  /**
   * Transform compliance data for gauge charts
   */
  static transformComplianceForGauge(snapshot: ComplianceSnapshot): {
    overall: number;
    components: Array<{ name: string; value: number; target: number }>;
  } {
    return {
      overall: snapshot.overall_compliance_score,
      components: [
        {
          name: 'Accuracy',
          value: snapshot.accuracy_compliance || 0,
          target: 0.95
        },
        {
          name: 'Drift',
          value: snapshot.drift_compliance || 0,
          target: 0.90
        },
        {
          name: 'Robustness',
          value: snapshot.robustness_compliance || 0,
          target: 0.85
        },
        {
          name: 'Security',
          value: snapshot.security_compliance || 0,
          target: 0.90
        }
      ]
    };
  }
}

// Error handling utilities
export class ApiErrorHandler {
  static handleApiError(error: any): string {
    if (typeof error === 'string') return error;

    if (error?.message) return error.message;

    if (error?.error) return error.error;

    return 'An unexpected error occurred';
  }

  static isNetworkError(error: any): boolean {
    return error?.message?.includes('fetch') ||
           error?.message?.includes('network') ||
           error?.code === 'NETWORK_ERROR';
  }

  static isAuthError(error: any): boolean {
    return error?.status === 401 || error?.status === 403;
  }

  static getRetryDelay(attempt: number): number {
    // Exponential backoff: 1s, 2s, 4s, 8s, max 30s
    return Math.min(1000 * Math.pow(2, attempt - 1), 30000);
  }
}

// WebSocket integration for real-time updates (optional)
export class RealtimeUpdates {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  connect(onMessage: (data: any) => void, onError?: (error: any) => void): void {
    try {
      const wsUrl = API_BASE.replace('http', 'ws') + '/ai-act/art15/ws';
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('Connected to Article 15 real-time updates');
        this.reconnectAttempts = 0;
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onMessage(data);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('Disconnected from Article 15 real-time updates');
        this.attemptReconnect(onMessage, onError);
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        if (onError) onError(error);
      };

    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
      if (onError) onError(error);
    }
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  private attemptReconnect(onMessage: (data: any) => void, onError?: (error: any) => void): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    setTimeout(() => {
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      this.connect(onMessage, onError);
    }, this.reconnectDelay * this.reconnectAttempts);
  }
}

// Export singleton instances
export const art15Api = Art15PerformanceApi;
export const realtimeUpdates = new RealtimeUpdates();