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
  FileCheck,
  ClipboardCheck,
  XCircle,
  AlertCircle
} from "lucide-react";
import DashboardLayout from '@/app/components/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AuditPreparationPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'checklist' | 'documents' | 'evidence-gaps'>('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Mock data - empty state
  const stats = {
    overallReadiness: 0,
    documentsReady: 0,
    totalDocuments: 0,
    evidenceCoverage: 0,
    openFindings: 0,
    aiActReadiness: 0,
    gdprReadiness: 0,
    doraReadiness: 0,
    lastAssessment: '--',
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    console.log('[Audit Preparation] Refresh triggered');
    // TODO: Implement full functionality
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  const getStatusColor = () => {
    if (stats.overallReadiness >= 80) {
      return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    } else if (stats.overallReadiness >= 50) {
      return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
    } else {
      return 'text-red-400 bg-red-500/10 border-red-500/20';
    }
  };

  const getStatusIcon = () => {
    if (stats.overallReadiness >= 80) {
      return <CheckCircle size={16} />;
    } else if (stats.overallReadiness >= 50) {
      return <AlertTriangle size={16} />;
    } else {
      return <XCircle size={16} />;
    }
  };

  const getStatusText = () => {
    if (stats.overallReadiness === 0) {
      return 'NOT STARTED';
    } else {
      return `${stats.overallReadiness}% READY`;
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
                <h1 className="text-2xl font-bold text-white">AUDIT PREPARATION</h1>
                <p className="text-slate-400 mt-1">AI Act Art. 17, 61 • GDPR Art. 30 • DORA Art. 5 • Readiness Assessment</p>

                {/* Status Banner */}
                <div className="mt-6 flex items-center gap-4">
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium ${getStatusColor()}`}>
                    {getStatusIcon()}
                    Status: {getStatusText()}
                  </div>

                  <div className="text-sm text-slate-400">
                    Documents: <span className="text-slate-300 font-medium">{stats.documentsReady}/{stats.totalDocuments}</span> │
                    Evidence coverage: <span className="text-slate-300 font-medium">{stats.evidenceCoverage}%</span> │
                    Open findings: <span className="text-slate-300 font-medium">{stats.openFindings}</span>
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
                    console.log('[Audit Preparation] Start Assessment triggered');
                    // TODO: Implement full functionality
                  }}
                  className="border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  <ClipboardCheck size={14} className="mr-2" />
                  Start Assessment
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
                    <DropdownMenuItem className="text-slate-300 hover:bg-slate-800" onClick={() => console.log('[Audit Preparation] Export Readiness Report as PDF')}>
                      <FileText size={14} className="mr-2" />
                      Readiness Report (PDF)
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-slate-300 hover:bg-slate-800" onClick={() => console.log('[Audit Preparation] Export Checklist as CSV')}>
                      <ClipboardCheck size={14} className="mr-2" />
                      Checklist (CSV)
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-slate-300 hover:bg-slate-800" onClick={() => console.log('[Audit Preparation] Export Documents List as CSV')}>
                      <FileCheck size={14} className="mr-2" />
                      Documents List (CSV)
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-slate-300 hover:bg-slate-800" onClick={() => console.log('[Audit Preparation] Export Evidence Gaps Report')}>
                      <AlertCircle size={14} className="mr-2" />
                      Evidence Gaps Report
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
                    <p className="text-sm text-slate-400">OVERALL READINESS</p>
                    <p className="text-2xl font-bold text-white">{stats.overallReadiness}%</p>
                    <p className="text-sm text-slate-400">Target: 100%</p>
                  </div>
                  <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                    <Shield size={16} className="text-blue-400" />
                  </div>
                </div>
                <div className="mt-2">
                  <div className="w-full bg-slate-800 rounded-full h-1">
                    <div className="bg-blue-500 h-1 rounded-full" style={{ width: `${stats.overallReadiness}%` }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">DOCUMENTS READY</p>
                    <p className="text-2xl font-bold text-white">{stats.documentsReady}/{stats.totalDocuments}</p>
                    <p className="text-sm text-slate-400">Uploaded</p>
                  </div>
                  <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                    <FileCheck size={16} className="text-emerald-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">EVIDENCE COVERAGE</p>
                    <p className="text-2xl font-bold text-white">{stats.evidenceCoverage}%</p>
                    <p className="text-sm text-slate-400">Complete</p>
                  </div>
                  <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                    <CheckCircle size={16} className="text-green-400" />
                  </div>
                </div>
                <div className="mt-2">
                  <div className="w-full bg-slate-800 rounded-full h-1">
                    <div className="bg-green-500 h-1 rounded-full" style={{ width: `${stats.evidenceCoverage}%` }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">OPEN FINDINGS</p>
                    <p className="text-2xl font-bold text-white">{stats.openFindings}</p>
                    <p className="text-sm text-red-400">⚠ Requires attention</p>
                  </div>
                  <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                    <AlertTriangle size={16} className="text-red-400" />
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
                    <p className="text-sm text-slate-400">AI ACT READINESS</p>
                    <p className="text-2xl font-bold text-white">{stats.aiActReadiness}%</p>
                    <p className="text-sm text-slate-400">Art. 17, 61</p>
                  </div>
                  <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                    <Shield size={16} className="text-purple-400" />
                  </div>
                </div>
                <div className="mt-2">
                  <div className="w-full bg-slate-800 rounded-full h-1">
                    <div className="bg-purple-500 h-1 rounded-full" style={{ width: `${stats.aiActReadiness}%` }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">GDPR READINESS</p>
                    <p className="text-2xl font-bold text-white">{stats.gdprReadiness}%</p>
                    <p className="text-sm text-slate-400">Art. 30</p>
                  </div>
                  <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                    <Shield size={16} className="text-blue-400" />
                  </div>
                </div>
                <div className="mt-2">
                  <div className="w-full bg-slate-800 rounded-full h-1">
                    <div className="bg-blue-500 h-1 rounded-full" style={{ width: `${stats.gdprReadiness}%` }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">DORA READINESS</p>
                    <p className="text-2xl font-bold text-white">{stats.doraReadiness}%</p>
                    <p className="text-sm text-slate-400">Art. 5</p>
                  </div>
                  <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                    <Shield size={16} className="text-cyan-400" />
                  </div>
                </div>
                <div className="mt-2">
                  <div className="w-full bg-slate-800 rounded-full h-1">
                    <div className="bg-cyan-500 h-1 rounded-full" style={{ width: `${stats.doraReadiness}%` }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">LAST ASSESSMENT</p>
                    <p className="text-2xl font-bold text-white">{stats.lastAssessment}</p>
                    <p className="text-sm text-slate-400">Readiness check</p>
                  </div>
                  <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                    <Clock size={16} className="text-slate-400" />
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
              <TabsTrigger value="checklist" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white">
                Checklist
              </TabsTrigger>
              <TabsTrigger value="documents" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white">
                Documents
              </TabsTrigger>
              <TabsTrigger value="evidence-gaps" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white">
                Evidence Gaps
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <div className="space-y-6">
                {/* Top Row: Two Panels Side by Side */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left: Readiness by Regulation */}
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-white mb-4">Readiness by Regulation</h3>
                      <div className="space-y-4">
                        {/* AI Act */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-slate-300">AI Act</span>
                            <span className="text-sm text-slate-400">{stats.aiActReadiness}%</span>
                          </div>
                          <div className="w-full bg-slate-800 rounded-full h-2">
                            <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${stats.aiActReadiness}%` }}></div>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">Art. 17, 61</p>
                        </div>

                        {/* GDPR */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-slate-300">GDPR</span>
                            <span className="text-sm text-slate-400">{stats.gdprReadiness}%</span>
                          </div>
                          <div className="w-full bg-slate-800 rounded-full h-2">
                            <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${stats.gdprReadiness}%` }}></div>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">Art. 30</p>
                        </div>

                        {/* DORA */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-slate-300">DORA</span>
                            <span className="text-sm text-slate-400">{stats.doraReadiness}%</span>
                          </div>
                          <div className="w-full bg-slate-800 rounded-full h-2">
                            <div className="bg-cyan-500 h-2 rounded-full" style={{ width: `${stats.doraReadiness}%` }}></div>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">Art. 5</p>
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
                          <p className="text-slate-400">Complete your first assessment to see recommendations</p>
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
                        <p className="text-slate-400">No recent audit activity</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="checklist" className="mt-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-white">Audit Checklist</h3>
                    <Button
                      onClick={() => {
                        console.log('[Audit Preparation] Start Assessment from Checklist triggered');
                        // TODO: Implement full functionality
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <ClipboardCheck size={14} className="mr-2" />
                      Start Assessment
                    </Button>
                  </div>
                  <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                      <ClipboardCheck className="w-16 h-16 text-slate-400 mx-auto mb-4 opacity-50" />
                      <p className="text-slate-400 text-lg mb-2">Run your first readiness assessment</p>
                      <p className="text-slate-500 text-sm mb-4">
                        to generate the audit checklist
                      </p>
                      <Button
                        onClick={() => {
                          console.log('[Audit Preparation] Start Assessment from empty state triggered');
                          // TODO: Implement full functionality
                        }}
                        variant="outline"
                        className="border-slate-700 text-slate-300 hover:bg-slate-800"
                      >
                        <ClipboardCheck size={14} className="mr-2" />
                        Start Assessment
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents" className="mt-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-6">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-700">
                          <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase">Document Name</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase">Regulation</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase">Status</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase">Last Updated</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td colSpan={5} className="py-12 text-center">
                            <div className="flex flex-col items-center">
                              <FileCheck className="w-12 h-12 text-slate-400 mb-3 opacity-50" />
                              <p className="text-slate-400 text-lg mb-1">No audit documents uploaded yet</p>
                              <p className="text-slate-500 text-sm mb-4">
                                Upload documents to track audit readiness
                              </p>
                              <Button
                                onClick={() => {
                                  console.log('[Audit Preparation] Upload Document triggered');
                                  // TODO: Implement full functionality
                                }}
                                variant="outline"
                                className="border-slate-700 text-slate-300 hover:bg-slate-800"
                              >
                                <Plus size={14} className="mr-2" />
                                Upload Document
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

            <TabsContent value="evidence-gaps" className="mt-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-6">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-700">
                          <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase">Requirement</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase">Regulation</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase">Article</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase">Evidence Status</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td colSpan={5} className="py-12 text-center">
                            <div className="flex flex-col items-center">
                              <AlertCircle className="w-12 h-12 text-slate-400 mb-3 opacity-50" />
                              <p className="text-slate-400 text-lg mb-1">Run an assessment to identify evidence gaps</p>
                              <p className="text-slate-500 text-sm mb-4">
                                Start a readiness assessment to discover missing evidence
                              </p>
                              <Button
                                onClick={() => {
                                  console.log('[Audit Preparation] Start Assessment from Evidence Gaps triggered');
                                  // TODO: Implement full functionality
                                }}
                                variant="outline"
                                className="border-slate-700 text-slate-300 hover:bg-slate-800"
                              >
                                <ClipboardCheck size={14} className="mr-2" />
                                Start Assessment
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
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
}
