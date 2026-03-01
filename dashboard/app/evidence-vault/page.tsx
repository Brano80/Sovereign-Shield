'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import DashboardLayout from '../components/DashboardLayout';
import { fetchEvidenceEventsWithMeta, verifyIntegrity, /* executeErasure, */ EvidenceEvent } from '../utils/api';
import { RefreshCw, AlertTriangle, FileDown, Filter, Search, Download, Shield, Clock, MapPin, Server, Database, FileText, X, Copy /* Trash2, ExternalLink — Crypto Shredder */ } from 'lucide-react';
import { getCountryCodeFromName, getLegalBasis, getLegalBasisFullText } from '../config/countries';

function getDerivedSeverity(event: { eventType?: string; sourceSystem?: string; verificationStatus?: string; payload?: { decision?: string } }): 'CRITICAL' | 'HIGH' | 'LOW' | 'INFO' | 'ERASURE' {
  const label = formatEventTypeLabel(event.eventType || '');
  const source = (event.sourceSystem || '').toLowerCase();
  const et = (event.eventType || '').toUpperCase();
  const decision = (event.verificationStatus || event.payload?.decision || '').toUpperCase();

  if (label === 'Transfer — Blocked') return 'CRITICAL';
  if (et.includes('HUMAN_OVERSIGHT_REJECTED')) return 'CRITICAL';
  if (et.includes('HUMAN_OVERSIGHT_APPROVED')) return 'LOW';
  if (label === 'GDPR Erasure' || source.includes('crypto_shredder') || source.includes('crypto-shredder')) return 'ERASURE';
  if (label === 'Transfer — Review') return 'HIGH';
  if (label === 'Transfer Evaluation' && /^(ALLOW|ALLOWED|VERIFIED)$/.test(decision)) return 'LOW';
  return 'INFO';
}

function getSeverityBadgeClass(severity: 'CRITICAL' | 'HIGH' | 'LOW' | 'INFO' | 'ERASURE'): string {
  switch (severity) {
    case 'CRITICAL': return 'bg-red-500/15 text-red-400 border border-red-500/25';
    case 'HIGH': return 'bg-amber-500/15 text-amber-400 border border-amber-500/25';
    case 'LOW': return 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25';
    case 'ERASURE': return 'bg-purple-500/15 text-purple-400 border border-purple-500/25';
    default: return 'bg-slate-500/15 text-slate-400 border border-slate-500/25';
  }
}

function getSeverityExplanation(severity: 'CRITICAL' | 'HIGH' | 'LOW' | 'INFO' | 'ERASURE'): string {
  switch (severity) {
    case 'CRITICAL': return 'Immediate attention required — transfer was blocked';
    case 'HIGH': return 'Awaiting human review before transfer can proceed';
    case 'LOW': return 'Transfer evaluated and permitted under GDPR';
    case 'ERASURE': return 'Data cryptographically destroyed under GDPR Art. 17 — right to erasure fulfilled.';
    default: return 'Compliance record — no action required';
  }
}

function formatEventTypeLabel(eventType: string): string {
  const et = (eventType || '').toLowerCase();
  if (et.includes('sovereign_shield') || et === 'sovereign_shield_evaluation' || et === 'sovereign_shield') return 'Transfer Evaluation';
  if (et.includes('human_oversight_rejected') || et === 'human_oversight_rejected') return 'Human Decision — Blocked';
  if (et.includes('human_oversight_approved') || et === 'human_oversight_approved') return 'Human Decision — Approved';
  if (et === 'data_transfer') return 'Transfer Evaluation';
  if (et === 'data_transfer_blocked') return 'Transfer — Blocked';
  if (et === 'data_transfer_review') return 'Transfer — Review';
  if (et.includes('gdpr_erasure') || et === 'gdpr_erasure') return 'GDPR Erasure';
  if (et.includes('crypto_shredder') || et === 'crypto_shredder') return 'GDPR Erasure';
  if (eventType) return eventType.replace(/_/g, ' ').toLowerCase();
  return 'Unknown';
}

function getRetentionYear(createdAt: string): string {
  if (!createdAt) return '—';
  const d = new Date(createdAt);
  d.setFullYear(d.getFullYear() + 7);
  return `Until ${d.getFullYear()}`;
}

function formatDrawerTimestamp(dateStr: string | undefined): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-GB', { dateStyle: 'long', timeStyle: 'short' });
}

function formatRetentionDate(createdAt: string): string {
  if (!createdAt) return '—';
  const d = new Date(createdAt);
  d.setFullYear(d.getFullYear() + 7);
  return d.toLocaleString('en-GB', { dateStyle: 'long', timeStyle: 'short' });
}

