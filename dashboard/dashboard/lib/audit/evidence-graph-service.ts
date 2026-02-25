// ═══════════════════════════════════════════════════════════════
// EVIDENCE GRAPH SERVICE - Frontend API Client
// ═══════════════════════════════════════════════════════════════
// TypeScript service for Evidence Graph operations
// Provides clean API for React components to interact with Evidence Graph backend

import { EvidenceEvent, EvidenceDecision, EvidenceClock, EvidenceActor, EvidenceControl, EvidenceArtifact, EvidenceEdge, MerkleAnchor, TsaTimestamp, ComplianceQuery, ComplianceResult, Regulation, EventSeverity, DecisionType, ClockType, ActorType, AuthorityLevel, ControlType, ArtifactType, EdgeType } from './evidence-graph-types';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || '/api/v1';

// ═══════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Generic API request helper
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get authentication headers
 */
function getAuthHeaders(): Record<string, string> {
  // Implementation depends on your auth system
  const token = localStorage.getItem('auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ═══════════════════════════════════════════════════════════════
// EVENT OPERATIONS
// ═══════════════════════════════════════════════════════════════

export interface CreateEventRequest {
  eventType: string;
  severity: EventSeverity;
  sourceSystem: string;
  regulatoryTags: Regulation[];
  articles?: string[];
  payload: Record<string, any>;
  correlationId?: string;
  causationId?: string;
  sourceIp?: string;
  sourceUserAgent?: string;
}

export interface EventQueryParams {
  sourceSystem?: string;
  eventType?: string;
  severity?: string;
  limit?: number;
  offset?: number;
}

export class EvidenceEventService {
  /**
   * Create a new evidence event
   */
  static async create(request: CreateEventRequest): Promise<{
    eventId: string;
    sequenceNumber: number;
    payloadHash: string;
    previousHash: string;
    createdAt: string;
  }> {
    return apiRequest('/evidence/events', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * Get events with optional filtering
   */
  static async getEvents(params?: EventQueryParams): Promise<{
    events: EvidenceEvent[];
    totalCount: number;
    page: number;
    pageSize: number;
  }> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.set(key, value.toString());
        }
      });
    }

    const query = searchParams.toString();
    const endpoint = `/evidence/events${query ? `?${query}` : ''}`;

    return apiRequest(endpoint);
  }

  /**
   * Get event by ID
   */
  static async getEvent(eventId: string): Promise<EvidenceEvent> {
    return apiRequest(`/evidence/events/${eventId}`);
  }

  /**
   * Get events by correlation ID
   */
  static async getEventsByCorrelation(correlationId: string): Promise<EvidenceEvent[]> {
    return apiRequest(`/evidence/events?correlationId=${encodeURIComponent(correlationId)}`)
      .then((result: any) => result.events || []);
  }

  /**
   * Get event chain (causal relationships)
   */
  static async getEventChain(eventId: string): Promise<EvidenceEvent[]> {
    // This would require a backend endpoint to traverse the causal chain
    // For now, return a simplified implementation
    const event = await this.getEvent(eventId);
    const chain = [event];

    if (event.causation_id) {
      try {
        const parentEvent = await this.getEvent(event.causation_id);
        chain.unshift(parentEvent);
      } catch {
        // Parent event might not be accessible
      }
    }

    return chain;
  }
}

// ═══════════════════════════════════════════════════════════════
// DECISION OPERATIONS
// ═══════════════════════════════════════════════════════════════

export interface CreateDecisionRequest {
  decisionType: DecisionType;
  regulation: Regulation;
  articles?: string[];
  outcome: string;
  justification: string;
  actorId: string;
  actorName?: string;
  actorRole?: string;
  relatedEventId: string;
  relatedIncidentId?: string;
  relatedAssetIds?: string[];
  aiAssisted?: boolean;
  aiModelUsed?: string;
  aiConfidence?: number;
  aiRecommendation?: string;
  humanVerified?: boolean;
  humanOverrideReason?: string;
}

