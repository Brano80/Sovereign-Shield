"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Shield,
  AlertTriangle,
  RefreshCw,
  Download,
  ChevronDown,
  Clock,
  FileText,
  Bot,
  Info,
  Power,
  PowerOff,
  ExternalLink,
} from "lucide-react";
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useIncidents } from '@/app/hooks/useIncidents';
import { complianceApi } from '@/app/lib/api-client';
import type { Incident } from '@/app/types/incidents';

interface EvidenceEvent {
  id: string;
  eventId: string;
  eventType: string;
  severity: string;
  sourceSystem: string;
  regulatoryTags: string[];
  articles: string[];
  payload: Record<string, unknown>;
  occurredAt: string;
}

interface EvidenceEventsResponse {
  events: EvidenceEvent[];
  totalCount: number;
}

interface ModuleInfo {
  id: string;
  name: string;
  display_name: string;
  enabled: boolean;
}

interface ModulesResponse {
  modules: ModuleInfo[];
}

export default function AIActArt5Page() {
  const [activeTab, setActiveTab] = useState("overview");
  const [events, setEvents] = useState<EvidenceEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState<string | null>(null);
  const [moduleEnabled, setModuleEnabled] = useState<boolean | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const incidentsData = useIncidents();
  const incidents: Incident[] = incidentsData?.incidents || [];

  const fetchEvents = async () => {
    try {
      setEventsLoading(true);
      setEventsError(null);
      const result = await complianceApi.get<EvidenceEventsResponse>(
        '/evidence/events?search=PROHIBITED_PRACTICE&limit=100'
      );
      const allEvents = result.events || [];
      const filtered = allEvents.filter(
        (e) => e.eventType === 'PROHIBITED_PRACTICE_DETECTED' || e.eventType === 'PROHIBITED_PRACTICE_REVIEW'
      );
      setEvents(filtered);
    } catch (err) {
      setEventsError(err instanceof Error ? err.message : 'Failed to fetch events');
      setEvents([]);
    } finally {
      setEventsLoading(false);
    }
  };

  const fetchModuleStatus = async () => {
    try {
      const result = await complianceApi.get<ModulesResponse>('/modules');
      const art5Module = result.modules?.find(
        (m) => m.name === 'ai-act-art5' || m.name === 'ai_prohibited_practices'
      );
      setModuleEnabled(art5Module?.enabled ?? false);
    } catch {
      setModuleEnabled(null);
    }
  };

  useEffect(() => {
    fetchEvents();
    fetchModuleStatus();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchEvents();
    await fetchModuleStatus();
    setRefreshing(false);
  };

  const detectedEvents = useMemo(
    () => events.filter((e) => e.eventType === 'PROHIBITED_PRACTICE_DETECTED'),
    [events]
  );

  const reviewEvents = useMemo(
    () => events.filter((e) => e.eventType === 'PROHIBITED_PRACTICE_REVIEW'),
    [events]
  );

  const aiActIncidents = useMemo(
    () => incidents.filter((inc) => inc.regulation === 'AI_ACT'),
    [incidents]
  );

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-800/50 backdrop-blur supports-[backdrop-filter]:bg-slate-800/50">
        <div className="px-6 py-6">
          {eventsError && (
            <div className="mb-4 p-3 bg-yellow-900/20 border border-yellow-700/50 rounded-lg text-yellow-400 text-sm">
              Backend may be offline: {eventsError}
            </div>
          )}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">PROHIBITED AI PRACTICES</h1>
              <p className="text-slate-400 mt-1">EU AI Act Article 5 — Banned AI Applications Detection</p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                <RefreshCw size={14} className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
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
                  <DropdownMenuItem className="text-slate-300 hover:bg-slate-800">
                    <FileText size={14} className="mr-2" />
                    Violation History (CSV)
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Capability Limitation Banner */}
      <div className="px-6 pt-4">
        <div className="flex items-start gap-2 px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs text-amber-300/90">
          <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
          <span>
            Art. 5 detection uses keyword-based action matching. Behavioral analysis requires
            explicit action labeling in evaluate() requests. Medical/safety exceptions for emotion
            recognition (Art. 5(1)(f)) and factual-evidence exceptions for predictive policing
            (Art. 5(1)(h)) are not automatically detected — manual review required for these cases.
            See API documentation.
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="px-6 py-6 border-b border-slate-800">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Violations Detected */}
          <Card className="bg-slate-800/50 border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">VIOLATIONS DETECTED</p>
                  <p className="text-2xl font-bold text-white">
                    {eventsLoading ? '—' : detectedEvents.length}
                  </p>
                  <p className="text-sm text-slate-500">PROHIBITED_PRACTICE_DETECTED</p>
                </div>
                <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                  <AlertTriangle size={16} className="text-red-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Under Review */}
          <Card className="bg-slate-800/50 border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">UNDER REVIEW</p>
                  <p className="text-2xl font-bold text-white">
                    {eventsLoading ? '—' : reviewEvents.length}
                  </p>
                  <p className="text-sm text-slate-500">PROHIBITED_PRACTICE_REVIEW</p>
                </div>
                <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                  <Clock size={16} className="text-yellow-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Act Incidents */}
          <Card className="bg-slate-800/50 border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">AI ACT INCIDENTS</p>
                  <p className="text-2xl font-bold text-white">{aiActIncidents.length}</p>
                  <p className="text-sm text-slate-500">From incident system</p>
                </div>
                <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                  <Bot size={16} className="text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Module Status */}
          <Card className="bg-slate-800/50 border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">MODULE STATUS</p>
                  <p className="text-2xl font-bold text-white">
                    {moduleEnabled === null ? '—' : moduleEnabled ? 'ENABLED' : 'DISABLED'}
                  </p>
                  <p className="text-sm text-slate-500">ai-act-art5</p>
                </div>
                <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                  {moduleEnabled ? (
                    <Power size={16} className="text-emerald-400" />
                  ) : (
                    <PowerOff size={16} className="text-red-400" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 py-4 border-b border-slate-800">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-slate-800/50 border border-slate-800">
            <TabsTrigger value="overview" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white">
              Overview
            </TabsTrigger>
            <TabsTrigger value="violations" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white">
              Violations ({detectedEvents.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <OverviewTab
              detectedEvents={detectedEvents}
              reviewEvents={reviewEvents}
              aiActIncidents={aiActIncidents}
              eventsLoading={eventsLoading}
            />
          </TabsContent>

          <TabsContent value="violations" className="mt-6">
            <ViolationsTab events={detectedEvents} loading={eventsLoading} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function OverviewTab({
  detectedEvents,
  reviewEvents,
  aiActIncidents,
  eventsLoading,
}: {
  detectedEvents: EvidenceEvent[];
  reviewEvents: EvidenceEvent[];
  aiActIncidents: Incident[];
  eventsLoading: boolean;
}) {
  const categoryBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const ev of detectedEvents) {
      const category = (ev.payload?.category as string) || 'unknown';
      counts[category] = (counts[category] || 0) + 1;
    }
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [detectedEvents]);

  const recentEvents = useMemo(
    () =>
      [...detectedEvents, ...reviewEvents]
        .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())
        .slice(0, 10),
    [detectedEvents, reviewEvents]
  );

  if (eventsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-6 h-6 animate-spin text-slate-400" />
        <span className="ml-2 text-slate-400">Loading evidence events...</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Category Breakdown */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Detections by Category</h3>
        {categoryBreakdown.length === 0 ? (
          <p className="text-sm text-slate-400">No prohibited practice detections recorded.</p>
        ) : (
          <div className="space-y-3">
            {categoryBreakdown.map(([category, count]) => (
              <div key={category} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-red-400" />
                  <span className="text-sm text-slate-300">{category.replace(/_/g, ' ')}</span>
                </div>
                <Badge className="bg-red-500/20 text-red-400 border-red-500/50">
                  {count}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* AI Act Incidents from Incident System */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">AI Act Incidents</h3>
          <a
            href="/dashboard/incident-timeline"
            className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
          >
            View all in Incident Timeline <ExternalLink className="w-3 h-3" />
          </a>
        </div>
        {aiActIncidents.length === 0 ? (
          <p className="text-sm text-slate-400">No AI Act incidents recorded.</p>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {aiActIncidents.slice(0, 5).map((inc) => (
              <div key={inc.id} className="bg-slate-800/30 rounded-lg p-3 border border-slate-600/30">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white">{inc.title || inc.id}</span>
                  <Badge className="bg-slate-600/50 text-slate-300">{inc.status}</Badge>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {inc.createdAt ? new Date(inc.createdAt).toLocaleString() : '—'}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="lg:col-span-2 bg-slate-800/50 border border-slate-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
        {recentEvents.length === 0 ? (
          <p className="text-sm text-slate-400">No recent Art. 5 events.</p>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {recentEvents.map((ev) => (
              <div key={ev.id} className="bg-slate-800/50 rounded-lg p-3 border border-slate-600/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      ev.eventType === 'PROHIBITED_PRACTICE_DETECTED' ? 'bg-red-400' : 'bg-yellow-400'
                    }`} />
                    <span className="text-xs text-slate-400 font-mono">
                      {new Date(ev.occurredAt).toLocaleString()}
                    </span>
                    <Badge className={
                      ev.eventType === 'PROHIBITED_PRACTICE_DETECTED'
                        ? 'bg-red-500/20 text-red-400 border-red-500/50'
                        : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
                    }>
                      {ev.eventType === 'PROHIBITED_PRACTICE_DETECTED' ? 'BLOCK' : 'REVIEW'}
                    </Badge>
                  </div>
                  <span className="text-xs text-slate-500">{(ev.payload?.category as string) || '—'}</span>
                </div>
                <div className="mt-1 text-xs text-slate-400">
                  Agent: {ev.sourceSystem || '—'} | Articles: {ev.articles?.join(', ') || '—'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ViolationsTab({
  events,
  loading,
}: {
  events: EvidenceEvent[];
  loading: boolean;
}) {
  const sortedEvents = useMemo(
    () => [...events].sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()),
    [events]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-6 h-6 animate-spin text-slate-400" />
        <span className="ml-2 text-slate-400">Loading violations...</span>
      </div>
    );
  }

  if (sortedEvents.length === 0) {
    return (
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 text-center">
        <Shield className="w-12 h-12 mx-auto mb-3 text-slate-600" />
        <p className="text-slate-400">No prohibited practice violations detected.</p>
        <p className="text-xs text-slate-500 mt-1">
          Violations appear here when the evaluate engine blocks an action matching Art. 5 keywords.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-800/50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Timestamp</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Category</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Agent</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Decision</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Articles</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Evidence ID</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {sortedEvents.map((ev) => (
              <tr key={ev.id} className="hover:bg-slate-800/30">
                <td className="px-4 py-3 text-sm text-slate-300 font-mono">
                  {new Date(ev.occurredAt).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-sm text-white">
                  {((ev.payload?.category as string) || 'unknown').replace(/_/g, ' ')}
                </td>
                <td className="px-4 py-3 text-sm text-slate-300">
                  {ev.sourceSystem || '—'}
                </td>
                <td className="px-4 py-3 text-sm">
                  <Badge className="bg-red-500/20 text-red-400 border-red-500/50">BLOCK</Badge>
                </td>
                <td className="px-4 py-3 text-sm text-blue-400 font-mono">
                  {ev.articles?.join(', ') || '—'}
                </td>
                <td className="px-4 py-3 text-sm text-slate-400 font-mono">
                  {ev.id ? ev.id.substring(0, 8) + '...' : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-4 py-3 bg-slate-800/30 border-t border-slate-700">
        <div className="text-sm text-slate-400">
          Showing {sortedEvents.length} violation{sortedEvents.length !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  );
}
