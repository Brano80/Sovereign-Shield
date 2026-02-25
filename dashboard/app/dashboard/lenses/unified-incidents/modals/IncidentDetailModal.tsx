"use client";

import { useState } from "react";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  X,
  Calendar,
  Clock,
  User,
  Shield,
  FileText,
  Send,
  Eye,
  AlertTriangle,
  CheckCircle,
  Activity,
  Link
} from 'lucide-react';
import { IncidentStatusBadge } from '../components/IncidentStatusBadge';
import { RegulationBadge } from '../components/RegulationBadge';
import { SeverityBadge } from '../components/SeverityBadge';
import type { Incident } from '../types';

interface IncidentDetailModalProps {
  incident: Incident | null;
  onClose: () => void;
}

export function IncidentDetailModal({ incident, onClose }: IncidentDetailModalProps) {
  const [activeTab, setActiveTab] = useState('details');

  if (!incident) return null;

  const formatDateTime = (date: Date | string) => {
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  const getTimeRemaining = (deadline: Date | string | null | undefined) => {
    if (!deadline) return null;

    const now = new Date();
    const diff = new Date(deadline).getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (diff < 0) {
      return {
        text: `-${Math.abs(hours)}h ${Math.abs(minutes)}m`,
        urgent: true,
        overdue: true
      };
    }

    return { text: `${hours}h ${minutes}m`, urgent: hours < 4, overdue: false };
  };

  const timeRemaining = getTimeRemaining(incident.deadline?.dueAt ?? null);

  // Mock data for timeline and other tabs
  const timeline = [
    {
      id: 1,
      timestamp: incident.detectedAt,
      action: 'Incident Detected',
      user: 'System',
      details: 'Automated detection triggered'
    },
    {
      id: 2,
      timestamp: incident.classifiedAt,
      action: 'Classification Complete',
      user: 'Sarah Chen',
      details: 'Severity and impact assessment completed'
    }
  ];

  const reports = [
    {
      id: 'rep-001',
      type: 'Breach Notification',
      regulation: 'GDPR',
      status: 'draft',
      dueAt: incident.deadline,
      completeness: 75
    }
  ];

  return (
    <Dialog open={!!incident} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-700">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-white text-xl">
              Incident {incident.id}
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-slate-400 hover:text-white"
            >
              <X size={16} />
            </Button>
          </div>
        </DialogHeader>

        {/* Header Info */}
        <div className="bg-slate-800/50 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">{incident.title}</h2>
            <div className="flex items-center gap-3">
              <SeverityBadge severity={incident.severity} />
              <IncidentStatusBadge status={incident.status} />
            </div>
          </div>

          <div className="flex items-center gap-4 mb-4">
            {incident.regulations.map(reg => (
              <RegulationBadge key={reg} regulation={reg} />
            ))}
            <Badge className="bg-slate-700 text-slate-300">
              L{incident.evidenceSealLevel} Integrity
            </Badge>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-slate-400">Detected</p>
              <p className="text-white">{formatDateTime(incident.detectedAt)}</p>
            </div>
            <div>
              <p className="text-slate-400">Classified</p>
              <p className="text-white">{formatDateTime(incident.classifiedAt!)}</p>
            </div>
            {incident.resolvedAt && (
              <div>
                <p className="text-slate-400">Resolved</p>
                <p className="text-white">{formatDateTime(incident.resolvedAt)}</p>
              </div>
            )}
            <div>
              <p className="text-slate-400">Assignee</p>
              <p className="text-white">{incident.assignee || 'Unassigned'}</p>
            </div>
          </div>

          {timeRemaining && (
            <div className="mt-4 p-4 bg-slate-800 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock className={timeRemaining.urgent ? 'text-red-400' : 'text-slate-400'} size={20} />
                  <div>
                    <p className="text-white font-medium">Next Deadline</p>
                    <p className={`text-sm ${timeRemaining.overdue ? 'text-red-400' : timeRemaining.urgent ? 'text-orange-400' : 'text-slate-300'}`}>
                      {timeRemaining.text} remaining
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="border-slate-600 text-slate-300">
                    <FileText size={14} className="mr-2" />
                    Submit Report
                  </Button>
                  <Button variant="outline" size="sm" className="border-slate-600 text-slate-300">
                    Update Status
                  </Button>
                  <Button variant="outline" size="sm" className="border-slate-600 text-slate-300">
                    Assign
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Detail Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5 bg-slate-800/50 border border-slate-800">
            <TabsTrigger value="details" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white">
              Details
            </TabsTrigger>
            <TabsTrigger value="timeline" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white">
              Timeline
            </TabsTrigger>
            <TabsTrigger value="reports" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white">
              Reports
            </TabsTrigger>
            <TabsTrigger value="evidence" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white">
              Evidence
            </TabsTrigger>
            <TabsTrigger value="rca" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white">
              RCA
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="mt-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Incident Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm text-slate-400 block mb-2">Description</label>
                  <p className="text-white bg-slate-900/50 p-3 rounded border border-slate-700">
                    {incident.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-slate-400 block mb-2">Report Type</label>
                    <p className="text-white">{incident.reportType}</p>
                  </div>
                  <div>
                    <label className="text-sm text-slate-400 block mb-2">Evidence Seal</label>
                    <div className="flex items-center gap-2">
                      <Shield size={16} className="text-blue-400" />
                      <span className="text-white">Level {incident.evidenceSealLevel}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timeline" className="mt-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Incident Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {timeline.map((event, index) => (
                    <div key={event.id} className="flex items-start gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                          <Activity size={14} className="text-white" />
                        </div>
                        {index < timeline.length - 1 && (
                          <div className="w-px h-8 bg-slate-700 mt-2"></div>
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-white font-medium">{event.action}</h4>
                          <span className="text-sm text-slate-400">
                            {event.timestamp ? formatDateTime(event.timestamp) : ''}
                          </span>
                        </div>
                        <p className="text-slate-300 text-sm">{event.details}</p>
                        <p className="text-slate-500 text-xs mt-1">by {event.user}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="mt-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Regulatory Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reports.map(report => (
                    <div key={report.id} className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <RegulationBadge regulation={report.regulation as any} />
                        <div>
                          <h4 className="text-white font-medium">{report.type}</h4>
                          <p className="text-sm text-slate-400">Due: {report.dueAt ? formatDateTime((report.dueAt as any)?.dueAt ?? report.dueAt) : 'N/A'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-slate-400">Completeness</p>
                          <p className="text-white">{report.completeness}%</p>
                        </div>
                        <Badge className={
                          report.status === 'draft' ? 'bg-yellow-500/20 text-yellow-400' :
                          report.status === 'ready' ? 'bg-green-500/20 text-green-400' :
                          'bg-blue-500/20 text-blue-400'
                        }>
                          {report.status}
                        </Badge>
                        <Button variant="outline" size="sm" className="border-slate-600 text-slate-300">
                          <Eye size={14} className="mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="evidence" className="mt-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Evidence Vault</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Shield size={48} className="text-slate-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">Evidence Sealed</h3>
                  <p className="text-slate-400 mb-4">
                    All evidence has been sealed with L{incident.evidenceSealLevel} integrity protection.
                  </p>
                  <Button variant="outline" className="border-slate-600 text-slate-300">
                    <Link size={14} className="mr-2" />
                    View Evidence Chain
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rca" className="mt-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Root Cause Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Activity size={48} className="text-slate-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">RCA In Progress</h3>
                  <p className="text-slate-400 mb-4">
                    Root cause analysis is being conducted following systematic investigation protocols.
                  </p>
                  <Button variant="outline" className="border-slate-600 text-slate-300">
                    <FileText size={14} className="mr-2" />
                    View RCA Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}