// ═══════════════════════════════════════════════════════════════
// EU AI ACT ARTICLE 15 - PERFORMANCE MONITORING TYPES
// ═══════════════════════════════════════════════════════════════

// Enums
export enum SystemType {
  HIGH_RISK = 'high_risk',
  LIMITED_RISK = 'limited_risk',
  MINIMAL_RISK = 'minimal_risk'
}

export enum MetricType {
  ACCURACY = 'accuracy',
  PRECISION = 'precision',
  RECALL = 'recall',
  F1_SCORE = 'f1_score',
  AUC_ROC = 'auc_roc',
  SPECIFICITY = 'specificity',
  SENSITIVITY = 'sensitivity'
}

export enum DriftType {
  DATA_DRIFT = 'data_drift',
  CONCEPT_DRIFT = 'concept_drift',
  PREDICTION_DRIFT = 'prediction_drift',
  LABEL_DRIFT = 'label_drift'
}

export enum DriftSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum AlertStatus {
  PENDING = 'pending',
  ACKNOWLEDGED = 'acknowledged',
  RESOLVED = 'resolved',
  FALSE_POSITIVE = 'false_positive'
}

// ═══════════════════════════════════════════════════════════════
// CORE INTERFACES
// ═══════════════════════════════════════════════════════════════

// AI System Registry
export interface AISystem {
  id: string;
  company_id: string;
  system_id: string;
  system_name: string;
  system_version?: string;
  system_type: SystemType;
  provider_name?: string;
  model_name?: string;
  model_version?: string;
  eu_ai_act_risk_level: SystemType;
  intended_purposes: string[];
  prohibited_uses: string[];
  input_data_types: string[];
  output_data_types: string[];
  confidence_thresholds: Record<string, any>;
  performance_targets: Record<string, any>;
  deployment_environments: string[];
  geographic_restrictions: string[];
  usage_limits: Record<string, any>;
  monitoring_enabled: boolean;
  monitoring_frequency_minutes: number;
  alert_thresholds: Record<string, any>;
  drift_detection_enabled: boolean;
  description?: string;
  documentation_url?: string;
  created_by?: string;
  tags: string[];
  custom_metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
  last_health_check?: string;
  decommissioned_at?: string;
}

// Performance Metrics
export interface PerformanceMetric {
  id: string;
  ai_system_id: string;
  company_id: string;
  metric_type: MetricType;
  dataset_type: string;
  evaluation_context?: string;
  metric_value: number; // 0.0 to 1.0
  confidence_interval_lower?: number;
  confidence_interval_upper?: number;
  sample_size?: number;
  evaluation_duration_ms?: number;
  benchmark_reference?: string;
  benchmark_value?: number;
  benchmark_deviation?: number;
  input_data_hash?: string;
  evaluation_parameters: Record<string, any>;
  evaluation_method?: string;
  meets_target?: boolean;
  target_value?: number;
  deviation_from_target?: number;
  performance_trend?: 'improving' | 'stable' | 'degrading';
  evaluated_by?: string;
  evaluation_notes?: string;
  custom_metadata: Record<string, any>;
  evaluated_at: string;
  created_at: string;
}

// Drift Detection
export interface DriftDetection {
  id: string;
  ai_system_id: string;
  company_id: string;
  drift_type: DriftType;
  drift_severity: DriftSeverity;
  drift_score: number; // 0.0 to 1.0
  confidence_level?: number;
  statistical_significance?: number;
  detection_method: string;
  baseline_reference?: string;
  comparison_reference?: string;
  affected_features: string[];
  affected_predictions: string[];
  drift_magnitude: Record<string, any>;
  impact_on_accuracy?: number;
  impact_on_fairness?: number;
  impact_on_robustness?: number;
  business_impact_assessment?: string;
  resolution_required: boolean;
  resolution_status?: 'pending' | 'investigating' | 'resolved' | 'accepted' | 'mitigated';
  resolution_actions: any[];
  resolved_by?: string;
  resolved_at?: string;
  detection_parameters: Record<string, any>;
  detection_notes?: string;
  custom_metadata: Record<string, any>;
  detected_at: string;
  created_at: string;
}

// Robustness Tests
export interface RobustnessTest {
  id: string;
  ai_system_id: string;
  company_id: string;
  test_type: string;
  test_category: string;
  test_scenario: string;
  test_parameters: Record<string, any>;
  input_data_description?: string;
  expected_behavior?: string;
  success_criteria: Record<string, any>;
  test_passed: boolean;
  robustness_score?: number;
  failure_modes: any[];
  failure_rate?: number;
  performance_degradation?: number;
  recovery_time_ms?: number;
  resource_utilization: Record<string, any>;
  security_vulnerabilities: any[];
  exploitability_level?: 'none' | 'low' | 'medium' | 'high' | 'critical';
  attack_vector?: string;
  requires_mitigation: boolean;
  mitigation_actions: any[];
  mitigation_status?: 'pending' | 'implemented' | 'verified' | 'failed';
  tested_by?: string;
  test_environment?: string;
  test_duration_ms?: number;
  test_notes?: string;
  custom_metadata: Record<string, any>;
  tested_at: string;
  created_at: string;
}

