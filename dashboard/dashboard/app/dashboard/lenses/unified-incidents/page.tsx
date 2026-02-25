"use client";

import { useState } from "react";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity,
  Shield,
  Zap,
  Globe,
  FileText,
  TrendingUp,
  TrendingDown,
  Plus,
  Download,
  RefreshCw,
  ChevronDown
} from 'lucide-react';

// Core imports
import { useIncidents } from './hooks/useIncidents';
import { useDeadlines } from './hooks/useDeadlines';
import { RegulationBadge } from './components/RegulationBadge';
import { OverviewTab } from './tabs/OverviewTab';
import { AllIncidentsTab } from './tabs/AllIncidentsTab';
import { RegulatoryClockTab } from './tabs/RegulatoryClockTab';
import { ReportingTab } from './tabs/ReportingTab';
import { PatternAnalysisTab } from './tabs/PatternAnalysisTab';
import { RootCauseTab } from './tabs/RootCauseTab';
import { NewIncidentWizard } from './modals/NewIncidentWizard';

// Mock data for empty state
const emptyStats = {
  totalIncidents: 0,
  activeIncidents: 0,
  criticalIncidents: 0,
  overdueIncidents: 0,
  avgResponseTime: 0,
  slaCompliance: 0,
  gdprDeadlines: 0,
  doraDeadlines: 0,
  nis2Deadlines: 0,
  aiActIncidents: 0
};

