import { Regulation } from './evidence-graph-types';

// ═══════════════════════════════════════════════════════════════
// QUERY RESULT TYPES
// ═══════════════════════════════════════════════════════════════

export type QueryResult = 'PROVEN' | 'NOT_PROVEN' | 'PARTIAL';

export interface ComplianceQueryResult {
  queryId: string;
  queryName: string;
  regulation: Regulation;
  articles: string[];

  // Result
  result: QueryResult;
  confidence: number;           // 0-100

  // Evidence
  evidenceCount: number;
  evidence: {
    events: string[];           // Event IDs
    decisions: string[];        // Decision IDs
    clocks: string[];           // Clock IDs
    artifacts: string[];        // Artifact IDs
  };

  // Proof details
  proofDetails: {
    criterion: string;
    met: boolean;
    details: string;
  }[];

  // Gaps (for NOT_PROVEN or PARTIAL)
  gaps?: {
    description: string;
    recommendation: string;
  }[];

  // Timing
  executedAt: string;
  executionTimeMs: number;

  // Time range queried
  timeRange: {
    from: string;
    to: string;
  };
}

// ═══════════════════════════════════════════════════════════════
// QUERY DEFINITION TYPES
// ═══════════════════════════════════════════════════════════════

export interface ComplianceQuery {
  queryId: string;
  name: string;
  description: string;

  regulation: Regulation;
  articles: string[];

  // Query definition
  query: GraphQueryDefinition;

  // What constitutes proof
  proofCriteria: ProofCriterion[];

  // Metadata
  category: QueryCategory;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  automatable: boolean;
}

export type QueryCategory =
  | 'INCIDENT_MANAGEMENT'
  | 'BREACH_NOTIFICATION'
  | 'RISK_MANAGEMENT'
  | 'ACCESS_CONTROL'
  | 'DATA_PROTECTION'
  | 'AI_OVERSIGHT'
  | 'VENDOR_MANAGEMENT'
  | 'GOVERNANCE'
  | 'DOCUMENTATION'
  | 'MONITORING';

export interface GraphQueryDefinition {
  // Required nodes
  requiredNodes: {
    alias: string;              // Reference name in criteria
    type: 'EVENT' | 'DECISION' | 'CLOCK' | 'ACTOR' | 'CONTROL' | 'ARTIFACT';
    filters: Record<string, any>;
    minCount?: number;
    optional?: boolean;
  }[];

  // Required edges
  requiredEdges: {
    type: string;
    from: string;               // Alias
    to: string;                 // Alias
    optional?: boolean;
  }[];

  // Time constraints
  timeConstraints?: {
    field: string;
    within?: string;            // e.g., "12_MONTHS", "72_HOURS"
    after?: string;             // Relative to another field
    before?: string;
  }[];
}

export interface ProofCriterion {
  id: string;
  description: string;

  // Evaluation type
  type: 'EXISTS' | 'COUNT' | 'VALUE' | 'TIMING' | 'RELATIONSHIP' | 'CUSTOM';

  // Evaluation parameters
  params: {
    nodeAlias?: string;
    field?: string;
    operator?: 'EQUALS' | 'NOT_EQUALS' | 'GREATER_THAN' | 'LESS_THAN' | 'IN' | 'CONTAINS' | 'EXISTS';
    value?: any;
    minCount?: number;
    withinHours?: number;
  };

  // Weight for partial scoring
  weight: number;

  // Is this criterion mandatory for PROVEN?
  mandatory: boolean;
}

// ═══════════════════════════════════════════════════════════════
// SAVED QUERY TYPES
// ═══════════════════════════════════════════════════════════════

export interface SavedQuery {
  id: string;
  name: string;
  description?: string;

  // Query parameters
  filters: QueryFilters;

  // Owner
  createdBy: string;
  isPublic: boolean;

  // Usage
  lastUsedAt?: string;
  useCount: number;

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface QueryFilters {
  // Time range
  timeRange?: {
    from?: string;
    to?: string;
    preset?: 'TODAY' | 'YESTERDAY' | '7_DAYS' | '30_DAYS' | '90_DAYS' | '12_MONTHS' | 'CUSTOM';
  };

  // Event filters
  eventTypes?: string[];
  severities?: string[];
  sourceSystem?: string;

  // Regulatory filters
  regulations?: Regulation[];
  articles?: string[];

  // Correlation
  correlationId?: string;

  // Actor filters
  actorId?: string;
  actorRole?: string;

  // Free text
  searchText?: string;

  // Sorting
  sortBy?: 'occurred_at' | 'severity' | 'event_type';
  sortOrder?: 'asc' | 'desc';
}
