interface EvidenceEvent {
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

/**
 * Exportuje dáta z Evidence Vault.
 * Ošetrené tak, aby pri 0 záznamoch nespôsobilo chybu.
 */
export const exportEvidenceData = (data: EvidenceEvent[], format: 'pdf' | 'json') => {
  if (!data || data.length === 0) {
    console.warn("Nič na exportovanie.");
    return;
  }

  // Tu bude neskôr logika pre generovanie súboru (Blob/FileSaver)
  console.log(`Exportujem ${data.length} záznamov vo formáte ${format}`);
};
