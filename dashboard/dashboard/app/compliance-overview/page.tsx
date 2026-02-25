"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import {
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  AlertTriangle,
  Shield,
  Eye,
  ArrowRight,
} from 'lucide-react';
import DashboardLayout from '@/app/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useIncidents } from '@/app/hooks/useIncidents';
import { useEnabledModules } from '@/app/hooks/useEnabledModules';
import { useEnforcementMode } from '@/app/hooks/useEnforcementMode';
import { LENSES, LensDef, isLensEnabled } from '../dashboard/lensRegistry';

// Mock data for recent evaluations (TODO: Replace with real API integration)
const mockEvaluations = [
  { id: "1", timestamp: new Date(), agentId: "agent-sales-01", action: "data_transfer", decision: "BLOCK", regulation: "GDPR Art. 44", evidenceId: "ev-001" },
  { id: "2", timestamp: new Date(Date.now() - 120000), agentId: "agent-hr-02", action: "process_employee_data", decision: "ALLOW", regulation: "GDPR Art. 6", evidenceId: "ev-002" },
  { id: "3", timestamp: new Date(Date.now() - 300000), agentId: "agent-risk-03", action: "credit_scoring", decision: "REVIEW", regulation: "AI Act Art. 14", evidenceId: "ev-003" },
  { id: "4", timestamp: new Date(Date.now() - 600000), agentId: "agent-support-04", action: "process_customer_query", decision: "ALLOW", regulation: "GDPR Art. 6", evidenceId: "ev-004" },
  { id: "5", timestamp: new Date(Date.now() - 900000), agentId: "agent-analytics-05", action: "biometric_identification", decision: "BLOCK", regulation: "AI Act Art. 5", evidenceId: "ev-005" },
  { id: "6", timestamp: new Date(Date.now() - 1200000), agentId: "agent-marketing-06", action: "social_scoring", decision: "BLOCK", regulation: "AI Act Art. 5", evidenceId: "ev-006" },
  { id: "7", timestamp: new Date(Date.now() - 1500000), agentId: "agent-finance-07", action: "process_payment", decision: "ALLOW", regulation: "GDPR Art. 6", evidenceId: "ev-007" },
  { id: "8", timestamp: new Date(Date.now() - 1800000), agentId: "agent-hr-02", action: "employee_profiling", decision: "REVIEW", regulation: "GDPR Art. 22", evidenceId: "ev-008" },
  { id: "9", timestamp: new Date(Date.now() - 2100000), agentId: "agent-sales-01", action: "transfer_to_us", decision: "ALLOW", regulation: "GDPR Art. 46", evidenceId: "ev-009" },
  { id: "10", timestamp: new Date(Date.now() - 2400000), agentId: "agent-risk-03", action: "risk_assessment", decision: "ALLOW", regulation: "GDPR Art. 35", evidenceId: "ev-010" },
];

// Mock data for decision summary (TODO: Replace with real API integration)
const mockDecisionSummary = {
  totalEvaluations: 1247,
  allowed: 1189,
  blocked: 42,
  underReview: 16,
};