export default function EvidenceVaultPage() {
  const searchParams = useSearchParams();
  const highlightedEventId = searchParams.get('eventId');
  const searchParam = searchParams.get('search');

  const [events, setEvents] = useState<EvidenceEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [integrityStatus, setIntegrityStatus] = useState<'VALID' | 'TAMPERED' | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [filters, setFilters] = useState({
    severity: '',
    destinationCountry: '',
    search: searchParam || highlightedEventId || '',
    eventType: '',
  });
  const [merkleRootsCount, setMerkleRootsCount] = useState(0);
  const [lastVerifiedAt, setLastVerifiedAt] = useState<Date | null>(null);
  const [page, setPage] = useState(1);
  const [selectedEvent, setSelectedEvent] = useState<EvidenceEvent | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerEntered, setDrawerEntered] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  // Crypto Shredder / GDPR Art. 17 erasure UI (commented out — re-enable if product direction changes)
  // const [erasedEventIds, setErasedEventIds] = useState<Set<string>>(new Set());
  // const [erasureForm, setErasureForm] = useState({ requestId: '', grounds: '', confirmation: '' });
  // const [erasureExecuting, setErasureExecuting] = useState(false);
  // const [erasureCertificate, setErasureCertificate] = useState<Record<string, unknown> | null>(null);

  const EVENTS_PER_PAGE = 10;
  const totalPages = Math.max(1, Math.ceil(events.length / EVENTS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const paginatedEvents = events.slice(
    (currentPage - 1) * EVENTS_PER_PAGE,
    currentPage * EVENTS_PER_PAGE
  );

  useEffect(() => {
    setPage(1);
  }, [filters.severity, filters.destinationCountry, filters.search, filters.eventType]);

  useEffect(() => {
    if (searchParam || highlightedEventId) {
      setFilters(prev => ({ ...prev, search: searchParam || highlightedEventId || prev.search }));
    }
  }, [searchParam, highlightedEventId]);

  useEffect(() => {
    loadEvents();
    const interval = setInterval(loadEvents, 5000);
    return () => clearInterval(interval);
  }, [filters]);

  useEffect(() => {
    const handleRefresh = () => {
      loadEvents();
    };
    window.addEventListener('refresh-evidence-vault', handleRefresh);
    return () => window.removeEventListener('refresh-evidence-vault', handleRefresh);
  }, []);

  // Fix 5: Auto-run Chain Integrity verification on page load
  useEffect(() => {
    (async () => {
      try {
        const result = await verifyIntegrity();
        setIntegrityStatus(result.status);
        if (result.verified === true) setLastVerifiedAt(new Date());
      } catch {
        setIntegrityStatus(null);
      }
    })();
  }, []);

  async function loadEvents() {
    try {
      const { events: rawEvents, merkleRoots } = await fetchEvidenceEventsWithMeta();
      setMerkleRootsCount(merkleRoots);
      // Crypto Shredder: parallel fetch of GDPR_ERASURE_COMPLETED for erasedEventIds (commented out)
      // const [{ events: rawEvents, merkleRoots }, { events: erasureEvents }] = await Promise.all([
      //   fetchEvidenceEventsWithMeta(),
      //   fetchEvidenceEventsWithMeta({ eventType: 'GDPR_ERASURE_COMPLETED', limit: 500 }),
      // ]);
      // const erasedSet = new Set<string>();
      // for (const ev of erasureEvents || []) { if (ev.correlationId) erasedSet.add(ev.correlationId); }
      // setErasedEventIds(prev => new Set([...erasedSet, ...prev]));
      let filtered = Array.isArray(rawEvents) ? rawEvents : [];

      // Apply filters
      if (filters.severity) {
        filtered = filtered.filter(e => getDerivedSeverity(e) === filters.severity);
      }
      if (filters.destinationCountry) {
        filtered = filtered.filter(e => 
          e.payload?.destination_country?.toLowerCase().includes(filters.destinationCountry.toLowerCase()) ||
          e.payload?.destination_country_code?.toLowerCase().includes(filters.destinationCountry.toLowerCase())
        );
      }
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filtered = filtered.filter(e =>
          e.id.toLowerCase().includes(searchLower) ||
          e.eventId?.toLowerCase().includes(searchLower) ||
          e.correlationId?.toLowerCase().includes(searchLower) ||
          e.eventType?.toLowerCase().includes(searchLower) ||
          e.payloadHash?.toLowerCase().includes(searchLower)
        );
      }

      // Exclude only HUMAN_OVERSIGHT_REVIEW (noisy), keep HUMAN_OVERSIGHT_REJECTED and HUMAN_OVERSIGHT_APPROVED
      const excludeHumanOversight = filtered.filter((e) => {
        const source = (e.sourceSystem || '').toLowerCase();
        const et = (e.eventType || '').toUpperCase();
        if (source === 'human-oversight' && et.includes('HUMAN_OVERSIGHT_REVIEW')) return false;
        return true;
      });

      // Apply event type filter
      let eventTypeFiltered = excludeHumanOversight;
      if (filters.eventType) {
        eventTypeFiltered = excludeHumanOversight.filter(
          (e) => formatEventTypeLabel(e.eventType) === filters.eventType
        );
      }

      setEvents(eventTypeFiltered);
    } catch (error) {
      console.error('Failed to load events:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleRefresh() {
    setRefreshing(true);
    await loadEvents();
    setRefreshing(false);
  }

  async function handleVerifyIntegrity() {
    setVerifying(true);
    try {
      const result = await verifyIntegrity();
      if (result.verified === true) {
        setIntegrityStatus('VALID');
        setLastVerifiedAt(new Date());
      } else {
        setIntegrityStatus('TAMPERED');
      }
    } catch (error) {
      console.error('Failed to verify integrity:', error);
      alert('Failed to verify integrity');
    } finally {
      setVerifying(false);
    }
  }

  function handleFilterChange(key: string, value: string) {
    setFilters(prev => ({ ...prev, [key]: value }));
  }

  function getEventDecision(e: EvidenceEvent): string {
    const et = (e.eventType || '').toUpperCase();
    if (e.eventType === 'DATA_TRANSFER_BLOCKED' || e.verificationStatus === 'BLOCK' || et.includes('HUMAN_OVERSIGHT_REJECTED')) return 'BLOCKED';
    if (e.eventType === 'DATA_TRANSFER_REVIEW' || e.verificationStatus === 'REVIEW') return 'REVIEW';
    if (et.includes('HUMAN_OVERSIGHT_APPROVED')) return 'ALLOWED';
    return e.verificationStatus || e.payload?.decision || 'ALLOWED';
  }

  function handleExport(format: 'pdf' | 'json') {
    if (events.length === 0) {
      alert('No events to export');
      return;
    }
    if (format === 'json') {
      const dataStr = JSON.stringify(events, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `evidence-vault-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } else {
      // Fix 6: PDF Export for DPO audit - use print dialog (Save as PDF)
      const decisionCounts = events.reduce((acc, e) => {
        const d = getEventDecision(e);
        acc[d] = (acc[d] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      const timestamps = events.map(e => new Date(e.occurredAt || e.createdAt).getTime());
      const minDate = timestamps.length ? new Date(Math.min(...timestamps)).toLocaleDateString() : '—';
      const maxDate = timestamps.length ? new Date(Math.max(...timestamps)).toLocaleDateString() : '—';
      const companyName = 'Company Name'; // Placeholder for DPO to customize
      const reportDate = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });

      const escapeHtml = (s: string) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
      const rows = events.map(e => {
        const countryName = e.payload?.destination_country || e.payload?.destinationCountry || e.payload?.destination || 'Unknown';
        let countryCode = e.payload?.destination_country_code || e.payload?.destinationCountryCode || '';
        if (!countryCode) countryCode = getCountryCodeFromName(countryName);
        const source = (e.sourceSystem || '').toLowerCase();
        const et = (e.eventType || '').toUpperCase();
        const gdprBasis = source === 'human-oversight' || et.includes('HUMAN_OVERSIGHT') ? 'Art. 22' : getLegalBasis(countryCode);
        const dataCat = e.payload?.data_categories?.[0] || e.payload?.dataCategories?.[0] || e.payload?.data_category || '—';
        const ts = new Date(e.occurredAt || e.createdAt).toLocaleString();
        const sealId = e.nexusSeal || e.id || '—';
        return { ts, type: formatEventTypeLabel(e.eventType), dest: countryName, gdprBasis, dataCat, decision: getEventDecision(e), sealId };
      });

      const tableRows = rows.map(r =>
        `<tr><td>${escapeHtml(r.ts)}</td><td>${escapeHtml(r.type)}</td><td>${escapeHtml(r.dest)}</td><td>${escapeHtml(r.gdprBasis)}</td><td>${escapeHtml(r.dataCat)}</td><td>${escapeHtml(r.decision)}</td><td>${escapeHtml(r.sealId)}</td></tr>`
      ).join('');

      const html = `<!DOCTYPE html><html><head><title>Evidence Vault Audit Report</title>
<style>
body{font-family:system-ui,sans-serif;color:#1e293b;padding:2rem;max-width:900px;margin:0 auto}
h1{font-size:1.5rem;margin-bottom:0.5rem}h2{font-size:1.1rem;margin:1.5rem 0 0.5rem}
table{width:100%;border-collapse:collapse;font-size:0.85rem;margin-top:0.5rem}
th,td{border:1px solid #cbd5e1;padding:0.4rem 0.6rem;text-align:left}
th{background:#f1f5f9;font-weight:600}
.summary{background:#f8fafc;padding:1rem;border-radius:0.5rem;margin:1rem 0}
.cover{text-align:center;padding:3rem 0;border-bottom:1px solid #e2e8f0}
@media print{body{padding:0}}
</style></head><body>
<div class="cover">
<h1>${companyName}</h1>
<p>Evidence Vault Audit Report</p>
<p>${reportDate}</p>
<p class="summary">Prepared for supervisory authority under GDPR Art. 5(2)</p>
</div>
<h2>Summary</h2>
<div class="summary">
<p><strong>Total events:</strong> ${events.length}</p>
<p><strong>Date range:</strong> ${minDate} – ${maxDate}</p>
<p><strong>Decisions breakdown:</strong> ${Object.entries(decisionCounts).map(([k,v])=>`${k}: ${v}`).join(', ')}</p>
</div>
<h2>Evidence Events</h2>
<table>
<thead><tr><th>Timestamp</th><th>Event Type</th><th>Destination</th><th>GDPR Basis</th><th>Data Category</th><th>Decision</th><th>Seal ID</th></tr></thead>
<tbody>${tableRows}</tbody>
</table>
</body></html>`;
      const w = window.open('', '_blank');
      if (w) {
        w.document.write(html);
        w.document.close();
        w.focus();
        setTimeout(() => { w.print(); w.close(); }, 250);
      } else {
        alert('Please allow pop-ups to export PDF');
      }
    }
  }

  const handleEventClick = useCallback((event: EvidenceEvent) => {
    setSelectedEvent(event);
    // setErasureForm({ requestId: event.id || '', grounds: '', confirmation: '' });
    // setErasureCertificate(null);
    setDrawerOpen(true);
    setDrawerEntered(false);
    requestAnimationFrame(() => setDrawerEntered(true));
  }, []);

  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeDrawer = useCallback(() => {
    setDrawerEntered(false);
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    closeTimeoutRef.current = setTimeout(() => {
      setDrawerOpen(false);
      setSelectedEvent(null);
      // setErasureForm({ requestId: '', grounds: '', confirmation: '' });
      // setErasureCertificate(null);
      closeTimeoutRef.current = null;
    }, 300);
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeDrawer();
    };
    if (drawerOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [drawerOpen, closeDrawer]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
      closeDrawer();
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Could add toast - for now silent
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const eventTime = new Date(timestamp);
    const diffMs = now.getTime() - eventTime.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const getEventTypeColor = () => 'text-slate-400 bg-slate-500/10';

  return (
    <DashboardLayout>
      <div className="space-y-6 min-w-0 overflow-x-hidden">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">EVIDENCE VAULT</h1>
            <p className="text-sm text-slate-400">GDPR Art. 5(2), 24, 30, 32 • Audit Archive & Evidence Chain</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleExport('pdf')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <FileDown className="w-4 h-4" />
              Export for Audit (PDF)
            </button>
            <button
              onClick={() => handleExport('json')}
              className="flex items-center gap-2 px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Download className="w-4 h-4" />
              Export (JSON)
            </button>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Status Header Bar */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-green-400" />
              <span className="text-sm font-medium text-white">Status: ACTIVE</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-300">
              <span>Last scan: {new Date().toLocaleString()}</span>
              <span>•</span>
              <span>{events.length} events archived</span>
            </div>
            <div className="flex items-center gap-4">
              {integrityStatus && (
                <div className={`px-3 py-2 rounded-lg text-sm font-medium border ${
                  integrityStatus === 'VALID'
                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25'
                    : 'bg-red-500/15 text-red-400 border-red-500/25'
                }`}>
                  Chain: {integrityStatus}
                </div>
              )}
              <button
                onClick={handleVerifyIntegrity}
                disabled={verifying}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
              >
                {verifying ? 'Verifying...' : 'Verify Chain Integrity'}
              </button>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-slate-400 font-medium">MERKLE ROOTS</div>
              <Database className="w-4 h-4 text-slate-500" />
            </div>
            <div className={`text-2xl font-bold ${merkleRootsCount > 0 ? 'text-green-400' : 'text-white'}`}>{merkleRootsCount}</div>
            <div className="text-xs text-slate-500 mt-1">Sealed chain roots</div>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-slate-400 font-medium">EVENTS SEALED</div>
              <FileText className="w-4 h-4 text-slate-500" />
            </div>
            <div className="text-2xl font-bold text-white">{events.length}</div>
            <div className="text-xs text-slate-500 mt-1">In current view</div>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-slate-400 font-medium">CHAIN STATUS</div>
              <Shield className="w-4 h-4 text-slate-500" />
            </div>
            <div className={`text-2xl font-bold ${integrityStatus === 'VALID' ? 'text-green-400' : integrityStatus === 'TAMPERED' ? 'text-red-400' : 'text-slate-400'}`}>
              {integrityStatus ?? '—'}
            </div>
            <div className="text-xs text-slate-500 mt-1">Integrity check result</div>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-slate-400 font-medium">LAST VERIFIED</div>
              <Clock className="w-4 h-4 text-slate-500" />
            </div>
            <div className="text-2xl font-bold text-white">
              {lastVerifiedAt ? lastVerifiedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
            </div>
            <div className="text-xs text-slate-500 mt-1">When chain was verified</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-semibold text-white">Filters</span>
          </div>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-2">Severity</label>
              <select
                value={filters.severity}
                onChange={(e) => handleFilterChange('severity', e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Severities</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="LOW">Low</option>
                <option value="INFO">Info</option>
                <option value="ERASURE">Erasure</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-2">Event Type</label>
              <select
                value={filters.eventType}
                onChange={(e) => handleFilterChange('eventType', e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                <option value="Transfer Evaluation">Transfer Evaluation</option>
                <option value="Transfer — Blocked">Transfer — Blocked</option>
                <option value="Transfer — Review">Transfer — Review</option>
                <option value="Human Decision — Blocked">Human Decision — Blocked</option>
                <option value="Human Decision — Approved">Human Decision — Approved</option>
                <option value="GDPR Erasure">GDPR Erasure</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-2">Destination Country</label>
              <input
                type="text"
                value={filters.destinationCountry}
                onChange={(e) => handleFilterChange('destinationCountry', e.target.value)}
                placeholder="e.g., China, US, Germany"
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  placeholder="Event ID, type, or content..."
                  className="w-full pl-10 pr-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Highlighted Event Notice */}
        {highlightedEventId && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-semibold text-blue-400">
                Viewing Evidence for Block ID: {highlightedEventId}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              This event is highlighted below. The evidence has been sealed in the Audit & Evidence vault for regulatory compliance.
            </p>
          </div>
        )}

        {/* Evidence Events Table */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
          <div className="p-4 border-b border-slate-700 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">Evidence Events Archive</h2>
              <p className="text-xs text-slate-400 mt-1">
                {events.length === 0
                  ? '0 events found'
                  : `Showing ${(currentPage - 1) * EVENTS_PER_PAGE + 1}–${Math.min(currentPage * EVENTS_PER_PAGE, events.length)} of ${events.length} events`}
              </p>
            </div>
          </div>
          <div className="overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-slate-400">Loading evidence events...</div>
            ) : events.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-slate-400 mb-2">No Evidence Events Found</p>
                <p className="text-sm text-slate-500">Try adjusting your filters or check back later for new events.</p>
              </div>
            ) : (
              <>
              <table className="w-full table-fixed" style={{ tableLayout: 'fixed' }}>
                <colgroup>
                  <col style={{ width: '15%' }} />
                  <col style={{ width: '9%' }} />
                  <col style={{ width: '13%' }} />
                  <col style={{ width: '13%' }} />
                  <col style={{ width: '10%' }} />
                  <col style={{ width: '13%' }} />
                  <col style={{ width: '13%' }} />
                  <col style={{ width: '9%' }} />
                  <col style={{ width: '15%' }} />
                </colgroup>
                <thead className="bg-slate-700/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider whitespace-nowrap">Event</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider whitespace-nowrap">Severity</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider whitespace-nowrap">Destination</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider whitespace-nowrap">GDPR Basis</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider whitespace-nowrap">Data</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider whitespace-nowrap">Source</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider whitespace-nowrap">Time</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider whitespace-nowrap">Retention</th>
                    <th className="px-4 py-3 pl-8 text-left text-xs font-medium text-slate-300 uppercase tracking-wider whitespace-nowrap">Verification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {paginatedEvents.map((event, index) => {
                    const isHighlighted = highlightedEventId && (
                      event.id === highlightedEventId ||
                      event.eventId === highlightedEventId
                    );
                    // const isErased = erasedEventIds.has(event.id); // Crypto Shredder (commented out)
                    const seq = (currentPage - 1) * EVENTS_PER_PAGE + index + 1;
                    return (
                      <tr
                        key={event.id}
                        onClick={() => handleEventClick(event)}
                        className={`cursor-pointer hover:bg-slate-700/50 transition-colors ${
                          isHighlighted ? 'bg-blue-500/10 border-l-2 border-blue-500' : ''
                        }`}
                      >
                        <td className="px-4 py-3 text-sm text-slate-300" title={event.eventId || event.id || undefined}>
                          {formatEventTypeLabel(event.eventType)}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium border ${getSeverityBadgeClass(getDerivedSeverity(event))}`}>
                            {getDerivedSeverity(event)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="min-w-0">
                            <div className="text-sm text-white truncate" title={event.payload?.destination_country ?? event.payload?.destinationCountry ?? undefined}>
                              {event.payload?.destination_country ?? event.payload?.destinationCountry ?? 'N/A'}
                            </div>
                            {event.payload?.destination_country_code && (
                              <div className="text-xs text-slate-400">({event.payload.destination_country_code})</div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-300 font-mono whitespace-nowrap">
                          {(() => {
                            const source = (event.sourceSystem || '').toLowerCase();
                            const et = (event.eventType || '').toUpperCase();
                            if (source === 'human-oversight' || et.includes('HUMAN_OVERSIGHT')) return 'Art. 22';
                            const countryName = event.payload?.destination_country || event.payload?.destinationCountry || event.payload?.destination || '';
                            let countryCode = event.payload?.destination_country_code || event.payload?.destinationCountryCode || '';
                            if (!countryCode && countryName) countryCode = getCountryCodeFromName(countryName);
                            return getLegalBasis(countryCode) || '—';
                          })()}
                        </td>
                        <td className="px-4 py-3">
                          <div className="min-w-0">
                            <div className="text-sm text-white truncate">{event.payload?.data_categories?.[0] || event.payload?.dataCategories?.[0] || event.payload?.data_category ?? 'N/A'}</div>
                            {event.payload?.records && (
                              <div className="text-xs text-slate-400">{event.payload.records.toLocaleString()} records</div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm text-white truncate" title={event.sourceSystem ?? undefined}>
                            {event.sourceSystem ?? 'N/A'}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm">
                            <div className="text-white whitespace-nowrap">{formatTimeAgo(event.occurredAt)}</div>
                            <div className="text-xs text-slate-400 whitespace-nowrap">{formatTimestamp(event.occurredAt)}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-xs text-slate-500 whitespace-nowrap">{getRetentionYear(event.createdAt)}</div>
                        </td>
                        <td className="px-4 py-3 pl-8">
                          {event.verificationStatus === 'BLOCK' || event.verificationStatus === 'VERIFIED' ? (
                            <span className="px-2 py-1 bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 rounded text-xs font-medium">
                              VERIFIED
                            </span>
                          ) : event.verificationStatus === 'REVIEW' || event.verificationStatus === 'PENDING' ? (
                            <span className="px-2 py-1 bg-amber-500/15 text-amber-400 border border-amber-500/25 rounded text-xs font-medium">
                              PENDING
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-slate-500/15 text-slate-400 border border-slate-500/25 rounded text-xs font-medium">
                              UNVERIFIED
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="p-4 border-t border-slate-700 flex items-center justify-between">
                <p className="text-xs text-slate-400">
                  Evidence Vault maintains immutable audit trail
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage <= 1}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium bg-slate-700 text-white hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-slate-400 px-2">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage >= totalPages}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium bg-slate-700 text-white hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
              </>
            )}
          </div>
        </div>

        {/* Detail Drawer */}
        {drawerOpen && selectedEvent && (
          <div
            className="fixed inset-0 z-50 flex justify-end bg-black/20"
            onClick={(e) => { if (e.target === e.currentTarget) closeDrawer(); }}
            role="presentation"
          >
            <div
              ref={drawerRef}
              className={`fixed right-0 top-0 h-full w-[520px] bg-slate-900 border-l border-slate-700 shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
                drawerEntered ? 'translate-x-0' : 'translate-x-full'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {(() => {
                const e = selectedEvent;
                const countryName = e.payload?.destination_country || e.payload?.destinationCountry || e.payload?.destination || '';
                let countryCode = e.payload?.destination_country_code || e.payload?.destinationCountryCode || '';
                if (!countryCode && countryName) countryCode = getCountryCodeFromName(countryName);
                const source = (e.sourceSystem || '').toLowerCase();
                const et = (e.eventType || '').toUpperCase();
                const gdprBasisFull = source === 'human-oversight' || et.includes('HUMAN_OVERSIGHT')
                  ? 'Art. 22 — Right not to be subject to automated decision-making'
                  : getLegalBasisFullText(countryCode);
                const CopyRow = ({ label, value }: { label: string; value: string }) => (
                  <div className="flex items-start justify-between gap-2 py-1.5">
                    <div className="min-w-0 flex-1">
                      <div className="text-xs text-slate-400 mb-0.5">{label}</div>
                      <code className="text-xs font-mono text-emerald-400 break-all">{value || '—'}</code>
                    </div>
                    <button
                      onClick={() => copyToClipboard(value)}
                      className="shrink-0 p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                      title="Copy"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );

                return (
                  <>
                    {/* Header — Event Label, Severity, Verification, Close */}
                    <div className="p-5 border-b border-slate-700 flex items-start justify-between gap-3">
                      <div className="flex flex-wrap gap-2 items-center min-w-0">
                        <span className={`px-3 py-1.5 rounded text-sm font-medium ${getEventTypeColor()}`}>
                          {formatEventTypeLabel(e.eventType)}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium border ${getSeverityBadgeClass(getDerivedSeverity(e))}`}>
                          {getDerivedSeverity(e)}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium border ${
                            e.verificationStatus === 'VERIFIED' || e.verificationStatus === 'BLOCK' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25' :
                            e.verificationStatus === 'REVIEW' || e.verificationStatus === 'PENDING' ? 'bg-amber-500/15 text-amber-400 border-amber-500/25' :
                            'bg-red-500/15 text-red-400 border-red-500/25'
                          }`}>
                            {e.verificationStatus === 'VERIFIED' || e.verificationStatus === 'BLOCK' ? 'VERIFIED' :
                             e.verificationStatus === 'REVIEW' || e.verificationStatus === 'PENDING' ? 'PENDING' : 'UNVERIFIED'}
                          </span>
                      </div>
                      <button
                        onClick={closeDrawer}
                        className="shrink-0 p-2 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                        aria-label="Close"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-5 space-y-5">
                      {/* Section 1 — Transfer Details, Erasure Certificate, or Erasure Details */}
                      {(() => {
                        const et = (e.eventType || '').toUpperCase();
                        if (et === 'GDPR_ERASURE_COMPLETED') {
                          const p = e.payload || {};
                          const requestId = p.requestId ?? p.request_id ?? '—';
                          const userId = p.userId ?? p.user_id ?? '—';
                          const cryptoLogId = p.cryptoLogId ?? p.crypto_log_id ?? '—';
                          const executedAt = p.executedAt ?? p.executed_at ?? e.occurredAt ?? '—';
                          const grounds = p.grounds ?? '—';
                          const shreddedItems = Array.isArray(p.shreddedItems) ? p.shreddedItems : (Array.isArray(p.shredded_items) ? p.shredded_items : []);
                          const totalRecords = p.totalRecords ?? p.total_records ?? 0;
                          const totalSizeMb = p.totalSizeMb ?? p.total_size_mb ?? 0;
                          const execDate = executedAt !== '—' ? new Date(executedAt) : null;
                          const certId = execDate && requestId !== '—'
                            ? `CERT-${requestId}-${execDate.toISOString().replace(/[-:T.Z]/g, '').slice(0, 14)}`
                            : (e.nexusSeal || e.eventId || e.id);
                          const certObj = {
                            certificateId: certId,
                            issuedAt: executedAt,
                            compliance: 'GDPR Article 17 — Right to Erasure',
                            requestId,
                            userId,
                            cryptoLogId,
                            grounds,
                            shreddedItems,
                            totalRecords,
                            totalSizeMb,
                          };
                          return (
                            <section>
                              <h3 className="text-xs font-bold uppercase tracking-widest text-purple-400 mb-3">Erasure Certificate</h3>
                              <div className="bg-slate-900 rounded p-4 space-y-4">
                                <div className="text-sm text-emerald-400 font-medium">✓ GDPR Art. 17 — Right to Erasure Executed</div>
                                <div className="space-y-2 text-sm">
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="text-slate-400">Request ID</span>
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-white">{requestId}</span>
                                      <button onClick={() => copyToClipboard(String(requestId))} className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white" title="Copy"><Copy className="w-3.5 h-3.5" /></button>
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="text-slate-400">User ID</span>
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-white">{userId}</span>
                                      <button onClick={() => copyToClipboard(String(userId))} className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white" title="Copy"><Copy className="w-3.5 h-3.5" /></button>
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="text-slate-400">Crypto Log ID</span>
                                    <div className="flex items-center gap-1.5">
                                      <code className="text-emerald-400 font-mono text-xs">{cryptoLogId}</code>
                                      <button onClick={() => copyToClipboard(String(cryptoLogId))} className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white" title="Copy"><Copy className="w-3.5 h-3.5" /></button>
                                    </div>
                                  </div>
                                  <div><span className="text-slate-400">Executed At</span> <span className="text-white">{formatDrawerTimestamp(executedAt)}</span></div>
                                  <div><span className="text-slate-400">Legal Grounds</span> <span className="text-white">{grounds}</span></div>
                                </div>
                                {shreddedItems.length > 0 && (
                                  <>
                                    <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 pt-2 border-t border-slate-700">Shredded Items</h4>
                                    <div className="space-y-0">
                                      {shreddedItems.map((item: { source?: string; records?: number; size_mb?: number; sizeMb?: number; method?: string; status?: string }, i: number) => (
                                        <div key={i} className="border-t border-slate-700 pt-2 first:border-t-0 first:pt-0 text-sm">
                                          <span className="text-slate-400">Source:</span> <span className="text-white">{item.source ?? '—'}</span>
                                          <span className="text-slate-500 mx-2">|</span>
                                          <span className="text-slate-400">Records:</span> <span className="text-white">{(item.records ?? 0).toLocaleString()}</span>
                                          <span className="text-slate-500 mx-2">|</span>
                                          <span className="text-slate-400">Size:</span> <span className="text-white">{item.size_mb ?? item.sizeMb ?? 0} MB</span>
                                          <span className="text-slate-500 mx-2">|</span>
                                          <span className="text-slate-400">Method:</span> <span className="text-white">{item.method ?? '—'}</span>
                                          <span className="text-slate-500 mx-2">|</span>
                                          <span className="text-emerald-400">✓ SHREDDED</span>
                                        </div>
                                      ))}
                                    </div>
                                  </>
                                )}
                                <div className="border-t border-slate-700 pt-3 space-y-1">
                                  <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">Totals</h4>
                                  <div className="text-white font-medium">Total Records Destroyed: {(totalRecords ?? 0).toLocaleString()}</div>
                                  <div className="text-white font-medium">Total Data Size: {totalSizeMb ?? 0} MB</div>
                                </div>
                                <button
                                  onClick={() => {
                                    const blob = new Blob([JSON.stringify(certObj, null, 2)], { type: 'application/json' });
                                    const url = URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = `erasure-certificate-${requestId}.json`;
                                    a.click();
                                    URL.revokeObjectURL(url);
                                  }}
                                  className="w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded text-sm font-medium transition-colors"
                                >
                                  Download Certificate JSON
                                </button>
                              </div>
                            </section>
                          );
                        }
                        const destCountry = (e.payload?.destination_country ?? e.payload?.destinationCountry ?? e.payload?.destination ?? '').trim();
                        const hasDestCountry = destCountry && destCountry !== 'N/A';
                        const isErasure = getDerivedSeverity(e) === 'ERASURE';

                        if (hasDestCountry) {
                          return (
                            <section>
                              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Transfer Details</h3>
                              <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                  {countryCode && (
                                    <img src={`https://flagcdn.com/16x12/${countryCode.toLowerCase()}.png`} width={16} height={12} alt="" className="shrink-0" />
                                  )}
                                  <span className="text-white">{countryName || '—'}</span>
                                </div>
                                <div><span className="text-slate-400">GDPR Legal Basis:</span> <span className="text-white">{gdprBasisFull}</span></div>
                                <div><span className="text-slate-400">Data Category:</span> <span className="text-white">{e.payload?.data_categories?.[0] || e.payload?.dataCategories?.[0] || e.payload?.data_category ?? '—'}</span></div>
                                <div><span className="text-slate-400">Source System:</span> <span className="text-white">{e.sourceSystem || '—'}</span></div>
                                <div><span className="text-slate-400">Purpose:</span> <span className="text-white">{e.payload?.purpose || '—'}</span></div>
                              </div>
                            </section>
                          );
                        }
                        if (isErasure) {
                          return (
                            <section>
                              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Erasure Details</h3>
                              <div className="space-y-2 text-sm">
                                <div><span className="text-slate-400">Executed by:</span> <span className="text-white">{e.sourceSystem || '—'}</span></div>
                                <div><span className="text-slate-400">Key ID:</span> <span className="text-white font-mono">{e.payload?.key_id ?? '—'}</span></div>
                                <div><span className="text-slate-400">Records affected:</span> <span className="text-white">{e.payload?.records_affected ?? '—'}</span></div>
                                <div><span className="text-slate-400">Method:</span> <span className="text-white">AES-256-GCM Cryptographic Key Destruction</span></div>
                                <div><span className="text-slate-400">Legal basis:</span> <span className="text-white">GDPR Art. 17 — Right to Erasure</span></div>
                              </div>
                            </section>
                          );
                        }
                        return null;
                      })()}

                      {/* Section 2 — Cryptographic Evidence */}
                      <section className="border-t border-slate-700 pt-5">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Cryptographic Evidence</h3>
                        <div className="space-y-0">
                          <CopyRow label="Event ID" value={e.eventId || e.id} />
                          <CopyRow label="Seal ID" value={e.nexusSeal || ''} />
                          <CopyRow label="Payload Hash" value={e.payloadHash || ''} />
                          <CopyRow label="Previous Hash" value={e.previousHash || ''} />
                        </div>
                        <div className="mt-3">
                          <div className="text-xs text-slate-400">{getSeverityExplanation(getDerivedSeverity(e))}</div>
                        </div>
                      </section>

                      {/* Section 3 — Timestamps */}
                      <section className="border-t border-slate-700 pt-5">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Timestamps</h3>
                        <div className="space-y-1 text-sm">
                          <div><span className="text-slate-400">Occurred at:</span> <span className="text-white">{formatDrawerTimestamp(e.occurredAt)}</span></div>
                          <div><span className="text-slate-400">Recorded at:</span> <span className="text-white">{formatDrawerTimestamp(e.recordedAt)}</span></div>
                          <div><span className="text-slate-400">Retention until:</span> <span className="text-white">{formatRetentionDate(e.createdAt)}</span></div>
                        </div>
                      </section>

                      {/* Section 4 — Regulatory Tags */}
                      <section className="border-t border-slate-700 pt-5">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Regulatory Tags</h3>
                        <div className="flex flex-wrap gap-1.5">
                          {[...(e.regulatoryTags || []), ...(e.articles || [])].length ? (
                            [...(e.regulatoryTags || []), ...(e.articles || [])].map((tag, i) => (
                              <span key={i} className="px-2 py-0.5 rounded text-xs bg-slate-700 text-slate-300">{tag}</span>
                            ))
                          ) : (
                            <span className="text-slate-500 text-sm">None</span>
                          )}
                        </div>
                      </section>

                      {/* Section 5 — GDPR Art. 17 Erasure (Crypto Shredder) — COMMENTED OUT: re-enable if product direction changes */}
                      {/* {(() => {
                        const dataCategories = e.payload?.data_categories || e.payload?.dataCategories || [];
                        const hasDataCategories = Array.isArray(dataCategories) && dataCategories.length > 0;
                        const isSovereignShield = (e.sourceSystem || '').toLowerCase() === 'sovereign-shield';
                        const isAlreadyErased = erasedEventIds.has(e.id);
                        const userId = e.payload?.user_id || e.payload?.userId || e.correlationId || e.id;

                        if (!hasDataCategories || !isSovereignShield) return null;

                        if (isAlreadyErased) {
                          return (
                            <section className="border-t border-slate-700 pt-5">
                              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">🔒 PERSONAL DATA ERASED</h3>
                              <div className="bg-slate-900 rounded p-4 space-y-3 text-sm">
                                <p className="text-slate-300">
                                  This transfer&apos;s personal data has been cryptographically shredded per GDPR Art. 17.
                                </p>
                                <p className="text-slate-400">
                                  The encryption key has been permanently destroyed.
                                </p>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setFilters(prev => ({ ...prev, search: e.id }));
                                    closeDrawer();
                                  }}
                                  className="inline-flex items-center gap-1.5 text-purple-400 hover:text-purple-300 font-medium text-left"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                  View Erasure Certificate →
                                </button>
                              </div>
                            </section>
                          );
                        }

                        if (erasureCertificate) {
                          const cert = erasureCertificate as { certificate?: { id?: string }; executedAt?: string; summary?: { totalRecords?: number; cryptoLogId?: string } };
                          const certId = cert.certificate?.id || 'certificate';
                          return (
                            <section className="border-t border-slate-700 pt-5">
                              <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-3">✓ ERASURE COMPLETED</h3>
                              <div className="bg-slate-900 rounded p-4 space-y-2 text-sm">
                                <div><span className="text-slate-400">Certificate ID:</span> <span className="text-white font-mono">{certId}</span></div>
                                <div><span className="text-slate-400">Executed at:</span> <span className="text-white">{formatDrawerTimestamp(cert.executedAt as string)}</span></div>
                                <div><span className="text-slate-400">Records affected:</span> <span className="text-white">{cert.summary?.totalRecords ?? '—'}</span></div>
                                <div><span className="text-slate-400">Crypto Log ID:</span> <code className="text-emerald-400 font-mono text-xs">{cert.summary?.cryptoLogId ?? '—'}</code></div>
                                <div><span className="text-slate-400">Compliance:</span> <span className="text-white">GDPR Article 17 — Right to Erasure</span></div>
                                <button
                                  onClick={() => {
                                    const blob = new Blob([JSON.stringify(erasureCertificate, null, 2)], { type: 'application/json' });
                                    const url = URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = `erasure-certificate-${certId}.json`;
                                    a.click();
                                    URL.revokeObjectURL(url);
                                  }}
                                  className="mt-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded text-sm font-medium transition-colors"
                                >
                                  Download Certificate
                                </button>
                              </div>
                            </section>
                          );
                        }

                        const expectedConfirmation = `ERASE ${userId}`;
                        const formValid = erasureForm.requestId.trim() && erasureForm.grounds && erasureForm.confirmation.trim() === expectedConfirmation;

                        return (
                          <section className="border-t border-slate-700 pt-5">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">GDPR ART. 17 — RIGHT TO ERASURE</h3>
                            <div className="bg-slate-900 rounded p-4 space-y-4">
                              <div>
                                <label className="block text-xs text-slate-400 mb-1">Request ID *</label>
                                <input
                                  type="text"
                                  placeholder="REQ-2026-001"
                                  value={erasureForm.requestId}
                                  onChange={(ev) => setErasureForm(f => ({ ...f, requestId: ev.target.value }))}
                                  className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-slate-400 mb-1">Legal Grounds *</label>
                                <select
                                  value={erasureForm.grounds}
                                  onChange={(ev) => setErasureForm(f => ({ ...f, grounds: ev.target.value }))}
                                  className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                  <option value="">Select grounds...</option>
                                  <option value="Withdrawal of consent (Art. 6(1)(a))">Withdrawal of consent (Art. 6(1)(a))</option>
                                  <option value="Data no longer necessary (Art. 17(1)(a))">Data no longer necessary (Art. 17(1)(a))</option>
                                  <option value="Unlawful processing (Art. 17(1)(d))">Unlawful processing (Art. 17(1)(d))</option>
                                  <option value="Legal obligation (Art. 17(1)(c))">Legal obligation (Art. 17(1)(c))</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs text-slate-400 mb-1">User ID (for confirmation)</label>
                                <div className="px-3 py-2 bg-slate-800/50 border border-slate-700 rounded text-slate-300 text-sm font-mono">
                                  {userId}
                                </div>
                              </div>
                              <div>
                                <label className="block text-xs text-slate-400 mb-1">Confirmation *</label>
                                <input
                                  type="text"
                                  placeholder={`Type: ERASE ${userId}`}
                                  value={erasureForm.confirmation}
                                  onChange={(ev) => setErasureForm(f => ({ ...f, confirmation: ev.target.value }))}
                                  className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <p className="text-xs text-slate-400 mt-1">Type ERASE followed by the user ID to confirm permanent erasure</p>
                              </div>
                              <div className="bg-amber-500/10 border border-amber-500/25 rounded p-3 text-sm text-amber-200">
                                <strong>⚠ This action is irreversible.</strong> The encryption key will be cryptographically destroyed. The transfer record will remain in the Evidence Vault as required by GDPR Art. 30, but the personal data will be permanently unrecoverable.
                              </div>
                              <button
                                onClick={async () => {
                                  if (!formValid || !selectedEvent) return;
                                  setErasureExecuting(true);
                                  try {
                                    const res = await executeErasure({
                                      requestId: erasureForm.requestId.trim(),
                                      userId,
                                      grounds: erasureForm.grounds,
                                      confirmation: erasureForm.confirmation.trim(),
                                    });
                                    setErasureCertificate(res as unknown as Record<string, unknown>);
                                    setErasedEventIds(prev => new Set([...prev, selectedEvent.id]));
                                    loadEvents();
                                  } catch (err) {
                                    alert(err instanceof Error ? err.message : 'Erasure failed');
                                  } finally {
                                    setErasureExecuting(false);
                                  }
                                }}
                                disabled={!formValid || erasureExecuting}
                                className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-red-500/15 text-red-400 border border-red-500/25 rounded text-sm font-medium hover:bg-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                                {erasureExecuting ? 'Executing...' : 'Execute Erasure'}
                              </button>
                            </div>
                          </section>
                        );
                      })()} */}

                    </div>

                    {/* Raw Payload — above footer */}
                    <div className="px-5 pb-4 border-t border-slate-700 pt-4">
                      <details className="group">
                        <summary className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-slate-300 cursor-pointer list-none flex items-center gap-1 [&::-webkit-details-marker]:hidden">
                          Show Raw Payload ▶
                        </summary>
                        <pre className="mt-3 p-3 rounded overflow-auto max-h-48 font-mono text-xs text-emerald-400 bg-slate-950">
                          {JSON.stringify(e.payload, null, 2)}
                        </pre>
                      </details>
                    </div>

                    {/* Footer */}
                    <div className="p-5 border-t border-slate-700 flex gap-2">
                      <button
                        onClick={() => {
                          if (!selectedEvent) return;
                          const e = selectedEvent;
                          const countryName = e.payload?.destination_country || e.payload?.destinationCountry || e.payload?.destination || '';
                          let countryCode = e.payload?.destination_country_code || e.payload?.destinationCountryCode || '';
                          if (!countryCode && countryName) countryCode = getCountryCodeFromName(countryName);
                          const html = `<html><head><title>Evidence - ${e.eventId || e.id}</title>
<style>body{font-family:system-ui,sans-serif;color:#1e293b;padding:2rem;max-width:600px}
h3{font-size:0.7rem;text-transform:uppercase;letter-spacing:0.1em;color:#64748b;margin:1.5rem 0 0.5rem}
p{margin:0.2rem 0;font-size:0.875rem}
code{font-family:monospace;font-size:0.75rem;color:#059669;word-break:break-all}
</style></head><body>
<h2>Evidence Vault — Event Detail</h2>
<h3>Transfer Details</h3><p>Destination: ${countryName || '—'}</p><p>GDPR Basis: ${getLegalBasisFullText(countryCode)}</p>
<h3>Cryptographic Evidence</h3><p>Event ID: <code>${e.eventId || e.id}</code></p><p>Seal ID: <code>${e.nexusSeal || '—'}</code></p>
<h3>Timestamps</h3><p>Occurred: ${e.occurredAt || '—'}</p><p>Retention: ${getRetentionYear(e.createdAt)}</p>
</body></html>`;
                          const w = window.open('', '_blank');
                          if (w) { w.document.write(html); w.document.close(); w.focus(); setTimeout(() => { w.print(); w.close(); }, 250); }
                        }}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        <FileDown className="w-4 h-4" />
                        Export as PDF
                      </button>
                      <button
                        onClick={() => copyToClipboard(`${typeof window !== 'undefined' ? window.location.origin : ''}/evidence-vault?eventId=${encodeURIComponent(e.eventId || e.id)}`)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                        Copy Shareable Link
                      </button>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
