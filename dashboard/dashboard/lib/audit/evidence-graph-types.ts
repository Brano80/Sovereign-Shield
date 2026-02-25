// ═══════════════════════════════════════════════════════════════
// EVIDENCE GRAPH SCHEMA - PART 1/4: CORE INFRASTRUCTURE
// ═══════════════════════════════════════════════════════════════
// Comprehensive type definitions for regulatory-grade audit logging
// Supports: GDPR, DORA, NIS2, AI_ACT compliance with cryptographic integrity

// ═══════════════════════════════════════════════════════════════
// REGULATORY FOUNDATIONS
// ═══════════════════════════════════════════════════════════════

export type Regulation = 'GDPR' | 'DORA' | 'NIS2' | 'AI_ACT';

export type EventSeverity = 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type DecisionType =
  | 'ESCALATION'
  | 'APPROVAL'
  | 'REJECTION'
  | 'OVERRIDE'
  | 'BLOCK'
  | 'ALLOW'
  | 'CLOSURE'
  | 'RISK_ACCEPTANCE'
  | 'CLASSIFICATION'
  | 'NOTIFICATION'
  | 'COMPLIANCE_CHECK'
  | 'AUDIT_TRIGGER';

export type ClockType =
  | 'GDPR_72H_BREACH'      // GDPR Art.33 - Breach notification to DPA
  | 'GDPR_30D_REPORTING'   // GDPR Art.34 - Communication to individuals
  | 'DORA_4H_INITIAL'      // DORA Art.19 - Initial notification to NCA
  | 'DORA_24H_INTERMEDIATE' // DORA Art.19 - Intermediate report
  | 'DORA_1M_FINAL'        // DORA Art.19 - Final report (1 month)
  | 'NIS2_24H_WARNING'     // NIS2 Art.23 - Early warning
  | 'NIS2_72H_NOTIFICATION' // NIS2 Art.23 - Incident notification
  | 'NIS2_1M_FINAL'        // NIS2 Art.23 - Final report
  | 'AI_ACT_5_RISK'        // AI Act Art.5 - Prohibited practices monitoring
  | 'INTERNAL_SLA'         // Internal SLA tracking
  | 'CUSTOM';

export type ClockStatus = 'RUNNING' | 'MET' | 'BREACHED' | 'STOPPED' | 'PAUSED';

export type ActorType = 'USER' | 'SYSTEM' | 'AI_MODEL' | 'EXTERNAL_SERVICE' | 'AUTOMATED_PROCESS';

export type AuthorityLevel = 'OPERATOR' | 'ANALYST' | 'SUPERVISOR' | 'MANAGER' | 'EXECUTIVE' | 'BOARD' | 'DPO' | 'CISO' | 'CEO';

export type ControlType =
  | 'INCIDENT_RESPONSE'
  | 'ACCESS_CONTROL'
  | 'ENCRYPTION'
  | 'BACKUP_RECOVERY'
  | 'MONITORING_ALERTING'
  | 'ESCALATION_POLICY'
  | 'AI_OVERSIGHT'
  | 'DATA_PROTECTION'
  | 'NETWORK_SECURITY'
  | 'VENDOR_MANAGEMENT'
  | 'AUDIT_LOGGING'
  | 'CHANGE_MANAGEMENT'
  | 'COMPLIANCE_MONITORING'
  | 'BUSINESS_CONTINUITY'
  | 'CUSTOM';

export type ControlStatus = 'ACTIVE' | 'DISABLED' | 'TESTING' | 'DEPRECATED' | 'MAINTENANCE';

export type ArtifactType =
  | 'LOG_SNAPSHOT'
  | 'SIGNED_RECORD'
  | 'TIMELINE_EXTRACT'
  | 'HASH_PROOF'
  | 'MERKLE_PROOF'
  | 'TSA_TIMESTAMP'
  | 'QES_SIGNATURE'
  | 'ADVANCED_SIGNATURE'
  | 'SCREENSHOT'
  | 'EXPORT_PACKAGE'
  | 'NOTIFICATION_PROOF'
  | 'REPORT'
  | 'CONFIGURATION_BACKUP'
  | 'AUDIT_TRAIL'
  | 'COMPLIANCE_EVIDENCE';

export type SignatureType = 'QES' | 'ADVANCED' | 'SIMPLE' | 'TSA' | 'NONE';