// Security Events
export interface SecurityEvent {
  id: string;
  ai_system_id: string;
  company_id: string;
  event_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  attack_vector: string;
  description: string;
  affected_components: string[];
  payload_hash?: string;
  source_ip?: string;
  user_agent?: string;
  confidentiality_impact?: 'none' | 'low' | 'medium' | 'high';
  integrity_impact?: 'none' | 'low' | 'medium' | 'high';
  availability_impact?: 'none' | 'low' | 'medium' | 'high';
  overall_cvss_score?: number;
  detection_method: string;
  detection_confidence?: number;
  false_positive_probability?: number;
  response_actions: any[];
  response_status?: 'detected' | 'investigating' | 'contained' | 'resolved' | 'false_positive';
  response_time_ms?: number;
  mitigation_applied: boolean;
  mitigation_details?: string;
  lessons_learned?: string;
  reported_by?: string;
  investigation_notes?: string;
  custom_metadata: Record<string, any>;
  occurred_at: string;
  detected_at: string;
  responded_at?: string;
  resolved_at?: string;
  created_at: string;
}

// Compliance Snapshots
export interface ComplianceSnapshot {
  id: string;
  ai_system_id: string;
  company_id: string;
  snapshot_type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'ad_hoc';
  compliance_period_start: string;
  compliance_period_end: string;
  overall_compliance_score: number; // 0.0 to 1.0
  accuracy_compliance?: number;
  drift_compliance?: number;
  robustness_compliance?: number;
  security_compliance?: number;
  performance_metrics: Record<string, any>;
  drift_metrics: Record<string, any>;
  robustness_metrics: Record<string, any>;
  security_metrics: Record<string, any>;
  compliance_status: 'compliant' | 'warning' | 'non_compliant';
  compliance_issues: any[];
  remediation_required: boolean;
  remediation_actions: any[];
  evidence_hashes: string[];
  audit_trail: any[];
  reviewed_by?: string;
  review_notes?: string;
  next_review_due?: string;
  assessment_methodology?: string;
  assessment_version?: string;
  custom_metadata: Record<string, any>;
  assessed_at: string;
  created_at: string;
}

