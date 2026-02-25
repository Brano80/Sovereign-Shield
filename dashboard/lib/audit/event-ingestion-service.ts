import 'server-only';
import { v4 as uuidv4 } from 'uuid';
import prisma from '@/lib/prisma';
import { hashChainService } from './hash-chain-service';
import { tsaService } from './tsa-service';
import {
  EvidenceEvent,
  EvidenceDecision,
  EvidenceClock,
  EvidenceEdge,
  Regulation,
  EventSeverity,
  ClockType,
  DecisionType,
  EdgeType,
} from './evidence-graph-types';

// ═══════════════════════════════════════════════════════════════
// EVENT CREATION OPTIONS
// ═══════════════════════════════════════════════════════════════

export interface CreateEventOptions {
  // Required
  eventType: string;              // e.g., "INCIDENT.CREATED", "DECISION.APPROVAL.GRANTED"
  sourceSystem: string;           // e.g., "unified-incidents", "risk-overview"
  payload: Record<string, any>;   // Event-specific data

  // Optional - will be inferred if not provided
  severity?: EventSeverity;
  regulatoryTags?: Regulation[];
  articles?: string[];

  // Correlation
  correlationId?: string;         // Links related events (e.g., incident ID)
  causationId?: string;           // What triggered this event

  // Timing
  occurredAt?: string;            // ISO8601, defaults to now

  // Source context
  sourceIp?: string;

  // Auto-triggers
  autoTriggerClocks?: boolean;    // Default: true
  autoCreateEdges?: boolean;      // Default: true

  // TSA
  requestTsaTimestamp?: boolean;  // Default: only for CRITICAL

  // Related entities (for edge creation)
  relatedDecisionId?: string;
  relatedControlId?: string;
  relatedActorId?: string;
  relatedArtifactId?: string;
}

export interface CreateDecisionOptions {
  decisionType: DecisionType;
  outcome: string;
  justification: string;          // REQUIRED for audit
  actorId: string;
  relatedEventId: string;

  // Optional
  regulatoryTags?: Regulation[];
  articles?: string[];
  aiAssisted?: boolean;
  aiConfidence?: number;
  humanVerified?: boolean;

  // Auto-triggers
  autoCreateEdges?: boolean;
  autoCreateArtifact?: boolean;
}

export interface CreateClockOptions {
  clockType: ClockType;
  relatedEventId: string;

  // Optional - will be calculated if not provided
  startTime?: string;
  deadline?: string;

  // Custom deadline (for CUSTOM or INTERNAL_SLA)
  deadlineHours?: number;
}

// ═══════════════════════════════════════════════════════════════
// REGULATORY TAG INFERENCE
// ═══════════════════════════════════════════════════════════════

const EVENT_TYPE_REGULATIONS: Record<string, Regulation[]> = {
  // Incident events
  'INCIDENT.CREATED': ['GDPR', 'DORA', 'NIS2'],
  'INCIDENT.CLASSIFIED': ['DORA', 'NIS2'],
  'INCIDENT.ESCALATED': ['DORA', 'NIS2'],
  'INCIDENT.RESOLVED': ['DORA', 'NIS2'],
  'INCIDENT.CLOSED': ['GDPR', 'DORA', 'NIS2'],

  // Data breach events
  'BREACH.DETECTED': ['GDPR'],
  'BREACH.ASSESSED': ['GDPR'],
  'BREACH.NOTIFIED_DPA': ['GDPR'],
  'BREACH.NOTIFIED_SUBJECTS': ['GDPR'],

  // Decision events
  'DECISION.APPROVAL.GRANTED': ['DORA', 'NIS2'],
  'DECISION.APPROVAL.REJECTED': ['DORA', 'NIS2'],
  'DECISION.OVERRIDE.HUMAN': ['AI_ACT'],
  'DECISION.RISK_ACCEPTANCE': ['GDPR', 'DORA'],
  'DECISION.ESCALATION': ['DORA', 'NIS2'],

  // AI events
  'AI.DECISION.MADE': ['AI_ACT'],
  'AI.OVERRIDE.REQUESTED': ['AI_ACT'],
  'AI.OVERRIDE.EXECUTED': ['AI_ACT'],
  'AI.BLOCKED.PROHIBITED': ['AI_ACT'],

  // Control events
  'CONTROL.ACTIVATED': ['DORA', 'NIS2'],
  'CONTROL.TESTED': ['DORA', 'NIS2'],
  'CONTROL.FAILED': ['DORA', 'NIS2'],

  // Asset events
  'ASSET.REGISTERED': ['DORA'],
  'ASSET.UPDATED': ['DORA'],
  'ASSET.DECOMMISSIONED': ['DORA'],

  // TPRM events
  'VENDOR.REGISTERED': ['DORA'],
  'VENDOR.RISK_ASSESSED': ['DORA'],
  'VENDOR.CONTRACT_UPDATED': ['DORA'],

  // Clock events
  'CLOCK.STARTED': ['GDPR', 'DORA', 'NIS2'],
  'CLOCK.WARNING': ['GDPR', 'DORA', 'NIS2'],
  'CLOCK.MET': ['GDPR', 'DORA', 'NIS2'],
  'CLOCK.BREACHED': ['GDPR', 'DORA', 'NIS2'],

  // Communication events
  'COMMUNICATION.SENT': ['DORA'],
  'COMMUNICATION.ACKNOWLEDGED': ['DORA'],
  'COMMUNICATION.ESCALATED': ['DORA'],

  // Governance events
  'GOVERNANCE.POLICY.CREATED': ['DORA', 'NIS2'],
  'GOVERNANCE.POLICY.APPROVED': ['DORA', 'NIS2'],
  'GOVERNANCE.OVERSIGHT.RECORDED': ['DORA', 'NIS2'],

  // GDPR events
  'CONSENT.RECORDED': ['GDPR'],
  'DSR.RECEIVED': ['GDPR'],
};

