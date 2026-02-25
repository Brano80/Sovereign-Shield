"use client";

import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  Plus,
  Download,
  ChevronDown,
  FileText,
  Activity,
  Shield,
  Zap,
  Globe,
  XCircle
} from "lucide-react";
import DashboardLayout from '@/app/components/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function IncidentTimelinePage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'active' | 'resolved'>('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Mock data - empty state
  const stats = {
    activeIncidents: 0,
    resolvedThisMonth: 0,
    avgResolutionTime: '--',
    overdueNotifications: 0,
    gdprBreaches: 0,
    doraIctIncidents: 0,
    nis2Reports: 0,
    aiActSerious: 0,
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    console.log('[Incident Timeline] Refresh triggered');
    // TODO: Implement full functionality
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  const getStatusColor = () => {
    if (stats.activeIncidents === 0) {
      return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    } else if (stats.activeIncidents <= 5) {
      return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
    } else {
      return 'text-red-400 bg-red-500/10 border-red-500/20';
    }
  };

  const getStatusIcon = () => {
    if (stats.activeIncidents === 0) {
      return <CheckCircle size={16} />;
    } else {
      return <AlertTriangle size={16} />;
    }
  };

  const getStatusText = () => {
    if (stats.activeIncidents === 0) {
      return 'ALL CLEAR';
    } else {
      return `${stats.activeIncidents} ACTIVE`;
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-slate-950">
        {/* Header */}
        <div className="border-b border-slate-800 bg-slate-800/50 backdrop-blur supports-[backdrop-filter]:bg-slate-800/50">
          <div className="px-6 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">INCIDENT TIMELINE</h1>
                <p className="text-slate-400 mt-1">GDPR Art. 33-34 • DORA Art. 13-19 • NIS2 Art. 23 • AI Act Art. 62</p>

                {/* Status Banner */}
                <div className="mt-6 flex items-center gap-4">
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium ${getStatusColor()}`}>
                    {getStatusIcon()}
                    Status: {getStatusText()}
                  </div>

                  <div className="text-sm text-slate-400">
                    Active incidents: <span className="text-slate-300 font-medium">{stats.activeIncidents}</span> │
                    Overdue: <span className="text-slate-300 font-medium">{stats.overdueNotifications}</span> │
                    Last update: <span className="text-slate-300 font-medium">Just now</span>
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
                  onClick={() => {
                    console.log('[Incident Timeline] New Incident triggered');
                    // TODO: Implement full functionality
                  }}
                  className="border-slate-700 text-slate-300 hover:bg-slate-800"
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
                    <DropdownMenuItem className="text-slate-300 hover:bg-slate-800" onClick={() => console.log('[Incident Timeline] Export as PDF')}>
                      <FileText size={14} className="mr-2" />
                      Incident Report (PDF)
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-slate-300 hover:bg-slate-800" onClick={() => console.log('[Incident Timeline] Export All Incidents as CSV')}>
                      <Download size={14} className="mr-2" />
                      All Incidents (CSV)
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-slate-300 hover:bg-slate-800" onClick={() => console.log('[Incident Timeline] Export Timeline as CSV')}>
                      <Activity size={14} className="mr-2" />
                      Timeline (CSV)
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-slate-300 hover:bg-slate-800" onClick={() => console.log('[Incident Timeline] Export Compliance Report')}>
                      <Shield size={14} className="mr-2" />
                      Compliance Report
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
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
                    <p className="text-sm text-slate-400">ACTIVE INCIDENTS</p>
                    <p className="text-2xl font-bold text-white">{stats.activeIncidents}</p>
                    <p className="text-sm text-slate-400">Requiring attention</p>
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
                    <p className="text-sm text-slate-400">RESOLVED THIS MONTH</p>
                    <p className="text-2xl font-bold text-white">{stats.resolvedThisMonth}</p>
                    <p className="text-sm text-emerald-400">↗ 0%</p>
                  </div>
                  <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                    <CheckCircle size={16} className="text-emerald-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">AVG RESOLUTION TIME</p>
                    <p className="text-2xl font-bold text-white">{stats.avgResolutionTime}</p>
                    <p className="text-sm text-slate-400">Target: &lt;72h</p>
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
                    <p className="text-sm text-slate-400">OVERDUE NOTIFICATIONS</p>
                    <p className="text-2xl font-bold text-white">{stats.overdueNotifications}</p>
                    <p className="text-sm text-red-400">⚠ Action needed</p>
                  </div>
                  <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                    <XCircle size={16} className="text-red-400" />
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
                    <p className="text-sm text-slate-400">GDPR BREACHES</p>
                    <p className="text-2xl font-bold text-white">{stats.gdprBreaches}</p>
                    <p className="text-sm text-slate-400">Art. 33-34</p>
                  </div>
                  <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                    <Shield size={16} className="text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">DORA ICT INCIDENTS</p>
                    <p className="text-2xl font-bold text-white">{stats.doraIctIncidents}</p>
                    <p className="text-sm text-slate-400">Art. 13-19</p>
                  </div>
                  <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                    <Activity size={16} className="text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">NIS2 REPORTS</p>
                    <p className="text-2xl font-bold text-white">{stats.nis2Reports}</p>
                    <p className="text-sm text-slate-400">Art. 23</p>
                  </div>
                  <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                    <Globe size={16} className="text-cyan-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">AI ACT SERIOUS</p>
                    <p className="text-2xl font-bold text-white">{stats.aiActSerious}</p>
                    <p className="text-sm text-slate-400">Art. 62</p>
                  </div>
                  <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                    <Zap size={16} className="text-yellow-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 py-4 border-b border-slate-800">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-slate-800/50 border border-slate-800">
              <TabsTrigger value="overview" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white">
                Overview
              </TabsTrigger>
              <TabsTrigger value="timeline" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white">
                Timeline
              </TabsTrigger>
              <TabsTrigger value="active" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white">
                Active
              </TabsTrigger>
              <TabsTrigger value="resolved" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white">
                Resolved
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <div className="space-y-6">
                {/* Top Row: Two Panels Side by Side */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left: Incident Severity Breakdown */}
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-white mb-4">Incident Severity Breakdown</h3>
                      <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                          <AlertTriangle className="w-12 h-12 text-slate-400 mx-auto mb-2 opacity-50" />
                          <p className="text-slate-400">No incidents recorded</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Right: Upcoming Deadlines */}
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-white mb-4">Upcoming Deadlines</h3>
                      <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                          <Clock className="w-12 h-12 text-slate-400 mx-auto mb-2 opacity-50" />
                          <p className="text-slate-400">No pending deadlines</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Bottom: Recent Activity */}
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
                    <div className="flex items-center justify-center h-48">
                      <div className="text-center">
                        <Activity className="w-12 h-12 text-slate-400 mx-auto mb-2 opacity-50" />
                        <p className="text-slate-400">No recent incident activity</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="timeline" className="mt-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Incident Timeline</h3>
                  <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                      <Clock className="w-16 h-16 text-slate-400 mx-auto mb-4 opacity-50" />
                      <p className="text-slate-400 text-lg mb-2">No incidents to display</p>
                      <p className="text-slate-500 text-sm">
                        Incidents from all regulations will appear here chronologically.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="active" className="mt-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-6">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-700">
                          <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase">Created</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase">Severity</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase">Title</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase">Regulation</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase">Status</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase">Deadline</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td colSpan={7} className="py-12 text-center">
                            <div className="flex flex-col items-center">
                              <AlertTriangle className="w-12 h-12 text-slate-400 mb-3 opacity-50" />
                              <p className="text-slate-400 text-lg mb-1">No active incidents</p>
                              <p className="text-slate-500 text-sm">
                                Active incidents requiring attention will appear here.
                              </p>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="resolved" className="mt-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-6">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-700">
                          <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase">Created</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase">Severity</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase">Title</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase">Regulation</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase">Status</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase">Resolved</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td colSpan={7} className="py-12 text-center">
                            <div className="flex flex-col items-center">
                              <CheckCircle className="w-12 h-12 text-slate-400 mb-3 opacity-50" />
                              <p className="text-slate-400 text-lg mb-1">No resolved incidents</p>
                              <p className="text-slate-500 text-sm">
                                Resolved incidents will appear here for historical reference.
                              </p>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
}