export class EvidenceDecisionService {
  /**
   * Create a new evidence decision
   */
  static async create(request: CreateDecisionRequest): Promise<{
    decisionId: string;
  }> {
    return apiRequest('/evidence/decisions', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * Get decisions by actor
   */
  static async getDecisionsByActor(actorId: string): Promise<EvidenceDecision[]> {
    return apiRequest(`/evidence/decisions?actorId=${encodeURIComponent(actorId)}`)
      .then((result: any) => result.decisions || []);
  }

  /**
   * Get decisions by event
   */
  static async getDecisionsByEvent(eventId: string): Promise<EvidenceDecision[]> {
    return apiRequest(`/evidence/decisions?relatedEventId=${encodeURIComponent(eventId)}`)
      .then((result: any) => result.decisions || []);
  }

  /**
   * Get pending decisions requiring approval
   */
  static async getPendingApprovals(): Promise<EvidenceDecision[]> {
    return apiRequest('/evidence/decisions?requiresApproval=true&approvalTimestamp=null')
      .then((result: any) => result.decisions || []);
  }
}

// ═══════════════════════════════════════════════════════════════
// CLOCK OPERATIONS
// ═══════════════════════════════════════════════════════════════

export interface CreateClockRequest {
  clockType: ClockType;
  regulation: Regulation;
  article: string;
  deadline: string; // ISO8601
  relatedEventId: string;
  relatedIncidentId?: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
  businessImpactAssessment?: string;
  priorityLevel?: string;
}

export class EvidenceClockService {
  /**
   * Create a new regulatory clock
   */
  static async create(request: CreateClockRequest): Promise<{
    clockId: string;
  }> {
    return apiRequest('/evidence/clocks', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * Get active clocks
   */
  static async getActiveClocks(): Promise<EvidenceClock[]> {
    return apiRequest('/evidence/clocks?status=RUNNING')
      .then((result: any) => result.clocks || []);
  }

  /**
   * Get breached clocks
   */
  static async getBreachedClocks(): Promise<EvidenceClock[]> {
    return apiRequest('/evidence/clocks?status=BREACHED')
      .then((result: any) => result.clocks || []);
  }

  /**
   * Get clocks by regulation
   */
  static async getClocksByRegulation(regulation: Regulation): Promise<EvidenceClock[]> {
    return apiRequest(`/evidence/clocks?regulation=${regulation}`)
      .then((result: any) => result.clocks || []);
  }

  /**
   * Get clock statistics
   */
  static async getClockStats(): Promise<{
    total: number;
    active: number;
    met: number;
    breached: number;
    paused: number;
  }> {
    const [active, met, breached, paused] = await Promise.all([
      this.getActiveClocks(),
      apiRequest('/evidence/clocks?status=MET').then((r: any) => r.clocks || []),
      this.getBreachedClocks(),
      apiRequest('/evidence/clocks?status=PAUSED').then((r: any) => r.clocks || []),
    ]);

    return {
      total: active.length + met.length + breached.length + paused.length,
      active: active.length,
      met: met.length,
      breached: breached.length,
      paused: paused.length,
    };
  }
}

// ═══════════════════════════════════════════════════════════════
// ACTOR OPERATIONS
// ═══════════════════════════════════════════════════════════════

export interface CreateActorRequest {
  actorType: ActorType;
  name?: string;
  email?: string;
  username?: string;
  externalId?: string;
  role: string;
  authorityLevel: AuthorityLevel;
  orgUnit: string;
  jobTitle?: string;
  systemName?: string;
  systemVersion?: string;
  systemEnvironment?: string;
  modelName?: string;
  modelVersion?: string;
  modelProvider?: string;
  trainingDataCutoff?: string;
  permissions?: string[];
  accessLevel?: string;
}

export class EvidenceActorService {
  /**
   * Create a new actor
   */
  static async create(request: CreateActorRequest): Promise<{
    actorId: string;
  }> {
    return apiRequest('/evidence/actors', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * Get current user actor
   */
  static async getCurrentActor(): Promise<EvidenceActor | null> {
    try {
      // This would need to be implemented based on your auth system
      // For now, return null
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Get actors by role
   */
  static async getActorsByRole(role: string): Promise<EvidenceActor[]> {
    // This would require a backend endpoint
    // For now, return empty array
    return [];
  }

  /**
   * Get actors by authority level
   */
  static async getActorsByAuthorityLevel(level: AuthorityLevel): Promise<EvidenceActor[]> {
    // This would require a backend endpoint
    // For now, return empty array
    return [];
  }
}

// ═══════════════════════════════════════════════════════════════
// CONTROL OPERATIONS
// ═══════════════════════════════════════════════════════════════

export interface CreateControlRequest {
  controlType: ControlType;
  name: string;
  description: string;
  controlFamily?: string;
  controlScope: string[];
  appliesToRegulations: Regulation[];
  riskCategories?: string[];
  configuration?: Record<string, any>;
  dependsOnControls?: string[];
  requiredForControls?: string[];
  operationalCost?: number;
  resourceRequirements?: string[];
}

export class EvidenceControlService {
  /**
   * Create a new control
   */
  static async create(request: CreateControlRequest): Promise<{
    controlId: string;
  }> {
    return apiRequest('/evidence/controls', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * Get active controls
   */
  static async getActiveControls(): Promise<EvidenceControl[]> {
    // This would require a backend endpoint
    // For now, return empty array
    return [];
  }

  /**
   * Get controls by type
   */
  static async getControlsByType(controlType: ControlType): Promise<EvidenceControl[]> {
    // This would require a backend endpoint
    // For now, return empty array
    return [];
  }

  /**
   * Get control effectiveness metrics
   */
  static async getControlMetrics(): Promise<{
    totalControls: number;
    activeControls: number;
    testedControls: number;
    averageEffectiveness: number;
  }> {
    // Mock data for now
    return {
      totalControls: 0,
      activeControls: 0,
      testedControls: 0,
      averageEffectiveness: 0,
    };
  }
}

// ═══════════════════════════════════════════════════════════════
// ARTIFACT OPERATIONS
// ═══════════════════════════════════════════════════════════════

export interface CreateArtifactRequest {
  artifactType: ArtifactType;
  name: string;
  description?: string;
  keywords?: string[];
  hash: string;
  contentType?: string;
  contentSizeBytes?: number;
  validFrom?: string;
  validUntil?: string;
  retentionPeriodYears?: number;
  storageRef: string;
  storageType?: string;
  storageLocation?: string;
  accessUrl?: string;
  signature?: string;
  signatureType?: string;
  signer?: string;
  signerName?: string;
  signerRole?: string;
  signedAt?: string;
  relatedEventIds: string[];
  relatedDecisionId?: string;
  relatedClockId?: string;
  relatedIncidentId?: string;
  metadata?: Record<string, any>;
  tags?: string[];
  complianceFramework?: string;
  regulatoryApproval?: boolean;
  approvalReference?: string;
}

export class EvidenceArtifactService {
  /**
   * Create a new artifact
   */
  static async create(request: CreateArtifactRequest): Promise<{
    artifactId: string;
  }> {
    return apiRequest('/evidence/artifacts', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * Get artifacts by event
   */
  static async getArtifactsByEvent(eventId: string): Promise<EvidenceArtifact[]> {
    // This would require a backend endpoint
    // For now, return empty array
    return [];
  }

  /**
   * Get artifacts by type
   */
  static async getArtifactsByType(artifactType: ArtifactType): Promise<EvidenceArtifact[]> {
    // This would require a backend endpoint
    // For now, return empty array
    return [];
  }

  /**
   * Download artifact
   */
  static async downloadArtifact(artifactId: string): Promise<Blob> {
    const response = await fetch(`${API_BASE}/evidence/artifacts/${artifactId}/download`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to download artifact: ${response.statusText}`);
    }

    return response.blob();
  }
}

// ═══════════════════════════════════════════════════════════════
// INTEGRITY OPERATIONS
// ═══════════════════════════════════════════════════════════════

export interface IntegrityCheckResponse {
  hashChainValid: boolean;
  eventsVerified: number;
  lastVerification: string;
  gapsDetected: string[];
  merkleAnchorsCount: number;
}

export class EvidenceIntegrityService {
  /**
   * Check integrity of the evidence graph
   */
  static async checkIntegrity(): Promise<IntegrityCheckResponse> {
    return apiRequest('/evidence/integrity');
  }

  /**
   * Get Merkle anchors
   */
  static async getMerkleAnchors(): Promise<MerkleAnchor[]> {
    // This would require a backend endpoint
    // For now, return empty array
    return [];
  }

  /**
   * Get TSA timestamps
   */
  static async getTsaTimestamps(): Promise<TsaTimestamp[]> {
    // This would require a backend endpoint
    // For now, return empty array
    return [];
  }

  /**
   * Verify hash chain for specific source system
   */
  static async verifyHashChain(sourceSystem: string): Promise<{
    valid: boolean;
    eventsChecked: number;
    lastEventHash: string;
  }> {
    // This would require a backend endpoint
    // For now, return mock data
    return {
      valid: true,
      eventsChecked: 0,
      lastEventHash: '',
    };
  }
}

// ═══════════════════════════════════════════════════════════════
// COMPLIANCE OPERATIONS
// ═══════════════════════════════════════════════════════════════

export class EvidenceComplianceService {
  /**
   * Run a compliance query
   */
  static async runComplianceQuery(queryId: string): Promise<ComplianceResult> {
    return apiRequest('/evidence/compliance-query', {
      method: 'POST',
      body: JSON.stringify({ queryId }),
    });
  }

  /**
   * Get available compliance queries
   */
  static async getComplianceQueries(): Promise<ComplianceQuery[]> {
    // This would require a backend endpoint
    // For now, return empty array
    return [];
  }

  /**
   * Get compliance results by regulation
   */
  static async getComplianceResultsByRegulation(regulation: Regulation): Promise<ComplianceResult[]> {
    // This would require a backend endpoint
    // For now, return empty array
    return [];
  }

  /**
   * Get compliance dashboard stats
   */
  static async getComplianceStats(): Promise<{
    totalQueries: number;
    passedQueries: number;
    failedQueries: number;
    partialQueries: number;
    averageConfidence: number;
    lastEvaluation: string;
  }> {
    // Mock data for now
    return {
      totalQueries: 0,
      passedQueries: 0,
      failedQueries: 0,
      partialQueries: 0,
      averageConfidence: 0,
      lastEvaluation: new Date().toISOString(),
    };
  }
}

// ═══════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Create evidence event from common patterns
 */
export function createEventFromPattern(
  eventType: string,
  sourceSystem: string,
  regulatoryTags: Regulation[],
  payload: Record<string, any>,
  options: {
    severity?: EventSeverity;
    correlationId?: string;
    causationId?: string;
    articles?: string[];
  } = {}
): CreateEventRequest {
  return {
    eventType,
    severity: options.severity || 'INFO',
    sourceSystem,
    regulatoryTags,
    articles: options.articles,
    payload,
    correlationId: options.correlationId,
    causationId: options.causationId,
  };
}

/**
 * Create decision from approval workflow
 */
export function createDecisionFromApproval(
  decisionType: DecisionType,
  regulation: Regulation,
  outcome: string,
  justification: string,
  actorId: string,
  relatedEventId: string,
  options: {
    actorName?: string;
    actorRole?: string;
    articles?: string[];
  } = {}
): CreateDecisionRequest {
  return {
    decisionType,
    regulation,
    articles: options.articles,
    outcome,
    justification,
    actorId,
    actorName: options.actorName,
    actorRole: options.actorRole,
    relatedEventId,
  };
}

/**
 * Create clock from regulatory requirement
 */
export function createClockFromRegulation(
  clockType: ClockType,
  regulation: Regulation,
  article: string,
  deadline: string,
  relatedEventId: string,
  options: {
    businessImpactAssessment?: string;
    priorityLevel?: string;
  } = {}
): CreateClockRequest {
  return {
    clockType,
    regulation,
    article,
    deadline,
    relatedEventId,
    businessImpactAssessment: options.businessImpactAssessment,
    priorityLevel: options.priorityLevel,
  };
}

/**
 * Format regulation and article for display
 */
export function formatRegulationArticle(regulation: Regulation, article?: string): string {
  if (article) {
    return `${regulation} ${article}`;
  }
  return regulation;
}

/**
 * Get severity color for UI
 */
export function getSeverityColor(severity: EventSeverity): string {
  switch (severity) {
    case 'CRITICAL':
      return 'text-red-600 bg-red-100';
    case 'HIGH':
      return 'text-orange-600 bg-orange-100';
    case 'MEDIUM':
      return 'text-yellow-600 bg-yellow-100';
    case 'LOW':
      return 'text-blue-600 bg-blue-100';
    case 'INFO':
    default:
      return 'text-gray-600 bg-gray-100';
  }
}

/**
 * Get status color for UI
 */
export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'compliant':
    case 'passed':
    case 'proven':
      return 'text-green-600 bg-green-100';
    case 'non_compliant':
    case 'failed':
    case 'breached':
      return 'text-red-600 bg-red-100';
    case 'warning':
    case 'partial':
      return 'text-yellow-600 bg-yellow-100';
    case 'pending':
    case 'running':
      return 'text-blue-600 bg-blue-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
}



