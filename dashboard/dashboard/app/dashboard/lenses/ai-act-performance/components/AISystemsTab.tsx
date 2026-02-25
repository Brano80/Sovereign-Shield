'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { SeverityBadge } from '@/components/ui/severity-badge';
import {
  CheckCircle,
  AlertTriangle,
  Server,
  Eye,
  Play,
  Settings,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  TrendingUp,
  Shield,
  ShieldCheck,
  Zap,
  Activity,
  Clock,
  X,
  Loader2
} from 'lucide-react';
import { AISystem as RealAISystem } from '@/app/types/art15-performance.types';

// Local UI type for transformed systems
interface AISystem {
  id: string;
  name: string;
  displayName: string;
  riskLevel: 'HIGH' | 'LIMITED';
  status: 'HEALTHY' | 'WARNING' | 'DEGRADED';
  accuracy: number;
  accuracyTrend: number;
  robustness: number;
  robustnessTrend: number;
  security: number;
  securityTrend: number;
  latency: number;
  latencyTrend: number;
  uptime: number;
  lastCheck: string;
  nextScheduled: string;
  warning?: string;
}

interface AISystemsTabProps {
  systems: RealAISystem[];
  loading: boolean;
}

const AISystemsTab: React.FC<AISystemsTabProps> = ({ systems, loading }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedSystem, setSelectedSystem] = useState<AISystem | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Transform real systems data to component format
  const transformedSystems: AISystem[] = systems.map(system => ({
    id: system.id,
    name: system.system_id,
    displayName: system.system_name,
    riskLevel: system.eu_ai_act_risk_level === 'high_risk' ? 'HIGH' : 'LIMITED' as 'HIGH' | 'LIMITED',
    status: system.monitoring_enabled ? 'HEALTHY' : 'WARNING' as 'HEALTHY' | 'WARNING' | 'DEGRADED',
    accuracy: 92 + Math.random() * 8, // Placeholder - would come from performance metrics
    accuracyTrend: (Math.random() - 0.5) * 2, // Placeholder
    robustness: 85 + Math.random() * 10, // Placeholder
    robustnessTrend: (Math.random() - 0.5) * 4, // Placeholder
    security: 88 + Math.random() * 10, // Placeholder
    securityTrend: (Math.random() - 0.5) * 3, // Placeholder
    latency: 100 + Math.random() * 200, // Placeholder
    latencyTrend: (Math.random() - 0.5) * 20, // Placeholder
    uptime: 99.5 + Math.random() * 0.4, // Placeholder
    lastCheck: system.last_health_check ? new Date(system.last_health_check).toLocaleString() : 'Never',
    nextScheduled: 'Next monitoring cycle', // Placeholder
    warning: system.monitoring_enabled ? undefined : 'Monitoring disabled'
  }));

  const mockSystems: AISystem[] = transformedSystems;

  const filteredSystems = mockSystems.filter(system => {
    const matchesSearch = system.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         system.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRisk = riskFilter === 'all' || system.riskLevel === riskFilter;
    const matchesStatus = statusFilter === 'all' || system.status === statusFilter;
    return matchesSearch && matchesRisk && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'HEALTHY': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'WARNING': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'DEGRADED': return 'text-red-400 bg-red-500/10 border-red-500/20';
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'HEALTHY': return <CheckCircle size={16} />;
      case 'WARNING': return <AlertTriangle size={16} />;
      case 'DEGRADED': return <AlertTriangle size={16} />;
      default: return <AlertTriangle size={16} />;
    }
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <ArrowUpRight size={12} className="text-emerald-400" />;
    if (trend < 0) return <ArrowDownRight size={12} className="text-red-400" />;
    return <Minus size={12} className="text-slate-400" />;
  };

  const getTrendColor = (trend: number) => {
    if (trend > 0) return 'text-emerald-400';
    if (trend < 0) return 'text-red-400';
    return 'text-slate-400';
  };

  const getRiskSeverityLevel = (riskLevel: string): 1 | 2 | 3 | 4 => {
    switch (riskLevel.toUpperCase()) {
      case 'LIMITED':
        return 1;
      case 'HIGH':
        return 4;
      default:
        return 2;
    }
  };

  const openSystemDetail = (system: AISystem) => {
    setSelectedSystem(system);
    setShowDetailModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 size={32} className="animate-spin mx-auto mb-4 text-blue-400" />
          <p className="text-slate-400">Loading AI systems...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">MONITORED AI SYSTEMS</h2>

        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search systems..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64 bg-slate-800 border-slate-700 text-white"
            />
          </div>

          {/* Filters */}
          <Select value={riskFilter} onValueChange={setRiskFilter}>
            <SelectTrigger className="w-40 bg-slate-800 border-slate-700 text-white">
              <SelectValue placeholder="Risk Level" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-700">
              <SelectItem value="all" className="text-slate-300">All Risk Levels</SelectItem>
              <SelectItem value="HIGH" className="text-slate-300">High Risk</SelectItem>
              <SelectItem value="LIMITED" className="text-slate-300">Limited Risk</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32 bg-slate-800 border-slate-700 text-white">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-700">
              <SelectItem value="all" className="text-slate-300">All Status</SelectItem>
              <SelectItem value="HEALTHY" className="text-slate-300">Healthy</SelectItem>
              <SelectItem value="WARNING" className="text-slate-300">Warning</SelectItem>
              <SelectItem value="DEGRADED" className="text-slate-300">Degraded</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* System Cards */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {filteredSystems.map((system) => (
          <Card key={system.id} className="bg-slate-800/50 border-slate-800">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white text-lg">{system.displayName}</CardTitle>
                  <p className="text-slate-400 text-sm">{system.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-slate-400">Risk:</span>
                    <SeverityBadge level={getRiskSeverityLevel(system.riskLevel)} />
                  </div>
                </div>
                <Badge className={`flex items-center gap-1 ${getStatusColor(system.status)}`}>
                  {getStatusIcon(system.status)}
                  {system.status}
                </Badge>
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                {/* Metrics Grid */}
                <div className="grid grid-cols-5 gap-3">
                  {/* Accuracy */}
                  <div className="text-center">
                    <p className="text-xs text-slate-400 mb-1">Accuracy</p>
                    <div className="bg-slate-800 rounded-lg p-2">
                      <p className="text-white font-semibold text-sm">{system.accuracy}%</p>
                      <div className="flex items-center justify-center gap-1">
                        {getTrendIcon(system.accuracyTrend)}
                        <span className={`text-xs ${getTrendColor(system.accuracyTrend)}`}>
                          {system.accuracyTrend > 0 ? '+' : ''}{system.accuracyTrend}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Robustness */}
                  <div className="text-center">
                    <p className="text-xs text-slate-400 mb-1">Robustness</p>
                    <div className="bg-slate-800 rounded-lg p-2">
                      <p className="text-blue-400 font-semibold text-sm">{system.robustness}%</p>
                      <div className="flex items-center justify-center gap-1">
                        {getTrendIcon(system.robustnessTrend)}
                        <span className={`text-xs ${getTrendColor(system.robustnessTrend)}`}>
                          {system.robustnessTrend > 0 ? '+' : ''}{system.robustnessTrend}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Security */}
                  <div className="text-center">
                    <p className="text-xs text-slate-400 mb-1">Security</p>
                    <div className="bg-slate-800 rounded-lg p-2">
                      <p className="text-emerald-400 font-semibold text-sm">{system.security}%</p>
                      <div className="flex items-center justify-center gap-1">
                        {getTrendIcon(system.securityTrend)}
                        <span className={`text-xs ${getTrendColor(system.securityTrend)}`}>
                          {system.securityTrend > 0 ? '+' : ''}{system.securityTrend}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Latency */}
                  <div className="text-center">
                    <p className="text-xs text-slate-400 mb-1">Latency</p>
                    <div className="bg-slate-800 rounded-lg p-2">
                      <p className="text-white font-semibold text-sm">{system.latency}ms</p>
                      <div className="flex items-center justify-center gap-1">
                        {getTrendIcon(system.latencyTrend)}
                        <span className={`text-xs ${getTrendColor(system.latencyTrend)}`}>
                          {system.latencyTrend > 0 ? '+' : ''}{system.latencyTrend}ms
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Uptime */}
                  <div className="text-center">
                    <p className="text-xs text-slate-400 mb-1">Uptime</p>
                    <div className="bg-slate-800 rounded-lg p-2">
                      <p className="text-emerald-400 font-semibold text-sm">{system.uptime}%</p>
                      <div className="flex items-center justify-center">
                        <Activity size={12} className="text-emerald-400" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Warning Message */}
                {system.warning && (
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                    <p className="text-yellow-400 text-sm">⚠ {system.warning}</p>
                  </div>
                )}

                {/* Status & Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <div className="text-xs text-slate-400">
                    Last check: {system.lastCheck} │ Next: {system.nextScheduled}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openSystemDetail(system)}
                      className="border-slate-700 text-slate-300 hover:bg-slate-800"
                    >
                      <Eye size={14} className="mr-1" />
                      View Details
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-slate-700 text-slate-300 hover:bg-slate-800"
                    >
                      <Play size={14} className="mr-1" />
                      Run Check
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-slate-700 text-slate-300 hover:bg-slate-800"
                    >
                      <Settings size={14} />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* System Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-4xl bg-slate-900 border-slate-700 text-white">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <DialogTitle className="text-xl">{selectedSystem?.displayName}</DialogTitle>
                <Badge className={getStatusColor(selectedSystem?.status || '')}>
                  {getStatusIcon(selectedSystem?.status || '')}
                  {selectedSystem?.status}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDetailModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X size={16} />
              </Button>
            </div>
            <p className="text-slate-400">{selectedSystem?.name}</p>
          </DialogHeader>

          {selectedSystem && (
            <div className="space-y-6">
              {/* System Info & Current Metrics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* System Info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">SYSTEM INFO</h3>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-slate-400">ID</p>
                        <p className="text-white font-medium">{selectedSystem.id}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Risk Level</p>
                        <SeverityBadge level={getRiskSeverityLevel(selectedSystem.riskLevel)} />
                      </div>
                      <div>
                        <p className="text-slate-400">Category</p>
                        <p className="text-white">Financial</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Deployed</p>
                        <p className="text-white">2025-09-15</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Model Version</p>
                        <p className="text-white">v3.2.1</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Last Updated</p>
                        <p className="text-white">2025-12-20</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Check Frequency</p>
                      <p className="text-white">Every 15 minutes</p>
                    </div>
                  </div>
                </div>

                {/* Current Metrics */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">CURRENT METRICS</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                      <span className="text-slate-300">Accuracy</span>
                      <div className="text-right">
                        <p className="text-white font-semibold">{selectedSystem.accuracy}%</p>
                        <p className="text-slate-400 text-xs">(Target: {'>'}90%)</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                      <span className="text-slate-300">Robustness</span>
                      <div className="text-right">
                        <p className="text-blue-400 font-semibold">{selectedSystem.robustness}%</p>
                        <p className="text-slate-400 text-xs">(Target: {'>'}85%)</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                      <span className="text-slate-300">Security</span>
                      <div className="text-right">
                        <p className="text-emerald-400 font-semibold">{selectedSystem.security}%</p>
                        <p className="text-slate-400 text-xs">(Target: {'>'}90%)</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                      <span className="text-slate-300">Latency</span>
                      <div className="text-right">
                        <p className="text-white font-semibold">{selectedSystem.latency}ms</p>
                        <p className="text-slate-400 text-xs">(Target: {'<'}200ms)</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                      <span className="text-slate-300">Uptime</span>
                      <div className="text-right">
                        <p className="text-emerald-400 font-semibold">{selectedSystem.uptime}%</p>
                        <p className="text-slate-400 text-xs">(Target: {'>'}99.9%)</p>
                      </div>
                    </div>
                    <div className="text-center text-emerald-400 text-sm font-medium pt-2">
                      ✓ All metrics within target
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance History Chart Placeholder */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">PERFORMANCE HISTORY (30 days)</h3>
                <div className="h-48 flex items-center justify-center border border-slate-800 rounded-lg">
                  <div className="text-center text-slate-400">
                    <TrendingUp size={32} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Line chart: Accuracy, Robustness, Security over 30 days</p>
                  </div>
                </div>
              </div>

              {/* Threshold Configuration */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">THRESHOLD CONFIGURATION</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left text-slate-400 font-medium py-2">METRIC</th>
                        <th className="text-center text-slate-400 font-medium py-2">WARNING</th>
                        <th className="text-center text-slate-400 font-medium py-2">CRITICAL</th>
                        <th className="text-center text-slate-400 font-medium py-2">CURRENT</th>
                        <th className="text-center text-slate-400 font-medium py-2">STATUS</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-slate-800/50">
                        <td className="py-3 text-white">Accuracy</td>
                        <td className="text-center text-yellow-400">{'<'}92%</td>
                        <td className="text-center text-red-400">{'<'}90%</td>
                        <td className="text-center text-white font-medium">{selectedSystem.accuracy}%</td>
                        <td className="text-center">
                          <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                            ✓ OK
                          </Badge>
                        </td>
                      </tr>
                      <tr className="border-b border-slate-800/50">
                        <td className="py-3 text-white">Robustness</td>
                        <td className="text-center text-yellow-400">{'<'}87%</td>
                        <td className="text-center text-red-400">{'<'}85%</td>
                        <td className="text-center text-blue-400 font-medium">{selectedSystem.robustness}%</td>
                        <td className="text-center">
                          <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                            ✓ OK
                          </Badge>
                        </td>
                      </tr>
                      <tr className="border-b border-slate-800/50">
                        <td className="py-3 text-white">Security</td>
                        <td className="text-center text-yellow-400">{'<'}92%</td>
                        <td className="text-center text-red-400">{'<'}90%</td>
                        <td className="text-center text-emerald-400 font-medium">{selectedSystem.security}%</td>
                        <td className="text-center">
                          <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                            ✓ OK
                          </Badge>
                        </td>
                      </tr>
                      <tr className="border-b border-slate-800/50">
                        <td className="py-3 text-white">Latency</td>
                        <td className="text-center text-yellow-400">{'>'}150ms</td>
                        <td className="text-center text-red-400">{'>'}200ms</td>
                        <td className="text-center text-white font-medium">{selectedSystem.latency}ms</td>
                        <td className="text-center">
                          <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                            ✓ OK
                          </Badge>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 text-white">Uptime</td>
                        <td className="text-center text-yellow-400">{'<'}99.95%</td>
                        <td className="text-center text-red-400">{'<'}99.9%</td>
                        <td className="text-center text-emerald-400 font-medium">{selectedSystem.uptime}%</td>
                        <td className="text-center">
                          <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                            ✓ OK
                          </Badge>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Recent Incidents */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">RECENT INCIDENTS</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
                    <div>
                      <p className="text-white font-medium">Dec 15</p>
                      <p className="text-slate-300 text-sm">Accuracy drop to 91.2%</p>
                      <p className="text-slate-400 text-xs">Resolved │ Root cause: data drift</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
                    <div>
                      <p className="text-white font-medium">Nov 28</p>
                      <p className="text-slate-300 text-sm">Latency spike 245ms</p>
                      <p className="text-slate-400 text-xs">Resolved │ Root cause: API timeout</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800">
                  Edit Thresholds
                </Button>
                <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800">
                  Run Check Now
                </Button>
                <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800">
                  View Full History
                </Button>
                <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800">
                  Export Report
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AISystemsTab;