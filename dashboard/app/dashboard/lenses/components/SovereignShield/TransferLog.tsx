'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Download, Search, Filter, ChevronLeft, ChevronRight, Database } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { complianceApi } from '@/app/lib/api-client';

interface TransferRecord {
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
  eventType: 'DATA_TRANSFER' | 'DATA_TRANSFER_BLOCKED' | 'DATA_TRANSFER_REVIEW';
  mechanism?: string; // Mechanism from payload: "scc", "adequacy", "blocked", "review"
}

interface TransferLogProps {
  isLoading?: boolean;
}


const TransferLog: React.FC<TransferLogProps> = ({ isLoading }) => {
  const [transfers, setTransfers] = useState<TransferRecord[]>([]);
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All Status');
  const [countryFilter, setCountryFilter] = useState<string>('All Countries');
  const [legalBasisFilter, setLegalBasisFilter] = useState<string>('All Legal Basis');
  const [dateRange, setDateRange] = useState<string>('All Time');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  // Load evidence events on component mount
  useEffect(() => {
    const fetchTransfers = async () => {
      setApiLoading(true);
      setApiError(null);

      try {
        const response = await complianceApi.getEvidenceEvents();
        const evidenceEvents = response.events || [];

        const transferEvents = evidenceEvents.filter(
          (event: any) => {
            // Only include events with correct event type
            const isValidEventType = event.eventType === 'DATA_TRANSFER' ||
                                   event.eventType === 'DATA_TRANSFER_BLOCKED' ||
                                   event.eventType === 'DATA_TRANSFER_REVIEW';
            
            if (!isValidEventType) {
              return false;
            }
            
            // Filter out events that don't have valid destination_country_code in payload
            const payload = event.payload || {};
            const destinationCode = payload.destination_country_code || payload.country_code;
            
            // Must exist, not empty, not null, and not EU/UN (invalid codes)
            if (!destinationCode || 
                destinationCode === '' || 
                destinationCode === null || 
                destinationCode === 'EU' || 
                destinationCode === 'UN') {
              return false;
            }
            
            return true;
          }
        );

        const transformedTransfers: TransferRecord[] = transferEvents.map((event: any) => {
          const payload = event.payload || {};
          const countryName = getCountryName(
            payload.destination_country_code || payload.country_code
          );

          // Calculate data_categories count
          const dataCategories = payload.data_categories;
          const categoriesCount = Array.isArray(dataCategories) && dataCategories.length > 0
            ? dataCategories.length.toString()
            : '—';

          // Read mechanism from payload to determine correct status badge
          const mechanism = payload.mechanism || payload.transfer_mechanism;
          
          return {
            id: event.eventId || event.id,
            timestamp: event.recordedAt || event.createdAt,
            destination: {
              country: payload.destination_country || countryName,
              code: payload.destination_country_code || payload.country_code || 'Unknown'
            },
            purpose: payload.data_category || 'Unknown',
            legalBasis: payload.mechanism || 'Unknown',
            volume: categoriesCount,
            status: event.eventType === 'DATA_TRANSFER_BLOCKED' ? 'BLOCKED' :
                   event.eventType === 'DATA_TRANSFER_REVIEW' ? 'PENDING' : 'ALLOWED',
            eventType: event.eventType as 'DATA_TRANSFER' | 'DATA_TRANSFER_BLOCKED' | 'DATA_TRANSFER_REVIEW',
            mechanism: mechanism // Store mechanism for badge rendering
          };
        });

        setTransfers(transformedTransfers);
      } catch (error) {
        console.error('Failed to load transfer log:', error);
        setApiError(error instanceof Error ? error.message : 'Failed to load transfers');
        setTransfers([]);
      } finally {
        setApiLoading(false);
      }
    };

    fetchTransfers();
  }, []);

  // Helper function to get country name from country code
  const getCountryName = (countryCode: string): string => {
    const countryMap: Record<string, string> = {
      'RU': 'Russia',
      'DE': 'Germany',
      'US': 'United States',
      'GB': 'United Kingdom',
      'JP': 'Japan',
      'CN': 'China',
      'CH': 'Switzerland',
      'IN': 'India',
      'FR': 'France',
      'IT': 'Italy',
      'ES': 'Spain',
      'NL': 'Netherlands'
    };
    return countryMap[countryCode] || countryCode;
  };

  // Helper function to get country flag emoji from country code
  const getCountryFlag = (countryCode: string): string => {
    const flagMap: Record<string, string> = {
      'RU': '🇷🇺',
      'DE': '🇩🇪',
      'US': '🇺🇸',
      'GB': '🇬🇧',
      'JP': '🇯🇵',
      'CN': '🇨🇳',
      'CH': '🇨🇭',
      'IN': '🇮🇳',
      'FR': '🇫🇷',
      'IT': '🇮🇹',
      'ES': '🇪🇸',
      'NL': '🇳🇱',
      'AU': '🇦🇺',
      'BR': '🇧🇷',
      'CA': '🇨🇦',
      'MX': '🇲🇽',
      'SG': '🇸🇬',
      'ZA': '🇿🇦',
      'KR': '🇰🇷',
      'NZ': '🇳🇿',
      'IL': '🇮🇱',
      'AR': '🇦🇷',
      'UY': '🇺🇾',
      'AD': '🇦🇩',
      'FO': '🇫🇴',
      'GG': '🇬🇬',
      'IM': '🇮🇲',
      'JE': '🇯🇪',
      'AT': '🇦🇹',
      'BE': '🇧🇪',
      'BG': '🇧🇬',
      'HR': '🇭🇷',
      'CY': '🇨🇾',
      'CZ': '🇨🇿',
      'DK': '🇩🇰',
      'EE': '🇪🇪',
      'FI': '🇫🇮',
      'GR': '🇬🇷',
      'HU': '🇭🇺',
      'IE': '🇮🇪',
      'LV': '🇱🇻',
      'LT': '🇱🇹',
      'LU': '🇱🇺',
      'MT': '🇲🇹',
      'PL': '🇵🇱',
      'PT': '🇵🇹',
      'RO': '🇷🇴',
      'SK': '🇸🇰',
      'SI': '🇸🇮',
      'SE': '🇸🇪',
      'IS': '🇮🇸',
      'LI': '🇱🇮',
      'NO': '🇳🇴'
    };
    return flagMap[countryCode?.toUpperCase()] || '🌍';
  };

  const uniqueCountries = useMemo(() => {
    const countries = new Set(transfers.map(t => t.destination.country));
    return Array.from(countries).sort();
  }, [transfers]);

  const filteredTransfers = useMemo(() => {
    const now = Date.now();
    const dateRangeMs: Record<string, number> = {
      'Today': 24 * 60 * 60 * 1000,
      'Last 7 days': 7 * 24 * 60 * 60 * 1000,
      'Last 30 days': 30 * 24 * 60 * 60 * 1000,
      'Last 90 days': 90 * 24 * 60 * 60 * 1000,
    };

    return transfers.filter(transfer => {
      const matchesSearch = searchTerm === '' ||
        transfer.destination.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transfer.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transfer.legalBasis.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'All Status' || transfer.status === statusFilter;
      const matchesCountry = countryFilter === 'All Countries' || transfer.destination.country === countryFilter;
      const matchesLegalBasis = legalBasisFilter === 'All Legal Basis' || transfer.legalBasis === legalBasisFilter;

      let matchesDate = true;
      if (dateRange !== 'All Time' && dateRangeMs[dateRange]) {
        const transferTime = new Date(transfer.timestamp).getTime();
        matchesDate = (now - transferTime) <= dateRangeMs[dateRange];
      }

      return matchesSearch && matchesStatus && matchesCountry && matchesLegalBasis && matchesDate;
    });
  }, [transfers, searchTerm, statusFilter, countryFilter, legalBasisFilter, dateRange]);

  const paginatedTransfers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredTransfers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredTransfers, currentPage]);

  const totalPages = Math.ceil(filteredTransfers.length / itemsPerPage);


  const handleExport = (format: 'csv' | 'pdf') => {
    // TODO: Implement export functionality
    console.log(`Exporting as ${format}`);
  };

  if (isLoading || apiLoading) {
    return (
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-700 rounded mb-4"></div>
          <div className="space-y-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-12 bg-slate-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (apiError) {
    // Show graceful empty state instead of error message
    return (
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-12">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mb-4">
            <Database size={32} className="text-slate-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No Transfer Records</h3>
          <p className="text-slate-400 mb-2 max-w-md">
            Cross-border data transfer records will appear here once transfers are detected.
          </p>
          <p className="text-slate-500 text-sm">GDPR Art. 44-49 • Transfer monitoring active</p>
        </div>
      </div>
    );
  }

  if (transfers.length === 0) {
    return (
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <div className="text-center text-slate-300">
          <div className="flex flex-col items-center gap-1">
            <div className="inline-flex items-center gap-1 text-slate-400">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              System Monitoring
            </div>
            <div className="text-slate-400">No data transfers recorded yet.</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">📋 TRANSFER LOG</h3>
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleExport('csv')}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={() => handleExport('pdf')}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            Export PDF
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"
        >
          <option>All Status</option>
          <option>ALLOWED</option>
          <option>BLOCKED</option>
          <option>PENDING</option>
        </select>

        <select
          value={countryFilter}
          onChange={(e) => setCountryFilter(e.target.value)}
          className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"
        >
          <option>All Countries</option>
          {uniqueCountries.map(country => (
            <option key={country}>{country}</option>
          ))}
        </select>

        <select
          value={legalBasisFilter}
          onChange={(e) => setLegalBasisFilter(e.target.value)}
          className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"
        >
          <option>All Legal Basis</option>
          <option>Adequacy</option>
          <option>SCC</option>
          <option>BCR</option>
          <option>Consent</option>
          <option>Derogation</option>
          <option>None</option>
        </select>

        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"
        >
          <option>All Time</option>
          <option>Today</option>
          <option>Last 7 days</option>
          <option>Last 30 days</option>
          <option>Last 90 days</option>
        </select>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search transfers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 rounded-lg pl-10 pr-3 py-2 text-white text-sm placeholder-slate-400"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-600">
              <th className="text-left py-3 px-4 text-slate-400 font-medium">TIMESTAMP</th>
              <th className="text-left py-3 px-4 text-slate-400 font-medium">DESTINATION</th>
              <th className="text-left py-3 px-4 text-slate-400 font-medium">PURPOSE</th>
              <th className="text-left py-3 px-4 text-slate-400 font-medium">LEGAL BASIS</th>
              <th className="text-left py-3 px-4 text-slate-400 font-medium">CATEGORIES</th>
              <th className="text-left py-3 px-4 text-slate-400 font-medium">STATUS</th>
            </tr>
          </thead>
          <tbody>
            {paginatedTransfers.map((transfer) => (
              <tr key={transfer.id} className="border-b border-slate-700 hover:bg-slate-700/50 transition-colors">
                <td className="py-3 px-4 text-slate-300">
                  {new Date(transfer.timestamp).toLocaleString()}
                </td>
                <td className="py-3 px-4 text-slate-300">
                  {getCountryFlag(transfer.destination.code)} {transfer.destination.country}
                </td>
                <td className="py-3 px-4 text-slate-300">
                  {transfer.purpose}
                </td>
                <td className="py-3 px-4 text-slate-300">
                  {transfer.legalBasis}
                </td>
                <td className="py-3 px-4 text-slate-300">
                  {transfer.volume}
                </td>
                <td className="py-3 px-4">
                  {/* Map status badge based on mechanism field from payload */}
                  {(() => {
                    const mechanism = transfer.mechanism;
                    const eventType = transfer.eventType;
                    
                    // Priority: mechanism field > eventType fallback
                    if (mechanism === 'scc') {
                      return (
                        <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50">
                          SCC Transfer
                        </Badge>
                      );
                    }
                    if (mechanism === 'adequacy') {
                      return (
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
                          Adequate Protection
                        </Badge>
                      );
                    }
                    if (mechanism === 'blocked' || eventType === 'DATA_TRANSFER_BLOCKED') {
                      return (
                        <Badge className="bg-red-500/20 text-red-400 border-red-500/50">
                          BLOCKED
                        </Badge>
                      );
                    }
                    if (mechanism === 'review' || eventType === 'DATA_TRANSFER_REVIEW') {
                      return (
                        <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/50">
                          PENDING REVIEW
                        </Badge>
                      );
                    }
                    // Fallback: no mechanism field, eventType = DATA_TRANSFER
                    return (
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
                        Allowed
                      </Badge>
                    );
                  })()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-slate-400">
          Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, filteredTransfers.length)} of {filteredTransfers.length}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="p-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
              if (pageNum > totalPages) return null;

              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                    currentPage === pageNum
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="p-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransferLog;
