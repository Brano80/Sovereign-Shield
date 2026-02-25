'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { RefreshCw, AlertTriangle, FileDown, Filter, Search, Download, Eye } from 'lucide-react';
import EvidenceEventsTable from './EvidenceEventsTable';
import { exportEvidenceData } from './exportUtils';
import { complianceApi } from '@/app/lib/api-client';
import type { EvidenceEvent } from './types';

const EvidenceVault: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const highlightedEventId = searchParams.get('eventId');

  const [data, setData] = useState<{
    events: EvidenceEvent[];
    totalCount: number;
    isLoading: boolean;
    error?: string;
  }>({
    events: [],
    totalCount: 0,
    isLoading: true
  });

  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState({
    riskLevel: '',
    destinationCountry: '',
    search: highlightedEventId || '' // Pre-fill search with eventId if provided
  });

  const fetchEvidenceEvents = async () => {
    try {
      setData(prev => ({ ...prev, isLoading: true, error: undefined }));

      // Build query parameters
      const params = new URLSearchParams();
      if (filters.riskLevel) params.append('severity', filters.riskLevel);
      if (filters.destinationCountry) params.append('destination_country', filters.destinationCountry);
      if (filters.search) params.append('search', filters.search);

      const result = await complianceApi.get<{ events?: any[]; totalCount?: number; total_count?: number }>(`/evidence/events?${params.toString()}`);

      setData({
        events: result.events || [],
        totalCount: result.totalCount || result.total_count || 0,
        isLoading: false
      });
    } catch (error) {
      console.error('Error fetching evidence events:', error);
      setData(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }));
    }
  };

  useEffect(() => {
    fetchEvidenceEvents();
  }, [filters]);

  // Listen for Evidence Vault refresh events
  useEffect(() => {
    const handleRefresh = () => {
      console.log('Evidence Vault: Refreshing due to SCC registration');
      fetchEvidenceEvents();
    };

    window.addEventListener('refresh-evidence-vault', handleRefresh);

    return () => {
      window.removeEventListener('refresh-evidence-vault', handleRefresh);
    };
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchEvidenceEvents();
    setRefreshing(false);
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleExport = (format: 'pdf' | 'json') => {
    try {
      exportEvidenceData(data.events, format);
      console.log(`Successfully exported ${data.events.length} evidence events as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Export failed:', error);
      // TODO: Show user-friendly error message
    }
  };

  const getStatusColor = (severity: string) => {
    switch (severity) {
      case 'L1':
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'L2':
        return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
      case 'L3':
        return 'text-red-400 bg-red-500/10 border-red-500/20';
      default:
        return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  };

  if (data.error) {
    const isAuthError = data.error.includes('Authentication failed') || data.error.includes('No authentication token');

    return (
      <div className="min-h-screen bg-slate-950 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-medium">
                {isAuthError ? 'Authentication Required' : 'Error loading Evidence Vault data'}
              </span>
            </div>
            <p className="text-red-300 mt-2">{data.error}</p>
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleRefresh}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
              {isAuthError && (
                <button
                  onClick={() => router.push('/')}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2"
                >
                  Go to Developer Login
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">🗄️ EVIDENCE VAULT</h1>
        <p className="text-slate-400">GDPR Art. 32 • Audit Archive & Evidence Chain</p>
      </div>

      {/* Status Header Bar */}
      <div className={`flex items-center justify-between p-4 rounded-lg border mb-8 ${getStatusColor('L2')}`}>
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          <div>
            <div className="font-semibold text-white">Status: ACTIVE</div>
            <div className="text-sm opacity-80">
              Last scan: {new Date().toLocaleString()} • {data.totalCount} events archived
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleExport('pdf')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <FileDown className="w-4 h-4" />
            Export for Audit (PDF)
          </button>
          <button
            onClick={() => handleExport('json')}
            className="flex items-center gap-2 px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            Export (JSON)
          </button>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-slate-400" />
          <h3 className="text-lg font-semibold text-white">Filters</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Risk Level</label>
            <select
              value={filters.riskLevel}
              onChange={(e) => handleFilterChange('riskLevel', e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Show All</option>
              <option value="L1">L1 - Low</option>
              <option value="L2">L2 - Medium</option>
              <option value="L3">L3 - High</option>
              <option value="L4">L4 - Critical</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Destination Country</label>
            <input
              type="text"
              value={filters.destinationCountry}
              onChange={(e) => handleFilterChange('destinationCountry', e.target.value)}
              placeholder="e.g., China, US, Germany"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Event ID, type, or content..."
                className="w-full pl-10 pr-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Highlighted Event Notice */}
      {highlightedEventId && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-blue-400" />
            <span className="text-blue-400 font-medium">Viewing Evidence for Block ID: {highlightedEventId}</span>
          </div>
          <p className="text-blue-300 mt-2 text-sm">
            This event is highlighted below. The evidence has been sealed in the Audit & Evidence vault for regulatory compliance.
          </p>
        </div>
      )}

      {/* Severity Filter Chips */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-sm font-medium text-slate-400">Quick Filters:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleFilterChange('riskLevel', '')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              filters.riskLevel === ''
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Show All
          </button>
          <button
            onClick={() => handleFilterChange('riskLevel', 'L1')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              filters.riskLevel === 'L1'
                ? 'bg-green-600 text-white'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            L1 - Low
          </button>
          <button
            onClick={() => handleFilterChange('riskLevel', 'L2')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              filters.riskLevel === 'L2'
                ? 'bg-blue-600 text-white'
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            }`}
          >
            L2 - Medium
          </button>
          <button
            onClick={() => handleFilterChange('riskLevel', 'L3')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              filters.riskLevel === 'L3'
                ? 'bg-orange-600 text-white'
                : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
            }`}
          >
            L3 - High
          </button>
          <button
            onClick={() => handleFilterChange('riskLevel', 'L4')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              filters.riskLevel === 'L4'
                ? 'bg-red-600 text-white'
                : 'bg-red-100 text-red-700 hover:bg-red-200'
            }`}
          >
            L4 - Critical
          </button>
        </div>
      </div>

      {/* Evidence Events Table */}
      <EvidenceEventsTable
        events={data.events}
        isLoading={data.isLoading}
        highlightedEventId={highlightedEventId}
        onEventClick={(event) => {
          // TODO: Open detail view
          console.log('Selected event:', event);
        }}
      />
    </div>
  );
};

export default EvidenceVault;
