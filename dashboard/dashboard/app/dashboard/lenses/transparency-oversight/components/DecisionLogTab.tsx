"use client";

import { useState, useMemo } from "react";
import {
  Search,
  Download,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  User,
  Bot,
  Shield
} from "lucide-react";

interface DecisionLogEntry {
  id: string;
  timestamp: Date;
  decisionId: string;
  category: string;
  outcome: 'APPROVED' | 'DENIED' | 'FLAGGED' | 'PENDING';
  confidence: number;
  reviewType: 'AUTO' | 'HUMAN' | 'OVERRIDE' | 'PENDING';
  sealLevel?: 'L1' | 'L2' | 'L3';
  userId: string;
  systemName: string;
}

interface DecisionLogTabProps {
  decisionLog: DecisionLogEntry[];
}

export function DecisionLogTab({ decisionLog }: DecisionLogTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [outcomeFilter, setOutcomeFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [modelFilter, setModelFilter] = useState('ALL');
  const [dateRange, setDateRange] = useState('TODAY');

  // Get unique categories and models for filters
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(decisionLog.map(d => d.category))];
    return uniqueCategories.sort();
  }, [decisionLog]);

  const models = useMemo(() => {
    const uniqueModels = [...new Set(decisionLog.map(d => d.systemName))];
    return uniqueModels.sort();
  }, [decisionLog]);

  // Filter decisions
  const filteredDecisions = useMemo(() => {
    return decisionLog.filter(decision => {
      // Search filter
      if (searchTerm && !decision.decisionId.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !decision.userId.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      // Outcome filter
      if (outcomeFilter !== 'ALL' && decision.outcome !== outcomeFilter) {
        return false;
      }

      // Category filter
      if (categoryFilter !== 'ALL' && decision.category !== categoryFilter) {
        return false;
      }

      // Model filter
      if (modelFilter !== 'ALL' && decision.systemName !== modelFilter) {
        return false;
      }

      return true;
    });
  }, [decisionLog, searchTerm, outcomeFilter, categoryFilter, modelFilter]);

  // Calculate statistics
  const statistics = useMemo(() => {
    const total = filteredDecisions.length;
    const byOutcome = filteredDecisions.reduce((acc, decision) => {
      acc[decision.outcome] = (acc[decision.outcome] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byReviewType = filteredDecisions.reduce((acc, decision) => {
      acc[decision.reviewType] = (acc[decision.reviewType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byConfidence = filteredDecisions.reduce((acc, decision) => {
      if (decision.confidence >= 90) acc['90+'] = (acc['90+'] || 0) + 1;
      else if (decision.confidence >= 70) acc['70-89'] = (acc['70-89'] || 0) + 1;
      else acc['<70'] = (acc['<70'] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { total, byOutcome, byReviewType, byConfidence };
  }, [filteredDecisions]);

  const formatDateTime = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
      return 'Invalid date';
    }
    return dateObj.toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getOutcomeIcon = (outcome: string) => {
    switch (outcome) {
      case 'APPROVED': return <CheckCircle size={16} className="text-green-400" />;
      case 'DENIED': return <XCircle size={16} className="text-red-400" />;
      case 'FLAGGED': return <AlertTriangle size={16} className="text-yellow-400" />;
      case 'PENDING': return <Clock size={16} className="text-blue-400" />;
      default: return <Clock size={16} className="text-gray-400" />;
    }
  };

  const getReviewTypeIcon = (reviewType: string) => {
    switch (reviewType) {
      case 'AUTO': return <Bot size={14} className="text-blue-400" />;
      case 'HUMAN': return <User size={14} className="text-green-400" />;
      case 'OVERRIDE': return <Shield size={14} className="text-orange-400" />;
      case 'PENDING': return <Clock size={14} className="text-yellow-400" />;
      default: return <Bot size={14} className="text-gray-400" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-400';
    if (confidence >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getSealLevelColor = (sealLevel?: string) => {
    switch (sealLevel) {
      case 'L1': return 'text-blue-400 bg-blue-500/10';
      case 'L2': return 'text-green-400 bg-green-500/10';
      case 'L3': return 'text-purple-400 bg-purple-500/10';
      default: return 'text-gray-400 bg-gray-500/10';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">AUTOMATED DECISION LOG</h2>
        <div className="flex items-center space-x-4">
          <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2">
            <Download size={16} />
            <span>Export CSV</span>
          </button>
          <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2">
            <Download size={16} />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-slate-800/50 border border-slate-600 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by ID or user..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Outcome Filter */}
          <select
            value={outcomeFilter}
            onChange={(e) => setOutcomeFilter(e.target.value)}
            className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Outcomes</option>
            <option value="APPROVED">Approved</option>
            <option value="DENIED">Denied</option>
            <option value="FLAGGED">Flagged</option>
            <option value="PENDING">Pending</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          {/* Model Filter */}
          <select
            value={modelFilter}
            onChange={(e) => setModelFilter(e.target.value)}
            className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Models</option>
            {models.map(model => (
              <option key={model} value={model}>{model}</option>
            ))}
          </select>

          {/* Date Range */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="TODAY">Today</option>
            <option value="YESTERDAY">Yesterday</option>
            <option value="LAST_7_DAYS">Last 7 Days</option>
            <option value="LAST_30_DAYS">Last 30 Days</option>
          </select>
        </div>
      </div>

      {/* Statistics Bar */}
      <div className="bg-slate-800/50 border border-slate-600 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Today's Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* By Outcome */}
          <div>
            <h4 className="text-sm font-medium text-slate-400 mb-3">By Outcome</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-green-400">✓ Approved</span>
                <span className="text-sm font-mono">{statistics.byOutcome.APPROVED || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-red-400">✗ Denied</span>
                <span className="text-sm font-mono">{statistics.byOutcome.DENIED || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-yellow-400">⚠ Flagged</span>
                <span className="text-sm font-mono">{statistics.byOutcome.FLAGGED || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-blue-400">⏳ Pending</span>
                <span className="text-sm font-mono">{statistics.byOutcome.PENDING || 0}</span>
              </div>
            </div>
          </div>

          {/* By Review Type */}
          <div>
            <h4 className="text-sm font-medium text-slate-400 mb-3">By Review Type</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Bot size={14} className="text-blue-400" />
                  <span className="text-sm">Auto</span>
                </div>
                <span className="text-sm font-mono">{statistics.byReviewType.AUTO || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <User size={14} className="text-green-400" />
                  <span className="text-sm">Human</span>
                </div>
                <span className="text-sm font-mono">{statistics.byReviewType.HUMAN || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Shield size={14} className="text-orange-400" />
                  <span className="text-sm">Override</span>
                </div>
                <span className="text-sm font-mono">{statistics.byReviewType.OVERRIDE || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Clock size={14} className="text-yellow-400" />
                  <span className="text-sm">Pending</span>
                </div>
                <span className="text-sm font-mono">{statistics.byReviewType.PENDING || 0}</span>
              </div>
            </div>
          </div>

          {/* By Confidence */}
          <div>
            <h4 className="text-sm font-medium text-slate-400 mb-3">By Confidence</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-green-400">{'>'}90%</span>
                <span className="text-sm font-mono">{statistics.byConfidence['90+'] || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-yellow-400">70-90%</span>
                <span className="text-sm font-mono">{statistics.byConfidence['70-89'] || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-red-400">&lt;70%</span>
                <span className="text-sm font-mono text-red-400 font-semibold">
                  {statistics.byConfidence['<70'] || 0}
                  {(statistics.byConfidence['<70'] || 0) > 0 && ' ⚠️'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decision Log Table */}
      <div className="bg-slate-800/50 border border-slate-600 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-700/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Outcome
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Conf.
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Review
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Sealed
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-600">
              {filteredDecisions.slice(0, 50).map((decision) => (
                <tr key={decision.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-mono text-sm text-slate-300">
                      {formatDateTime(decision.timestamp)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <div className="font-mono text-sm text-slate-300">{decision.decisionId}</div>
                      <div className="text-xs text-slate-500">{decision.systemName}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-slate-300">{decision.category}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      {getOutcomeIcon(decision.outcome)}
                      <span className="text-sm text-slate-300 capitalize">{decision.outcome.toLowerCase()}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`font-mono text-sm font-semibold ${getConfidenceColor(decision.confidence)}`}>
                      {decision.confidence}%
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      {getReviewTypeIcon(decision.reviewType)}
                      <span className="text-sm text-slate-300 capitalize">
                        {decision.reviewType.toLowerCase()}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {decision.sealLevel ? (
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold border ${getSealLevelColor(decision.sealLevel)}`}>
                        {decision.sealLevel}
                      </span>
                    ) : (
                      <span className="text-slate-500">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredDecisions.length === 0 && (
          <div className="text-center py-12">
            <div className="text-slate-400 mb-2">No decisions match the current filters</div>
            <button
              onClick={() => {
                setSearchTerm('');
                setOutcomeFilter('ALL');
                setCategoryFilter('ALL');
                setModelFilter('ALL');
              }}
              className="text-blue-400 hover:text-blue-300 text-sm"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Pagination */}
      {filteredDecisions.length > 50 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-400">
            Showing 1-50 of {filteredDecisions.length} decisions
          </div>
          <div className="flex items-center space-x-2">
            <button className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-sm transition-colors">
              ← Prev
            </button>
            <span className="px-3 py-1 bg-blue-600 rounded text-sm">1</span>
            <span className="px-3 py-1 bg-slate-700 rounded text-sm">2</span>
            <span className="px-3 py-1 bg-slate-700 rounded text-sm">...</span>
            <button className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-sm transition-colors">
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
