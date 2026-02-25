import { eventIngestionService, CreateEventOptions } from './event-ingestion-service';
import { Regulation, EventSeverity, DecisionType, ClockType } from './evidence-graph-types';
import { alertService } from './alert-service';

// ═══════════════════════════════════════════════════════════════
// UNIFIED INCIDENTS LENS HELPERS
// ═══════════════════════════════════════════════════════════════

export const IncidentAuditHelpers = {
  /**
   * Log incident creation
   */
  async logIncidentCreated(incident: {
    incidentId: string;
    title: string;
    severity: string;
    category: string;
    description?: string;
    affectedSystems?: string[];
    reportedBy?: string;
  }) {
    return eventIngestionService.createEvent({
      eventType: 'INCIDENT.CREATED',
      sourceSystem: 'unified-incidents',
      correlationId: incident.incidentId,
      severity: incident.severity as EventSeverity,
      payload: incident,
      autoTriggerClocks: true,  // Will trigger DORA_4H, NIS2_24H
    });
  },

  /**
   * Log incident classification
   */
  async logIncidentClassified(
    incidentId: string,
    classification: {
      severity: string;
      category: string;
      isMajor: boolean;
      affectedUsers?: number;
      affectedServices?: string[];
    },
    actorId: string
  ) {
    const result = await eventIngestionService.createEvent({
      eventType: 'INCIDENT.CLASSIFIED',
      sourceSystem: 'unified-incidents',
      correlationId: incidentId,
      severity: classification.severity as EventSeverity,
      payload: { incidentId, ...classification },
      autoTriggerClocks: true,
    });

    // Create decision for classification
    await eventIngestionService.createDecision({
      decisionType: 'CLASSIFICATION',
      outcome: `Incident classified as ${classification.severity} - ${classification.category}`,
      justification: `Classification based on: affected users (${classification.affectedUsers || 0}), major incident: ${classification.isMajor}`,
      actorId,
      relatedEventId: result.eventId,
      autoCreateArtifact: classification.isMajor,
    });

    return result;
  },

  /**
   * Log incident escalation
   */
  async logIncidentEscalated(
    incidentId: string,
    escalation: {
      fromLevel: number;
      toLevel: number;
      reason: string;
      escalatedTo: string[];
    },
    actorId: string
  ) {
    const result = await eventIngestionService.createEvent({
      eventType: 'INCIDENT.ESCALATED',
      sourceSystem: 'unified-incidents',
      correlationId: incidentId,
      severity: 'HIGH',
      payload: { incidentId, ...escalation },
    });

    await eventIngestionService.createDecision({
      decisionType: 'ESCALATION',
      outcome: `Escalated from L${escalation.fromLevel} to L${escalation.toLevel}`,
      justification: escalation.reason,
      actorId,
      relatedEventId: result.eventId,
      autoCreateArtifact: true,
    });

    return result;
  },

  /**
   * Log incident resolution
   */
  async logIncidentResolved(
    incidentId: string,
    resolution: {
      rootCause: string;
      resolution: string;
      preventiveMeasures?: string;
      lessonsLearned?: string;
    },
    actorId: string
  ) {
    const result = await eventIngestionService.createEvent({
      eventType: 'INCIDENT.RESOLVED',
      sourceSystem: 'unified-incidents',
      correlationId: incidentId,
      severity: 'INFO',
      payload: { incidentId, ...resolution },
    });

    await eventIngestionService.createDecision({
      decisionType: 'CLOSURE',
      outcome: `Incident resolved: ${resolution.resolution}`,
      justification: `Root cause: ${resolution.rootCause}. Preventive measures: ${resolution.preventiveMeasures || 'None'}`,
      actorId,
      relatedEventId: result.eventId,
      autoCreateArtifact: true,
    });

    return result;
  },

  /**
   * Log communication sent
   */
  async logCommunicationSent(
    incidentId: string,
    communication: {
      communicationId: string;
      type: string;
      channel: string;
      recipients: string[];
      subject: string;
    }
  ) {
    return eventIngestionService.createEvent({
      eventType: 'COMMUNICATION.SENT',
      sourceSystem: 'unified-incidents',
      correlationId: incidentId,
      payload: communication,
    });
  },

  /**
   * Log regulatory deadline met
   */
  async logDeadlineMet(
    incidentId: string,
    clockId: string,
    artifactId?: string
  ) {
    await eventIngestionService.updateClockStatus(clockId, 'MET', { artifactId });
  },
};

