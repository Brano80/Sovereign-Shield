'use client';

import React, { useState, useEffect } from 'react';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Plus,
  Download,
  ChevronDown,
  Eye,
  BarChart3,
  FileText,
  Shield,
  ShieldCheck,
  Zap,
  Archive,
  Activity,
  TrendingUp,
  Server,
  Clock,
  Crosshair,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

// Import data hooks
import {
  useArticle15Dashboard,
  useArticle15Systems,
  useArticle15Alerts,
  useArticle15Export
} from '../../../hooks/useArticle15Data';

// Import tab components
import OverviewTab from './components/OverviewTab';
import AISystemsTab from './components/AISystemsTab';
import AccuracyTab from './components/AccuracyTab';
import DriftDetectionTab from './components/DriftDetectionTab';
import SecurityTab from './components/SecurityTab';
import AddSystemModal from './components/AddSystemModal';

const AIActPerformance: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddSystemModal, setShowAddSystemModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Use real data hooks
  const { dashboardData, loading: dashboardLoading, error: dashboardError, refetch: refetchDashboard, lastUpdated } = useArticle15Dashboard();
  const { systems, loading: systemsLoading, error: systemsError } = useArticle15Systems();
  const { alerts, loading: alertsLoading } = useArticle15Alerts();
  const { exportReport, exporting } = useArticle15Export();

  // Extract dashboard values safely with defaults to prevent null reference errors
  const { total_systems = 0, compliance_score = 0, drift_alerts = 0, systems_monitoring = 0 } = dashboardData || {};

  // Convert dashboard data to the expected format for backward compatibility
  const stats = {
    avgAccuracy: compliance_score * 100,
    accuracyTrend: 1.2, // Would be calculated from historical data
    modelDriftAlerts: drift_alerts,
    systemsDegraded: 0, // Would be calculated from system health
    totalSystems: total_systems,
    incidents30Days: 2, // Would come from incident data
    incidentsResolved: 2, // Would come from incident data
    robustnessScore: 87, // Would be calculated from robustness tests
    robustnessTrend: 3, // Would be calculated from historical data
    securityScore: 92, // Would be calculated from security events
    securityTrend: 5, // Would be calculated from historical data
    uptime30Days: 99.94, // Would come from system monitoring
    latencyP95: 124, // Would come from performance metrics
    latencyTrend: -8, // Would be calculated from historical data
    lastCheck: lastUpdated ? `${Math.floor((Date.now() - lastUpdated.getTime()) / 1000 / 60)} min ago` : 'Never',
    status: compliance_score > 0.8 ? 'COMPLIANT' : compliance_score > 0.6 ? 'WARNING' : 'NON-COMPLIANT'
  };

  const complianceStatus = {
    status: compliance_score > 0.8 ? 'COMPLIANT' : compliance_score > 0.6 ? 'WARNING' : 'NON-COMPLIANT',
    systemsMonitored: systems_monitoring,
    driftAlerts: drift_alerts,
    lastCheck: lastUpdated ? `${Math.floor((Date.now() - lastUpdated.getTime()) / 1000 / 60)} min ago` : 'Never'
  };

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await refetchDashboard();
      toast.success('Dashboard data refreshed');
    } catch (error) {
      toast.error('Failed to refresh dashboard data');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleExport = async (format: 'pdf' | 'csv' | 'json') => {
    try {
      const downloadUrl = await exportReport(format);
      if (downloadUrl) {
        // In a real implementation, trigger download or open URL
        window.open(downloadUrl, '_blank');
        toast.success(`${format.toUpperCase()} report exported successfully`);
      }
    } catch (error) {
      toast.error(`Failed to export ${format.toUpperCase()} report`);
    }
  };

  const getComplianceStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLIANT':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'NON-COMPLIANT':
        return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'WARNING':
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      default:
        return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  };

  const getComplianceStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLIANT':
        return <CheckCircle size={16} />;
      case 'NON-COMPLIANT':
        return <XCircle size={16} />;
      case 'WARNING':
        return <AlertTriangle size={16} />;
      default:
        return <AlertTriangle size={16} />;
    }
  };

  // Global safety net: Prevent rendering if data is loading
  if (dashboardLoading || systemsLoading || alertsLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
        <p className="mt-4 text-slate-400">Loading Article 15 Metrics...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-800/50 backdrop-blur supports-[backdrop-filter]:bg-slate-800/50">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">AI PERFORMANCE MONITORING</h1>
              <p className="text-slate-400 mt-1">EU AI Act Article 15 • Accuracy, Robustness & Cybersecurity</p>
            </div>

            <div className="flex items-center gap-3">
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

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddSystemModal(true)}
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                <Plus size={14} className="mr-2" />
                + Add System
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
                  <DropdownMenuItem
                    className="text-slate-300 hover:bg-slate-800"
                    onClick={() => handleExport('pdf')}
                    disabled={exporting}
                  >
                    {exporting ? (
                      <Loader2 size={14} className="mr-2 animate-spin" />
                    ) : (
                      <FileText size={14} className="mr-2" />
                    )}
                    Performance Report (PDF)
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-slate-300 hover:bg-slate-800"
                    onClick={() => handleExport('csv')}
                    disabled={exporting}
                  >
                    {exporting ? (
                      <Loader2 size={14} className="mr-2 animate-spin" />
                    ) : (
                      <BarChart3 size={14} className="mr-2" />
                    )}
                    All Metrics (CSV)
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-slate-300 hover:bg-slate-800"
                    onClick={() => handleExport('json')}
                    disabled={exporting}
                  >
                    {exporting ? (
                      <Loader2 size={14} className="mr-2 animate-spin" />
                    ) : (
                      <ShieldCheck size={14} className="mr-2" />
                    )}
                    Compliance Summary (JSON)
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-slate-300 hover:bg-slate-800">
                    <Clock size={14} className="mr-2" />
                    Schedule Report...
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Status Banner */}
          {complianceStatus && (
            <div className="mt-6 flex items-center gap-4">
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium ${getComplianceStatusColor(complianceStatus.status)}`}>
                {getComplianceStatusIcon(complianceStatus.status)}
                Status: {complianceStatus.status}
              </div>

              <div className="text-sm text-slate-400">
                Systems: <span className="text-slate-300 font-medium">{complianceStatus.systemsMonitored ?? 0} monitored</span> │
                Drift alerts: <span className="text-slate-300 font-medium">{complianceStatus.driftAlerts ?? 0}</span> │
                Last check: <span className="text-slate-300 font-medium">{complianceStatus.lastCheck}</span>
              </div>
            </div>
          )}

          {/* Error Display */}
          {(dashboardError || systemsError) && (
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <div className="flex items-center gap-2 text-red-400">
                <AlertTriangle size={16} />
                <span className="font-medium">Error loading data</span>
              </div>
              <p className="text-sm text-red-300 mt-1">
                {dashboardError || systemsError}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                className="mt-2 border-red-500/20 text-red-400 hover:bg-red-500/10"
              >
                Retry
              </Button>
            </div>
          )}

          {/* Loading State */}
          {dashboardLoading && (
            <div className="mt-6 flex items-center gap-2 text-slate-400">
              <Loader2 size={16} className="animate-spin" />
              <span>Loading dashboard data...</span>
            </div>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="px-6 py-6 border-b border-slate-800">
        {/* Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="bg-slate-800/50 border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">AVG ACCURACY</p>
                  <p className="text-2xl font-bold text-white">{stats.avgAccuracy.toFixed(1)}%</p>
                  <p className="text-sm text-emerald-400">↗ {stats.accuracyTrend.toFixed(1)}%</p>
                  <p className="text-xs text-slate-500 mt-1">Target: {'>'}90%</p>
                </div>
                <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                  <Crosshair size={16} className="text-emerald-400" />
                </div>
              </div>
              <div className="mt-2">
                <div className="w-full bg-slate-800 rounded-full h-1">
                  <div className="bg-emerald-500 h-1 rounded-full" style={{ width: `${Math.min(stats.avgAccuracy, 100)}%` }}></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">DRIFT ALERTS</p>
                  <p className="text-2xl font-bold text-white">{drift_alerts}</p>
                  <p className="text-sm text-emerald-400">
                    {drift_alerts === 0 ? '✓ Stable' : '⚠️ Active'}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Last 7 days</p>
                </div>
                <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                  <TrendingUp size={16} className={drift_alerts === 0 ? "text-emerald-400" : "text-yellow-400"} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">SYSTEMS STATUS</p>
                  <p className="text-lg font-bold text-white">{systems.filter(s => s.monitoring_enabled).length}/{systems.length}</p>
                  <p className="text-sm text-slate-400">operational</p>
                  <p className="text-sm text-emerald-400">
                    {systems.filter(s => s.monitoring_enabled).length === systems.length ? '✓ All healthy' : '⚠️ Some issues'}
                  </p>
                </div>
                <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                  <Server size={16} className="text-emerald-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">ACTIVE ALERTS</p>
                  <p className="text-lg font-bold text-white">{alerts.filter(a => a.status === 'pending').length}</p>
                  <p className="text-sm text-red-400">
                    {alerts.filter(a => a.status === 'pending').length > 0 ? '⚠️ Requires attention' : '✓ All clear'}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Pending review</p>
                </div>
                <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                  <AlertTriangle size={16} className={alerts.filter(a => a.status === 'pending').length > 0 ? "text-red-400" : "text-emerald-400"} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-slate-800/50 border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">ROBUSTNESS SCORE</p>
                  <p className="text-lg font-bold text-white">{stats.robustnessScore}%</p>
                  <p className="text-sm text-emerald-400">↗ {stats.robustnessTrend}%</p>
                  <p className="text-xs text-slate-500 mt-1">Target: {'>'}85%</p>
                </div>
                <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                  <Shield size={16} className="text-blue-400" />
                </div>
              </div>
              <div className="mt-2">
                <div className="w-full bg-slate-800 rounded-full h-1">
                  <div className="bg-blue-500 h-1 rounded-full" style={{ width: `${stats.robustnessScore}%` }}></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">SECURITY SCORE</p>
                  <p className="text-lg font-bold text-white">{stats.securityScore}%</p>
                  <p className="text-sm text-emerald-400">↗ {stats.securityTrend}%</p>
                  <p className="text-xs text-slate-500 mt-1">Target: {'>'}90%</p>
                </div>
                <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                  <ShieldCheck size={16} className="text-emerald-400" />
                </div>
              </div>
              <div className="mt-2">
                <div className="w-full bg-slate-800 rounded-full h-1">
                  <div className="bg-emerald-500 h-1 rounded-full" style={{ width: `${stats.securityScore}%` }}></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">UPTIME (30 days)</p>
                  <p className="text-lg font-bold text-white">{stats.uptime30Days}%</p>
                  <p className="text-sm text-slate-400">Target: {'>'}99.9%</p>
                </div>
                <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                  <Activity size={16} className="text-emerald-400" />
                </div>
              </div>
              <div className="mt-2">
                <div className="w-full bg-slate-800 rounded-full h-1">
                  <div className="bg-emerald-500 h-1 rounded-full" style={{ width: `${stats.uptime30Days}` }}></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">LATENCY (P95)</p>
                  <p className="text-lg font-bold text-white">{stats.latencyP95}ms</p>
                  <p className="text-sm text-emerald-400">↘ {Math.abs(stats.latencyTrend)}ms</p>
                  <p className="text-xs text-slate-500 mt-1">Target: {'<'}200ms</p>
                </div>
                <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                  <Zap size={16} className="text-emerald-400" />
                </div>
              </div>
              <div className="mt-2">
                <div className="w-full bg-slate-800 rounded-full h-1">
                  <div className="bg-emerald-500 h-1 rounded-full" style={{ width: `${Math.max(0, 100 - (stats.latencyP95 / 2))}%` }}></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="px-6 py-4 border-b border-slate-800">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-slate-800/50 border border-slate-800">
            <TabsTrigger value="overview" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white">
              Overview
            </TabsTrigger>
            <TabsTrigger value="ai-systems" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white">
              AI Systems
            </TabsTrigger>
            <TabsTrigger value="accuracy" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white">
              Accuracy
            </TabsTrigger>
            <TabsTrigger value="drift-detection" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white">
              Drift Detection
            </TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white">
              Security
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <OverviewTab
              dashboardData={dashboardData}
              systems={systems}
              alerts={alerts}
              loading={false}
            />
          </TabsContent>

          <TabsContent value="ai-systems" className="mt-6">
            <AISystemsTab systems={systems} loading={systemsLoading} />
          </TabsContent>

          <TabsContent value="accuracy" className="mt-6">
            <AccuracyTab />
          </TabsContent>

          <TabsContent value="drift-detection" className="mt-6">
            <DriftDetectionTab />
          </TabsContent>

          <TabsContent value="security" className="mt-6">
            <SecurityTab />
          </TabsContent>
        </Tabs>
      </div>

      {/* Add System Modal */}
      <AddSystemModal isOpen={showAddSystemModal} onClose={() => setShowAddSystemModal(false)} />
    </div>
  );
};

export default AIActPerformance;