export type StorageType = 'IMMUTABLE' | 'STANDARD' | 'ARCHIVAL';

export type EdgeType =
  // Event relationships
  | 'TRIGGERS'           // Event → Clock (event starts regulatory clock)
  | 'EVALUATED_BY'       // Event → Control (event processed by control)
  | 'LEADS_TO'           // Event → Decision (event results in decision)
  | 'DOCUMENTED_BY'      // Event → Artifact (event has evidence)
  | 'CAUSED_BY'          // Event → Event (causal chain)
  | 'FOLLOWS_FROM'      // Event → Event (sequence chain)

  // Decision relationships
  | 'MADE_BY'            // Decision → Actor (who made decision)
  | 'PRODUCES'           // Decision → Artifact (decision creates evidence)
  | 'OVERRIDES'          // Decision → Decision (override chain)
  | 'REQUIRES_APPROVAL'  // Decision → Decision (approval chain)

  // Control relationships
  | 'ENFORCED_BY'        // Control → Actor/System
  | 'MONITORS'           // Control → Event (control monitors events)
  | 'TESTED_BY'          // Control → Actor (who tests control)

  // Clock relationships
  | 'FULFILLED_BY'       // Clock → Artifact (proof of deadline met)
  | 'STOPPED_BY'         // Clock → Decision (decision to stop clock)
  | 'BREACHED_DUE_TO'    // Clock → Event (breach caused by event)

  // Actor relationships
  | 'SUPERVISES'         // Actor → Actor (supervisory hierarchy)
  | 'DELEGATED_TO'       // Actor → Actor (delegation chain)

  // Artifact relationships
  | 'SIGNED_BY'          // Artifact → Actor (who signed artifact)
  | 'STORED_IN'          // Artifact → System (storage location)
  | 'VERIFIED_BY'        // Artifact → Control (verification method);

// ═══════════════════════════════════════════════════════════════
// REGULATORY EDGE REQUIREMENTS
// ═══════════════════════════════════════════════════════════════

export const REQUIRED_EDGES: Record<Regulation, EdgeType[]> = {
  GDPR: [
    'TRIGGERS',
    'LEADS_TO',
    'MADE_BY',
    'PRODUCES',
  ],
  DORA: [
    'TRIGGERS',
    'EVALUATED_BY',
    'MADE_BY',
    'PRODUCES',
    'ENFORCED_BY',
  ],
  NIS2: [
    'EVALUATED_BY',
    'ENFORCED_BY',
    'MADE_BY',
    'PRODUCES',
  ],
  AI_ACT: [
    'EVALUATED_BY',
    'LEADS_TO',
    'PRODUCES',
  ],
};

export const UNIVERSAL_EDGES: EdgeType[] = [
  'MADE_BY',
  'PRODUCES',
  'DOCUMENTED_BY',
];

// ═══════════════════════════════════════════════════════════════
// NODE TYPES - 6 REQUIRED TYPES
// ═══════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════
// 1. EVENT NODE - Core audit events
// ═══════════════════════════════════════════════════════════════

export interface EvidenceEvent {
  // Identity & Correlation
  event_id: string;              // UUID, globally unique
  correlation_id: string;        // Links related events (e.g., incident ID)
  causation_id?: string;         // What triggered this event (causal chain)
  sequence_number: number;       // Monotonic sequence per source system

  // Temporality (CRITICAL for compliance)
  occurred_at: string;           // ISO8601 - When event actually happened
  recorded_at: string;           // ISO8601 - When written to audit log

  // Classification & Context
  event_type: string;            // Hierarchical: DOMAIN.CATEGORY.ACTION
                                 // Examples:
                                 // INCIDENT.CREATED
                                 // INCIDENT.CLASSIFIED
                                 // INCIDENT.ESCALATED
                                 // DECISION.APPROVAL.GRANTED
                                 // DECISION.OVERRIDE.HUMAN
                                 // CLOCK.STARTED
                                 // CLOCK.MET
                                 // CLOCK.BREACHED
                                 // CONTROL.ACTIVATED
                                 // CONTROL.TESTED
                                 // ARTIFACT.GENERATED
                                 // COMMUNICATION.SENT
                                 // COMMUNICATION.ACKNOWLEDGED
                                 // COMPLIANCE.CHECK.PASSED
                                 // COMPLIANCE.CHECK.FAILED
                                 // RISK.ASSESSMENT.STARTED
                                 // RISK.ASSESSMENT.COMPLETED
                                 // AUDIT.LOG.ENTRY
                                 // AUDIT.LOG.VERIFICATION

