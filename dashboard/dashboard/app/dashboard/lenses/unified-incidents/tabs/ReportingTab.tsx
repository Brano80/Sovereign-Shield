"use client";

import { useState } from "react";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Clock,
  FileText,
  CheckCircle,
  AlertTriangle,
  Download,
  Eye,
  Plus,
  ExternalLink,
  Settings,
  Send
} from 'lucide-react';
import { RegulationBadge } from '../components/RegulationBadge';
import { ReportTemplateSelector } from '../components/ReportTemplateSelector';
import { ReportGenerator } from '../components/ReportGenerator';

interface PendingReport {
  id: string;
  incidentId: string;
  regulation: string;
  reportType: string;
  dueAt: Date;
  completeness: number;
  status: 'draft' | 'review' | 'ready';
}

interface SubmittedReport {
  id: string;
  incidentId: string;
  regulation: string;
  reportType: string;
  submittedAt: Date;
  authority: string;
  status: 'submitted' | 'acknowledged' | 'requires_update';
}

interface Authority {
  id: string;
  name: string;
  regulation: string;
  jurisdiction: string;
  portalUrl: string;
  lastSubmission?: Date;
}

export function ReportingTab() {
  const [activeSubTab, setActiveSubTab] = useState('pending');
  const [showReportGenerator, setShowReportGenerator] = useState(false);
  const [selectedReport, setSelectedReport] = useState<PendingReport | null>(null);

  // Mock data for development
  const pendingReports: PendingReport[] = [
    {
      id: "rep-001",
      incidentId: "INC-2025-047",
      regulation: "GDPR",
      reportType: "Breach Notification",
      dueAt: new Date(Date.now() + 70 * 60 * 60 * 1000), // 70 hours from now
      completeness: 75,
      status: 'draft'
    },
    {
      id: "rep-002",
      incidentId: "INC-2025-046",
      regulation: "DORA",
      reportType: "Major Incident Report",
      dueAt: new Date(Date.now() + 20 * 60 * 60 * 1000), // 20 hours from now
      completeness: 90,
      status: 'review'
    }
  ];

  const submittedReports: SubmittedReport[] = [
    {
      id: "sub-001",
      incidentId: "INC-2025-045",
      regulation: "NIS2",
      reportType: "Incident Notification",
      submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      authority: "National Cybersecurity Agency",
      status: 'acknowledged'
    },
    {
      id: "sub-002",
      incidentId: "INC-2025-044",
      regulation: "GDPR",
      reportType: "Breach Notification",
      submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      authority: "Data Protection Authority",
      status: 'submitted'
    }
  ];

  const authorities: Authority[] = [
    {
      id: "auth-001",
      name: "Data Protection Authority",
      regulation: "GDPR",
      jurisdiction: "European Union",
      portalUrl: "https://edpb.europa.eu/",
      lastSubmission: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    },
    {
      id: "auth-002",
      name: "European Banking Authority",
      regulation: "DORA",
      jurisdiction: "European Union",
      portalUrl: "https://eba.europa.eu/",
      lastSubmission: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    },
    {
      id: "auth-003",
      name: "ENISA",
      regulation: "NIS2",
      jurisdiction: "European Union",
      portalUrl: "https://enisa.europa.eu/",
      lastSubmission: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge className="bg-yellow-500/20 text-yellow-400">Draft</Badge>;
      case 'review':
        return <Badge className="bg-blue-500/20 text-blue-400">Review</Badge>;
      case 'ready':
        return <Badge className="bg-green-500/20 text-green-400">Ready</Badge>;
      case 'submitted':
        return <Badge className="bg-blue-500/20 text-blue-400">Submitted</Badge>;
      case 'acknowledged':
        return <Badge className="bg-green-500/20 text-green-400">Acknowledged</Badge>;
      case 'requires_update':
        return <Badge className="bg-red-500/20 text-red-400">Requires Update</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTimeRemaining = (dueAt: Date) => {
    const now = new Date();
    const diff = dueAt.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (diff < 0) {
      return { text: `Overdue by ${Math.abs(hours)}h`, urgent: true };
    }

    if (days > 0) {
      return { text: `${days}d ${hours % 24}h`, urgent: false };
    }

    return { text: `${hours}h`, urgent: hours < 24 };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Regulatory Reporting</h2>
          <p className="text-slate-400 mt-1">Automated report generation and authority submissions</p>
        </div>

        <Button
          onClick={() => setShowReportGenerator(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus size={14} className="mr-2" />
          Generate Report
        </Button>
      </div>

      {/* Sub-tabs */}
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-slate-800/50 border border-slate-800">
          <TabsTrigger value="pending" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white">
            Pending Reports
          </TabsTrigger>
          <TabsTrigger value="submitted" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white">
            Submitted
          </TabsTrigger>
          <TabsTrigger value="templates" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white">
            Templates
          </TabsTrigger>
          <TabsTrigger value="authorities" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white">
            Authorities
          </TabsTrigger>
        </TabsList>

        {/* Pending Reports */}
        <TabsContent value="pending" className="mt-6">
          <div className="space-y-4">
            {pendingReports.map(report => {
              const timeRemaining = getTimeRemaining(report.dueAt);

              return (
                <Card key={report.id} className="bg-slate-800/50 border-slate-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <RegulationBadge regulation={report.regulation as any} />
                        <div>
                          <h3 className="text-white font-medium">{report.incidentId}</h3>
                          <p className="text-slate-400 text-sm">{report.reportType}</p>
                          <p className="text-slate-500 text-xs">
                            Due: {report.dueAt.toLocaleDateString()} {report.dueAt.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm text-slate-400">Completeness</span>
                            <span className="text-sm font-medium text-white">{report.completeness}%</span>
                          </div>
                          <Progress value={report.completeness} className="w-32 h-2" />

                          <div className="flex items-center gap-2 mt-2">
                            <Clock size={14} className={timeRemaining.urgent ? 'text-red-400' : 'text-slate-400'} />
                            <span className={`text-sm ${timeRemaining.urgent ? 'text-red-400' : 'text-slate-300'}`}>
                              {timeRemaining.text}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {getStatusBadge(report.status)}
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="border-slate-600 text-slate-300">
                              <Eye size={14} className="mr-1" />
                              Edit
                            </Button>
                            <Button variant="outline" size="sm" className="border-slate-600 text-slate-300">
                              <FileText size={14} className="mr-1" />
                              Preview
                            </Button>
                            <Button
                              variant="default"
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700"
                              disabled={report.completeness < 100}
                            >
                              <Send size={14} className="mr-1" />
                              Submit
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {pendingReports.length === 0 && (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-12">
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mb-4">
                      <CheckCircle className="h-8 w-8 text-green-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">All Reports Submitted</h3>
                    <p className="text-slate-400 mb-6 max-w-md">
                      All regulatory reporting requirements have been fulfilled. No pending reports.
                    </p>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                      Compliant
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Submitted Reports */}
        <TabsContent value="submitted" className="mt-6">
          <div className="space-y-4">
            {submittedReports.map(report => (
              <Card key={report.id} className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <RegulationBadge regulation={report.regulation as any} />
                      <div>
                        <h3 className="text-white font-medium">{report.incidentId}</h3>
                        <p className="text-slate-400 text-sm">{report.reportType}</p>
                        <p className="text-slate-500 text-xs">
                          Submitted: {report.submittedAt.toLocaleDateString()} {report.submittedAt.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div>
                        <p className="text-sm text-slate-400">Authority</p>
                        <p className="text-white font-medium">{report.authority}</p>
                      </div>

                      <div className="flex items-center gap-3">
                        {getStatusBadge(report.status)}
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="border-slate-600 text-slate-300">
                            <Eye size={14} className="mr-1" />
                            View
                          </Button>
                          <Button variant="outline" size="sm" className="border-slate-600 text-slate-300">
                            <Download size={14} className="mr-1" />
                            Download
                          </Button>
                          {report.status === 'requires_update' && (
                            <Button variant="outline" size="sm" className="border-red-600 text-red-400">
                              <AlertTriangle size={14} className="mr-1" />
                              Resubmit
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Templates */}
        <TabsContent value="templates" className="mt-6">
          <ReportTemplateSelector />
        </TabsContent>

        {/* Authorities */}
        <TabsContent value="authorities" className="mt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-white">Regulatory Authorities</h3>
              <Button variant="outline" size="sm" className="border-slate-700 text-slate-300">
                <Plus size={14} className="mr-2" />
                Add Authority
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {authorities.map(authority => (
                <Card key={authority.id} className="bg-slate-800/50 border-slate-700">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white text-base">{authority.name}</CardTitle>
                      <RegulationBadge regulation={authority.regulation as any} />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-slate-400">Jurisdiction</p>
                        <p className="text-white text-sm">{authority.jurisdiction}</p>
                      </div>

                      {authority.lastSubmission && (
                        <div>
                          <p className="text-sm text-slate-400">Last Submission</p>
                          <p className="text-white text-sm">
                            {authority.lastSubmission.toLocaleDateString()}
                          </p>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 border-slate-600 text-slate-300"
                          onClick={() => window.open(authority.portalUrl, '_blank')}
                        >
                          <ExternalLink size={14} className="mr-1" />
                          Portal
                        </Button>
                        <Button variant="outline" size="sm" className="border-slate-600 text-slate-300">
                          <Settings size={14} />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Report Generator Modal */}
      {showReportGenerator && (
        <ReportGenerator
          onClose={() => {
            setShowReportGenerator(false);
            setSelectedReport(null);
          }}
          selectedReport={selectedReport as any}
        />
      )}
    </div>
  );
}