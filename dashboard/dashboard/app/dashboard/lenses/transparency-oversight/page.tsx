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
  AlertCircle,
  CheckSquare,
  XCircle,
  Clock as ClockIcon,
  BarChart3,
  PieChart,
  MessageSquare,
  FileCheck,
  Settings,
  Download,
  Search,
  MoreHorizontal
} from "lucide-react";
import { complianceApi } from "@/app/lib/api-client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Dynamic imports for Recharts
const LineChart: any = dynamic(async () => (await import("recharts")).LineChart as any, { ssr: false });
const Line: any = dynamic(async () => (await import("recharts")).Line as any, { ssr: false });
const XAxis: any = dynamic(async () => (await import("recharts")).XAxis as any, { ssr: false });
const YAxis: any = dynamic(async () => (await import("recharts")).YAxis as any, { ssr: false });
const CartesianGrid: any = dynamic(async () => (await import("recharts")).CartesianGrid as any, { ssr: false });
const Tooltip: any = dynamic(async () => (await import("recharts")).Tooltip as any, { ssr: false });
const ResponsiveContainer: any = dynamic(async () => (await import("recharts")).ResponsiveContainer as any, { ssr: false });
const Legend: any = dynamic(async () => (await import("recharts")).Legend as any, { ssr: false });
const PieChartRecharts: any = dynamic(async () => (await import("recharts")).PieChart as any, { ssr: false });
const Pie: any = dynamic(async () => (await import("recharts")).Pie as any, { ssr: false });
const Cell: any = dynamic(async () => (await import("recharts")).Cell as any, { ssr: false });

// Import tab components
import { OverviewTab } from './components/OverviewTab';
import { ReviewQueueTab } from './components/ReviewQueueTab';
import { DecisionLogTab } from './components/DecisionLogTab';
import { AISystemsTab, AISystemDetailModal } from './components/AISystemsTab';
import { DisclosuresTab, DisclosureTemplateEditor } from './components/DisclosuresTab';
import { ReviewPanelModal } from './components/ReviewPanelModal';
import { NewReviewRequestModal } from './components/NewReviewRequestModal';
import { formatDateTimeDDMMYYYY } from '@/lib/utils';

// Types for Transparency & Human Oversight data
interface TransparencyOverview {
  pendingReviews: number;
  overdueReviews: number;
  autoDecisionsToday: number;
  autoDecisionsChange: number;
  humanOverrideRate: number;
  humanOverrideChange: number;
  avgReviewTime: number;
  avgReviewTimeChange: number;
  aiDisclosureCompliance: number;
  explanationRequests: number;
  avgExplanationResponseTime: string;
  appealsPending: number;
  appealsSlaHours: number;
  highRiskDecisions: number;
  lastAuditTimestamp: Date;
  complianceStatus: 'COMPLIANT' | 'NON_COMPLIANT' | 'MONITORING';
}

interface ReviewItem {
  id: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  category: string;
  subject: string;
  waitingTime: string;
  assignedTo?: string;
  userId: string;
  systemName: string;
  confidence: number;
  timestamp: Date;
  slaBreach: boolean;
}

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

interface DisclosureTemplate {
  id: string;
  name: string;
  usedBy: string;
  type: 'DECISION' | 'ACTION' | 'INTERACTION' | 'SUGGESTION';
  lastUpdated: Date;
  status: 'ACTIVE' | 'REVIEW' | 'DRAFT';
  requiredElements: string[];
}

interface DisclosureEvent {
  timestamp: Date;
  userId: string;
  systemName: string;
  disclosureType: string;
  status: 'DELIVERED' | 'FAILED' | 'PENDING';
}

interface ReviewQueueData {
  reviews: ReviewItem[];
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  overdue: number;
}

interface DecisionDistribution {
  autoApproved: number;
  humanApproved: number;
  humanRejected: number;
  escalated: number;
}