  severity: EventSeverity;

  // Source Attribution
  source_system: string;         // Which Veridion component (e.g., "unified-incidents", "sovereign-shield")
  source_ip?: string;            // Client IP for user actions
  source_user_agent?: string;    // Browser/client info

  // Regulatory Context (MULTI-REGULATION SUPPORT)
  regulatory_tags: Regulation[]; // Which regulations this event relates to
  articles?: string[];           // Specific articles: ["GDPR-33", "DORA-17", "AI_ACT-5"]

  // Payload & Integrity (CRYPTOGRAPHIC)
  payload: Record<string, any>;  // Event-specific structured data
  payload_hash: string;          // SHA-256 of canonical JSON payload
  previous_hash: string;         // Hash chain link (immutable sequence)

  // Metadata
  processing_duration_ms?: number; // How long it took to process
  retry_count?: number;          // For failed operations
  error_message?: string;        // If processing failed

  // Timestamps (Audit Trail)
  created_at: string;
  updated_at: string;
}

// ═══════════════════════════════════════════════════════════════
// 2. DECISION NODE - Approval & override decisions
// ═══════════════════════════════════════════════════════════════

export interface EvidenceDecision {
  decision_id: string;
  decision_type: DecisionType;

  // Context
  timestamp: string;             // ISO8601
  regulation: Regulation;
  articles?: string[];           // Specific articles requiring this decision

  // Decision Content (AUDIT CRITICAL)
  outcome: string;               // What was decided (machine-readable)
  justification: string;         // WHY this decision (REQUIRED for compliance)
  alternatives_considered?: string[]; // What other options were evaluated
  risk_assessment?: string;      // Risk assessment performed

  // Attribution (ACCOUNTABILITY)
  actor_id: string;              // Who made the decision
  actor_name?: string;           // Cached for readability
  actor_role?: string;           // Cached for context

  // Related Context
  related_event_id: string;      // What event triggered this decision
  related_incident_id?: string;  // If incident-related
  related_asset_ids?: string[];  // If asset-related

  // AI Involvement (TRANSPARENCY)
  ai_assisted?: boolean;         // Was AI involved in decision?
  ai_model_used?: string;        // Which AI model (if any)
  ai_confidence?: number;        // AI confidence score (0.0-1.0)
  ai_recommendation?: string;    // What AI recommended
  human_verified?: boolean;      // Did human verify AI recommendation?
  human_override_reason?: string; // Why human overrode AI

  // Approval Chain
  requires_approval?: boolean;
  approval_level?: number;       // 1, 2, 3, etc.
  approver_id?: string;          // Who approved (if different from actor)
  approval_timestamp?: string;

  // Effectiveness Tracking
  effectiveness_rating?: 'SUCCESSFUL' | 'PARTIALLY_SUCCESSFUL' | 'UNSUCCESSFUL';
  outcome_verification?: string; // How outcome was verified

  // Integrity
  payload_hash: string;          // SHA-256 of decision content

  // Audit Trail
  created_at: string;
  updated_at: string;
}

// ═══════════════════════════════════════════════════════════════
// 3. CLOCK NODE - Regulatory deadlines & SLAs
// ═══════════════════════════════════════════════════════════════

export interface EvidenceClock {
  clock_id: string;
  clock_type: ClockType;

  // Regulatory Context
  regulation: Regulation;
  article: string;               // Specific article: "Art.33", "Art.19"

  // Time Boundaries (COMPLIANCE CRITICAL)
  start_time: string;            // ISO8601 - When clock started
  deadline: string;              // ISO8601 - When clock expires
  paused_duration_ms?: number;   // How long clock was paused

  // Current State
  status: ClockStatus;

  // Completion Tracking
  met_at?: string;               // ISO8601 - When requirement fulfilled
  breached_at?: string;          // ISO8601 - When deadline missed
  stopped_at?: string;           // ISO8601 - When manually stopped
  stop_reason?: string;          // Why stopped (compliance required)

