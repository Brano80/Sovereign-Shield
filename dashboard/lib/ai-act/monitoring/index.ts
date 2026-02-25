/**
 * AI Act Article 15 Performance Monitoring
 * Comprehensive monitoring algorithms for drift detection, accuracy validation,
 * robustness testing, and security threat detection
 */

export { DriftDetectionEngine, runComprehensiveDriftAnalysis } from './DriftDetectionEngine';
export { AccuracyMonitor, runAccuracyAnalysis } from './AccuracyMonitor';
export { RobustnessTestEngine, runQuickRobustnessAssessment } from './RobustnessTestEngine';
export { SecurityMonitor, runQuickSecurityAssessment } from './SecurityMonitor';

// Re-export statistical utilities (explicit to avoid duplicate calculatePSI export)
export * from '../../../utils/statistics/kolmogorov-smirnov';
export * from '../../../utils/statistics/significance-testing';
// chi-square and PSI both export calculatePSI - use chi-square as canonical
export { chiSquareTest, calculatePSI, createContingencyTable } from '../../../utils/statistics/chi-square';
// export PSI utilities (excluding calculatePSI to avoid conflict)
export { binData, calculatePSIBinned, calculatePSITrend } from '../../../utils/statistics/population-stability-index';

// Type exports from correct modules
export type {
  DriftDetectionResult,
  DriftDetectionConfig,
} from './DriftDetectionEngine';

export type {
  AccuracyMetrics,
  PerformanceValidationResult,
  PerformanceReport,
} from './AccuracyMonitor';

export type {
  AdversarialAttackResult,
  EdgeCaseTestResult,
  StressTestResult,
  RobustnessAnalysisResult,
} from './RobustnessTestEngine';

export type {
  SecurityThreat,
  ModelExtractionAttempt,
  AdversarialInputDetection,
  DataPoisoningDetection,
  SecurityMonitoringResult
} from './SecurityMonitor';