// ═══════════════════════════════════════════════════════════════
// RISK OVERVIEW LENS HELPERS
// ═══════════════════════════════════════════════════════════════

export const RiskAuditHelpers = {
  /**
   * Log risk assessment completed
   */
  async logRiskAssessmentCompleted(assessment: {
    assessmentId: string;
    assetId: string;
    riskScore: number;
    riskLevel: string;
    factors: Record<string, number>;
  }) {
    return eventIngestionService.createEvent({
      eventType: 'RISK.ASSESSMENT.COMPLETED',
      sourceSystem: 'risk-overview',
      correlationId: assessment.assessmentId,
      severity: assessment.riskLevel === 'CRITICAL' ? 'CRITICAL' : 'INFO',
      payload: assessment,
      regulatoryTags: ['DORA', 'GDPR'],
      articles: ['DORA-6', 'GDPR-35'],
    });
  },

  /**
   * Log threshold breach
   */
  async logThresholdBreach(breach: {
    breachId: string;
    assetId: string;
    thresholdType: string;
    currentValue: number;
    thresholdValue: number;
  }) {
    return eventIngestionService.createEvent({
      eventType: 'RISK.THRESHOLD.BREACHED',
      sourceSystem: 'risk-overview',
      correlationId: breach.breachId,
      severity: 'HIGH',
      payload: breach,
    });
  },

  /**
   * Log risk acceptance decision
   */
  async logRiskAccepted(
    riskId: string,
    acceptance: {
      riskDescription: string;
      acceptedLevel: string;
      validUntil: string;
      conditions?: string;
    },
    actorId: string
  ) {
    const result = await eventIngestionService.createEvent({
      eventType: 'RISK.ACCEPTED',
      sourceSystem: 'risk-overview',
      correlationId: riskId,
      payload: acceptance,
    });

    await eventIngestionService.createDecision({
      decisionType: 'RISK_ACCEPTANCE',
      outcome: `Risk accepted at level: ${acceptance.acceptedLevel}`,
      justification: `Risk: ${acceptance.riskDescription}. Valid until: ${acceptance.validUntil}. Conditions: ${acceptance.conditions || 'None'}`,
      actorId,
      relatedEventId: result.eventId,
      autoCreateArtifact: true,
    });

    return result;
  },
};

// ═══════════════════════════════════════════════════════════════
// DORA ASSETS LENS HELPERS
// ═══════════════════════════════════════════════════════════════

export const AssetAuditHelpers = {
  /**
   * Log asset registered
   */
  async logAssetRegistered(asset: {
    assetId: string;
    name: string;
    category: string;
    criticality: string;
    owner: string;
  }) {
    return eventIngestionService.createEvent({
      eventType: 'ASSET.REGISTERED',
      sourceSystem: 'dora-assets',
      correlationId: asset.assetId,
      payload: asset,
      regulatoryTags: ['DORA'],
      articles: ['DORA-5', 'DORA-6'],
    });
  },

  /**
   * Log asset updated
   */
  async logAssetUpdated(
    assetId: string,
    changes: Record<string, { old: any; new: any }>
  ) {
    return eventIngestionService.createEvent({
      eventType: 'ASSET.UPDATED',
      sourceSystem: 'dora-assets',
      correlationId: assetId,
      payload: { assetId, changes },
    });
  },

  /**
   * Log whitelist violation
   */
  async logWhitelistViolation(violation: {
    violationId: string;
    assetId: string;
    violationType: string;
    component: string;
    version?: string;
  }) {
    return eventIngestionService.createEvent({
      eventType: 'ASSET.WHITELIST.VIOLATION',
      sourceSystem: 'dora-assets',
      correlationId: violation.violationId,
      severity: 'HIGH',
      payload: violation,
    });
  },
};

// ═══════════════════════════════════════════════════════════════
// AI ACT ART.5 LENS HELPERS
// ═══════════════════════════════════════════════════════════════