  // Related Context
  related_event_id: string;      // What started this clock
  related_incident_id?: string;  // If incident-related
  related_entity_type?: string;  // "incident", "asset", "decision", etc.
  related_entity_id?: string;    // Entity that triggered clock

  // Notification Tracking (AUDIT PROOF)
  warning_sent?: boolean;        // Was warning notification sent?
  warning_sent_at?: string;      // When warning was sent
  final_notification_sent?: boolean; // Was breach/final notification sent?
  final_notification_sent_at?: string;

  // Evidence of Compliance
  evidence_artifact_id?: string; // Proof that deadline was met (e.g., notification sent)
  compliance_verification?: string; // How compliance was verified

  // Extension Tracking
  extension_requested?: boolean;
  extension_approved?: boolean;
  extension_reason?: string;
  extension_duration_ms?: number;

  // Business Impact
  business_impact_assessment?: string;
  priority_level?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

  // Audit Trail
  created_at: string;
  updated_at: string;
  created_by: string;            // Who/system started the clock
}

// ═══════════════════════════════════════════════════════════════
// 4. ACTOR NODE - Users, systems, AI models
// ═══════════════════════════════════════════════════════════════

export interface EvidenceActor {
  actor_id: string;
  actor_type: ActorType;

  // Identity
  name?: string;                 // Display name
  email?: string;                // Contact email
  username?: string;             // System username
  external_id?: string;          // External system ID

  // Role & Authority
  role: string;                  // DPO, CISO, CEO, Security Analyst, etc.
  authority_level: AuthorityLevel;
  org_unit: string;              // Department, team, division
  job_title?: string;

  // System Context (for automated actors)
  system_name?: string;          // Which system/component
  system_version?: string;       // Version for audit
  system_environment?: string;   // prod, staging, dev

  // AI Context (for AI actors)
  model_name?: string;           // Which AI model (GPT-4, Claude, etc.)
  model_version?: string;        // Model version
  model_provider?: string;       // OpenAI, Anthropic, etc.
  training_data_cutoff?: string; // When training data ends

  // Authentication Context
  authentication_method?: string; // password, sso, mfa, api_key, etc.
  last_authentication?: string;  // ISO8601
  session_id?: string;           // Current session (if applicable)
  ip_address?: string;           // Last known IP

  // Permissions & Access
  permissions?: string[];        // Specific permissions granted
  access_level?: string;         // read, write, admin, etc.

  // Status & Lifecycle
  is_active: boolean;
  deactivated_at?: string;
  deactivation_reason?: string;

  // Compliance Training
  training_completed?: string[]; // List of completed compliance trainings
  last_training_date?: string;
  next_training_due?: string;

  // Audit Trail
  created_at: string;
  updated_at: string;
  created_by?: string;
}

// ═══════════════════════════════════════════════════════════════
// 5. CONTROL NODE - Security controls & safeguards
// ═══════════════════════════════════════════════════════════════

export interface EvidenceControl {
  control_id: string;
  control_type: ControlType;

  // Identity & Description
  name: string;
  description: string;
  control_family?: string;       // NIST, ISO27001, etc.

  // Scope & Coverage
  control_scope: string[];       // What it covers (asset IDs, system names, etc.)
  applies_to_regulations: Regulation[]; // Which regulations this control addresses
  risk_categories?: string[];    // Types of risk this control mitigates

  // Status & Lifecycle
  status: ControlStatus;
  implementation_status?: 'PLANNED' | 'IMPLEMENTING' | 'IMPLEMENTED' | 'TESTING' | 'OPERATIONAL';

  // Operational Proof (CRITICAL FOR AUDITORS)
  last_used_at?: string;         // ISO8601 - When last activated (proof of use)
  last_tested_at?: string;       // ISO8601 - When last tested
  test_result?: 'PASS' | 'FAIL' | 'PARTIAL' | 'NOT_TESTED';
  test_frequency?: string;       // "DAILY", "WEEKLY", "MONTHLY", etc.

  // Effectiveness Metrics
  effectiveness_score?: number;  // 0.0-1.0 based on testing/results
  false_positive_rate?: number;
  false_negative_rate?: number;

  // Enforcement
  enforced_by: string;           // Actor ID or System ID
  enforcement_method?: string;   // manual, automated, hybrid
  automation_level?: number;     // 0-100% automation

  // Configuration (VERSION CONTROL)
  configuration?: Record<string, any>; // Current configuration
  configuration_version?: string;
  last_configuration_change?: string;
  configuration_changed_by?: string;