export default function ComplianceOverviewPage() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { data: enabledModules = [], isLoading: modulesLoading } = useEnabledModules();
  const { data: incidentsData, isLoading: incidentsLoading, refetch: refetchIncidents } = useIncidents();
  const { data: enforcementModeData } = useEnforcementMode();

  const enabledModuleNames = useMemo(() => {
    return enabledModules.map((m) => m.name);
  }, [enabledModules]);

  const enabledLenses = useMemo(() => {
    return LENSES.filter((lens) => isLensEnabled(lens, enabledModuleNames));
  }, [enabledModuleNames]);

  // Count regulations from enabled modules
  const regulationCount = useMemo(() => {
    const regulations = new Set<string>();
    enabledModules.forEach((module) => {
      if (module.category === 'regulatory') {
        // Extract regulation from module name or category
        if (module.name.includes('gdpr') || module.name.includes('sovereign')) regulations.add('GDPR');
        if (module.name.includes('dora')) regulations.add('DORA');
        if (module.name.includes('ai-act') || module.name.includes('ai_act')) regulations.add('AI Act');
        if (module.name.includes('nis2')) regulations.add('NIS2');
      }
    });
    return regulations.size || enabledModules.length; // Fallback to module count
  }, [enabledModules]);

  const enforcementMode = (enforcementModeData as any)?.enforcement_mode || (enforcementModeData as any)?.runtime_mode || 'SHADOW';
  const enforcementModeLabel = enforcementMode === 'ACTIVE' ? 'Enforce Mode' : enforcementMode === 'SHADOW' ? 'Shadow Mode' : 'Monitor Mode';

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate refresh
    await Promise.all([
      refetchIncidents(),
      new Promise((resolve) => setTimeout(resolve, 1000)),
    ]);
    setIsRefreshing(false);
  };

  // Get lens status (mock for now - TODO: integrate with real evaluation data)
  const getLensStatus = (lens: LensDef): 'green' | 'amber' | 'red' | 'grey' => {
    const isEnabled = isLensEnabled(lens, enabledModuleNames);
    if (!isEnabled) return 'grey';
    
    // Mock logic: check mock evaluations for this lens's regulation
    const hasBlock = mockEvaluations.some((e) => 
      e.regulation.includes(lens.articleLabels[0]?.split(' ')[0] || '')
    );
    const hasReview = mockEvaluations.some((e) => 
      e.decision === 'REVIEW' && e.regulation.includes(lens.articleLabels[0]?.split(' ')[0] || '')
    );
    
    if (hasBlock) return 'red';
    if (hasReview) return 'amber';
    return 'green';
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-slate-950">
        {/* HEADER */}
        <div className="border-b border-slate-800 bg-slate-800/50 backdrop-blur supports-[backdrop-filter]:bg-slate-800/50">
          <div className="px-6 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">Compliance Overview</h1>
                <p className="text-slate-400 mt-1">
                  {regulationCount} {regulationCount === 1 ? 'regulation' : 'regulations'} monitored • {enforcementModeLabel}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                <RefreshCw size={14} className={`mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        <div className="px-6 py-6 space-y-6">
          {/* DECISION SUMMARY - 4 stat cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Evaluations */}
            <Card className="bg-slate-800/50 border-slate-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">TOTAL EVALUATIONS</p>
                    <p className="text-2xl font-bold text-white">{mockDecisionSummary.totalEvaluations.toLocaleString()}</p>
                    <p className="text-sm text-slate-400">Today</p>
                  </div>
                  <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                    <Activity size={16} className="text-slate-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Allowed */}
            <Card className="bg-slate-800/50 border-slate-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">ALLOWED</p>
                    <p className="text-2xl font-bold text-emerald-400">{mockDecisionSummary.allowed.toLocaleString()}</p>
                    <p className="text-sm text-slate-400">Compliant</p>
                  </div>
                  <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                    <CheckCircle size={16} className="text-emerald-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Blocked */}
            <Card className="bg-slate-800/50 border-slate-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">BLOCKED</p>
                    <p className="text-2xl font-bold text-red-400">{mockDecisionSummary.blocked.toLocaleString()}</p>
                    <p className="text-sm text-slate-400">Violations</p>
                  </div>
                  <div className="w-8 h-8 bg-red-500/10 rounded-lg flex items-center justify-center">
                    <XCircle size={16} className="text-red-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Under Review */}
            <Link href="/dashboard/review-queue">
              <Card className="bg-slate-800/50 border-slate-800 hover:bg-slate-800/70 transition-colors cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-400">UNDER REVIEW</p>
                      <p className="text-2xl font-bold text-amber-400">{mockDecisionSummary.underReview.toLocaleString()}</p>
                      <p className="text-sm text-slate-400">Pending</p>
                    </div>
                    <div className="w-8 h-8 bg-amber-500/10 rounded-lg flex items-center justify-center">
                      <Clock size={16} className="text-amber-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* ACTIVE INCIDENTS - conditional section */}
          {incidentsData && incidentsData.length > 0 && (
            <Card className="bg-slate-800/50 border-slate-800">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-white flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Active Incidents
                    <Badge variant="destructive" className="ml-2">{incidentsData.length}</Badge>
                  </CardTitle>
                  <Link href="/dashboard/incidents" className="text-sm text-slate-400 hover:text-slate-300 flex items-center gap-1">
                    View All <ArrowRight size={14} />
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {incidentsData
                    .slice(0, 5)
                    .sort((a, b) => {
                      // Sort by urgency (shortest remaining time first)
                      const aDeadline = a.deadlines?.[0]?.deadlineAt?.getTime() || 0;
                      const bDeadline = b.deadlines?.[0]?.deadlineAt?.getTime() || 0;
                      return aDeadline - bDeadline;
                    })
                    .map((incident) => {
                      const timeRemaining = incident.deadlines?.[0]?.deadlineAt
                        ? formatDistanceToNow(incident.deadlines[0].deadlineAt, { addSuffix: true })
                        : 'No deadline';
                      
                      const severityBadgeColor =
                        incident.severity === 'CRITICAL' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                        incident.severity === 'HIGH' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                        incident.severity === 'MEDIUM' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                        'bg-slate-500/10 text-slate-400 border-slate-500/20';

                      const regulationBadgeColor =
                        incident.regulation === 'GDPR' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                        incident.regulation === 'DORA' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                        incident.regulation === 'NIS2' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' :
                        'bg-slate-500/10 text-slate-400 border-slate-500/20';

                      return (
                        <div
                          key={incident.id}
                          className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors"
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <Badge className={severityBadgeColor}>
                              {incident.severity}
                            </Badge>
                            <Badge className={regulationBadgeColor}>
                              {incident.regulation}
                            </Badge>
                            <span className="text-sm text-slate-300 flex-1 truncate">
                              {incident.title || incident.description}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-slate-400">
                              <Clock size={14} className="inline mr-1" />
                              {timeRemaining}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {incident.status}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* MODULE STATUS GRID - 3×3 grid of lens cards */}
          <Card className="bg-slate-800/50 border-slate-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-white">Module Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {LENSES.map((lens) => {
                  const status = getLensStatus(lens);
                  const isEnabled = isLensEnabled(lens, enabledModuleNames);
                  
                  const statusConfig = {
                    green: { dot: 'bg-emerald-500', text: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'All ALLOW today' },
                    amber: { dot: 'bg-amber-500', text: 'text-amber-400', bg: 'bg-amber-500/10', label: 'Has REVIEW' },
                    red: { dot: 'bg-red-500', text: 'text-red-400', bg: 'bg-red-500/10', label: 'Has BLOCK' },
                    grey: { dot: 'bg-slate-500', text: 'text-slate-400', bg: 'bg-slate-500/10', label: 'Disabled' },
                  }[status];

                  const regulationTag = lens.articleLabels[0]?.split(' ')[0] || 'N/A';

                  return (
                    <Link key={lens.lensId} href={lens.href}>
                      <Card className={`bg-slate-900/50 border-slate-700 hover:border-slate-600 transition-colors cursor-pointer ${!isEnabled ? 'opacity-50' : ''}`}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h3 className="text-sm font-semibold text-white mb-1">{lens.title}</h3>
                              <p className="text-xs text-slate-400 mb-2">{lens.subtitle}</p>
                              <Badge variant="outline" className="text-xs">
                                {regulationTag}
                              </Badge>
                            </div>
                            <div className={`w-3 h-3 rounded-full ${statusConfig.dot}`} title={statusConfig.label} />
                          </div>
                          <div className="mt-3 pt-3 border-t border-slate-700">
                            <div className="flex items-center justify-between text-xs">
                              <span className={`${statusConfig.text}`}>{statusConfig.label}</span>
                              <span className="text-slate-500">
                                {isEnabled ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                            {/* Mock last evaluation time */}
                            <div className="text-xs text-slate-500 mt-1">
                              Last: {isEnabled ? formatDistanceToNow(new Date(Date.now() - Math.random() * 3600000), { addSuffix: true }) : 'Never'}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* RECENT EVALUATIONS - table */}
          <Card className="bg-slate-800/50 border-slate-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-white">Recent Evaluations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-2 px-3 text-xs font-semibold text-slate-400">Time</th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-slate-400">Agent</th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-slate-400">Action</th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-slate-400">Decision</th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-slate-400">Regulation</th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-slate-400">Evidence ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockEvaluations.map((evaluation) => {
                      const decisionBadgeColor =
                        evaluation.decision === 'ALLOW' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        evaluation.decision === 'BLOCK' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                        'bg-amber-500/10 text-amber-400 border-amber-500/20';

                      return (
                        <tr key={evaluation.id} className="border-b border-slate-800 hover:bg-slate-900/50 transition-colors">
                          <td className="py-2 px-3 text-xs text-slate-400">
                            {formatDistanceToNow(evaluation.timestamp, { addSuffix: true })}
                          </td>
                          <td className="py-2 px-3 text-xs text-slate-300">{evaluation.agentId}</td>
                          <td className="py-2 px-3 text-xs text-slate-300">{evaluation.action}</td>
                          <td className="py-2 px-3">
                            <Badge className={decisionBadgeColor}>
                              {evaluation.decision}
                            </Badge>
                          </td>
                          <td className="py-2 px-3 text-xs text-slate-300">{evaluation.regulation}</td>
                          <td className="py-2 px-3">
                            <Link
                              href={`/dashboard/evidence?id=${evaluation.evidenceId}`}
                              className="text-xs text-blue-400 hover:text-blue-300 underline"
                            >
                              {evaluation.evidenceId}
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* EVIDENCE INTEGRITY - footer card */}
          <Card className="bg-slate-800/50 border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-emerald-400" />
                    <span className="text-sm text-white font-medium">Evidence Chain: ✓ Verified</span>
                  </div>
                  <span className="text-sm text-slate-400">
                    {mockDecisionSummary.totalEvaluations.toLocaleString()} sealed events
                  </span>
                  <span className="text-sm text-slate-500">
                    Last seal: {formatDistanceToNow(new Date(), { addSuffix: true })}
                  </span>
                </div>
                <Link href="/dashboard/evidence">
                  <Button variant="outline" size="sm" className="border-slate-700 text-slate-300 hover:bg-slate-800">
                    Open Evidence Vault <ArrowRight size={14} className="ml-2" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
