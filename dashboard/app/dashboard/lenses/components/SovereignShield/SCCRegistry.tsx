'use client';

import React, { useState } from 'react';
import { Plus, ChevronDown, ChevronRight, FileText, Eye, Edit, RotateCcw, Trash2, RefreshCw } from 'lucide-react';
import { SeverityBadge } from '@/components/ui/severity-badge';
import SccWizard from './SccWizard';
import { useSccRegistries, SCCRegistryResponse } from '@/app/hooks/useSccRegistries';

interface SCCRegistryProps {
  isLoading?: boolean;
}

const SCCRegistry: React.FC<SCCRegistryProps> = ({ isLoading }) => {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All Status');
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  // Use React Query for SCC data
  const { data: sccRegistries = [], isLoading: isLoadingSCCs, isFetching, refetch } = useSccRegistries();

  const getCountryFlag = (countryCode: string): string => {
    const flags: Record<string, string> = {
      'US': '🇺🇸',
      'GB': '🇬🇧',
      'DE': '🇩🇪',
      'FR': '🇫🇷',
      'IT': '🇮🇹',
      'ES': '🇪🇸',
      'NL': '🇳🇱',
      'BE': '🇧🇪',
      'AT': '🇦🇹',
      'SE': '🇸🇪',
      'DK': '🇩🇰',
      'NO': '🇳🇴',
      'FI': '🇫🇮',
      'CH': '🇨🇭',
      'JP': '🇯🇵',
      'AU': '🇦🇺',
      'CA': '🇨🇦',
      'IN': '🇮🇳',
    };
    return flags[countryCode] || '🏳️';
  };

  const toggleRowExpansion = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const filteredSCCs = sccRegistries.filter(scc => {
    const matchesSearch = searchTerm === '' ||
      scc.partner.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scc.country.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'All Status' || scc.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusConfig = (status: string, expiryDate: string): { level: 1 | 2 | 3 | 4; label: string } => {
    const daysUntilExpiry = Math.ceil((new Date(expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry <= 0) {
      return { level: 4, label: "Critical" }; // EXPIRED
    } else if (daysUntilExpiry <= 14) {
      return { level: 4, label: "Critical" }; // ≤14 days
    } else if (daysUntilExpiry <= 60) {
      return { level: 2, label: "Warning" }; // ≤60 days
    } else {
      return { level: 1, label: "Active" }; // OK (>60 days)
    }
  };

  const getStatusSummary = () => {
    const critical = sccRegistries.filter(scc => {
      const daysUntilExpiry = Math.ceil((new Date(scc.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry <= 14 && daysUntilExpiry > 0;
    }).length;

    const warning = sccRegistries.filter(scc => {
      const daysUntilExpiry = Math.ceil((new Date(scc.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry <= 60 && daysUntilExpiry > 14;
    }).length;

    const active = sccRegistries.filter(scc => {
      const daysUntilExpiry = Math.ceil((new Date(scc.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry > 60;
    }).length;

    return { total: sccRegistries.length, critical, warning, active };
  };

  if (isLoading || isLoadingSCCs) {
    return (
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-700 rounded mb-4"></div>
          <div className="space-y-3">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="h-12 bg-slate-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const statusSummary = getStatusSummary();

  return (
    <div className={`bg-slate-800/50 border border-slate-700 rounded-lg p-6 transition-opacity duration-200 ${isFetching ? 'opacity-75' : 'opacity-100'}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-white">SCC REGISTRY</h3>
          {isFetching && (
            <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors disabled:opacity-50"
            title="Refresh SCC data"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => setIsWizardOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Register New SCC
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"
        >
          <option>All Status</option>
          <option>ACTIVE</option>
          <option>EXPIRING</option>
          <option>EXPIRED</option>
        </select>

        <input
          type="text"
          placeholder="🔍 Search partner..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm placeholder-slate-400"
        />

        <div></div> {/* Spacer */}
      </div>

      {/* Summary */}
      <div className="mb-6 p-4 bg-slate-700/50 rounded-lg">
        <div className="text-sm text-slate-400 flex items-center gap-2">
          <span>Summary: {statusSummary.total} Active SCCs</span>
          {statusSummary.critical > 0 && (
            <>
              <span>|</span>
              <SeverityBadge level={4} label={`${statusSummary.critical} Critical`} />
            </>
          )}
          {statusSummary.warning > 0 && (
            <>
              <span>|</span>
              <SeverityBadge level={2} label={`${statusSummary.warning} Warning`} />
            </>
          )}
          {statusSummary.active > 0 && (
            <>
              <span>|</span>
              <SeverityBadge level={1} label={`${statusSummary.active} Active`} />
            </>
          )}
        </div>
        <div className="text-xs text-slate-500 mt-1">
          SCC Types: C2C = Controller to Controller | C2P = Controller to Processor
        </div>
      </div>

      {/* Empty State */}
      {filteredSCCs.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 mx-auto mb-4 text-slate-600" />
          <p className="text-slate-400 mb-6">No SCC registrations found. Create your first regulatory anchor.</p>
        </div>
      ) : (
        /* Table */
        <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-600">
              <th className="text-left py-3 px-4 text-slate-400 font-medium w-8"></th>
              <th className="text-left py-3 px-4 text-slate-400 font-medium">PARTNER</th>
              <th className="text-left py-3 px-4 text-slate-400 font-medium">COUNTRY</th>
              <th className="text-left py-3 px-4 text-slate-400 font-medium">TYPE</th>
              <th className="text-left py-3 px-4 text-slate-400 font-medium">SIGNED</th>
              <th className="text-left py-3 px-4 text-slate-400 font-medium">EXPIRES</th>
              <th className="text-left py-3 px-4 text-slate-400 font-medium">STATUS</th>
            </tr>
          </thead>
          <tbody>
            {filteredSCCs.map((scc) => (
              <React.Fragment key={scc.id}>
                <tr className="border-b border-slate-700 hover:bg-slate-700/50 transition-colors">
                  <td className="py-3 px-4">
                    <button
                      onClick={() => toggleRowExpansion(scc.id)}
                      className="text-slate-400 hover:text-slate-300"
                    >
                      {expandedRows.has(scc.id) ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-slate-300 font-medium">{scc.partner}</td>
                  <td className="py-3 px-4 text-slate-300">{getCountryFlag(scc.countryCode)} {scc.country}</td>
                  <td className="py-3 px-4 text-slate-300">{scc.type}</td>
                  <td className="py-3 px-4 text-slate-300">{scc.signedDate}</td>
                  <td className="py-3 px-4 text-slate-300">{scc.expiryDate}</td>
                  <td className="py-3 px-4">
                    <SeverityBadge
                      level={getStatusConfig(scc.status, scc.expiryDate).level}
                      label={getStatusConfig(scc.status, scc.expiryDate).label}
                    />
                  </td>
                </tr>

                {/* Expanded Row */}
                {expandedRows.has(scc.id) && (
                  <tr className="bg-slate-700/30">
                    <td colSpan={7} className="py-4 px-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Contract Details */}
                        <div>
                          <h4 className="text-white font-medium mb-3">Contract Details</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-slate-400">Type:</span>
                              <span className="text-slate-300">{scc.contractDetails.contractType}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Signed:</span>
                              <span className="text-slate-300">{scc.signedDate}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Expires:</span>
                              <span className="text-slate-300">{scc.expiryDate}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">DPA ID:</span>
                              <span className="text-slate-300">{scc.contractDetails.dpaId}</span>
                            </div>
                          </div>
                        </div>

                        {/* Expiry & TIA */}
                        <div>
                          <h4 className="text-white font-medium mb-3">Expiry & Compliance</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-slate-400">Days Until Expiry:</span>
                              <span className={`font-medium ${
                                scc.daysUntilExpiry <= 0 ? 'text-red-400' :
                                scc.daysUntilExpiry <= 60 ? 'text-yellow-400' :
                                'text-green-400'
                              }`}>{scc.daysUntilExpiry <= 0 ? 'EXPIRED' : `${scc.daysUntilExpiry} days`}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">TIA Completed:</span>
                              <span className="text-slate-300">
                                {scc.contractDetails.tiaCompleted ? `Yes (${scc.contractDetails.tiaDate})` : 'No'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-3 mt-6 pt-4 border-t border-slate-600">
                        <button className="flex items-center gap-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors">
                          <FileText className="w-3 h-3" />
                          View Contract
                        </button>
                        <button className="flex items-center gap-2 px-3 py-1 bg-slate-600 hover:bg-slate-700 text-white text-sm rounded transition-colors">
                          <Edit className="w-3 h-3" />
                          Edit
                        </button>
                        <button className="flex items-center gap-2 px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white text-sm rounded transition-colors">
                          <RotateCcw className="w-3 h-3" />
                          Renew SCC
                        </button>
                        <button className="flex items-center gap-2 px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors">
                          <Trash2 className="w-3 h-3" />
                          Revoke
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
      )}

      {/* SCC Registration Wizard */}
      <SccWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onSuccess={() => {
          // React Query will automatically refetch due to invalidation in the wizard
        }}
      />
    </div>
  );
};

export default SCCRegistry;
