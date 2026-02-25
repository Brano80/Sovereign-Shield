"use client";

import { useState, useMemo } from "react";
import {
  Plus,
  Settings,
  BarChart3,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Zap,
  Eye,
  Edit
} from "lucide-react";

interface AISystem {
  id: string;
  name: string;
  systemId: string;
  riskLevel: 'HIGH' | 'LIMITED' | 'MINIMAL';
  category: string;
  decisionsToday: number;
  overrideRate?: number;
  disclosureStatus: 'ACTIVE' | 'MISSING' | 'EXPIRED';
  lastAudit: Date;
  provider: string;
  modelVersion: string;
  deployedDate: Date;
  friaCompleted: boolean;
  friaDate?: Date;
  reviewTriggers: string[];
  disclosureTemplate?: string;
}

interface AISystemsTabProps {
  aiSystems: AISystem[];
  showSystemDetail: AISystem | null;
  setShowSystemDetail: (system: AISystem | null) => void;
}

export function AISystemsTab({
  aiSystems,
  showSystemDetail,
  setShowSystemDetail
}: AISystemsTabProps) {
  const [selectedRiskLevel, setSelectedRiskLevel] = useState<'ALL' | 'HIGH' | 'LIMITED' | 'MINIMAL'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Group systems by risk level
  const groupedSystems = useMemo(() => {
    let filtered = aiSystems;

    // Apply filters
    if (selectedRiskLevel !== 'ALL') {
      filtered = filtered.filter(system => system.riskLevel === selectedRiskLevel);
    }
    if (selectedCategory !== 'ALL') {
      filtered = filtered.filter(system => system.category === selectedCategory);
    }
    if (selectedStatus !== 'ALL') {
      filtered = filtered.filter(system => system.disclosureStatus === selectedStatus);
    }

    return filtered.reduce((acc, system) => {
      if (!acc[system.riskLevel]) {
        acc[system.riskLevel] = [];
      }
      acc[system.riskLevel].push(system);
      return acc;
    }, {} as Record<string, AISystem[]>);
  }, [aiSystems, selectedRiskLevel, selectedCategory, selectedStatus]);

  // Get unique categories for filter
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(aiSystems.map(system => system.category))];
    return uniqueCategories.sort();
  }, [aiSystems]);

  const getRiskLevelIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'HIGH': return '🟠';
      case 'LIMITED': return '🟡';
      case 'MINIMAL': return '🟢';
      default: return '⚪';
    }
  };

  const getRiskLevelBadge = (riskLevel: string) => {
    const colors = {
      HIGH: 'bg-red-500/20 text-red-400 border-red-500/30',
      LIMITED: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      MINIMAL: 'bg-green-500/20 text-green-400 border-green-500/30'
    };
    return colors[riskLevel as keyof typeof colors] || colors.MINIMAL;
  };

  const getDisclosureStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE': return <CheckCircle size={16} className="text-green-400" />;
      case 'MISSING': return <AlertTriangle size={16} className="text-red-400" />;
      case 'EXPIRED': return <Clock size={16} className="text-yellow-400" />;
      default: return <Clock size={16} className="text-gray-400" />;
    }
  };

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
      return 'Invalid date';
    }
    return dateObj.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const riskLevelOrder = ['HIGH', 'LIMITED', 'MINIMAL'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">REGISTERED AI SYSTEMS</h2>
        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2">
          <Plus size={16} />
          <span>Register System</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-slate-800/50 border border-slate-600 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            value={selectedRiskLevel}
            onChange={(e) => setSelectedRiskLevel(e.target.value as any)}
            className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Risk Levels</option>
            <option value="HIGH">High Risk</option>
            <option value="LIMITED">Limited Risk</option>
            <option value="MINIMAL">Minimal Risk</option>
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="MISSING">Missing</option>
            <option value="EXPIRED">Expired</option>
          </select>
        </div>
      </div>

      {/* Systems by Risk Level */}
      <div className="space-y-8">
        {riskLevelOrder.map((riskLevel) => {
          const systems = groupedSystems[riskLevel] || [];
          if (systems.length === 0) return null;

          return (
            <div key={riskLevel} className="space-y-4">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{getRiskLevelIcon(riskLevel)}</span>
                <h3 className="text-xl font-semibold">
                  {riskLevel === 'HIGH' ? 'HIGH-RISK' :
                   riskLevel === 'LIMITED' ? 'LIMITED RISK' :
                   'MINIMAL RISK'}
                </h3>
                <span className="text-slate-400">({systems.length} systems)</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {systems.map((system) => (
                  <div
                    key={system.id}
                    className="bg-slate-800/50 border border-slate-600 rounded-lg p-6 hover:bg-slate-800/70 transition-colors cursor-pointer"
                    onClick={() => setShowSystemDetail(system)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-semibold text-white text-lg">{system.name}</h4>
                        <p className="text-sm text-slate-400">{system.systemId}</p>
                      </div>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getRiskLevelBadge(system.riskLevel)}`}>
                        {system.riskLevel}
                      </span>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-400">Decisions Today</span>
                        <span className="text-lg font-bold text-white">{system.decisionsToday.toLocaleString()}</span>
                      </div>

                      {system.overrideRate !== undefined && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-400">Override Rate</span>
                          <span className={`text-sm font-semibold ${
                            system.overrideRate > 10 ? 'text-red-400' :
                            system.overrideRate > 5 ? 'text-yellow-400' :
                            'text-green-400'
                          }`}>
                            {system.overrideRate}%
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-400">Disclosure</span>
                        <div className="flex items-center space-x-1">
                          {getDisclosureStatusIcon(system.disclosureStatus)}
                          <span className="text-sm capitalize">{system.disclosureStatus.toLowerCase()}</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-400">Last Audit</span>
                        <span className="text-sm text-slate-300">{formatDate(system.lastAudit)}</span>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        className="flex-1 px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm font-medium transition-colors flex items-center justify-center space-x-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Handle configure
                        }}
                      >
                        <Settings size={14} />
                        <span>Configure</span>
                      </button>
                      <button
                        className="flex-1 px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm font-medium transition-colors flex items-center justify-center space-x-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Handle view stats
                        }}
                      >
                        <BarChart3 size={14} />
                        <span>View Stats</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {Object.keys(groupedSystems).length === 0 && (
        <div className="text-center py-12">
          <div className="text-slate-400 mb-4">No AI systems match the current filters</div>
          <button
            onClick={() => {
              setSelectedRiskLevel('ALL');
              setSelectedCategory('ALL');
              setSelectedStatus('ALL');
            }}
            className="text-blue-400 hover:text-blue-300 text-sm"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}

// AI System Detail Modal Component
interface AISystemDetailModalProps {
  system: AISystem;
  onClose: () => void;
}

export function AISystemDetailModal({ system, onClose }: AISystemDetailModalProps) {
  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
      return 'Invalid date';
    }
    return dateObj.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <h2 className="text-2xl font-bold">{system.name}</h2>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${getRiskLevelBadge(system.riskLevel)}`}>
              {system.riskLevel} RISK
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* System Info & Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* System Info */}
            <div className="bg-slate-800/50 border border-slate-600 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">SYSTEM INFO</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Risk Level:</span>
                  <span className={`font-semibold ${system.riskLevel === 'HIGH' ? 'text-red-400' :
                                                   system.riskLevel === 'LIMITED' ? 'text-yellow-400' :
                                                   'text-green-400'}`}>
                    {system.riskLevel}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Category:</span>
                  <span className="text-white">{system.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Provider:</span>
                  <span className="text-white">{system.provider}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Model Version:</span>
                  <span className="text-white font-mono">{system.modelVersion}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Deployed:</span>
                  <span className="text-white">{formatDate(system.deployedDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">FRIA Completed:</span>
                  <span className={`font-semibold ${system.friaCompleted ? 'text-green-400' : 'text-red-400'}`}>
                    {system.friaCompleted ? '✓ Yes' : '✗ No'}
                  </span>
                </div>
                {system.friaDate && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">FRIA Date:</span>
                    <span className="text-white">{formatDate(system.friaDate)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Performance (30 days) */}
            <div className="bg-slate-800/50 border border-slate-600 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">PERFORMANCE (30 days)</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Decisions:</span>
                  <span className="text-white font-bold">12,847</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Auto-Approved:</span>
                  <span className="text-green-400">11,234 (87%)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Human Reviewed:</span>
                  <span className="text-blue-400">1,613 (13%)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Overridden:</span>
                  <span className="text-orange-400">312 (2.4%)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Appeals:</span>
                  <span className="text-yellow-400">45 (0.4%)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Avg Confidence:</span>
                  <span className="text-purple-400">84.2%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Avg Review Time:</span>
                  <span className="text-cyan-400">3.8 min</span>
                </div>
              </div>
            </div>
          </div>

          {/* Human Oversight Configuration */}
          <div className="bg-slate-800/50 border border-slate-600 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">HUMAN OVERSIGHT CONFIGURATION (Art. 14)</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3">Review Triggers</h4>
                <div className="space-y-2">
                  {[
                    { label: 'Confidence below 75%', checked: system.reviewTriggers.includes('confidence_below_75') },
                    { label: 'Decision affects >€10,000', checked: system.reviewTriggers.includes('high_value') },
                    { label: 'User flagged as vulnerable', checked: system.reviewTriggers.includes('vulnerable_user') },
                    { label: 'Appeal requested', checked: system.reviewTriggers.includes('appeal_requested') },
                    { label: 'All denials (currently: only high-value)', checked: system.reviewTriggers.includes('all_denials') }
                  ].map((trigger, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={trigger.checked}
                        readOnly
                        className="rounded border-slate-600 text-blue-600"
                      />
                      <span className="text-sm text-slate-300">{trigger.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Auto-Escalation</h4>
                <div className="space-y-2 text-sm text-slate-300">
                  <div>• After 30 min → Notify team lead</div>
                  <div>• After 1 hour → Escalate to compliance</div>
                  <div>• After 2 hours → SLA breach alert</div>
                </div>
              </div>
            </div>
          </div>

          {/* Transparency Disclosures */}
          <div className="bg-slate-800/50 border border-slate-600 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">TRANSPARENCY DISCLOSURES (Art. 13, 50, 52)</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3">Required Elements</h4>
                <div className="space-y-2">
                  {[
                    { label: 'AI involvement statement', checked: true },
                    { label: 'Purpose of processing', checked: true },
                    { label: 'Logic involved (plain language)', checked: true },
                    { label: 'Significance and consequences', checked: true },
                    { label: 'Right to human review', checked: true },
                    { label: 'Right to contest decision', checked: true },
                    { label: 'Right to explanation', checked: true },
                    { label: 'Contact information', checked: true }
                  ].map((element, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <span className={`text-sm ${element.checked ? 'text-green-400' : 'text-red-400'}`}>
                        {element.checked ? '☑' : '☐'}
                      </span>
                      <span className="text-sm text-slate-300">{element.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Disclosure Template</h4>
                <div className="bg-slate-800/50 border border-slate-600 rounded p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-400">Template:</span>
                    <span className="text-sm text-blue-400">{system.disclosureTemplate || 'credit-disclosure-v2'}</span>
                  </div>
                  <button className="w-full px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm font-medium transition-colors">
                    Edit Template
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-slate-700">
            <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2">
              <BarChart3 size={16} />
              <span>View Full Analytics</span>
            </button>
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2">
              <Edit size={16} />
              <span>Edit Configuration</span>
            </button>
            <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2">
              <Eye size={16} />
              <span>Export Documentation</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function getRiskLevelBadge(riskLevel: string) {
  const colors = {
    HIGH: 'bg-red-500/20 text-red-400 border-red-500/30',
    LIMITED: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    MINIMAL: 'bg-green-500/20 text-green-400 border-green-500/30'
  };
  return colors[riskLevel as keyof typeof colors] || colors.MINIMAL;
}
