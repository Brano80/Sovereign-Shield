export type LensLevel = "L1" | "L2" | "L3" | "L4";

export type LensAction = "BLOCK" | "ALLOW";

export interface EvidenceMetadata {
  sealId?: string;
  txId?: string;

  auditReportUrl?: string;
  integrityReportId?: string;

  policyVersionId?: string;
  checksumSha256?: string;

  notes?: string;
}

export interface GeoData {
  sourceCountry: string;
  destinationCountry: string;
}

/**
 * Lens output DTO (READ-ONLY).
 *
 * Derived by the Lens aggregation layer from raw DB facts (events/logs/outcomes).
 * Must NOT be treated as an execution artifact.
 */
export interface LensFinding {
  lensId: string;
  moduleId: string;
  level: LensLevel;
  action: LensAction;
  timestamp: string; // ISO-8601
  deadlineTimestamp?: string; // ISO-8601 (Regulatory Clock)
  geoData?: GeoData; // Sovereign Shield map
  confidenceScore?: number; // Pattern radar
  evidenceMetadata: EvidenceMetadata;
}