const CLOCK_TYPE_CONFIG: Record<ClockType, {
  regulation: Regulation;
  article: string;
  hours: number;
}> = {
  GDPR_72H_BREACH: { regulation: 'GDPR', article: 'Art.33', hours: 72 },
  GDPR_30D_REPORTING: { regulation: 'GDPR', article: 'Art.34', hours: 720 },
  DORA_4H_INITIAL: { regulation: 'DORA', article: 'Art.19', hours: 4 },
  DORA_24H_INTERMEDIATE: { regulation: 'DORA', article: 'Art.19', hours: 24 },
  DORA_1M_FINAL: { regulation: 'DORA', article: 'Art.19', hours: 720 },
  NIS2_24H_WARNING: { regulation: 'NIS2', article: 'Art.23', hours: 24 },
  NIS2_72H_NOTIFICATION: { regulation: 'NIS2', article: 'Art.23', hours: 72 },
  NIS2_1M_FINAL: { regulation: 'NIS2', article: 'Art.23', hours: 720 },
  AI_ACT_5_RISK: { regulation: 'AI_ACT', article: 'Art.5', hours: 24 },
  INTERNAL_SLA: { regulation: 'DORA', article: 'Internal', hours: 24 },
  CUSTOM: { regulation: 'DORA', article: 'Custom', hours: 24 },
};

// Events that should auto-trigger regulatory clocks
const CLOCK_TRIGGERS: Record<string, ClockType[]> = {
  'INCIDENT.CREATED': ['DORA_4H_INITIAL', 'NIS2_24H_WARNING'],
  'BREACH.DETECTED': ['GDPR_72H_BREACH'],
};

// ═══════════════════════════════════════════════════════════════
// EVENT INGESTION SERVICE
// ═══════════════════════════════════════════════════════════════

export class EventIngestionService {

