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
  Cpu,
  XCircle,
  AlertCircle,
  Database
} from "lucide-react";
import DashboardLayout from '@/app/components/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AISystemRegistryPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'all-systems' | 'high-risk' | 'registration-status'>('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Mock data - empty state
  const stats = {
    totalSystems: 0,
    highRisk: 0,
    limitedRisk: 0,
    minimalRisk: 0,
    registeredInEuDb: 0,
    pendingRegistration: 0,
    conformityAssessed: 0,
    nonCompliant: 0,
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    console.log('[AI System Registry] Refresh triggered');
    // TODO: Implement full functionality
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  const getStatusColor = () => {
    if (stats.totalSystems === 0) {
      return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    } else if (stats.nonCompliant === 0) {
      return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    } else if (stats.nonCompliant <= 2) {
      return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
    } else {
      return 'text-red-400 bg-red-500/10 border-red-500/20';
    }
  };

  const getStatusIcon = () => {
    if (stats.totalSystems === 0) {
      return <Database size={16} />;
    } else if (stats.nonCompliant === 0) {
      return <CheckCircle size={16} />;
    } else {
      return <AlertTriangle size={16} />;
    }
  };

  const getStatusText = () => {
    if (stats.totalSystems === 0) {
      return 'NO SYSTEMS REGISTERED';
    } else {
      return `${stats.totalSystems} SYSTEMS REGISTERED`;
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
                <h1 className="text-2xl font-bold text-white">AI SYSTEM REGISTRY</h1>
                <p className="text-slate-400 mt-1">AI Act Art. 49, 6, Annex III • System Registration & Risk Classification</p>

                {/* Status Banner */}
                <div className="mt-6 flex items-center gap-4">
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium ${getStatusColor()}`}>
                    {getStatusIcon()}
                    Status: {getStatusText()}
                  </div>

                  <div className="text-sm text-slate-400">
                    High-risk: <span className="text-slate-300 font-medium">{stats.highRisk}</span> │
                    Registered: <span className="text-slate-300 font-medium">{stats.registeredInEuDb}</span> │
                    Pending: <span className="text-slate-300 font-medium">{stats.pendingRegistration}</span>
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
                    console.log('[AI System Registry] Register System triggered');
                    // TODO: Implement full functionality
                  }}
                  className="border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  <Plus size={14} className="mr-2" />
                  Register System
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
                    <DropdownMenuItem className="text-slate-300 hover:bg-slate-800" onClick={() => console.log('[AI System Registry] Export Registry Report as PDF')}>
                      <FileText size={14} className="mr-2" />
                      Registry Report (PDF)
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-slate-300 hover:bg-slate-800" onClick={() => console.log('[AI System Registry] Export All Systems as CSV')}>
                      <Download size={14} className="mr-2" />
                      All Systems (CSV)
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-slate-300 hover:bg-slate-800" onClick={() => console.log('[AI System Registry] Export High-Risk Systems as CSV')}>
                      <AlertTriangle size={14} className="mr-2" />
                      High-Risk Systems (CSV)
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-slate-300 hover:bg-slate-800" onClick={() => console.log('[AI System Registry] Export Registration Status Report')}>
                      <Database size={14} className="mr-2" />
                      Registration Status Report
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
                    <p className="text-sm text-slate-400">TOTAL SYSTEMS</p>
                    <p className="text-2xl font-bold text-white">{stats.totalSystems}</p>
                    <p className="text-sm text-slate-400">Registered</p>
                  </div>
                  <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                    <Cpu size={16} className="text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">HIGH-RISK</p>
                    <p className="text-2xl font-bold text-white">{stats.highRisk}</p>
                    <p className="text-sm text-red-400">⚠ Requires registration</p>
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
                    <p className="text-sm text-slate-400">LIMITED RISK</p>
                    <p className="text-2xl font-bold text-white">{stats.limitedRisk}</p>
                    <p className="text-sm text-yellow-400">Art. 6</p>
                  </div>
                  <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                    <AlertCircle size={16} className="text-yellow-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">MINIMAL RISK</p>
                    <p className="text-2xl font-bold text-white">{stats.minimalRisk}</p>
                    <p className="text-sm text-emerald-400">✓ Compliant</p>
                  </div>
                  <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                    <CheckCircle size={16} className="text-emerald-400" />
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
                    <p className="text-sm text-slate-400">REGISTERED IN EU DB</p>
                    <p className="text-2xl font-bold text-white">{stats.registeredInEuDb}</p>
                    <p className="text-sm text-slate-400">Art. 49</p>
                  </div>
                  <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                    <Database size={16} className="text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">PENDING REGISTRATION</p>
                    <p className="text-2xl font-bold text-white">{stats.pendingRegistration}</p>
                    <p className="text-sm text-yellow-400">⚠ Action needed</p>
                  </div>
                  <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                    <Clock size={16} className="text-yellow-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">CONFORMITY ASSESSED</p>
                    <p className="text-2xl font-bold text-white">{stats.conformityAssessed}</p>
                    <p className="text-sm text-emerald-400">✓ Verified</p>
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
                    <p className="text-sm text-slate-400">NON-COMPLIANT</p>
                    <p className="text-2xl font-bold text-white">{stats.nonCompliant}</p>
                    <p className="text-sm text-red-400">⚠ Requires action</p>
                  </div>
                  <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                    <XCircle size={16} className="text-red-400" />
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
              <TabsTrigger value="all-systems" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white">
                All Systems
              </TabsTrigger>
              <TabsTrigger value="high-risk" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white">
                High-Risk
              </TabsTrigger>
              <TabsTrigger value="registration-status" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white">
                Registration Status
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <div className="space-y-6">
                {/* Top Row: Two Panels Side by Side */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left: Risk Classification Breakdown */}
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-white mb-4">Risk Classification Breakdown</h3>
                      <div className="space-y-4">
                        {/* High-Risk */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <AlertTriangle size={16} className="text-red-400" />
                              <span className="text-sm text-slate-300">High-Risk</span>
                            </div>
                            <span className="text-sm text-slate-400">{stats.highRisk}</span>
                          </div>
                          <div className="w-full bg-slate-800 rounded-full h-2">
                            <div className="bg-red-500 h-2 rounded-full" style={{ width: stats.totalSystems > 0 ? `${(stats.highRisk / stats.totalSystems) * 100}%` : '0%' }}></div>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">Art. 6, Annex III</p>
                        </div>

                        {/* Limited Risk */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <AlertCircle size={16} className="text-yellow-400" />
                              <span className="text-sm text-slate-300">Limited Risk</span>
                            </div>
                            <span className="text-sm text-slate-400">{stats.limitedRisk}</span>
                          </div>
                          <div className="w-full bg-slate-800 rounded-full h-2">
                            <div className="bg-yellow-500 h-2 rounded-full" style={{ width: stats.totalSystems > 0 ? `${(stats.limitedRisk / stats.totalSystems) * 100}%` : '0%' }}></div>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">Art. 6</p>
                        </div>

                        {/* Minimal Risk */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <CheckCircle size={16} className="text-emerald-400" />
                              <span className="text-sm text-slate-300">Minimal Risk</span>
                            </div>
                            <span className="text-sm text-slate-400">{stats.minimalRisk}</span>
                          </div>
                          <div className="w-full bg-slate-800 rounded-full h-2">
                            <div className="bg-emerald-500 h-2 rounded-full" style={{ width: stats.totalSystems > 0 ? `${(stats.minimalRisk / stats.totalSystems) * 100}%` : '0%' }}></div>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">Art. 6</p>
                        </div>

                        {/* Unacceptable Risk */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <XCircle size={16} className="text-red-600" />
                              <span className="text-sm text-slate-300">Unacceptable Risk</span>
                            </div>
                            <span className="text-sm text-slate-400">0</span>
                          </div>
                          <div className="w-full bg-slate-800 rounded-full h-2">
                            <div className="bg-red-600 h-2 rounded-full" style={{ width: '0%' }}></div>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">Art. 5 - Prohibited</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Right: Requires Attention */}
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-white mb-4">Requires Attention</h3>
                      <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                          <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-2 opacity-50" />
                          <p className="text-slate-400">Register your first AI system to begin compliance tracking</p>
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
                        <p className="text-slate-400">No recent registry activity</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="all-systems" className="mt-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-6">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-700">
                          <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase">System Name</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase">Provider</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase">Risk Level</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase">Purpose</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase">Registration Status</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase">Conformity</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td colSpan={7} className="py-12 text-center">
                            <div className="flex flex-col items-center">
                              <Cpu className="w-12 h-12 text-slate-400 mb-3 opacity-50" />
                              <p className="text-slate-400 text-lg mb-1">No AI systems registered</p>
                              <p className="text-slate-500 text-sm mb-4">
                                Register your first system to begin tracking.
                              </p>
                              <Button
                                onClick={() => {
                                  console.log('[AI System Registry] Register System from empty state triggered');
                                  // TODO: Implement full functionality
                                }}
                                variant="outline"
                                className="border-slate-700 text-slate-300 hover:bg-slate-800"
                              >
                                <Plus size={14} className="mr-2" />
                                Register System
                              </Button>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="high-risk" className="mt-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-6">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-700">
                          <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase">System Name</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase">Provider</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase">Risk Level</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase">Purpose</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase">Registration Status</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase">Conformity</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td colSpan={7} className="py-12 text-center">
                            <div className="flex flex-col items-center">
                              <AlertTriangle className="w-12 h-12 text-slate-400 mb-3 opacity-50" />
                              <p className="text-slate-400 text-lg mb-1">No high-risk AI systems registered</p>
                              <p className="text-slate-500 text-sm">
                                High-risk systems require mandatory registration in the EU database.
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

            <TabsContent value="registration-status" className="mt-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-6">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-700">
                          <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase">System Name</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase">Risk Level</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase">EU DB Status</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase">Registration Date</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase">Next Review</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td colSpan={6} className="py-12 text-center">
                            <div className="flex flex-col items-center">
                              <Database className="w-12 h-12 text-slate-400 mb-3 opacity-50" />
                              <p className="text-slate-400 text-lg mb-1">No registration activity</p>
                              <p className="text-slate-500 text-sm">
                                Registration status for all systems will appear here.
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