// Alert Rules
export interface AlertRule {
  id: string;
  company_id: string;
  rule_name: string;
  rule_description?: string;
  alert_type: 'performance' | 'drift' | 'security' | 'robustness' | 'compliance';
  condition_expression: string;
  condition_parameters: Record<string, any>;
  severity_threshold?: 'low' | 'medium' | 'high' | 'critical';
  applicable_systems: any[];
  applicable_metrics: any[];
  alert_channels: string[];
  alert_frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
  escalation_policy: Record<string, any>;
  enabled: boolean;
  cooldown_period_minutes: number;
  max_alerts_per_hour: number;
  created_by?: string;
  last_triggered_at?: string;
  trigger_count: number;
  custom_metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// Alerts
export interface Alert {
  id: string;
  alert_rule_id?: string;
  ai_system_id?: string;
  company_id: string;
  alert_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: AlertStatus;
  title: string;
  description: string;
  alert_data: Record<string, any>;
  affected_components: string[];
  impact_assessment?: string;
  recommended_actions: any[];
  acknowledged_by?: string;
  acknowledged_at?: string;
  resolved_by?: string;
  resolved_at?: string;
  resolution_notes?: string;
  escalated: boolean;
  escalation_level: number;
  next_escalation_at?: string;
  notifications_sent: any[];
  last_notification_at?: string;
  alert_source?: string;
  alert_correlation_id?: string;
  custom_metadata: Record<string, any>;
  triggered_at: string;
  created_at: string;
  updated_at: string;
}

// ═══════════════════════════════════════════════════════════════
// DASHBOARD & UI INTERFACES
// ═══════════════════════════════════════════════════════════════

// Dashboard Summary
export interface PerformanceDashboardSummary {
  total_systems: number;
  systems_monitoring: number;
  alerts_today: number;
  compliance_score: number;
  drift_alerts: number;
  performance_degradation: number;
  last_updated: string;
}

// System Performance Overview
export interface SystemPerformanceOverview {
  system_id: string;
  system_name: string;
  risk_level: SystemType;
  current_accuracy: number;
  accuracy_trend: 'improving' | 'stable' | 'degrading';
  drift_score: number;
  robustness_score: number;
  security_score: number;
  last_assessed: string;
  compliance_status: 'compliant' | 'warning' | 'non_compliant';
  active_alerts: number;
}

// Alert Summary
export interface AlertSummary {
  total_alerts: number;
  critical_alerts: number;
  acknowledged_today: number;
  resolved_today: number;
  avg_resolution_time: number;
}

// Compliance Overview
export interface ComplianceOverview {
  overall_score: number;
  systems_compliant: number;
  systems_warning: number;
  systems_non_compliant: number;
  next_audit_due: string;
  last_audit_score: number;
}

// ═══════════════════════════════════════════════════════════════
// API REQUEST/RESPONSE INTERFACES
// ═══════════════════════════════════════════════════════════════

// Create/Update AI System
export interface CreateAISystemRequest {
  system_id: string;
  system_name: string;
  system_version?: string;
  system_type: SystemType;
  provider_name?: string;
  model_name?: string;
  model_version?: string;
  eu_ai_act_risk_level: SystemType;
  intended_purposes?: string[];
  prohibited_uses?: string[];
  input_data_types?: string[];
  output_data_types?: string[];
  confidence_thresholds?: Record<string, any>;
  performance_targets?: Record<string, any>;
  deployment_environments?: string[];
  geographic_restrictions?: string[];
  usage_limits?: Record<string, any>;
  monitoring_enabled?: boolean;
  monitoring_frequency_minutes?: number;
  alert_thresholds?: Record<string, any>;
  drift_detection_enabled?: boolean;
  description?: string;
  documentation_url?: string;
  tags?: string[];
  custom_metadata?: Record<string, any>;
}

// Submit Performance Metrics
export interface SubmitPerformanceMetricsRequest {
  ai_system_id: string;
  metrics: Array<{
    metric_type: MetricType;
    dataset_type: string;
    evaluation_context?: string;
    metric_value: number;
    confidence_interval_lower?: number;
    confidence_interval_upper?: number;
    sample_size?: number;
    evaluation_duration_ms?: number;
    benchmark_reference?: string;
    benchmark_value?: number;
    benchmark_deviation?: number;
    input_data_hash?: string;
    evaluation_parameters?: Record<string, any>;
    evaluation_method?: string;
    target_value?: number;
    evaluated_by?: string;
    evaluation_notes?: string;
    custom_metadata?: Record<string, any>;
  }>;
}

// Report Drift Detection
export interface ReportDriftDetectionRequest {
  ai_system_id: string;
  drift_type: DriftType;
  drift_severity: DriftSeverity;
  drift_score: number;
  confidence_level?: number;
  statistical_significance?: number;
  detection_method: string;
  baseline_reference?: string;
  comparison_reference?: string;
  affected_features?: string[];
  affected_predictions?: string[];
  drift_magnitude?: Record<string, any>;
  impact_on_accuracy?: number;
  impact_on_fairness?: number;
  impact_on_robustness?: number;
  business_impact_assessment?: string;
  detection_parameters?: Record<string, any>;
  detection_notes?: string;
  custom_metadata?: Record<string, any>;
}

// Report Security Event
export interface ReportSecurityEventRequest {
  ai_system_id: string;
  event_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  attack_vector: string;
  description: string;
  affected_components?: string[];
  payload_hash?: string;
  source_ip?: string;
  user_agent?: string;
  confidentiality_impact?: 'none' | 'low' | 'medium' | 'high';
  integrity_impact?: 'none' | 'low' | 'medium' | 'high';
  availability_impact?: 'none' | 'low' | 'medium' | 'high';
  overall_cvss_score?: number;
  detection_method: string;
  detection_confidence?: number;
  false_positive_probability?: number;
  response_actions?: any[];
  reported_by?: string;
  investigation_notes?: string;
  custom_metadata?: Record<string, any>;
  occurred_at: string;
}

// Create Alert Rule
export interface CreateAlertRuleRequest {
  rule_name: string;
  rule_description?: string;
  alert_type: 'performance' | 'drift' | 'security' | 'robustness' | 'compliance';
  condition_expression: string;
  condition_parameters?: Record<string, any>;
  severity_threshold?: 'low' | 'medium' | 'high' | 'critical';
  applicable_systems?: any[];
  applicable_metrics?: any[];
  alert_channels?: string[];
  alert_frequency?: 'immediate' | 'hourly' | 'daily' | 'weekly';
  escalation_policy?: Record<string, any>;
  enabled?: boolean;
  cooldown_period_minutes?: number;
  max_alerts_per_hour?: number;
  custom_metadata?: Record<string, any>;
}

// Update Alert Status
export interface UpdateAlertStatusRequest {
  status: AlertStatus;
  acknowledged_by?: string;
  resolved_by?: string;
  resolution_notes?: string;
  custom_metadata?: Record<string, any>;
}