  /**
   * Create a new evidence event with full integrity chain
   */
  async createEvent(options: CreateEventOptions): Promise<{
    eventId: string;
    sequenceNumber: number;
    clocksCreated: string[];
    edgesCreated: string[];
    tsaTimestampId?: string;
  }> {
    const {
      eventType,
      sourceSystem,
      payload,
      severity = this.inferSeverity(eventType, payload),
      regulatoryTags = this.inferRegulatoryTags(eventType),
      articles = [],
      correlationId = uuidv4(),
      causationId,
      occurredAt = new Date().toISOString(),
      sourceIp,
      autoTriggerClocks = true,
      autoCreateEdges = true,
      requestTsaTimestamp,
      relatedDecisionId,
      relatedControlId,
      relatedActorId,
      relatedArtifactId,
    } = options;

    // 1. Get sequence number and previous hash
    const sequenceNumber = await hashChainService.getNextSequenceNumber(sourceSystem);
    const previousHash = await hashChainService.getPreviousHash(sourceSystem);

    // 2. Calculate payload hash
    const payloadHash = hashChainService.calculateHash(payload);

    // 3. Generate event ID
    const eventId = `EVT-${Date.now()}-${uuidv4().substring(0, 8)}`;

    // 4. Create event record
    const now = new Date().toISOString();

    await (prisma as any).evidenceEvent.create({
      data: {
        eventId,
        correlationId,
        causationId,
        sequenceNumber,
        occurredAt: new Date(occurredAt),
        recordedAt: new Date(now),
        eventType,
        severity,
        sourceSystem,
        sourceIp,
        regulatoryTags,
        articles,
        payload,
        payloadHash,
        previousHash,
        createdAt: new Date(now),
        updatedAt: new Date(now),
      },
    });

    const clocksCreated: string[] = [];
    const edgesCreated: string[] = [];
    let tsaTimestampId: string | undefined;

    // 5. Auto-trigger clocks
    if (autoTriggerClocks) {
      const triggeredClocks = await this.autoTriggerClocks(eventId, eventType, payload);
      clocksCreated.push(...triggeredClocks);
    }

    // 6. Auto-create edges
    if (autoCreateEdges) {
      const edges = await this.autoCreateEdges(eventId, {
        relatedDecisionId,
        relatedControlId,
        relatedActorId,
        relatedArtifactId,
        eventType,
      });
      edgesCreated.push(...edges);
    }

    // 7. Request TSA timestamp for critical events
    const shouldTimestamp = requestTsaTimestamp ?? severity === 'CRITICAL';
    if (shouldTimestamp) {
      tsaTimestampId = await tsaService.timestampEvent(eventId, payloadHash);
    }

    return {
      eventId,
      sequenceNumber,
      clocksCreated,
      edgesCreated,
      tsaTimestampId,
    };
  }

  /**
   * Create a decision with automatic edge creation
   */
  async createDecision(options: CreateDecisionOptions): Promise<{
    decisionId: string;
    edgesCreated: string[];
    artifactId?: string;
  }> {
    const {
      decisionType,
      outcome,
      justification,
      actorId,
      relatedEventId,
      regulatoryTags = ['DORA'],
      articles = [],
      aiAssisted = false,
      aiConfidence,
      humanVerified = !aiAssisted,
      autoCreateEdges = true,
      autoCreateArtifact = false,
    } = options;

    // Validate justification (REQUIRED for audit)
    if (!justification || justification.trim().length < 10) {
      throw new Error('Decision justification is required and must be meaningful (min 10 chars)');
    }

    const decisionId = `DEC-${Date.now()}-${uuidv4().substring(0, 8)}`;
    const now = new Date().toISOString();

    const payload = { decisionType, outcome, justification, aiAssisted, aiConfidence, humanVerified };
    const payloadHash = hashChainService.calculateHash(payload);

    await (prisma as any).evidenceDecision.create({
      data: {
        decisionId,
        decisionType,
        timestamp: new Date(now),
        outcome,
        justification,
        actorId,
        relatedEventId,
        aiAssisted,
        aiConfidence,
        humanVerified,
        regulatoryTags,
        articles,
        payloadHash,
        createdAt: new Date(now),
      },
    });

    const edgesCreated: string[] = [];
    let artifactId: string | undefined;

    if (autoCreateEdges) {
      // Decision → made_by → Actor (UNIVERSAL)
      const madeByEdge = await this.createEdge({
        edgeType: 'MADE_BY',
        sourceNodeType: 'DECISION',
        sourceNodeId: decisionId,
        targetNodeType: 'ACTOR',
        targetNodeId: actorId,
      });
      edgesCreated.push(madeByEdge);

      // Event → leads_to → Decision
      const leadsToEdge = await this.createEdge({
        edgeType: 'LEADS_TO',
        sourceNodeType: 'EVENT',
        sourceNodeId: relatedEventId,
        targetNodeType: 'DECISION',
        targetNodeId: decisionId,
      });
      edgesCreated.push(leadsToEdge);
    }

    // Create artifact for significant decisions
    if (autoCreateArtifact) {
      artifactId = await this.createDecisionArtifact(decisionId, outcome, justification);

      if (autoCreateEdges && artifactId) {
        // Decision → produces → Artifact (UNIVERSAL)
        const producesEdge = await this.createEdge({
          edgeType: 'PRODUCES',
          sourceNodeType: 'DECISION',
          sourceNodeId: decisionId,
          targetNodeType: 'ARTIFACT',
          targetNodeId: artifactId,
        });
        edgesCreated.push(producesEdge);
      }
    }

    // Also create an event for the decision
    await this.createEvent({
      eventType: `DECISION.${decisionType}`,
      sourceSystem: 'governance',
      payload: { decisionId, decisionType, outcome },
      correlationId: relatedEventId,
      relatedDecisionId: decisionId,
      relatedActorId: actorId,
      autoTriggerClocks: false,
    });

    return {
      decisionId,
      edgesCreated,
      artifactId,
    };
  }