export const AIActAuditHelpers = {
  /**
   * Log AI decision made
   */
  async logAIDecisionMade(decision: {
    decisionId: string;
    aiSystemId: string;
    decisionType: string;
    confidence: number;
    inputSummary?: string;
    outputSummary?: string;
  }) {
    return eventIngestionService.createEvent({
      eventType: 'AI.DECISION.MADE',
      sourceSystem: 'ai-act-art5',
      correlationId: decision.decisionId,
      payload: decision,
      regulatoryTags: ['AI_ACT'],
      articles: ['AI_ACT-14'],
    });
  },

  /**
   * Log prohibited practice blocked
   */
  async logProhibitedBlocked(blocked: {
    blockId: string;
    aiSystemId: string;
    prohibitedCategory: string;
    detectionMethod: string;
    riskScore: number;
    details?: string;
  }) {
    const result = await eventIngestionService.createEvent({
      eventType: 'AI.BLOCKED.PROHIBITED',
      sourceSystem: 'ai-act-art5',
      correlationId: blocked.blockId,
      severity: 'CRITICAL',
      payload: blocked,
      regulatoryTags: ['AI_ACT'],
      articles: ['AI_ACT-5'],
    });

    // Create AI blocked alert
    await alertService.createAIBlockedAlert({
      blockId: blocked.blockId,
      aiSystemId: blocked.aiSystemId,
      prohibitedCategory: blocked.prohibitedCategory,
      detectionMethod: blocked.detectionMethod,
      riskScore: blocked.riskScore,
      details: blocked.details || '',
    });

    return result;
  },

  /**
   * Log human override
   */
  async logHumanOverride(
    aiDecisionId: string,
    override: {
      overrideReason: string;
      originalDecision: string;
      newDecision: string;
    },
    actorId: string
  ) {
    const result = await eventIngestionService.createEvent({
      eventType: 'AI.OVERRIDE.EXECUTED',
      sourceSystem: 'ai-act-art5',
      correlationId: aiDecisionId,
      severity: 'MEDIUM',
      payload: { aiDecisionId, ...override },
      regulatoryTags: ['AI_ACT'],
      articles: ['AI_ACT-14'],
    });

    await eventIngestionService.createDecision({
      decisionType: 'OVERRIDE',
      outcome: `AI decision overridden: ${override.originalDecision} → ${override.newDecision}`,
      justification: override.overrideReason,
      actorId,
      relatedEventId: result.eventId,
      aiAssisted: false,
      humanVerified: true,
      autoCreateArtifact: true,
    });

    return result;
  },

  /**
   * Log transparency disclosure
   */
  async logTransparencyDisclosure(disclosure: {
    disclosureId: string;
    aiSystemId: string;
    disclosureType: string;
    recipientType: string;
    contentSummary: string;
  }) {
    return eventIngestionService.createEvent({
      eventType: 'AI.TRANSPARENCY.DISCLOSED',
      sourceSystem: 'ai-act-art5',
      correlationId: disclosure.disclosureId,
      payload: disclosure,
      regulatoryTags: ['AI_ACT'],
      articles: ['AI_ACT-13', 'AI_ACT-52'],
    });
  },
};

// ═══════════════════════════════════════════════════════════════
// GOVERNANCE HELPERS
// ═══════════════════════════════════════════════════════════════

export const GovernanceAuditHelpers = {
  /**
   * Log policy created
   */
  async logPolicyCreated(policy: {
    policyId: string;
    name: string;
    category: string;
    version: string;
  }) {
    return eventIngestionService.createEvent({
      eventType: 'GOVERNANCE.POLICY.CREATED',
      sourceSystem: 'governance',
      correlationId: policy.policyId,
      payload: policy,
      regulatoryTags: ['DORA', 'NIS2'],
      articles: ['DORA-5', 'NIS2-20'],
    });
  },

  /**
   * Log policy approved
   */
  async logPolicyApproved(
    policyId: string,
    approval: {
      version: string;
      approvalLevel: string;
    },
    actorId: string
  ) {
    const result = await eventIngestionService.createEvent({
      eventType: 'GOVERNANCE.POLICY.APPROVED',
      sourceSystem: 'governance',
      correlationId: policyId,
      payload: { policyId, ...approval },
    });

    await eventIngestionService.createDecision({
      decisionType: 'APPROVAL',
      outcome: `Policy ${policyId} approved at level ${approval.approvalLevel}`,
      justification: `Version ${approval.version} approved after review`,
      actorId,
      relatedEventId: result.eventId,
      autoCreateArtifact: true,
    });

    return result;
  },

  /**
   * Log management oversight activity
   */
  async logOversightActivity(activity: {
    activityId: string;
    activityType: string;
    description: string;
    participants: string[];
    outcomes?: string;
  }) {
    return eventIngestionService.createEvent({
      eventType: 'GOVERNANCE.OVERSIGHT.RECORDED',
      sourceSystem: 'governance',
      correlationId: activity.activityId,
      payload: activity,
      regulatoryTags: ['DORA', 'NIS2'],
      articles: ['DORA-5', 'NIS2-20'],
    });
  },
};

