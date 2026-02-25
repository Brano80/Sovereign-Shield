'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import DashboardLayout from '../components/DashboardLayout';
import { fetchEvidenceEvents, verifyIntegrity, EvidenceEvent } from '../utils/api';
import { RefreshCw, AlertTriangle, FileDown, Filter, Search, Download, Eye, Shield, Clock, MapPin, Server, Database, FileText } from 'lucide-react';

export default function EvidenceVaultPage() {
  const searchParams = useSearchParams();
  const highlightedEventId = searchParams.get('eventId');

  const [events, setEvents] = useState<EvidenceEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [integrityStatus, setIntegrityStatus] = useState<'VALID' | 'TAMPERED' | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [filters, setFilters] = useState({
    riskLevel: '',
    destinationCountry: '',
    search: highlightedEventId || '',
  });

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

  async function loadEvents() {
    try {
      const data = await fetchEvidenceEvents();
      let filtered = Array.isArray(data) ? data : [];

      // Apply filters
      if (filters.riskLevel) {
        filtered = filtered.filter(e => e.severity === filters.riskLevel);
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
          e.eventType?.toLowerCase().includes(searchLower) ||
          e.payloadHash?.toLowerCase().includes(searchLower)
        );
      }

      setEvents(filtered);
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
      setIntegrityStatus(result.status);
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
      alert('PDF export coming soon');
    }
  }

  function handleEventClick(event: EvidenceEvent) {
    console.log('Event clicked:', event);
    // TODO: Open detail view/modal
  }

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

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'L1': return 'text-green-400 bg-green-500/10 border-green-500/20';
      case 'L2': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'L3': return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
      case 'L4': return 'text-red-400 bg-red-500/10 border-red-500/20';
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'L1': return <Shield className="w-4 h-4 text-green-400" />;
      case 'L2': return <AlertTriangle className="w-4 h-4 text-blue-400" />;
      case 'L3': return <AlertTriangle className="w-4 h-4 text-orange-400" />;
      case 'L4': return <AlertTriangle className="w-4 h-4 text-red-400" />;
      default: return <Shield className="w-4 h-4 text-slate-400" />;
    }
  };

  const getEventTypeColor = (eventType: string) => {
    switch (eventType) {
      case 'DATA_TRANSFER': return 'text-blue-400 bg-blue-500/10';
      case 'DATA_TRANSFER_BLOCKED': return 'text-red-400 bg-red-500/10';
      case 'DATA_TRANSFER_REVIEW': return 'text-yellow-400 bg-yellow-500/10';
      default: return 'text-slate-400 bg-slate-500/10';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">EVIDENCE VAULT</h1>
            <p className="text-sm text-slate-400">GDPR Art. 32 • Audit Archive & Evidence Chain</p>
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
                <div className={`px-3 py-2 rounded-lg text-sm font-medium ${
                  integrityStatus === 'VALID'
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-red-500/20 text-red-400'
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

        {/* Filters */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-semibold text-white">Filters</span>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-2">Risk Level</label>
              <select
                value={filters.riskLevel}
                onChange={(e) => handleFilterChange('riskLevel', e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Show All</option>
                <option value="L1">L1 - Low</option>
                <option value="L2">L2 - Medium</option>
                <option value="L3">L3 - High</option>
                <option value="L4">L4 - Critical</option>
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

        {/* Quick Filter Chips */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-slate-400">Quick Filters:</span>
          {(['', 'L1', 'L2', 'L3', 'L4'] as const).map((level) => (
            <button
              key={level}
              onClick={() => handleFilterChange('riskLevel', level)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                filters.riskLevel === level
                  ? level === '' 
                    ? 'bg-blue-600 text-white'
                    : level === 'L1'
                    ? 'bg-green-600 text-white'
                    : level === 'L2'
                    ? 'bg-blue-600 text-white'
                    : level === 'L3'
                    ? 'bg-orange-600 text-white'
                    : 'bg-red-600 text-white'
                  : level === ''
                  ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  : level === 'L1'
                  ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                  : level === 'L2'
                  ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                  : level === 'L3'
                  ? 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30'
                  : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
              }`}
            >
              {level === '' ? 'Show All' : `${level} - ${level === 'L1' ? 'Low' : level === 'L2' ? 'Medium' : level === 'L3' ? 'High' : 'Critical'}`}
            </button>
          ))}
        </div>

        {/* Evidence Events Table */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
          <div className="p-4 border-b border-slate-700 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">Evidence Events Archive</h2>
              <p className="text-xs text-slate-400 mt-1">{events.length} events found</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-8 text-center text-slate-400">Loading evidence events...</div>
            ) : events.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-slate-400 mb-2">No Evidence Events Found</p>
                <p className="text-sm text-slate-500">Try adjusting your filters or check back later for new events.</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-slate-700/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Event</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Risk Level</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Destination</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Data</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Source</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Verification</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {events.map((event, index) => {
                    const isHighlighted = highlightedEventId && (
                      event.id === highlightedEventId ||
                      event.eventId === highlightedEventId
                    );
                    return (
                      <tr
                        key={event.id}
                        onClick={() => handleEventClick(event)}
                        className={`hover:bg-slate-700/30 cursor-pointer transition-colors ${
                          isHighlighted ? 'bg-blue-500/10 border-l-2 border-blue-500' : ''
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getEventTypeColor(event.eventType)}`}>
                              {event.eventType?.replace(/_/g, ' ') ?? 'Unknown'}
                            </span>
                            <div className="text-xs text-slate-400">
                              <div>{event.eventId ?? 'N/A'}</div>
                              <div className="text-slate-500">Seq: {index + 1}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className={`flex items-center gap-2 px-2 py-1 rounded border ${getSeverityColor(event.severity)}`}>
                            {getSeverityIcon(event.severity)}
                            <span className="text-xs font-medium">{event.severity}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-slate-400" />
                            <div className="text-sm">
                              <div className="text-white">{event.payload?.destination_country ?? 'N/A'}</div>
                              {event.payload?.destination_country_code && (
                                <div className="text-xs text-slate-400">({event.payload.destination_country_code})</div>
                              )}
                              {event.payload?.endpoint && (
                                <div className="text-xs text-slate-500">{event.payload.endpoint}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Database className="w-4 h-4 text-slate-400" />
                            <div className="text-sm">
                              <div className="text-white">{event.payload?.data_category ?? 'N/A'}</div>
                              {event.payload?.records && (
                                <div className="text-xs text-slate-400">
                                  {event.payload.records.toLocaleString()} records
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Server className="w-4 h-4 text-slate-400" />
                            <div className="text-sm">
                              <div className="text-white">{event.sourceSystem ?? 'N/A'}</div>
                              {event.sourceIp && (
                                <div className="text-xs text-slate-400">{event.sourceIp}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-slate-400" />
                            <div className="text-sm">
                              <div className="text-white">{formatTimeAgo(event.occurredAt)}</div>
                              <div className="text-xs text-slate-400">{formatTimestamp(event.occurredAt)}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {event.verificationStatus === 'BLOCK' || event.verificationStatus === 'VERIFIED' ? (
                            <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-medium">
                              VERIFIED
                            </span>
                          ) : event.verificationStatus === 'REVIEW' || event.verificationStatus === 'PENDING' ? (
                            <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs font-medium">
                              PENDING
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-slate-500/20 text-slate-400 rounded text-xs font-medium">
                              UNVERIFIED
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEventClick(event);
                            }}
                            className="text-blue-400 hover:text-blue-300 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
          {events.length > 0 && (
            <div className="p-4 border-t border-slate-700 text-xs text-slate-400">
              Showing {events.length} events • Evidence Vault maintains immutable audit trail
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