  /**
   * Create a regulatory clock
   */
  async createClock(options: CreateClockOptions): Promise<{
    clockId: string;
    deadline: string;
    edgeId: string;
  }> {
    const {
      clockType,
      relatedEventId,
      startTime = new Date().toISOString(),
      deadlineHours,
    } = options;

    const config = CLOCK_TYPE_CONFIG[clockType];
    const hours = deadlineHours ?? config.hours;

    const startDate = new Date(startTime);
    const deadlineDate = new Date(startDate.getTime() + hours * 60 * 60 * 1000);
    const deadline = options.deadline ?? deadlineDate.toISOString();

    const clockId = `CLK-${Date.now()}-${uuidv4().substring(0, 8)}`;
    const now = new Date().toISOString();

    await (prisma as any).evidenceClock.create({
      data: {
        clockId,
        clockType,
        regulation: config.regulation,
        article: config.article,
        startTime: new Date(startTime),
        deadline: new Date(deadline),
        status: 'RUNNING',
        relatedEventId,
        createdAt: new Date(now),
        updatedAt: new Date(now),
      },
    });

    // Create edge: Event → triggers → Clock
    const edgeId = await this.createEdge({
      edgeType: 'TRIGGERS',
      sourceNodeType: 'EVENT',
      sourceNodeId: relatedEventId,
      targetNodeType: 'CLOCK',
      targetNodeId: clockId,
    });

    // Create event for clock start
    await this.createEvent({
      eventType: 'CLOCK.STARTED',
      sourceSystem: 'audit',
      payload: { clockId, clockType, deadline, relatedEventId },
      correlationId: relatedEventId,
      regulatoryTags: [config.regulation],
      articles: [config.article],
      autoTriggerClocks: false,
    });

    return {
      clockId,
      deadline,
      edgeId,
    };
  }