// ═══════════════════════════════════════════════════════════════
// GDPR HELPERS
// ═══════════════════════════════════════════════════════════════

export const GDPRAuditHelpers = {
  /**
   * Log data breach detected
   */
  async logBreachDetected(breach: {
    breachId: string;
    description: string;
    affectedDataTypes: string[];
    affectedSubjects: number;
    severity?: string;
  }) {
    const result = await eventIngestionService.createEvent({
      eventType: 'BREACH.DETECTED',
      sourceSystem: 'gdpr-breach',
      correlationId: breach.breachId,
      severity: 'CRITICAL',
      payload: breach,
      regulatoryTags: ['GDPR'],
      articles: ['GDPR-33', 'GDPR-34'],
      autoTriggerClocks: true,  // Will trigger GDPR_72H
    });

    // Create data breach alert
    await alertService.createDataBreachAlert({
      breachId: breach.breachId,
      description: breach.description,
      affectedDataTypes: breach.affectedDataTypes,
      affectedSubjects: breach.affectedSubjects,
      severity: breach.severity || 'CRITICAL',
    });

    return result;
  },

  /**
   * Log DPA notification
   */
  async logDPANotified(
    breachId: string,
    notification: {
      notificationId: string;
      dpaName: string;
      submittedAt: string;
      referenceNumber?: string;
    }
  ) {
    return eventIngestionService.createEvent({
      eventType: 'BREACH.NOTIFIED_DPA',
      sourceSystem: 'gdpr-breach',
      correlationId: breachId,
      payload: notification,
      regulatoryTags: ['GDPR'],
      articles: ['GDPR-33'],
    });
  },

  /**
   * Log consent recorded
   */
  async logConsentRecorded(consent: {
    consentId: string;
    dataSubjectId: string;
    purposes: string[];
    lawfulBasis: string;
    givenAt: string;
  }) {
    return eventIngestionService.createEvent({
      eventType: 'CONSENT.RECORDED',
      sourceSystem: 'gdpr-consent',
      correlationId: consent.consentId,
      payload: consent,
      regulatoryTags: ['GDPR'],
      articles: ['GDPR-6', 'GDPR-7'],
    });
  },

  /**
   * Log data subject request
   */
  async logDataSubjectRequest(request: {
    requestId: string;
    requestType: string;  // ACCESS, ERASURE, PORTABILITY, etc.
    dataSubjectId: string;
    receivedAt: string;
  }) {
    const result = await eventIngestionService.createEvent({
      eventType: 'DSR.RECEIVED',
      sourceSystem: 'gdpr-rights',
      correlationId: request.requestId,
      payload: request,
      regulatoryTags: ['GDPR'],
      articles: ['GDPR-15', 'GDPR-16', 'GDPR-17', 'GDPR-20'],
    });

    // Create 30-day SLA clock for DSR
    await eventIngestionService.createClock({
      clockType: 'CUSTOM',
      relatedEventId: result.eventId,
      deadlineHours: 30 * 24,  // 30 days
    });

    return result;
  },
};

// ═══════════════════════════════════════════════════════════════
// TPRM HELPERS
// ═══════════════════════════════════════════════════════════════

export const TPRMAuditHelpers = {
  /**
   * Log vendor registered
   */
  async logVendorRegistered(vendor: {
    vendorId: string;
    name: string;
    serviceType: string;
    riskTier: string;
  }) {
    return eventIngestionService.createEvent({
      eventType: 'VENDOR.REGISTERED',
      sourceSystem: 'dora-tprm',
      correlationId: vendor.vendorId,
      payload: vendor,
      regulatoryTags: ['DORA'],
      articles: ['DORA-28', 'DORA-29', 'DORA-30'],
    });
  },

  /**
   * Log vendor risk assessment
   */
  async logVendorRiskAssessed(assessment: {
    assessmentId: string;
    vendorId: string;
    riskScore: number;
    riskLevel: string;
    findings: string[];
  }) {
    return eventIngestionService.createEvent({
      eventType: 'VENDOR.RISK_ASSESSED',
      sourceSystem: 'dora-tprm',
      correlationId: assessment.assessmentId,
      severity: assessment.riskLevel === 'CRITICAL' ? 'HIGH' : 'INFO',
      payload: assessment,
    });
  },
};
