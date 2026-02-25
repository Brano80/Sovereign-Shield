// Sovereign Shield Component Types

export interface TransferMechanism {
  id: string;
  type: 'SCC' | 'BCR' | 'Adequacy' | 'Derogation' | 'NONE';
  version?: string;
  documentUrl?: string;
  expiresAt?: string;
  status: 'VALID' | 'EXPIRING' | 'MISSING' | 'BLOCKED';
  daysUntilExpiry?: number;
}

export interface BlockEvent {
  id: string;
  timestamp: string;
  destination: {
    country: string;
    countryCode: string;
    endpoint?: string;
  };
  reason: string;
  source: string;
  user: string;
  blockLevel: 'L1' | 'L2' | 'L3'; // L1=Warning, L2=Block, L3=Hard Block
  transferVolume: {
    records: number;
    size: string;
  };
  mechanism?: TransferMechanism;
  shadowMode?: boolean;
  // Evidence Vault Data
  evidenceVault?: {
    requestId: string; // from Rust backend
    sourceIP: string;
    dataCategory: string; // e.g., 'AI Training Data'
    gdprCitation: string; // GDPR Art. 44-49
    sccStatus: 'MISSING' | 'EXPIRED' | 'VALID' | 'NOT_APPLICABLE';
    legalBasis?: string; // Legal basis for the transfer (e.g., 'Adequacy', 'SCC', 'None')
  };
}

export interface CountryData {
  country: string;
  code: string;
  count: number;
  status: 'Adequate' | 'SCC' | 'Blocked';
  transfers: number;
  mechanisms: TransferMechanism[];
  // Extended properties for modal
  sccCount?: number;
  transferAttempts?: number;
  flag?: string;
}

export interface ApiCountryData {
  code: string;
  name: string;
  status: 'adequate_protection' | 'scc_required' | 'blocked';
  transfers: number;
  mechanisms: number;
}

export interface RequiresAttentionEntry {
  eventId: string;
  destinationCountry: string;
  destinationCountryCode: string;
  systemName: string;
  firstSeen: string;
  lastSeen: string;
  occurrenceCount: number;
  blockedReason: string | null; // Can be null for REVIEW events
  decision?: 'BLOCKED' | 'REVIEW'; // Distinguishes event type from backend
}

export interface SovereignShieldStats {
  totalTransfers: number;
  activeAdequateCount: number;
  totalAdequateWhitelistCount: number;
  sccCoverage: {
    percentage: number;
    trend: number;
    covered: number; // Number of SCC-required countries with registered SCCs
    total: number;  // Total number of distinct SCC-required countries with transfers
  };
  blockedToday: number;
  transfersByDestination: ApiCountryData[];
  recentBlocks: BlockEvent[];
  pendingApprovals: number;
  expiringSccs: number;
  dataVolumeToday: number;
  highRiskDestinations: number;
  activeAgents: number;
  requiresAttention?: RequiresAttentionEntry[];
}

export interface SovereignShieldData {
  status: 'PROTECTED' | 'ATTENTION' | 'AT_RISK';
  lastScan: string;
  stats: SovereignShieldStats;
  isLoading?: boolean;
  error?: string;
  errorType?: 'network' | 'auth' | 'server' | 'validation';
  lastSuccessfulFetch?: string;
  dataFreshness?: 'fresh' | 'stale' | 'cached' | 'offline' | 'error' | 'loading' | 'retrying' | 'unknown';
}

// Transfer Log Types
export interface TransferRecord {
  id: string;
  timestamp: string;
  destination: {
    country: string;
    code: string;
  };
  purpose: string;
  legalBasis: string;
  volume: string;
  status: 'ALLOWED' | 'BLOCKED' | 'PENDING';
}

// SCC Registry Types
export interface SCCRecord {
  id: string;
  partner: string;
  country: string;
  countryCode: string;
  type: 'C2C' | 'C2P';
  signedDate: string;
  expiryDate: string;
  status: 'ACTIVE' | 'EXPIRING' | 'EXPIRED';
  daysUntilExpiry: number;
  contractDetails: {
    contractType: string;
    dpaId: string;
    tiaCompleted: boolean;
    tiaDate?: string;
  };
}