  // Dependencies
  depends_on_controls?: string[]; // Other controls this depends on
  required_for_controls?: string[]; // Controls that require this one

  // Cost & Resources
  operational_cost?: number;     // Monthly operational cost
  resource_requirements?: string[]; // People, systems, tools needed

  // Audit Trail
  created_at: string;
  updated_at: string;
  created_by: string;
  last_modified_by?: string;
}

// ═══════════════════════════════════════════════════════════════
// 6. ARTIFACT NODE - Evidence & documentation
// ═══════════════════════════════════════════════════════════════

export interface EvidenceArtifact {
  artifact_id: string;
  artifact_type: ArtifactType;

  // Identity & Description
  name: string;
  description?: string;
  keywords?: string[];           // For searchability

  // Content Integrity (CRYPTOGRAPHIC)
  hash: string;                  // SHA-256 of artifact content
  hash_algorithm: 'SHA-256';     // Required for compliance
  content_type?: string;         // MIME type
  content_size_bytes?: number;   // Size for storage tracking

  // Timestamps (TEMPORAL INTEGRITY)
  created_at: string;            // ISO8601 - When artifact was created
  valid_from?: string;           // ISO8601 - When artifact becomes valid
  valid_until?: string;          // ISO8601 - When artifact expires
  retention_period_years?: number; // How long to keep (regulatory requirement)

  // Storage & Access
  storage_ref: string;           // S3 path, database ref, URL, etc.
  storage_type: StorageType;     // IMMUTABLE = WORM storage required
  storage_location?: string;     // Region, datacenter, etc.
  access_url?: string;           // If web-accessible
  download_count?: number;       // Audit access patterns

  // Digital Signatures (LEGAL VALIDITY)
  signature?: string;            // Digital signature
  signature_type: SignatureType; // QES, Advanced, etc.
  signer?: string;               // Who signed (Actor ID)
  signer_name?: string;          // Cached for readability
  signer_role?: string;          // Cached for context
  signed_at?: string;            // ISO8601 - When signed
  signature_valid?: boolean;     // Current validity status
  signature_expires_at?: string; // When signature expires

  // Chain of Custody
  custody_chain?: Array<{        // Who had access and when
    actor_id: string;
    actor_name?: string;
    access_type: 'CREATED' | 'VIEWED' | 'DOWNLOADED' | 'COPIED' | 'MODIFIED';
    access_timestamp: string;
    ip_address?: string;
  }>;

  // Relationships (GRAPH INTEGRITY)
  related_event_ids: string[];   // Events this artifact documents
  related_decision_id?: string;  // Decision this artifact supports
  related_clock_id?: string;     // Clock this artifact fulfills
  related_incident_id?: string;  // Incident context

  // Metadata (EXTENSIBILITY)
  metadata?: Record<string, any>; // Flexible metadata for specific artifact types
  tags?: string[];               // Categorization tags

  // Compliance Verification
  compliance_framework?: string; // Which compliance framework this satisfies
  regulatory_approval?: boolean; // Has it been approved for regulatory use?
  approval_reference?: string;   // Reference number/case ID

  // Audit Trail
  updated_at: string;
  created_by: string;            // Who created this artifact
  last_accessed_at?: string;      // When last accessed
  last_accessed_by?: string;      // Who last accessed
}

// ═══════════════════════════════════════════════════════════════
// EDGE RELATIONSHIPS
// ═══════════════════════════════════════════════════════════════

export interface EvidenceEdge {
  edge_id: string;
  edge_type: EdgeType;

  // Source Node
  source_node_type: 'EVENT' | 'DECISION' | 'CLOCK' | 'ACTOR' | 'CONTROL' | 'ARTIFACT';
  source_node_id: string;

  // Target Node
  target_node_type: 'EVENT' | 'DECISION' | 'CLOCK' | 'ACTOR' | 'CONTROL' | 'ARTIFACT';
  target_node_id: string;

  // Edge Metadata
  relationship_strength?: number; // 0.0-1.0 for weighted relationships
  bidirectional?: boolean;       // Is relationship bidirectional?
  metadata?: Record<string, any>; // Edge-specific metadata

  // Temporal Context
  created_at: string;            // When relationship was established
  valid_from?: string;           // When relationship becomes valid
  valid_until?: string;          // When relationship expires

