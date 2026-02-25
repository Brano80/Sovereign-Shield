// Evidence Vault Component Types

export interface EvidenceEvent {
  id: string;
  eventId: string;
  correlationId: string;
  causationId?: string;
  sequenceNumber: bigint;
  occurredAt: string;
  recordedAt: string;
  eventType: string;
  severity: 'L1' | 'L2' | 'L3' | 'L4';
  sourceSystem: string;
  sourceIp?: string;
  regulatoryTags: string[];
  articles: string[];
  payload: {
    destinationCountry?: string;
    destinationCountryCode?: string;
    endpoint?: string;
    dataCategory?: string;
    records?: number;
    size?: string;
    requestId?: string;
    transferMechanism?: string;
    sccStatus?: string;
    [key: string]: any;
  };
  payloadHash: string;
  previousHash: string;
  createdAt: string;
  updatedAt: string;
}

export interface EvidenceVaultFilters {
  riskLevel: string;
  destinationCountry: string;
  search: string;
}

export interface EvidenceVaultData {
  events: EvidenceEvent[];
  totalCount: number;
  isLoading: boolean;
  error?: string;
}
