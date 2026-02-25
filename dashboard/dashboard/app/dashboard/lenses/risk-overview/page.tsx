"use client";

import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import {
  AlertTriangle,
  Clock,
  Shield,
  TrendingUp,
  Activity,
  CheckCircle,
  Users,
  Server,
  Bot,
  Building,
  Scale,
  FileText,
  RefreshCw,
  Plus,
  Filter,
  Eye,
  EyeOff,
  Download,
  ChevronDown,
  XCircle,
  BarChart3
} from "lucide-react";
import { API_BASE } from "@/app/utils/api-config";
import { formatDateDDMMYYYY, formatDateTimeDDMMYYYY } from "@/lib/utils";
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Dynamic imports for Recharts to avoid SSR issues
const LineChart: any = dynamic(async () => (await import("recharts")).LineChart as any, { ssr: false });
const Line: any = dynamic(async () => (await import("recharts")).Line as any, { ssr: false });
const XAxis: any = dynamic(async () => (await import("recharts")).XAxis as any, { ssr: false });
const YAxis: any = dynamic(async () => (await import("recharts")).YAxis as any, { ssr: false });
const CartesianGrid: any = dynamic(async () => (await import("recharts")).CartesianGrid as any, { ssr: false });
const Tooltip: any = dynamic(async () => (await import("recharts")).Tooltip as any, { ssr: false });
const ResponsiveContainer: any = dynamic(async () => (await import("recharts")).ResponsiveContainer as any, { ssr: false });
const Legend: any = dynamic(async () => (await import("recharts")).Legend as any, { ssr: false });

// Types for Risk Overview data
interface OverallRiskScore {
  score: number;
  level: 'LOW' | 'MEDIUM' | 'MEDIUM_HIGH' | 'HIGH';
  change: number;
  previousScore: number;
  totalIncidents: number;
  openIncidents: number;
  criticalViolations: number;
  lastEventTimestamp: Date;
  lastEventDescription: string;
}

interface RegulationRisk {
  regulation: 'GDPR' | 'DORA' | 'AI_ACT' | 'NIS2';
  regulationName: string;
  color: string;
  score: number;
  status: 'COMPLIANT' | 'MONITORING' | 'CAUTION' | 'DEGRADED' | 'CRITICAL';
  trend: 'IMPROVING' | 'STABLE' | 'DECLINING';
  trendPercentage: number;
  currentIssue?: string;
  activeViolations: number;
  recentEvents: number;
  lastUpdated: Date;
  enforcementLevel: 'L4';
  lensUrl: string;
}

interface RiskEvent {
  id: string;
  timestamp: Date;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  title: string;
  description: string;
  regulations: Array<{
    code: 'GDPR' | 'DORA' | 'AI_ACT' | 'NIS2';
    color: string;
    name: string;
  }>;
  evidenceId?: string;
  systemName?: string;
  incidentId?: string;
  status: 'NEW' | 'ACKNOWLEDGED' | 'INVESTIGATING' | 'RESOLVED';
  assignedTo?: string;
  actions: Array<{
    label: string;
    type: 'primary' | 'secondary';
    action: string;
  }>;
}

interface RiskCategory {
  id: string;
  name: string;
  icon: string;
  riskScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  metrics: {
    label: string;
    value: number;
    severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  }[];
  detailsUrl: string;
}

interface RiskFactor {
  rank: number;
  id: string;
  title: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  regulation: string;
  articles: string[];
  riskPoints: number;
  trend: 'INCREASING' | 'STABLE' | 'DECREASING';
  actionLabel: string;
  actionUrl: string;
  relatedIncidents: number;
  relatedEvents: number;
  firstDetected: Date;
  lastUpdated: Date;
}

interface MitigationAction {
  id: string;
  priority: 'URGENT' | 'RECOMMENDED' | 'PROACTIVE';
  title: string;
  description: string;
  riskReduction: number;
  dueDate: Date;
  regulation: string;
  articles: string[];
  owner: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';
  assignedTo?: string;
  completedAt?: Date;
  relatedIncidents: string[];
  relatedEvents: string[];
  actionType: 'REVIEW' | 'INVESTIGATE' | 'BLOCK' | 'AUDIT' | 'UPDATE' | 'TRAIN';
}

interface RiskTrendData {
  date: string;
  overallRisk: number;
  gdprScore: number;
  doraScore: number;
  aiActScore: number;
  nis2Score: number;
}

