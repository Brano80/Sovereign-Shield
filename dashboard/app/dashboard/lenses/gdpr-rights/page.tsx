"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  Clock,
  CheckCircle,
  AlertTriangle,
  Shield,
  Download,
  Plus,
  RefreshCw,
  AlertCircle,
  MoreHorizontal,
  Activity,
  Eye,
  FileText,
  TrendingUp,
  XCircle
} from "lucide-react";
import { complianceApi } from "@/app/lib/api-client";
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Dynamic imports for Recharts
const LineChart: any = dynamic(async () => (await import("recharts")).LineChart as any, { ssr: false });
const Line: any = dynamic(async () => (await import("recharts")).LineChart as any, { ssr: false });
const XAxis: any = dynamic(async () => (await import("recharts")).XAxis as any, { ssr: false });
const YAxis: any = dynamic(async () => (await import("recharts")).YAxis as any, { ssr: false });
const CartesianGrid: any = dynamic(async () => (await import("recharts")).CartesianGrid as any, { ssr: false });
const Tooltip: any = dynamic(async () => (await import("recharts")).Tooltip as any, { ssr: false });
const ResponsiveContainer: any = dynamic(async () => (await import("recharts")).ResponsiveContainer as any, { ssr: false });
const Legend: any = dynamic(async () => (await import("recharts")).Legend as any, { ssr: false });
const PieChartRecharts: any = dynamic(async () => (await import("recharts")).PieChart as any, { ssr: false });
const Pie: any = dynamic(async () => (await import("recharts")).PieChart as any, { ssr: false });
const Cell: any = dynamic(async () => (await import("recharts")).Cell as any, { ssr: false });
const BarChart: any = dynamic(async () => (await import("recharts")).BarChart as any, { ssr: false });
const Bar: any = dynamic(async () => (await import("recharts")).Bar as any, { ssr: false });

// Import tab components
import { OverviewTab } from './components/OverviewTab';
import { AllRequestsTab } from './components/AllRequestsTab';
import { AccessTab } from './components/AccessTab';
import { ErasureTab } from './components/ErasureTab';
import { PortabilityTab } from './components/PortabilityTab';
import { RestrictionsObjectionsTab } from './components/RestrictionsObjectionsTab';
import { NewRequestModal } from './components/NewRequestModal';
import { formatDateTimeDDMMYYYY } from '@/lib/utils';

// Types for GDPR Rights data
interface GDPRRightsOverview {
  openRequests: number;
  overdueRequests: number;
  completedThisMonth: number;
  completedChange: number;
  avgResponseTime: number;
  avgResponseTimeChange: number;
  slaCompliance30Days: number;
  lastRequestTimestamp: Date;
  complianceStatus: 'COMPLIANT' | 'NON_COMPLIANT' | 'MONITORING';

  // By article counts
  accessRequests: number;
  erasureRequests: number;
  portabilityRequests: number;
  objectionsActive: number;

  // Charts data
  requestsByType: Array<{
    type: string;
    count: number;
    article: string;
  }>;

  slaTimeline: Array<{
    date: string;
    requests: number;
    completed: number;
    breaches: number;
  }>;
}

interface RecentActivityItem {
  id: string;
  timestamp: Date;
  type: 'ACCESS_COMPLETED' | 'ERASURE_COMPLETED' | 'NEW_REQUEST' | 'RECTIFICATION_APPLIED' | 'EXPORT_GENERATED';
  message: string;
  requestId: string;
  dataSubject: string;
}

interface RequiresAttentionItem {
  id: string;
  type: 'SLA_CRITICAL' | 'PENDING_VERIFICATION' | 'EXCEPTION_REVIEW';
  title: string;
  description: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  requestId: string;
  dataSubject: string;
  actionLabel: string;
  daysRemaining?: number;
}