interface ActivityFeedItem {
  id: string;
  timestamp: Date;
  type: 'AUTO_APPROVED' | 'QUEUED_REVIEW' | 'HUMAN_OVERRIDE' | 'APPEAL_RECEIVED';
  message: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  decisionId?: string;
}

interface RequiresAttentionItem {
  id: string;
  type: 'OVERDUE_REVIEW' | 'APPEAL_DEADLINE' | 'MISSING_DISCLOSURE';
  title: string;
  description: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  actionLabel: string;
  actionUrl?: string;
}

export default function TransparencyOversightPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'review-queue' | 'decision-log' | 'ai-systems' | 'disclosures'>('overview');
  const [overview, setOverview] = useState<TransparencyOverview | null>(null);
  const [reviewQueue, setReviewQueue] = useState<ReviewQueueData | null>(null);
  const [decisionLog, setDecisionLog] = useState<DecisionLogEntry[]>([]);
  const [aiSystems, setAiSystems] = useState<AISystem[]>([]);
  const [disclosureTemplates, setDisclosureTemplates] = useState<DisclosureTemplate[]>([]);
  const [disclosureEvents, setDisclosureEvents] = useState<DisclosureEvent[]>([]);
  const [activityFeed, setActivityFeed] = useState<ActivityFeedItem[]>([]);
  const [requiresAttention, setRequiresAttention] = useState<RequiresAttentionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Modal states
  const [showNewReviewModal, setShowNewReviewModal] = useState(false);
  const [showReviewPanel, setShowReviewPanel] = useState<ReviewItem | null>(null);
  const [showSystemDetail, setShowSystemDetail] = useState<AISystem | null>(null);
  const [showTemplateEditor, setShowTemplateEditor] = useState<DisclosureTemplate | null>(null);

  // Filters and controls
  const [eventFilter, setEventFilter] = useState<'ALL' | 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [activityPaused, setActivityPaused] = useState(false);

  useEffect(() => {
    fetchAllData();

    // Auto-refresh every 30 seconds if enabled
    const interval = autoRefresh ? setInterval(fetchAllData, 30000) : null;
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const fetchAllData = async () => {
    try {
      setIsLoading(true);

      // Fetch all data in parallel using complianceApi
      const [
        overviewData,
        queueData,
        logData,
        systemsData,
        templatesData,
        eventsData,
        activityData,
        attentionData
      ] = await Promise.all([
        complianceApi.get<TransparencyOverview>('/lenses/transparency-oversight/overview'),
        complianceApi.get<ReviewQueueData>('/lenses/transparency-oversight/review-queue'),
        complianceApi.get<any>('/lenses/transparency-oversight/decision-log?limit=50'),
        complianceApi.get<any>('/lenses/transparency-oversight/ai-systems'),
        complianceApi.get<any>('/lenses/transparency-oversight/disclosure-templates'),
        complianceApi.get<any>('/lenses/transparency-oversight/disclosure-events?limit=20'),
        complianceApi.get<any>('/lenses/transparency-oversight/activity-feed'),
        complianceApi.get<any>('/lenses/transparency-oversight/requires-attention')
      ]);

      setOverview(overviewData);
      setReviewQueue(queueData);
      setDecisionLog((logData as any).entries || logData);
      setAiSystems((systemsData as any).systems || systemsData);
      setDisclosureTemplates((templatesData as any).templates || templatesData);
      setDisclosureEvents((eventsData as any).events || eventsData);
      setActivityFeed((activityData as any).feed || activityData);
      setRequiresAttention((attentionData as any).items || attentionData);
      setLastUpdated(new Date());
      setError(null);

    } catch (err) {
      console.error('Error fetching transparency data:', err);
      let errorMessage = 'An unexpected error occurred while loading transparency oversight data.';
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
            <h2 className="text-2xl font-bold mb-2">Transparency Oversight Error</h2>
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
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">TRANSPARENCY & HUMAN OVERSIGHT</h1>
              <p className="text-gray-400 mt-1">
                EU AI Act Art. 13, 14, 50, 52 • GDPR Art. 13, 14, 22
              </p>
              <div className="flex items-center mt-2 space-x-2">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  overview?.complianceStatus === 'COMPLIANT'
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : overview?.complianceStatus === 'MONITORING'
                    ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}>
                  {overview?.complianceStatus === 'COMPLIANT' ? '🟢 COMPLIANT' :
                   overview?.complianceStatus === 'MONITORING' ? '🟡 MONITORING' :
                   '🔴 NON-COMPLIANT'}
                </span>
                <span className="text-sm text-gray-500">
                  Last audit: {overview?.lastAuditTimestamp ? formatDateTimeDDMMYYYY(overview.lastAuditTimestamp) : 'Never'}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={fetchAllData}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Refresh</span>
              </button>
              <button
                onClick={() => setShowNewReviewModal(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>New Review Request</span>
              </button>
              <div className="relative">
                <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg flex items-center space-x-2 transition-colors">
                  <Download className="h-4 w-4" />
                  <span>Export</span>
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* KPI Cards - Row 1 */}
        {overview && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400 text-sm">PENDING REVIEWS</span>
                <AlertTriangle className="text-red-400" size={20} />
              </div>
              <div className="text-3xl font-bold text-white">{overview.pendingReviews}</div>
              <div className="text-sm text-red-400 mt-1">
                ⚠ {overview.overdueReviews} overdue
              </div>
              <div className="mt-2 h-2 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-red-500 rounded-full" style={{ width: `${(overview.overdueReviews / overview.pendingReviews) * 100}%` }}></div>
              </div>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400 text-sm">AUTO DECISIONS TODAY</span>
                <Activity className="text-blue-400" size={20} />
              </div>
              <div className="text-3xl font-bold text-white">{overview.autoDecisionsToday.toLocaleString()}</div>
              <div className={`text-sm mt-1 ${overview.autoDecisionsChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {overview.autoDecisionsChange >= 0 ? '↗' : '↘'} {Math.abs(overview.autoDecisionsChange)}%
              </div>
              <div className="mt-2 h-2 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400 text-sm">HUMAN OVERRIDE RATE</span>
                <Users className="text-orange-400" size={20} />
              </div>
              <div className="text-3xl font-bold text-white">{overview.humanOverrideRate}%</div>
              <div className={`text-sm mt-1 ${overview.humanOverrideChange >= 0 ? 'text-red-400' : 'text-green-400'}`}>
                {overview.humanOverrideChange >= 0 ? '↗' : '↘'} {Math.abs(overview.humanOverrideChange)}%
              </div>
              <div className="mt-2 h-2 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-orange-500 rounded-full" style={{ width: `${overview.humanOverrideRate}%` }}></div>
              </div>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400 text-sm">AVG REVIEW TIME</span>
                <Clock className="text-purple-400" size={20} />
              </div>
              <div className="text-3xl font-bold text-white">{overview.avgReviewTime} min</div>
              <div className={`text-sm mt-1 ${overview.avgReviewTimeChange >= 0 ? 'text-red-400' : 'text-green-400'}`}>
                {overview.avgReviewTimeChange >= 0 ? '↗' : '↘'} {Math.abs(overview.avgReviewTimeChange)}%
              </div>
              <div className="text-xs text-slate-500 mt-1">Target: &lt;5min</div>
            </div>
          </div>
        )}

        {/* KPI Cards - Row 2 */}
        {overview && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400 text-sm">AI DISCLOSURE COMPLIANCE</span>
                <FileCheck className="text-green-400" size={20} />
              </div>
              <div className="text-3xl font-bold text-white">{overview.aiDisclosureCompliance}%</div>
              <div className="text-sm text-slate-500 mt-1">Art. 50/52</div>
              <div className="mt-2 h-2 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: `${overview.aiDisclosureCompliance}%` }}></div>
              </div>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400 text-sm">EXPLANATION REQUESTS</span>
                <MessageSquare className="text-cyan-400" size={20} />
              </div>
              <div className="text-3xl font-bold text-white">{overview.explanationRequests}</div>
              <div className="text-sm text-slate-500 mt-1">
                Avg response: {overview.avgExplanationResponseTime}
              </div>
              <div className="mt-2 h-2 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-500 rounded-full" style={{ width: '60%' }}></div>
              </div>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400 text-sm">APPEALS PENDING</span>
                <Scale className="text-yellow-400" size={20} />
              </div>
              <div className="text-3xl font-bold text-white">{overview.appealsPending}</div>
              <div className="text-sm text-slate-500 mt-1">
                SLA: {overview.appealsSlaHours}h
              </div>
              <div className="mt-2 h-2 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-yellow-500 rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400 text-sm">HIGH-RISK DECISIONS</span>
                <AlertCircle className="text-red-400" size={20} />
              </div>
              <div className="text-3xl font-bold text-white">{overview.highRiskDecisions}</div>
              <div className="text-sm text-slate-500 mt-1">Requires review</div>
              <div className="mt-2 h-2 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-red-500 rounded-full" style={{ width: '40%' }}></div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="px-6 py-4 border-b border-slate-800">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-5 bg-slate-800/50 border border-slate-800">
              <TabsTrigger value="overview" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white">
                Overview
              </TabsTrigger>
              <TabsTrigger value="review-queue" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white">
                Review Queue
              </TabsTrigger>
              <TabsTrigger value="decision-log" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white">
                Decision Log
              </TabsTrigger>
              <TabsTrigger value="ai-systems" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white">
                AI Systems
              </TabsTrigger>
              <TabsTrigger value="disclosures" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white">
                Disclosures
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <OverviewTab
                reviewQueue={reviewQueue}
                activityFeed={activityFeed}
                requiresAttention={requiresAttention}
                activityPaused={activityPaused}
                setActivityPaused={setActivityPaused}
                eventFilter={eventFilter}
                setEventFilter={setEventFilter}
              />
            </TabsContent>

            <TabsContent value="review-queue" className="mt-6">
              <ReviewQueueTab
                reviewQueue={reviewQueue}
                showReviewPanel={showReviewPanel}
                setShowReviewPanel={setShowReviewPanel}
              />
            </TabsContent>

            <TabsContent value="decision-log" className="mt-6">
              <DecisionLogTab decisionLog={decisionLog} />
            </TabsContent>

            <TabsContent value="ai-systems" className="mt-6">
              <AISystemsTab
                aiSystems={aiSystems}
                showSystemDetail={showSystemDetail}
                setShowSystemDetail={setShowSystemDetail}
              />
            </TabsContent>

            <TabsContent value="disclosures" className="mt-6">
              <DisclosuresTab
                disclosureTemplates={disclosureTemplates}
                disclosureEvents={disclosureEvents}
                showTemplateEditor={showTemplateEditor}
                setShowTemplateEditor={setShowTemplateEditor}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Modals */}
        {showNewReviewModal && (
          <NewReviewRequestModal
            onClose={() => setShowNewReviewModal(false)}
            onSubmit={(data) => {
              console.log('New review request:', data);
              setShowNewReviewModal(false);
              fetchAllData();
            }}
          />
        )}

        {showReviewPanel && (
          <ReviewPanelModal
            review={showReviewPanel}
            onClose={() => setShowReviewPanel(null)}
            onAction={(action, notes) => {
              console.log('Review action:', action, notes);
              setShowReviewPanel(null);
              fetchAllData();
            }}
          />
        )}

        {showSystemDetail && (
          <AISystemDetailModal
            system={showSystemDetail}
            onClose={() => setShowSystemDetail(null)}
          />
        )}

        {showTemplateEditor && (
          <DisclosureTemplateEditor
            template={showTemplateEditor}
            onClose={() => setShowTemplateEditor(null)}
            onSave={(template) => {
              console.log('Template saved:', template);
              setShowTemplateEditor(null);
              fetchAllData();
            }}
          />
        )}
      </div>
    </div>
  );
}