export default function RiskOverviewPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedRisk, setSelectedRisk] = useState<any>(null);

  // API state
  const [apiData, setApiData] = useState<any>(null);
  const [regulationData, setRegulationData] = useState<any[]>([]);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [riskEvents, setRiskEvents] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getAuthHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  };

  const fetchRiskData = async () => {
    try {
      setLoading(true);
      setError(null);
      const headers = getAuthHeaders();
      
      const [scoreRes, regRes, trendRes, eventsRes, catRes] = await Promise.allSettled([
        fetch(`${API_BASE}/api/v1/lenses/risk-overview/overall-score`, { headers }),
        fetch(`${API_BASE}/api/v1/lenses/risk-overview/regulation-breakdown`, { headers }),
        fetch(`${API_BASE}/api/v1/lenses/risk-overview/trend`, { headers }),
        fetch(`${API_BASE}/api/v1/lenses/risk-overview/events`, { headers }),
        fetch(`${API_BASE}/api/v1/lenses/risk-overview/categories`, { headers }),
      ]);
      
      if (scoreRes.status === 'fulfilled' && scoreRes.value.ok) {
        setApiData(await scoreRes.value.json());
      }
      if (regRes.status === 'fulfilled' && regRes.value.ok) {
        const regJson = await regRes.value.json();
        setRegulationData(regJson.regulations || []);
      }
      if (trendRes.status === 'fulfilled' && trendRes.value.ok) {
        const trendJson = await trendRes.value.json();
        setTrendData(trendJson.trend || []);
      }
      if (eventsRes.status === 'fulfilled' && eventsRes.value.ok) {
        const eventsJson = await eventsRes.value.json();
        setRiskEvents(eventsJson.events || []);
      }
      if (catRes.status === 'fulfilled' && catRes.value.ok) {
        const catJson = await catRes.value.json();
        setCategories(catJson.categories || []);
      }
    } catch (err) {
      console.error('Failed to fetch risk data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load risk data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRiskData();
  }, []);

  // API-backed KPI data
  const kpiData = apiData ? {
    inherentRiskScore: apiData.score || 0,
    residualRiskScore: Math.max(0, (apiData.score || 0) - Math.round((apiData.score || 0) * 0.35)),
    riskReduction: 35,
    riskLevel: apiData.riskLevel || 'LOW',
    change: apiData.change || 0,
    criticalRisks: apiData.criticalViolations || 0,
    highRisks: apiData.openIncidents || 0,
    overdueMitigations: 0,
    assessmentsCompleted: 0,
    lastAssessment: apiData.lastEventAt ? formatDateDDMMYYYY(new Date(apiData.lastEventAt)) : '--',
    controlsEffectiveness: 0,
    complianceRate: 0,
    assessmentsThisQuarter: 0,
    lastScan: apiData.lastEventAt ? 'Just now' : '--',
    risksAboveTolerance: apiData.criticalViolations || 0,
    totalRisks: apiData.totalIncidents || 0,
    risksWithinTolerance: Math.max(0, (apiData.totalIncidents || 0) - (apiData.criticalViolations || 0)),
  } : {
    inherentRiskScore: 0,
    residualRiskScore: 0,
    riskReduction: 0,
    riskLevel: 'LOW',
    change: 0,
    criticalRisks: 0,
    highRisks: 0,
    overdueMitigations: 0,
    assessmentsCompleted: 0,
    lastAssessment: '--',
    controlsEffectiveness: 0,
    complianceRate: 0,
    assessmentsThisQuarter: 0,
    lastScan: '--',
    risksAboveTolerance: 0,
    totalRisks: 0,
    risksWithinTolerance: 0,
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchRiskData();
    setIsRefreshing(false);
  };

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-800/50 backdrop-blur supports-[backdrop-filter]:bg-slate-800/50">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">RISK OVERVIEW</h1>
              <p className="text-slate-400 mt-1">EU AI Act Art. 9 • DORA Art. 5-6 • GDPR Art. 35 • Risk Management</p>

              {/* Status Banner */}
              <div className="mt-6 flex items-center gap-4">
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium ${
                  kpiData.residualRiskScore <= 30 ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' :
                  kpiData.residualRiskScore <= 60 ? 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' :
                  'text-red-400 bg-red-500/10 border-red-500/20'
                }`}>
                  {kpiData.residualRiskScore <= 30 ? (
                    <CheckCircle size={16} />
                  ) : kpiData.residualRiskScore <= 60 ? (
                    <AlertTriangle size={16} />
                  ) : (
                    <XCircle size={16} />
                  )}
                  Status: {kpiData.residualRiskScore <= 30 ? 'COMPLIANT' : kpiData.residualRiskScore <= 60 ? 'WARNING' : 'NON-COMPLIANT'}
                </div>

                <div className="text-sm text-slate-400">
                  Inherent: <span className="text-slate-300 font-medium">{kpiData.inherentRiskScore}</span> → Residual: <span className="text-slate-300 font-medium">{kpiData.residualRiskScore}</span> │
                  {kpiData.risksAboveTolerance > 0 ? (
                    <span className="text-red-400 font-medium">{kpiData.risksAboveTolerance} risks above tolerance</span>
                  ) : (
                    <span className="text-emerald-400 font-medium">All risks within tolerance</span>
                  )} │
                  Last scan: <span className="text-slate-300 font-medium">{kpiData.lastScan}</span>
                </div>
              </div>
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
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
                onClick={() => {
                  console.log('[RiskOverview] New Assessment');
                  alert('Risk Assessment wizard coming soon — will create DPIA per GDPR Art. 35');
                }}
              >
                <Plus size={14} className="mr-2" />
                New Assessment
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
                  <DropdownMenuItem className="text-slate-300 hover:bg-slate-800" onClick={() => console.log('[Risk Overview] Export as PDF')}>
                    <FileText size={14} className="mr-2" />
                    Risk Report (PDF)
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-slate-300 hover:bg-slate-800" onClick={() => console.log('[Risk Overview] Export Risk Register as CSV')}>
                    <FileText size={14} className="mr-2" />
                    Risk Register (CSV)
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-slate-300 hover:bg-slate-800" onClick={() => console.log('[Risk Overview] Export Assessments as CSV')}>
                    <BarChart3 size={14} className="mr-2" />
                    Assessments (CSV)
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
          <Card className="bg-slate-800/50 border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">RISK SCORE</p>
                  <p className="text-lg font-bold text-white">
                    Inherent: {kpiData.inherentRiskScore} → Residual: {kpiData.residualRiskScore}
                  </p>
                  <p className="text-sm text-emerald-400">↘ {kpiData.riskReduction}% reduction</p>
                </div>
                <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                  <BarChart3 size={16} className="text-slate-400" />
                </div>
              </div>
              <div className="mt-2">
                <div className="w-full bg-slate-800 rounded-full h-1">
                  <div className="bg-emerald-500 h-1 rounded-full" style={{ width: `${kpiData.residualRiskScore}%` }}></div>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-1">Target: &lt;30 residual risk</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">CRITICAL RISKS</p>
                  <p className="text-2xl font-bold text-white">{kpiData.criticalRisks}</p>
                  {kpiData.criticalRisks > 0 ? (
                    <p className="text-sm text-red-400">⚠ {kpiData.criticalRisks} active</p>
                  ) : (
                    <p className="text-sm text-emerald-400">✓ None</p>
                  )}
                </div>
                <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                  <AlertTriangle size={16} className="text-red-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">HIGH RISKS</p>
                  <p className="text-2xl font-bold text-white">{kpiData.highRisks}</p>
                  {kpiData.highRisks > 0 ? (
                    <p className="text-sm text-orange-400">⚠ {kpiData.highRisks} active</p>
                  ) : (
                    <p className="text-sm text-emerald-400">✓ None</p>
                  )}
                </div>
                <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                  <AlertTriangle size={16} className="text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">CRITICAL VENDORS</p>
                  <p className="text-2xl font-bold text-white">{kpiData.criticalRisks}</p>
                  {kpiData.criticalRisks > 0 ? (
                    <p className="text-sm text-orange-400">⚠ {kpiData.criticalRisks} critical</p>
                  ) : (
                    <p className="text-sm text-emerald-400">✓ None</p>
                  )}
                </div>
                <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                  <Building size={16} className="text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">RISK APPETITE</p>
                  <p className="text-2xl font-bold text-white">{kpiData.risksWithinTolerance}/{kpiData.totalRisks}</p>
                  <p className="text-sm text-slate-400">within tolerance</p>
                  {kpiData.risksAboveTolerance > 0 && (
                    <p className="text-sm text-red-400">⚠ {kpiData.risksAboveTolerance} exceed tolerance</p>
                  )}
                </div>
                <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                  {kpiData.risksAboveTolerance > 0 ? (
                    <AlertTriangle size={16} className="text-red-400" />
                  ) : (
                    <CheckCircle size={16} className="text-emerald-400" />
                  )}
                </div>
              </div>
              {kpiData.risksAboveTolerance > 0 && (
                <Button 
                  variant="link" 
                  size="sm" 
                  className="text-cyan-400 p-0 h-auto text-xs mt-2"
                  onClick={() => {
                    console.log('[Risk Overview] View Exceptions triggered');
                    // TODO: Implement full functionality
                  }}
                >
                  View Exceptions →
                </Button>
              )}
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">ASSESSMENTS COMPLETED</p>
                  <p className="text-2xl font-bold text-white">{kpiData.assessmentsCompleted}</p>
                  {kpiData.assessmentsCompleted > 0 ? (
                    <p className="text-sm text-emerald-400">✓ {kpiData.assessmentsCompleted} completed</p>
                  ) : (
                    <p className="text-sm text-slate-400">--</p>
                  )}
                  <p className="text-sm text-slate-400">This quarter</p>
                </div>
                <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                  <CheckCircle size={16} className="text-green-400" />
                </div>
              </div>
              <div className="mt-2">
                <div className="w-full bg-slate-800 rounded-full h-1">
                  <div className="bg-emerald-500 h-1 rounded-full" style={{ width: kpiData.assessmentsCompleted > 0 ? '75%' : '0%' }}></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">LAST ASSESSMENT</p>
                  <p className="text-lg font-bold text-white">{kpiData.lastAssessment}</p>
                  {kpiData.lastAssessment !== '--' ? (
                    <p className="text-slate-400 text-xs">{kpiData.lastAssessment}</p>
                  ) : (
                    <p className="text-slate-500 text-xs">No assessments yet</p>
                  )}
                </div>
                <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                  <Clock size={16} className="text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">CONTROLS EFFECTIVENESS</p>
                  <p className="text-2xl font-bold text-white">{kpiData.controlsEffectiveness}%</p>
                  {kpiData.controlsEffectiveness > 0 ? (
                    <p className="text-sm text-emerald-400">✓ Active</p>
                  ) : (
                    <p className="text-sm text-slate-400">--</p>
                  )}
                </div>
                <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                  <Shield size={16} className="text-emerald-400" />
                </div>
              </div>
              <div className="mt-2">
                <div className="w-full bg-slate-800 rounded-full h-1">
                  <div className="bg-emerald-500 h-1 rounded-full" style={{ width: `${kpiData.controlsEffectiveness}%` }}></div>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-1">Target: &gt;85%</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">COMPLIANCE RATE</p>
                  <p className="text-2xl font-bold text-white">{kpiData.complianceRate}%</p>
                  {kpiData.complianceRate > 0 ? (
                    <p className="text-sm text-emerald-400">✓ Compliant</p>
                  ) : (
                    <p className="text-sm text-slate-400">--</p>
                  )}
                </div>
                <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                  <CheckCircle size={16} className="text-emerald-400" />
                </div>
              </div>
              <div className="mt-2">
                <div className="w-full bg-slate-800 rounded-full h-1">
                  <div className="bg-emerald-500 h-1 rounded-full" style={{ width: `${kpiData.complianceRate}%` }}></div>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-1">Target: &gt;90%</p>
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
            <TabsTrigger value="risk-register" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white">
              Risk Register
            </TabsTrigger>
            <TabsTrigger value="assessments" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white">
              Assessments
            </TabsTrigger>
            <TabsTrigger value="mitigations" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white">
              Mitigations
            </TabsTrigger>
            <TabsTrigger value="heatmap" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white">
              Heatmap
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <OverviewTab 
              categories={categories}
              riskEvents={riskEvents}
              regulationData={regulationData}
              trendData={trendData}
              kpiData={kpiData}
            />
          </TabsContent>

          <TabsContent value="risk-register" className="mt-6">
            <RiskRegisterTab />
          </TabsContent>

          <TabsContent value="assessments" className="mt-6">
            <AssessmentsTab />
          </TabsContent>

          <TabsContent value="mitigations" className="mt-6">
            <MitigationsTab />
          </TabsContent>

          <TabsContent value="heatmap" className="mt-6">
            <HeatmapTab />
          </TabsContent>
        </Tabs>
      </div>

      {/* Risk Detail Modal */}
      {selectedRisk && (
        <RiskDetailModal
          risk={selectedRisk}
          onClose={() => setSelectedRisk(null)}
        />
      )}
    </div>
  );
}

// Risk Detail Modal Component
function RiskDetailModal({ risk, onClose }: { risk: any; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Risk: {risk.title}</h2>
              <p className="text-slate-400">ID: {risk.id} • {risk.category} • {risk.severity}</p>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white">
              ✕
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Risk Scores Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Risk Assessment</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">Inherent Risk</span>
                    <span className="text-white font-mono">{risk.inherent}/100</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div className="bg-red-500 h-2 rounded-full" style={{ width: `${risk.inherent}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">Residual Risk</span>
                    <span className="text-white font-mono">{risk.residual}/100</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${risk.residual}%` }}></div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-700">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Risk Reduction</span>
                    <span className="text-emerald-400 font-mono">{risk.reduction}%</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Regulatory Mapping</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-blue-400 text-sm">🔵</span>
                  </div>
                  <div>
                    <p className="text-white font-medium">GDPR</p>
                    <p className="text-slate-400 text-sm">Articles 44-49 (Data Transfers)</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg">
                  <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-purple-400 text-sm">🟣</span>
                  </div>
                  <div>
                    <p className="text-white font-medium">DORA</p>
                    <p className="text-slate-400 text-sm">Article 5 (Risk Management)</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg">
                  <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-orange-400 text-sm">🟠</span>
                  </div>
                  <div>
                    <p className="text-white font-medium">AI Act</p>
                    <p className="text-slate-400 text-sm">Article 9 (Risk Management System)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Risk Appetite Threshold */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Risk Appetite Threshold</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Organization Tolerance</span>
                <span className="text-white">≤70 points</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-3 relative">
                <div className="bg-emerald-500 h-3 rounded-full" style={{ width: '70%' }}></div>
                <div className="absolute top-0 h-3 w-0.5 bg-white" style={{ left: '70%' }}></div>
                <div className="absolute -top-6 text-xs text-white" style={{ left: '68%' }}>Tolerance</div>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-slate-400">0</span>
                <span className="text-xs text-emerald-400">Current: {risk.residual} (Within tolerance)</span>
                <span className="text-xs text-slate-400">100</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
            <Button variant="outline" onClick={onClose}>Close</Button>
            <Button 
              onClick={() => {
                console.log('[RiskOverview] Review risk:', risk?.id);
                alert('Risk review workflow coming soon');
                onClose();
              }}
            >
              Review
            </Button>
            <Button 
              onClick={() => {
                console.log('[RiskOverview] Update risk:', risk?.id);
                alert('Risk update form coming soon');
                onClose();
              }}
            >
              Update Risk
            </Button>
            <Button 
              onClick={() => {
                console.log('[RiskOverview] Add mitigation for:', risk?.id);
                alert('Mitigation creation wizard coming soon');
                onClose();
              }}
            >
              Add Mitigation
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Tab Components
function OverviewTab({ 
  categories = [], 
  riskEvents = [], 
  regulationData = [], 
  trendData = [],
  kpiData 
}: { 
  categories?: any[];
  riskEvents?: any[];
  regulationData?: any[];
  trendData?: any[];
  kpiData: any;
}) {

  return (
    <div className="space-y-6">
      {/* Two Separate Risk Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk by Category Panel */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 h-80 overflow-hidden">
          <h3 className="text-lg font-semibold text-white mb-4">Risk by Category</h3>
          <div className="space-y-3">
            {categories.length > 0 ? (
              categories.map((cat: any) => (
                <div key={cat.id} className="flex items-center justify-between py-2">
                  <span className="text-slate-300">{cat.name}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-slate-700 rounded-full h-2">
                      <div className={`h-2 rounded-full ${cat.riskLevel === 'CRITICAL' ? 'bg-red-500' : cat.riskLevel === 'HIGH' ? 'bg-orange-500' : cat.riskLevel === 'MEDIUM' ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${cat.riskScore}%` }} />
                    </div>
                    <span className="text-slate-400 text-sm w-8">{cat.riskScore}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-500 text-center py-4">No risk categories tracked yet</p>
            )}
          </div>
          <p className="text-sm text-slate-400 mt-4">Total: {kpiData.totalRisks} identified risks</p>
        </div>

        {/* Risk by Severity Panel */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 h-80 overflow-hidden">
          <h3 className="text-lg font-semibold text-white mb-4">Risk by Severity</h3>
          <div className="h-32 flex items-center justify-center mb-4">
            <div className="text-center text-slate-400">
              <BarChart3 className="w-8 h-8 mx-auto mb-1 opacity-50" />
              <p className="text-xs">Severity Distribution Chart</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {(() => {
              const severityData = {
                critical: kpiData.criticalRisks || 0,
                high: kpiData.highRisks || 0,
                medium: 0,
                low: 0,
              };
              return [
                { severity: 'Critical', count: severityData.critical, color: '#ef4444' },
                { severity: 'High', count: severityData.high, color: '#f97316' },
                { severity: 'Medium', count: severityData.medium, color: '#eab308' },
                { severity: 'Low', count: severityData.low, color: '#22c55e' }
              ].map((item) => (
                <div key={item.severity} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-sm text-slate-400">{item.severity}</span>
                  <span className="text-sm text-white ml-auto">{item.count}</span>
                </div>
              ));
            })()}
          </div>
          <p className="text-sm text-slate-400 mt-4">{kpiData.totalRisks || 0} total risks assessed</p>
        </div>
      </div>

      {/* Rearranged Bottom Layout */}
      <div className="space-y-6">
        {/* Top Row: Risk Appetite Compliance and Recent Activity side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Risk Appetite Compliance */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Risk Appetite Compliance</h3>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-2xl font-bold text-white">{kpiData.risksWithinTolerance}/{kpiData.totalRisks}</p>
                <p className="text-sm text-slate-400">risks within tolerance</p>
              </div>
              <div className="text-right">
                {kpiData.risksAboveTolerance > 0 ? (
                  <div className="text-red-400">
                    <AlertTriangle size={24} />
                    <p className="text-sm font-medium">{kpiData.risksAboveTolerance} exceed tolerance</p>
                  </div>
                ) : (
                  <div className="text-emerald-400">
                    <CheckCircle size={24} />
                    <p className="text-sm font-medium">All within tolerance</p>
                  </div>
                )}
              </div>
            </div>

            {kpiData.risksAboveTolerance > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-slate-400">Exceptions:</p>
                {[
                  { id: 'RSK-047', title: 'Data Sovereignty', score: 89, tolerance: 70 },
                  { id: 'RSK-046', title: 'API Security', score: 85, tolerance: 70 }
                ].map((exception, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-red-500/10 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-white">{exception.title}</p>
                      <p className="text-xs text-slate-400">Score: {exception.score} (Tolerance: {exception.tolerance})</p>
                    </div>
                    <Button variant="outline" size="sm" className="text-xs">Review</Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {riskEvents.length > 0 ? (
                riskEvents.slice(0, 5).map((event: any) => (
                  <div key={event.id} className="flex items-start gap-3 py-3 border-b border-slate-800 last:border-0">
                    <AlertTriangle size={16} className={event.severity === 'CRITICAL' ? 'text-red-400' : event.severity === 'HIGH' ? 'text-orange-400' : 'text-yellow-400'} />
                    <div>
                      <p className="text-white text-sm">{event.title}</p>
                      <p className="text-slate-500 text-xs">{event.description}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Activity size={24} className="mx-auto mb-2 text-slate-500" />
                  <p className="text-slate-500 text-sm">No recent risk events</p>
                </div>
              )}
            </div>
            {riskEvents.length > 5 && (
              <Button 
                variant="link" 
                size="sm" 
                className="text-cyan-400 mt-4"
                onClick={() => {
                  console.log('[Risk Overview] View All Recent Activity triggered');
                  // TODO: Implement full functionality
                }}
              >
                View All →
              </Button>
            )}
          </div>
        </div>

        {/* Bottom Row: Requires Attention spanning full width */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Requires Attention</h3>
          <div className="space-y-3">
            {[
              { type: 'critical', title: 'Data Sovereignty', description: 'Score: 89/100', action: 'Review Now' },
              { type: 'overdue', title: 'API Security Update', description: '5 days overdue', action: 'Update Status' },
              { type: 'assessment', title: 'HR AI System', description: 'Due in 3 days', action: 'Start Assessment' }
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-white">{item.title}</p>
                  <p className="text-xs text-slate-400">{item.description}</p>
                </div>
                <Button variant="outline" size="sm">{item.action}</Button>
              </div>
            ))}
          </div>
          <Button 
            variant="link" 
            size="sm" 
            className="text-cyan-400 mt-4"
            onClick={() => {
              console.log('[Risk Overview] View All Requires Attention triggered');
              // TODO: Implement full functionality
            }}
          >
            View All →
          </Button>
        </div>
      </div>
    </div>
  );
}

function RiskRegisterTab() {
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Risk Register</h3>
          <div className="flex items-center gap-4">
            <input
              type="text"
              placeholder="Search risks..."
              className="px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button variant="outline" size="sm">
              <Download size={14} className="mr-2" />
              Export CSV
            </Button>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-800/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">ID</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Risk</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Category</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Regulation</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Inherent</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Residual</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Reduction</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {[
              { id: 'RSK-047', risk: 'Data Sovereignty', category: 'Compliance', regulation: 'GDPR Art. 44-49', inherent: 95, residual: 89, reduction: 6, severity: 'CRITICAL', status: 'Open' },
              { id: 'RSK-046', risk: 'API Security', category: 'Technical', regulation: 'DORA Art. 5', inherent: 92, residual: 85, reduction: 8, severity: 'CRITICAL', status: 'Mitigating' },
              { id: 'RSK-045', risk: 'Vendor Lock-in', category: 'Third-Party', regulation: 'AI Act Art. 9', inherent: 78, residual: 72, reduction: 8, severity: 'HIGH', status: 'Open' }
            ].map((risk) => (
              <tr key={risk.id} className="hover:bg-slate-800/30">
                <td className="px-6 py-4 text-sm text-blue-400 font-mono">{risk.id}</td>
                <td className="px-6 py-4 text-sm text-white">{risk.risk}</td>
                <td className="px-6 py-4 text-sm text-slate-300">{risk.category}</td>
                <td className="px-6 py-4 text-sm text-slate-300 text-xs">{risk.regulation}</td>
                <td className="px-6 py-4 text-sm text-white font-mono">{risk.inherent}</td>
                <td className="px-6 py-4 text-sm text-white font-mono">{risk.residual}</td>
                <td className="px-6 py-4 text-sm text-emerald-400 font-mono">{risk.reduction}%</td>
                <td className="px-6 py-4 text-sm">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    risk.severity === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                    risk.severity === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                    risk.severity === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {risk.severity === 'CRITICAL' ? '🔴' : risk.severity === 'HIGH' ? '🟠' : risk.severity === 'MEDIUM' ? '🟡' : '🟢'} {risk.severity}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">
                  <Button
                    variant="outline"
                    size="sm"
                  >
                    View Details
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AssessmentsTab() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Risk Assessments</h3>
        <Button>
          <Plus size={14} className="mr-2" />
          New Assessment
        </Button>
      </div>

      {/* Pending Assessments */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
        <h4 className="text-md font-semibold text-white mb-4">Pending Assessments (3)</h4>
        <div className="space-y-4">
          {[
            { system: 'HR Recruitment AI', dueDate: 'Jan 10', riskLevel: 'HIGH', lastAssessment: 'Oct 15, 2025', daysUntilDue: 3, regulations: ['GDPR', 'AI Act'] },
            { system: 'Content Moderation AI', dueDate: 'Jan 25', riskLevel: 'LIMITED', lastAssessment: 'Oct 25, 2025', daysUntilDue: 18, regulations: ['AI Act'] }
          ].map((assessment, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h5 className="text-sm font-medium text-white">{assessment.system}</h5>
                  <div className="flex gap-1">
                    {assessment.regulations.map((reg, i) => (
                      <span key={i} className="px-2 py-0.5 bg-slate-700 text-slate-300 text-xs rounded-full">
                        {reg}
                      </span>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-slate-400">
                  Risk Level: {assessment.riskLevel} • Last Assessment: {assessment.lastAssessment} • Days until due: {assessment.daysUntilDue}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">View History</Button>
                <Button size="sm">Start Assessment</Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Completed Assessments */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-slate-700">
          <h4 className="text-md font-semibold text-white">Completed Assessments (47)</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-800/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">System</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Regulation</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Completed</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Score</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Change</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Risks Found</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {[
                { system: 'Credit Scoring', regulation: 'GDPR, AI Act', completed: 'Jan 05', score: 34, change: -12, risks: 3 },
                { system: 'Customer Service', regulation: 'AI Act', completed: 'Jan 03', score: 28, change: -5, risks: 2 },
                { system: 'Recommendation', regulation: 'AI Act', completed: 'Dec 28', score: 19, change: 3, risks: 1 }
              ].map((assessment, index) => (
                <tr key={index} className="hover:bg-slate-800/30">
                  <td className="px-6 py-4 text-sm text-white">{assessment.system}</td>
                  <td className="px-6 py-4 text-sm text-slate-300 text-xs">{assessment.regulation}</td>
                  <td className="px-6 py-4 text-sm text-slate-300">{assessment.completed}</td>
                  <td className="px-6 py-4 text-sm text-white font-mono">{assessment.score}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={assessment.change >= 0 ? 'text-green-400' : 'text-red-400'}>
                      {assessment.change >= 0 ? '↗' : '↘'} {Math.abs(assessment.change)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-300">{assessment.risks}</td>
                  <td className="px-6 py-4 text-sm">
                    <Button variant="outline" size="sm">View</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function MitigationsTab() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Mitigation Tracking</h3>
        <Button>
          <Plus size={14} className="mr-2" />
          New Mitigation
        </Button>
      </div>

      {/* Overdue */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
        <h4 className="text-md font-semibold text-red-400 mb-4">🔴 Overdue (5)</h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
            <div>
              <h5 className="text-sm font-medium text-white">API Security Update</h5>
              <p className="text-xs text-slate-400">Risk: RSK-046 • Priority: CRITICAL • Due: Jan 02, 2026</p>
              <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
                <div className="bg-red-500 h-2 rounded-full" style={{ width: '80%' }}></div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">Update Progress</Button>
              <Button variant="outline" size="sm">View Risk</Button>
            </div>
          </div>
        </div>
      </div>

      {/* In Progress */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
        <h4 className="text-md font-semibold text-yellow-400 mb-4">🔵 In Progress (12)</h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
            <div>
              <h5 className="text-sm font-medium text-white">SCC with AI Providers</h5>
              <p className="text-xs text-slate-400">Risk: RSK-047 • Priority: HIGH • Due: Jan 15, 2026</p>
              <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '60%' }}></div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">Update Progress</Button>
              <Button variant="outline" size="sm">View Risk</Button>
            </div>
          </div>
        </div>
        <Button variant="link" size="sm" className="text-cyan-400 mt-4">
          Show 10 more →
        </Button>
      </div>

      {/* Completed */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
        <h4 className="text-md font-semibold text-green-400 mb-4">🟢 Completed (23)</h4>
        <Button variant="link" size="sm" className="text-cyan-400">
          View All Completed →
        </Button>
      </div>
    </div>
  );
}

function HeatmapTab() {
  return (
    <div className="space-y-6">
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Risk Heatmap - Impact vs Likelihood Matrix</h3>

        {/* Heatmap Grid */}
        <div className="overflow-x-auto">
          <div className="min-w-max">
            {/* Header */}
            <div className="grid grid-cols-6 gap-1 mb-2">
              <div></div>
              <div className="text-center text-xs text-slate-400 py-2">Rare (1)</div>
              <div className="text-center text-xs text-slate-400 py-2">Unlikely (2)</div>
              <div className="text-center text-xs text-slate-400 py-2">Possible (3)</div>
              <div className="text-center text-xs text-slate-400 py-2">Likely (4)</div>
              <div className="text-center text-xs text-slate-400 py-2">Almost Certain (5)</div>
            </div>

            {/* Rows */}
            {[
              { impact: 'Negligible (1)', cells: [4, 2, 0, 0, 0] },
              { impact: 'Minor (2)', cells: [3, 5, 2, 0, 0] },
              { impact: 'Moderate (3)', cells: [0, 3, 6, 2, 0] },
              { impact: 'Major (4)', cells: [0, 0, 2, 4, 0] },
              { impact: 'Catastrophic (5)', cells: [0, 0, 0, 1, 2] }
            ].map((row, rowIndex) => (
              <div key={rowIndex} className="grid grid-cols-6 gap-1 mb-1">
                <div className="text-right text-xs text-slate-400 py-2 pr-2">{row.impact}</div>
                {row.cells.map((count, colIndex) => (
                  <div
                    key={colIndex}
                    className={`w-12 h-12 border rounded flex items-center justify-center text-xs font-medium cursor-pointer ${
                      rowIndex === 0 && colIndex < 3 ? 'bg-green-500/20 border-green-500/30' :
                      rowIndex === 1 && colIndex < 4 ? 'bg-green-500/20 border-green-500/30' :
                      rowIndex === 2 && colIndex < 3 ? 'bg-yellow-500/20 border-yellow-500/30' :
                      rowIndex === 3 && colIndex < 4 ? 'bg-orange-500/20 border-orange-500/30' :
                      'bg-red-500/20 border-red-500/30'
                    }`}
                    title={`Impact: ${row.impact.split(' ')[0]}, Likelihood: ${colIndex + 1}, Risks: ${count}`}
                  >
                    {count > 0 && (
                      <div className="flex gap-0.5">
                        {Array.from({ length: Math.min(count, 5) }, (_, i) => (
                          <div key={i} className="w-1 h-1 bg-white rounded-full"></div>
                        ))}
                        {count > 5 && <span className="text-white ml-0.5">+</span>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-slate-700">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500/20 border border-green-500/30 rounded"></div>
            <span className="text-xs text-slate-400">Low Risk</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500/20 border border-yellow-500/30 rounded"></div>
            <span className="text-xs text-slate-400">Medium Risk</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-500/20 border border-orange-500/30 rounded"></div>
            <span className="text-xs text-slate-400">High Risk</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500/20 border border-red-500/30 rounded"></div>
            <span className="text-xs text-slate-400">Critical Risk</span>
          </div>
        </div>

        <p className="text-xs text-slate-500 mt-4 text-center">● = 1 risk • Click cell to view risks • Total: 47 risks assessed</p>
      </div>
    </div>
  );
}