export default function GDPRRightsPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'all-requests' | 'access' | 'erasure' | 'portability' | 'restrictions-objections'>('overview');
  const [overview, setOverview] = useState<GDPRRightsOverview | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivityItem[]>([]);
  const [requiresAttention, setRequiresAttention] = useState<RequiresAttentionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Modal states
  const [showNewRequestModal, setShowNewRequestModal] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState(false);

  // Controls
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetchAllData();

    // Auto-refresh every 60 seconds if enabled
    const interval = autoRefresh ? setInterval(fetchAllData, 60000) : null;
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  // Close export dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showExportDropdown && !(event.target as Element).closest('.export-dropdown')) {
        setShowExportDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showExportDropdown]);

  const fetchAllData = async () => {
    try {
      setIsLoading(true);

      // Fetch all data in parallel using complianceApi
      const [
        overviewData,
        activityData,
        attentionData
      ] = await Promise.all([
        complianceApi.get<GDPRRightsOverview>('/lenses/gdpr-rights/overview'),
        complianceApi.get<any>('/lenses/gdpr-rights/recent-activity'),
        complianceApi.get<any>('/lenses/gdpr-rights/requires-attention')
      ]);

      setOverview(overviewData);
      setRecentActivity((activityData as any).activities || activityData);
      setRequiresAttention((attentionData as any).items || attentionData);
      setLastUpdated(new Date());
      setError(null);

    } catch (err) {
      console.error('Error fetching GDPR rights data:', err);
      let errorMessage = 'An unexpected error occurred while loading GDPR rights data.';
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };


  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'critical': return 'text-red-400 bg-red-500/10 border-red-500/30';
      case 'high': return 'text-orange-400 bg-orange-500/10 border-orange-500/30';
      case 'medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      case 'low': return 'text-green-400 bg-green-500/10 border-green-500/30';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return '🔴';
      case 'high': return '🟠';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  };

  // Loading state
  if (isLoading && !overview) {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="space-y-8">
            {/* Header skeleton */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <div className="animate-pulse">
                <div className="h-8 bg-slate-700 rounded w-1/3 mb-2"></div>
                <div className="h-4 bg-slate-700 rounded w-1/2"></div>
                <div className="flex justify-end mt-4">
                  <div className="h-10 bg-slate-700 rounded w-24"></div>
                </div>
              </div>
            </div>

            {/* KPI skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 animate-pulse">
                  <div className="h-4 bg-slate-600 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-slate-600 rounded w-1/2 mb-1"></div>
                  <div className="h-3 bg-slate-600 rounded w-2/3"></div>
                </div>
              ))}
            </div>

            {/* Content skeleton */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <div className="animate-pulse">
                <div className="h-6 bg-slate-700 rounded w-1/4 mb-4"></div>
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-4 bg-slate-700 rounded"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold mb-2">GDPR Rights Error</h2>
            <p className="text-gray-400 mb-6">{error}</p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={fetchAllData}
                className="px-6 py-3 rounded-lg font-medium transition-colors bg-blue-600 hover:bg-blue-700 text-white"
              >
                Retry
              </button>
              <a
                href="/dashboard"
                className="px-6 py-3 rounded-lg font-medium transition-colors bg-slate-700 hover:bg-slate-600 text-white"
              >
                Back to Dashboard
              </a>
            </div>
          </div>
        </div>
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
              <h1 className="text-2xl font-bold text-white">GDPR RIGHTS</h1>
              <p className="text-slate-400 mt-1">Articles 15-22 • Data Subject Rights Management</p>

              {/* Status Banner */}
              {overview && (
                <div className="mt-6 flex items-center gap-4">
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium ${
                    overview?.complianceStatus === 'COMPLIANT'
                      ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                      : overview?.complianceStatus === 'MONITORING'
                      ? 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
                      : 'text-red-400 bg-red-500/10 border-red-500/20'
                  }`}>
                    {overview?.complianceStatus === 'COMPLIANT' ? (
                      <CheckCircle size={16} />
                    ) : overview?.complianceStatus === 'MONITORING' ? (
                      <AlertTriangle size={16} />
                    ) : (
                      <XCircle size={16} />
                    )}
                    Status: {overview?.complianceStatus}
                  </div>

                  <div className="text-sm text-slate-400">
                    Open requests: <span className="text-slate-300 font-medium">{overview?.openRequests || 0}</span> │
                    30-day SLA: <span className="text-slate-300 font-medium">{overview?.slaCompliance30Days || 0}%</span> │
                    Last request: <span className="text-slate-300 font-medium">{overview?.lastRequestTimestamp ? formatDateTimeDDMMYYYY(overview.lastRequestTimestamp) : 'Never'}</span>
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchAllData}
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                <RefreshCw size={14} className="mr-2" />
                Refresh
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowNewRequestModal(true)}
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                <Plus size={14} className="mr-2" />
                New Request
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-slate-700 text-slate-300 hover:bg-slate-800"
                  >
                    <Download size={14} className="mr-2" />
                    Export <MoreHorizontal size={14} className="ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-slate-900 border-slate-700">
                  <DropdownMenuItem className="text-slate-300 hover:bg-slate-800" onClick={() => console.log('[GDPR Rights] Export as PDF')}>
                    <FileText size={14} className="mr-2" />
                    Compliance Report (PDF)
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-slate-300 hover:bg-slate-800" onClick={() => console.log('[GDPR Rights] Export All Requests as CSV')}>
                    <Download size={14} className="mr-2" />
                    All Requests (CSV)
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-slate-300 hover:bg-slate-800" onClick={() => console.log('[GDPR Rights] Export SLA Performance Report')}>
                    <TrendingUp size={14} className="mr-2" />
                    SLA Performance Report
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-slate-300 hover:bg-slate-800" onClick={() => console.log('[GDPR Rights] Export Erasure Certificates')}>
                    <Shield size={14} className="mr-2" />
                    Erasure Certificates
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="px-6 py-6 border-b border-slate-800">

        {/* KPI Cards - Row 1 */}
        {overview && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="bg-slate-800/50 border-slate-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">OPEN REQUESTS</p>
                    <p className="text-2xl font-bold text-white">{overview.openRequests}</p>
                    <p className="text-sm text-red-400">⚠ {overview.overdueRequests} near SLA</p>
                  </div>
                  <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                    <AlertTriangle size={16} className="text-red-400" />
                  </div>
                </div>
                <div className="mt-2">
                  <div className="w-full bg-slate-800 rounded-full h-1">
                    <div className="bg-red-500 h-1 rounded-full" style={{ width: `${Math.min((overview.overdueRequests / Math.max(overview.openRequests, 1)) * 100, 100)}%` }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">COMPLETED THIS MONTH</p>
                    <p className="text-2xl font-bold text-white">{overview.completedThisMonth.toLocaleString()}</p>
                    <p className={`text-sm ${overview.completedChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {overview.completedChange >= 0 ? '↗' : '↘'} {Math.abs(overview.completedChange)}%
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                    <Activity size={16} className="text-blue-400" />
                  </div>
                </div>
                <div className="mt-2">
                  <div className="w-full bg-slate-800 rounded-full h-1">
                    <div className="bg-blue-500 h-1 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">AVG RESPONSE TIME</p>
                    <p className="text-2xl font-bold text-white">{overview.avgResponseTime} days</p>
                    <p className={`text-sm ${overview.avgResponseTimeChange >= 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                      {overview.avgResponseTimeChange >= 0 ? '↗' : '↘'} {Math.abs(overview.avgResponseTimeChange)}%
                    </p>
                    <p className="text-xs text-slate-500 mt-1">Target: &lt;5 days</p>
                  </div>
                  <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                    <Clock size={16} className="text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">30-DAY SLA COMPLIANCE</p>
                    <p className="text-2xl font-bold text-white">{overview.slaCompliance30Days}%</p>
                    <p className="text-sm text-slate-400">Target: 100%</p>
                  </div>
                  <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                    <CheckCircle size={16} className="text-emerald-400" />
                  </div>
                </div>
                <div className="mt-2">
                  <div className="w-full bg-slate-800 rounded-full h-1">
                    <div className="bg-emerald-500 h-1 rounded-full" style={{ width: `${overview.slaCompliance30Days}%` }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* KPI Cards - Row 2 */}
        {overview && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-slate-800/50 border-slate-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">ACCESS REQUESTS</p>
                    <p className="text-2xl font-bold text-white">{overview.accessRequests}</p>
                    <p className="text-sm text-slate-400">Art. 15</p>
                    <Button 
                      variant="link" 
                      size="sm" 
                      className="text-cyan-400 p-0 h-auto text-xs"
                      onClick={() => {
                        console.log('[GDPR Rights] View All Access Requests triggered');
                        // TODO: Implement full functionality
                      }}
                    >
                      View All →
                    </Button>
                  </div>
                  <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                    <Eye size={16} className="text-blue-400" />
                  </div>
                </div>
                <div className="mt-2">
                  <div className="w-full bg-slate-800 rounded-full h-1">
                    <div className="bg-blue-500 h-1 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">ERASURE REQUESTS</p>
                    <p className="text-2xl font-bold text-white">{overview.erasureRequests}</p>
                    <p className="text-sm text-slate-400">Art. 17</p>
                    <Button 
                      variant="link" 
                      size="sm" 
                      className="text-cyan-400 p-0 h-auto text-xs"
                      onClick={() => {
                        console.log('[GDPR Rights] View All Erasure Requests triggered');
                        // TODO: Implement full functionality
                      }}
                    >
                      View All →
                    </Button>
                  </div>
                  <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                    <Shield size={16} className="text-red-400" />
                  </div>
                </div>
                <div className="mt-2">
                  <div className="w-full bg-slate-800 rounded-full h-1">
                    <div className="bg-red-500 h-1 rounded-full" style={{ width: '60%' }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">PORTABILITY REQUESTS</p>
                    <p className="text-lg font-bold text-white">{overview.portabilityRequests}</p>
                    <p className="text-sm text-slate-400">Art. 20</p>
                  </div>
                  <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                    <Download size={16} className="text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">OBJECTIONS ACTIVE</p>
                    <p className="text-lg font-bold text-white">{overview.objectionsActive}</p>
                    <p className="text-sm text-slate-400">Art. 21</p>
                  </div>
                  <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                    <AlertCircle size={16} className="text-yellow-400" />
                  </div>
                </div>
                <div className="mt-2">
                  <div className="w-full bg-slate-800 rounded-full h-1">
                    <div className="bg-yellow-500 h-1 rounded-full" style={{ width: '40%' }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="px-6 py-4 border-b border-slate-800">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="w-full">
          <TabsList className="grid w-full grid-cols-6 bg-slate-800/50 border border-slate-800">
            <TabsTrigger value="overview" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white">
              Overview
            </TabsTrigger>
            <TabsTrigger value="all-requests" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white">
              All Requests
            </TabsTrigger>
            <TabsTrigger value="access" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white">
              Access
            </TabsTrigger>
            <TabsTrigger value="erasure" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white">
              Erasure
            </TabsTrigger>
            <TabsTrigger value="portability" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white">
              Portability
            </TabsTrigger>
            <TabsTrigger value="restrictions-objections" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white">
              Restrictions & Objections
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            {overview && (
              <OverviewTab
                overview={overview}
                recentActivity={recentActivity}
                requiresAttention={requiresAttention}
              />
            )}
          </TabsContent>

          <TabsContent value="all-requests" className="mt-6">
            <AllRequestsTab />
          </TabsContent>

          <TabsContent value="access" className="mt-6">
            <AccessTab />
          </TabsContent>

          <TabsContent value="erasure" className="mt-6">
            <ErasureTab />
          </TabsContent>

          <TabsContent value="portability" className="mt-6">
            <PortabilityTab />
          </TabsContent>

          <TabsContent value="restrictions-objections" className="mt-6">
            <RestrictionsObjectionsTab />
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      {showNewRequestModal && (
        <NewRequestModal
          onClose={() => setShowNewRequestModal(false)}
          onSubmit={(data) => {
            console.log('New GDPR request:', data);
            setShowNewRequestModal(false);
            fetchAllData();
          }}
        />
      )}
    </div>
  );
}
