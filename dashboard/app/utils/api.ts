const API_BASE = 'http://localhost:8080';

export interface EvidenceEvent {
  id: string;
  eventId: string;
  correlationId?: string;
  occurredAt: string;
  recordedAt: string;
  eventType: string;
  severity: string;
  sourceSystem: string;
  sourceIp?: string;
  regulatoryTags: string[];
  articles: string[];
  payload: any;
  payloadHash: string;
  previousHash: string;
  nexusSeal?: string;
  regulatoryFramework?: string;
  verificationStatus?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SCCRegistry {
  id: string;
  partnerName: string;
  destinationCountry: string;
  status: 'Valid' | 'Expired';
  expiryDate?: string;
  createdAt: string;
}

export interface ReviewQueueItem {
  id: string;
  created: string;
  agentId: string;
  action: string;
  module: string;
  suggestedDecision: string;
  context: any;
  status: string;
  evidenceId: string;
  sealId?: string; // Used for approve/reject
  decidedBy?: string;
  decisionReason?: string;
  finalDecision?: string;
  decidedAt?: string;
  expiresAt?: string;
}

export async function fetchEvidenceEvents(): Promise<EvidenceEvent[]> {
  const res = await fetch(`${API_BASE}/api/v1/evidence/events`);
  if (!res.ok) throw new Error('Failed to fetch evidence events');
  const data = await res.json();
  // API returns { events: [...], totalCount: ... }
  return Array.isArray(data.events) ? data.events : Array.isArray(data) ? data : [];
}

export async function fetchSCCRegistries(): Promise<SCCRegistry[]> {
  const res = await fetch(`${API_BASE}/api/v1/scc-registries`);
  if (!res.ok) throw new Error('Failed to fetch SCC registries');
  const data = await res.json();
  
  // Backend returns { registries: [...], total: ... }
  const registries = Array.isArray(data.registries) ? data.registries : Array.isArray(data) ? data : [];
  
  // Convert backend format to frontend format
  return registries.map((r: any) => ({
    id: r.id,
    partnerName: r.partnerName || r.partner_name,
    destinationCountry: r.destinationCountryCode || r.destination_country_code || r.destinationCountry,
    status: r.status === 'active' ? 'Valid' : 'Expired',
    expiryDate: r.expiresAt || r.expires_at,
    createdAt: r.createdAt || r.created_at,
  }));
}

export async function createSCCRegistry(data: {
  partnerName: string;
  destinationCountry: string;
  expiryDate?: string;
}): Promise<SCCRegistry> {
  // Convert country name to country code if needed
  const countryCodeMap: Record<string, string> = {
    'United States': 'US',
    'India': 'IN',
    'Brazil': 'BR',
    'Mexico': 'MX',
    'Singapore': 'SG',
    'South Korea': 'KR',
    'Republic of Korea': 'KR',
    'South Africa': 'ZA',
  };
  
  const destinationCountryCode = countryCodeMap[data.destinationCountry] || 
    data.destinationCountry.length === 2 ? data.destinationCountry.toUpperCase() : 
    data.destinationCountry;

  // Convert date to RFC3339 format if provided
  let expiresAt: string | undefined;
  if (data.expiryDate) {
    const date = new Date(data.expiryDate);
    expiresAt = date.toISOString();
  }

  const requestBody = {
    partner_name: data.partnerName,
    destination_country_code: destinationCountryCode,
    expires_at: expiresAt,
    notes: null,
  };

  const res = await fetch(`${API_BASE}/api/v1/scc-registries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  });
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(errorData.message || `Failed to create SCC registry: ${res.status}`);
  }
  
  const response = await res.json();
  // Convert backend response to frontend format
  return {
    id: response.id,
    partnerName: response.partnerName || response.partner_name,
    destinationCountry: response.destinationCountryCode || response.destination_country_code,
    status: response.status === 'active' ? 'Valid' : 'Expired',
    expiryDate: response.expiresAt || response.expires_at,
    createdAt: response.createdAt || response.created_at,
  };
}

export async function fetchReviewQueuePending(): Promise<ReviewQueueItem[]> {
  const res = await fetch(`${API_BASE}/api/v1/human_oversight/pending`);
  if (!res.ok) throw new Error('Failed to fetch review queue');
  const data = await res.json();
  return data.reviews || [];
}

export async function approveReviewQueueItem(sealId: string, reason?: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/v1/action/${sealId}/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      decision: 'APPROVE',
      reason: reason || 'Approved via dashboard',
      reviewerId: 'dashboard-user',
    }),
  });
  if (!res.ok) throw new Error('Failed to approve review item');
}

export async function rejectReviewQueueItem(sealId: string, reason?: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/v1/action/${sealId}/reject`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      decision: 'REJECT',
      reason: reason || 'Rejected via dashboard',
      reviewerId: 'dashboard-user',
    }),
  });
  if (!res.ok) throw new Error('Failed to reject review item');
}

export async function verifyIntegrity(): Promise<{ status: 'VALID' | 'TAMPERED' }> {
  const res = await fetch(`${API_BASE}/api/v1/evidence/verify-integrity`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to verify integrity');
  return res.json();
}