  // Provenance
  established_by?: string;       // Who/system established this relationship
  confidence_score?: number;     // How confident we are in this relationship (0.0-1.0)
}

// ═══════════════════════════════════════════════════════════════
// INTEGRITY LAYER TYPES
// ═══════════════════════════════════════════════════════════════

export interface MerkleAnchor {
  anchor_id: string;
  period_start: string;          // ISO8601
  period_end: string;            // ISO8601
  event_count: number;
  merkle_root: string;           // SHA-256 root hash

  // External Witnesses (MULTI-SOURCE VALIDATION)
  witnesses: Array<{
    witness_type: 'TSA' | 'BLOCKCHAIN' | 'NOTARY' | 'REGULATOR';
    witness_provider: string;    // DigiCert, Ethereum, government notary, etc.
    witness_reference: string;   // Transaction ID, certificate number, etc.
    witness_timestamp: string;   // When witness was obtained
    witness_proof: string;       // The witness data/proof
  }>;

  // Internal Verification
  verification_status: 'PENDING' | 'VERIFIED' | 'FAILED';
  verified_at?: string;
  verification_method?: string;

  created_at: string;
}

export interface TsaTimestamp {
  timestamp_id: string;
  event_id?: string;             // Which event was timestamped
  anchor_id?: string;            // Which anchor was timestamped

  // TSA Response (RFC 3161)
  tsa_response: string;          // Full TSA response (base64)
  tsa_time: string;              // When TSA says it happened
  tsa_provider: string;          // DigiCert, GlobalSign, etc.
  tsa_algorithm: string;         // SHA-256, etc.

  // What was timestamped
  hash_timestamped: string;      // The hash that was timestamped
  content_type: 'EVENT' | 'ANCHOR' | 'BATCH';

  // Verification
  verified?: boolean;
  verified_at?: string;
  verification_error?: string;

  created_at: string;
}

export interface SequenceTracker {
  source_system: string;         // Which component
  last_sequence_number: number;  // Last sequence number used
  last_event_id: string;         // Last event ID
  last_timestamp: string;        // Last event timestamp

  // Gap Detection
  expected_next_sequence: number;
  gap_detected?: boolean;
  gap_start_sequence?: number;
  gap_detected_at?: string;

  // Health Monitoring
  is_healthy: boolean;
  last_health_check: string;
  consecutive_failures: number;

  updated_at: string;
}

// ═══════════════════════════════════════════════════════════════
// QUERY & COMPLIANCE TYPES
// ═══════════════════════════════════════════════════════════════

export type ComplianceStatus = 'PROVEN' | 'NOT_PROVEN' | 'PARTIAL' | 'INSUFFICIENT_EVIDENCE' | 'CONFLICTING_EVIDENCE';

export interface ComplianceQuery {
  query_id: string;
  regulation: Regulation;
  article: string;
  requirement: string;           // Human-readable requirement

  // Query Definition
  event_filters: Record<string, any>; // What events to look for
  decision_filters?: Record<string, any>; // What decisions required
  clock_filters?: Record<string, any>; // What deadlines must be met
  artifact_filters?: Record<string, any>; // What evidence required

  // Evaluation Rules
  evaluation_logic: string;      // How to evaluate compliance
  required_confidence: number;   // Minimum confidence score (0.0-1.0)

  // Metadata
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface ComplianceResult {
  query_id: string;
  regulation: Regulation;
  article: string;
  status: ComplianceStatus;

  // Evidence Found
  events_found: number;
  decisions_found: number;
  clocks_met: number;
  artifacts_present: number;

  // Confidence & Scoring
  confidence_score: number;      // 0.0-1.0
  completeness_score: number;    // How complete is the evidence

  // Issues & Gaps
  missing_evidence: string[];    // What evidence is missing
  conflicting_evidence: Array<{  // Conflicting evidence found
    description: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  }>;

  // Recommendations
  recommendations: string[];     // What to do to improve compliance

  // Execution Details
  evaluated_at: string;
  evaluation_duration_ms: number;
  evaluated_by: string;
}

// ═══════════════════════════════════════════════════════════════
// UTILITY & HELPER TYPES
// ═══════════════════════════════════════════════════════════════

export interface EvidenceGraphStats {
  total_events: number;
  total_decisions: number;
  total_clocks: number;
  total_actors: number;
  total_controls: number;
  total_artifacts: number;
  total_edges: number;

