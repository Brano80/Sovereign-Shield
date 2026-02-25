// ═══════════════════════════════════════════════════════════════
// VERIDION AUDIT SYSTEM - PUBLIC API
// ═══════════════════════════════════════════════════════════════

// Types
export * from './evidence-graph-types';
export * from './compliance-query-types';
export * from './governance-types';
export * from './alert-types';
// Explicitly resolve duplicate export ambiguity
export type { ComplianceQuery } from './compliance-query-types';

// Services
export { eventIngestionService } from './event-ingestion-service';
export type { CreateEventOptions, CreateDecisionOptions, CreateClockOptions } from './event-ingestion-service';
export { hashChainService } from './hash-chain-service';
export { merkleAnchorService } from './merkle-anchor-service';
export { tsaService } from './tsa-service';
export { complianceQueryEngine } from './compliance-query-engine';
export { governanceService } from './governance-service';
export { clockMonitoringService } from './clock-monitoring-job';
export { alertService } from './alert-service';

// Lens Helpers
export {
  IncidentAuditHelpers,
  RiskAuditHelpers,
  AssetAuditHelpers,
  AIActAuditHelpers,
  GovernanceAuditHelpers,
  GDPRAuditHelpers,
  TPRMAuditHelpers,
} from './lens-helpers';

// Compliance Queries
export {
  ALL_COMPLIANCE_QUERIES,
  GDPR_QUERIES,
  DORA_QUERIES,
  NIS2_QUERIES,
  AI_ACT_QUERIES,
  QUERY_BY_ID,
  QUERIES_BY_REGULATION,
} from './compliance-queries';

// Startup
export { initializeAuditSystem, shutdownAuditSystem } from './startup';