export default function UnifiedIncidentsPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [showNewIncidentModal, setShowNewIncidentModal] = useState(false);
  const { data, stats, loading, error, refreshing, refreshData } = useIncidents();

  // Use real data if available, otherwise empty stats
  const displayStats = stats || emptyStats;

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-800/50 backdrop-blur supports-[backdrop-filter]:bg-slate-800/50">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">UNIFIED INCIDENTS</h1>
              <p className="text-slate-400 mt-1">GDPR Art. 33-34 • DORA Art. 13-19 • NIS2 Art. 23 • AI Act Art. 11-12, 62</p>

              {/* Status Summary */}
              <div className="mt-6 flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-400">Status:</span>
                  <span className="text-lg font-semibold text-white">
                    {displayStats.criticalIncidents > 0 ? `${displayStats.criticalIncidents} CRITICAL DEADLINES` : 'All Systems Operational'}
                  </span>
                  {displayStats.criticalIncidents > 0 && (
                    <AlertTriangle className="h-4 w-4 text-red-400" />
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-400">
                  <span>Active: {displayStats.activeIncidents}</span>
                  <span>Investigating: 5</span>
                  <span>Overdue: {displayStats.overdueIncidents}</span>
                  <span>Last update: 2 min ago</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={refreshData}
                disabled={refreshing}
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                <RefreshCw size={14} className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
                onClick={() => setShowNewIncidentModal(true)}
              >
                <Plus size={14} className="mr-2" />
                New Incident
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-slate-700 text-slate-300 hover:bg-slate-800"
                  >
                    <Download size={14} className="mr-2" />
                    Export <ChevronDown size={14} className="ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-slate-900 border-slate-700">
                  <DropdownMenuItem className="text-slate-300 hover:bg-slate-800" onClick={() => {
                    console.log('[Unified Incidents] Export All Incidents as CSV');
                    alert('CSV export coming soon — data will be exported from /api/v1/incidents/unified');
                  }}>
                    <FileText size={14} className="mr-2" />
                    Export All Incidents (CSV)
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-slate-300 hover:bg-slate-800" onClick={() => {
                    console.log('[Unified Incidents] Export Deadlines as CSV');
                    alert('CSV export coming soon — data will be exported from /api/v1/incidents/deadlines');
                  }}>
                    <FileText size={14} className="mr-2" />
                    Export Deadlines (CSV)
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-slate-300 hover:bg-slate-800" onClick={() => {
                    console.log('[Unified Incidents] Export Compliance Report as PDF');
                    alert('PDF export coming soon — compliance report will be generated from incident data');
                  }}>
                    <Activity size={14} className="mr-2" />
                    Compliance Report (PDF)
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="px-6 py-6 border-b border-slate-800">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Row 1 - Operational Metrics */}
          <Card className="bg-slate-800/50 border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">TOTAL INCIDENTS</p>
                  <p className="text-2xl font-bold text-white">{displayStats.totalIncidents}</p>
                  <p className="text-sm text-emerald-400">↗ 12% This quarter</p>
                </div>
                <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                  <Activity className="h-4 w-4 text-slate-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">ACTIVE INCIDENTS</p>
                  <p className="text-2xl font-bold text-white">{displayStats.activeIncidents}</p>
                  <p className="text-sm text-orange-400">{displayStats.criticalIncidents} critical Requiring action</p>
                </div>
                <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="h-4 w-4 text-slate-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">AVG RESPONSE TIME</p>
                  <p className="text-2xl font-bold text-white">{displayStats.avgResponseTime}h</p>
                  <p className="text-sm text-red-400">↘ 18% vs. last month</p>
                </div>
                <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                  <Clock className="h-4 w-4 text-slate-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">SLA COMPLIANCE</p>
                  <p className="text-2xl font-bold text-white">{displayStats.slaCompliance}%</p>
                  <p className="text-sm text-emerald-400">↗ 3.1% On-time reports</p>
                </div>
                <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-slate-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Row 2 - Regulatory Deadlines */}
          <Card className="bg-slate-800/50 border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">GDPR 72h DEADLINES</p>
                  <p className="text-2xl font-bold text-white">{displayStats.gdprDeadlines}</p>
                  <p className="text-sm text-orange-400">1 urgent Data breaches</p>
                </div>
                <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                  <Shield className="h-4 w-4 text-slate-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">DORA 4h/24h/72h</p>
                  <p className="text-2xl font-bold text-white">{displayStats.doraDeadlines}</p>
                  <p className="text-sm text-red-400">1 overdue Major ICT incidents</p>
                </div>
                <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                  <Activity className="h-4 w-4 text-slate-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">NIS2 24h/72h</p>
                  <p className="text-2xl font-bold text-white">{displayStats.nis2Deadlines}</p>
                  <p className="text-sm text-emerald-400">On track Significant incidents</p>
                </div>
                <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                  <Globe className="h-4 w-4 text-slate-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">AI ACT SERIOUS</p>
                  <p className="text-2xl font-bold text-white">{displayStats.aiActIncidents}</p>
                  <p className="text-sm text-emerald-400">✓ Clean High-risk AI incidents</p>
                </div>
                <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                  <Zap className="h-4 w-4 text-slate-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="px-6 py-4 border-b border-slate-800">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 bg-slate-800/50 border border-slate-800">
            <TabsTrigger value="overview" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white">
              Overview
            </TabsTrigger>
            <TabsTrigger value="all-incidents" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white">
              All Incidents
            </TabsTrigger>
            <TabsTrigger value="regulatory-clock" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white">
              Regulatory Clock
            </TabsTrigger>
            <TabsTrigger value="reporting" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white">
              Reporting
            </TabsTrigger>
            <TabsTrigger value="pattern-analysis" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white">
              Pattern Analysis
            </TabsTrigger>
            <TabsTrigger value="root-cause" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white">
              Root Cause
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <OverviewTab data={{ incidents: data?.incidents || [], deadlines: data?.deadlines || [] }} loading={loading} />
          </TabsContent>

          <TabsContent value="all-incidents" className="mt-6">
            <AllIncidentsTab />
          </TabsContent>

          <TabsContent value="regulatory-clock" className="mt-6">
            <RegulatoryClockTab />
          </TabsContent>

          <TabsContent value="reporting" className="mt-6">
            <ReportingTab />
          </TabsContent>

          <TabsContent value="pattern-analysis" className="mt-6">
            <PatternAnalysisTab />
          </TabsContent>

          <TabsContent value="root-cause" className="mt-6">
            <RootCauseTab />
          </TabsContent>
        </Tabs>
      </div>

      {/* New Incident Wizard Modal */}
      {showNewIncidentModal && (
        <NewIncidentWizard
          onClose={() => setShowNewIncidentModal(false)}
          onComplete={() => {
            setShowNewIncidentModal(false);
            refreshData();
          }}
        />
      )}
    </div>
  );
}