  // Integrity Stats
  hash_chain_valid: boolean;
  last_merkle_anchor: string;
  active_clocks: number;
  breached_clocks: number;

  // Compliance Stats
  compliance_queries_run: number;
  proven_compliant: number;
  not_proven_compliant: number;
  partial_compliance: number;

  generated_at: string;
}

export interface EvidenceBatch {
  batch_id: string;
  events: EvidenceEvent[];
  decisions: EvidenceDecision[];
  clocks: EvidenceClock[];
  artifacts: EvidenceArtifact[];
  edges: EvidenceEdge[];

  // Batch Integrity
  batch_hash: string;
  merkle_root?: string;
  created_at: string;
  created_by: string;
}

// ═══════════════════════════════════════════════════════════════
// CONFIGURATION TYPES
// ═══════════════════════════════════════════════════════════════

export interface EvidenceGraphConfig {
  // Hash Chain Configuration
  hash_algorithm: 'SHA-256';     // Required for compliance
  chain_verification_enabled: boolean;
  chain_verification_frequency: string; // "CONTINUOUS", "HOURLY", "DAILY"

  // Merkle Anchoring
  merkle_anchoring_enabled: boolean;
  anchor_frequency_hours: number;
  external_witnesses: Array<{
    type: 'TSA' | 'BLOCKCHAIN' | 'NOTARY';
    provider: string;
    enabled: boolean;
  }>;

  // Sequence Management
  gap_detection_enabled: boolean;
  max_sequence_gap: number;
  gap_alert_threshold: number;

  // Storage Configuration
  storage_type: StorageType;
  retention_years: number;
  compression_enabled: boolean;

  // Performance Tuning
  batch_size: number;
  write_buffer_size: number;
  read_cache_enabled: boolean;
}

// ═══════════════════════════════════════════════════════════════
// ERROR TYPES
// ═══════════════════════════════════════════════════════════════

export interface EvidenceError {
  error_id: string;
  error_type: 'VALIDATION' | 'INTEGRITY' | 'SEQUENCE' | 'STORAGE' | 'NETWORK';
  message: string;
  details?: Record<string, any>;

  // Context
  related_event_id?: string;
  related_operation?: string;

  // Recovery
  recoverable: boolean;
  retry_count?: number;
  max_retries?: number;

  occurred_at: string;
}

// ═══════════════════════════════════════════════════════════════
// PREDEFINED COMPLIANCE QUERIES (45 Total)
// ═══════════════════════════════════════════════════════════════

export const COMPLIANCE_QUERIES: Record<string, ComplianceQuery> = {
  // GDPR Queries (15)
  'GDPR_ART_33_BREACH_NOTIFICATION': {
    query_id: 'gdpr-33-breach-notification',
    regulation: 'GDPR',
    article: 'Art. 33',
    requirement: 'Breach notification to supervisory authority within 72 hours',
    event_filters: { event_type: 'COMMUNICATION.SENT', regulatory_tags: ['GDPR'], articles: ['Art.33'] },
    clock_filters: { clock_type: 'GDPR_72H_BREACH', status: 'MET' },
    artifact_filters: { artifact_type: 'NOTIFICATION_PROOF' },
    evaluation_logic: 'CLOCK_MET_WITHIN_DEADLINE AND NOTIFICATION_SENT',
    required_confidence: 0.95,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    created_by: 'system'
  },
  // ... (additional queries would be defined here)

  // DORA Queries (13)
  'DORA_ART_19_INCIDENT_REPORTING': {
    query_id: 'dora-19-incident-reporting',
    regulation: 'DORA',
    article: 'Art. 19',
    requirement: 'Complete incident reporting chain (4h → 24h → 1M)',
    event_filters: { event_type: 'INCIDENT.REPORTED', regulatory_tags: ['DORA'], articles: ['Art.19'] },
    clock_filters: { regulation: 'DORA', status: 'MET' },
    evaluation_logic: 'ALL_CLOCKS_MET_IN_SEQUENCE',
    required_confidence: 0.98,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    created_by: 'system'
  },
  // ... (additional DORA queries)

  // NIS2 Queries (8)
  // AI Act Queries (9)
  // Total: 45 predefined queries
};