  /**
   * Update clock status (MET, BREACHED, STOPPED)
   */
  async updateClockStatus(
    clockId: string,
    status: 'MET' | 'BREACHED' | 'STOPPED',
    options?: {
      artifactId?: string;
      stopReason?: string;
      actorId?: string;
    }
  ): Promise<void> {
    const now = new Date().toISOString();

    const updateData: any = {
      status,
      updatedAt: new Date(now),
    };

    if (status === 'MET') {
      updateData.metAt = new Date(now);
      if (options?.artifactId) {
        updateData.evidenceArtifactId = options.artifactId;
      }
    } else if (status === 'BREACHED') {
      updateData.breachedAt = new Date(now);
    } else if (status === 'STOPPED') {
      updateData.stoppedAt = new Date(now);
      updateData.stopReason = options?.stopReason;
    }

    await (prisma as any).evidenceClock.update({
      where: { clockId },
      data: updateData,
    });

    // Get clock details for event
    const clock = await (prisma as any).evidenceClock.findUnique({
      where: { clockId },
    });

    // Create event for status change
    await this.createEvent({
      eventType: `CLOCK.${status}`,
      sourceSystem: 'audit',
      payload: {
        clockId,
        status,
        clockType: clock?.clockType,
        artifactId: options?.artifactId,
        stopReason: options?.stopReason,
      },
      correlationId: clock?.relatedEventId,
      severity: status === 'BREACHED' ? 'CRITICAL' : 'INFO',
      regulatoryTags: clock ? [clock.regulation as Regulation] : [],
      autoTriggerClocks: false,
    });

    // Create edge if artifact provided (Clock → fulfilled_by → Artifact)
    if (status === 'MET' && options?.artifactId) {
      await this.createEdge({
        edgeType: 'FULFILLED_BY',
        sourceNodeType: 'CLOCK',
        sourceNodeId: clockId,
        targetNodeType: 'ARTIFACT',
        targetNodeId: options.artifactId,
      });
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // PRIVATE HELPER METHODS
  // ═══════════════════════════════════════════════════════════════

  private inferSeverity(eventType: string, payload: Record<string, any>): EventSeverity {
    // Critical events
    if (eventType.includes('BREACH') || eventType.includes('BLOCKED')) {
      return 'CRITICAL';
    }
    if (eventType.includes('ESCALATED') || eventType.includes('FAILED')) {
      return 'HIGH';
    }
    if (eventType.includes('WARNING') || eventType.includes('OVERRIDE')) {
      return 'MEDIUM';
    }
    if (payload.severity) {
      return payload.severity as EventSeverity;
    }
    return 'INFO';
  }

  private inferRegulatoryTags(eventType: string): Regulation[] {
    return EVENT_TYPE_REGULATIONS[eventType] || ['DORA'];
  }

  private async autoTriggerClocks(
    eventId: string,
    eventType: string,
    payload: Record<string, any>
  ): Promise<string[]> {
    const clockTypes = CLOCK_TRIGGERS[eventType] || [];
    const clockIds: string[] = [];

    for (const clockType of clockTypes) {
      const { clockId } = await this.createClock({
        clockType,
        relatedEventId: eventId,
      });
      clockIds.push(clockId);
    }

    // Handle severity-based clock triggers
    if (eventType === 'INCIDENT.CLASSIFIED' && payload.severity === 'CRITICAL') {
      // Critical incidents may need additional clocks
      const { clockId } = await this.createClock({
        clockType: 'DORA_4H_INITIAL',
        relatedEventId: eventId,
      });
      clockIds.push(clockId);
    }

    return clockIds;
  }

  private async autoCreateEdges(
    eventId: string,
    options: {
      relatedDecisionId?: string;
      relatedControlId?: string;
      relatedActorId?: string;
      relatedArtifactId?: string;
      eventType: string;
    }
  ): Promise<string[]> {
    const edgeIds: string[] = [];

    // Event → evaluated_by → Control
    if (options.relatedControlId) {
      const edgeId = await this.createEdge({
        edgeType: 'EVALUATED_BY',
        sourceNodeType: 'EVENT',
        sourceNodeId: eventId,
        targetNodeType: 'CONTROL',
        targetNodeId: options.relatedControlId,
      });
      edgeIds.push(edgeId);
    }

    // Event → documented_by → Artifact
    if (options.relatedArtifactId) {
      const edgeId = await this.createEdge({
        edgeType: 'DOCUMENTED_BY',
        sourceNodeType: 'EVENT',
        sourceNodeId: eventId,
        targetNodeType: 'ARTIFACT',
        targetNodeId: options.relatedArtifactId,
      });
      edgeIds.push(edgeId);
    }

    return edgeIds;
  }

  private async createEdge(options: {
    edgeType: EdgeType;
    sourceNodeType: string;
    sourceNodeId: string;
    targetNodeType: string;
    targetNodeId: string;
    metadata?: Record<string, any>;
  }): Promise<string> {
    const edgeId = `EDG-${Date.now()}-${uuidv4().substring(0, 8)}`;

    await (prisma as any).evidenceEdge.create({
      data: {
        edgeId,
        edgeType: options.edgeType,
        sourceNodeType: options.sourceNodeType,
        sourceNodeId: options.sourceNodeId,
        targetNodeType: options.targetNodeType,
        targetNodeId: options.targetNodeId,
        metadata: options.metadata || {},
        createdAt: new Date(),
      },
    });

    return edgeId;
  }

  private async createDecisionArtifact(
    decisionId: string,
    outcome: string,
    justification: string
  ): Promise<string> {
    const artifactId = `ART-${Date.now()}-${uuidv4().substring(0, 8)}`;
    const content = JSON.stringify({ decisionId, outcome, justification, timestamp: new Date().toISOString() });
    const hash = hashChainService.calculateHash({ content });

    await (prisma as any).evidenceArtifact.create({
      data: {
        artifactId,
        artifactType: 'SIGNED_RECORD',
        name: `Decision Record - ${decisionId}`,
        description: `Audit record for decision: ${outcome}`,
        hash,
        hashAlgorithm: 'SHA-256',
        storageRef: `decisions/${decisionId}.json`,
        storageType: 'IMMUTABLE',
        signatureType: 'NONE',
        relatedEventIds: [],
        relatedDecisionId: decisionId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return artifactId;
  }
}

// Singleton instance
export const eventIngestionService = new EventIngestionService();


