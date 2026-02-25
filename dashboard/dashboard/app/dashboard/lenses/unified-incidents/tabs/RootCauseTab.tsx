"use client";

import { useState } from "react";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Activity,
  CheckCircle,
  BookOpen,
  Plus,
  Eye,
  FileText,
  Clock,
  User,
  AlertTriangle,
  Target
} from 'lucide-react';
import { RootCauseAnalyzer } from '../components/RootCauseAnalyzer';

interface ActiveRCA {
  id: string;
  incidentId: string;
  title: string;
  methodology: 'FIVE_WHYS' | 'ISHIKAWA' | 'FAULT_TREE';
  status: 'IN_PROGRESS' | 'REVIEW' | 'FINALIZING';
  analyst: string;
  startedAt: Date;
  dueAt: Date;
  progress: number;
}

interface CompletedRCA {
  id: string;
  incidentId: string;
  title: string;
  rootCause: string;
  correctiveActions: number;
  completedAt: Date;
  analyst: string;
}

export function RootCauseTab() {
  const [activeSubTab, setActiveSubTab] = useState('active');
  const [showAnalyzer, setShowAnalyzer] = useState(false);
  const [selectedRCA, setSelectedRCA] = useState<ActiveRCA | null>(null);

  // Mock data for active RCAs
  const activeRCAs: ActiveRCA[] = [
    {
      id: 'rca-001',
      incidentId: 'INC-2025-047',
      title: 'Database Connection Failures',
      methodology: 'FIVE_WHYS',
      status: 'IN_PROGRESS',
      analyst: 'Sarah Chen',
      startedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      dueAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      progress: 65
    },
    {
      id: 'rca-002',
      incidentId: 'INC-2025-046',
      title: 'Payment System Outage',
      methodology: 'ISHIKAWA',
      status: 'REVIEW',
      analyst: 'Michael Rodriguez',
      startedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      dueAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      progress: 85
    }
  ];

  // Mock data for completed RCAs
  const completedRCAs: CompletedRCA[] = [
    {
      id: 'rca-comp-001',
      incidentId: 'INC-2025-045',
      title: 'Email Service Disruption',
      rootCause: 'Configuration change in load balancer routing rules',
      correctiveActions: 3,
      completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      analyst: 'Emma Thompson'
    },
    {
      id: 'rca-comp-002',
      incidentId: 'INC-2025-044',
      title: 'Memory Leak Investigation',
      rootCause: 'Memory leak in user session management service',
      correctiveActions: 2,
      completedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      analyst: 'David Park'
    }
  ];

  const getMethodologyLabel = (methodology: string) => {
    switch (methodology) {
      case 'FIVE_WHYS': return 'Five Whys';
      case 'ISHIKAWA': return 'Ishikawa (Fishbone)';
      case 'FAULT_TREE': return 'Fault Tree';
      default: return methodology;
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS':
        return { color: 'text-blue-400', bgColor: 'bg-blue-500/20', label: 'In Progress' };
      case 'REVIEW':
        return { color: 'text-yellow-400', bgColor: 'bg-yellow-500/20', label: 'Under Review' };
      case 'FINALIZING':
        return { color: 'text-purple-400', bgColor: 'bg-purple-500/20', label: 'Finalizing' };
      default:
        return { color: 'text-slate-400', bgColor: 'bg-slate-500/20', label: status };
    }
  };

  const handleStartRCA = (incidentId: string) => {
    console.log('Start RCA for incident:', incidentId);
    setShowAnalyzer(true);
  };

  const handleContinueRCA = (rca: ActiveRCA) => {
    setSelectedRCA(rca);
    setShowAnalyzer(true);
  };

  const handleViewRCA = (rca: ActiveRCA | CompletedRCA) => {
    console.log('View RCA details:', rca.id);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  const getDaysRemaining = (dueDate: Date) => {
    const now = new Date();
    const diff = dueDate.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (diff < 0) {
      return { text: `${Math.abs(days)} days overdue`, urgent: true };
    }

    return { text: `${days} days remaining`, urgent: days <= 2 };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Root Cause Analysis</h2>
          <p className="text-slate-400 mt-1">
            Systematic investigation and corrective action planning
          </p>
        </div>

        <Button
          onClick={() => setShowAnalyzer(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus size={14} className="mr-2" />
          Start RCA
        </Button>
      </div>

      {/* Sub-tabs */}
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-slate-800/50 border border-slate-800">
          <TabsTrigger value="active" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white">
            Active RCAs
          </TabsTrigger>
          <TabsTrigger value="completed" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white">
            Completed
          </TabsTrigger>
          <TabsTrigger value="methodology" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white">
            Methodology
          </TabsTrigger>
        </TabsList>

        {/* Active RCAs */}
        <TabsContent value="active" className="mt-6">
          <div className="space-y-4">
            {activeRCAs.map(rca => {
              const statusConfig = getStatusConfig(rca.status);
              const daysRemaining = getDaysRemaining(rca.dueAt);

              return (
                <Card key={rca.id} className="bg-slate-800/50 border-slate-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-white font-medium mb-1">{rca.title}</h3>
                        <p className="text-slate-400 text-sm">Incident: {rca.incidentId}</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <Badge className={`${statusConfig.bgColor} text-white border-0`}>
                          {statusConfig.label}
                        </Badge>
                        <Badge className="bg-slate-700 text-slate-300">
                          {getMethodologyLabel(rca.methodology)}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-slate-400">Analyst</p>
                        <p className="text-white">{rca.analyst}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-400">Started</p>
                        <p className="text-white">{formatDate(rca.startedAt)}</p>
                      </div>
                      <div>
                        <p className={`text-sm ${daysRemaining.urgent ? 'text-red-400' : 'text-slate-400'}`}>
                          Due: {daysRemaining.text}
                        </p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-slate-400">Progress</span>
                        <span className="text-white">{rca.progress}%</span>
                      </div>
                      <Progress value={rca.progress} className="h-2" />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <Clock size={14} />
                        <span>Last updated 2 hours ago</span>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewRCA(rca)}
                          className="border-slate-600 text-slate-300 hover:bg-slate-800"
                        >
                          <Eye size={14} className="mr-1" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleContinueRCA(rca)}
                          className="border-blue-600 text-blue-400 hover:bg-blue-900"
                        >
                          <Activity size={14} className="mr-1" />
                          Continue
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {activeRCAs.length === 0 && (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-12">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Activity className="h-8 w-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-medium text-white mb-2">No Active RCAs</h3>
                    <p className="text-slate-400 mb-6">
                      Start a root cause analysis for recent incidents to identify underlying causes and preventive measures.
                    </p>
                    <Button
                      onClick={() => setShowAnalyzer(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Plus size={14} className="mr-2" />
                      Start First RCA
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Completed RCAs */}
        <TabsContent value="completed" className="mt-6">
          <div className="space-y-4">
            {completedRCAs.map(rca => (
              <Card key={rca.id} className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-white font-medium mb-1">{rca.title}</h3>
                      <p className="text-slate-400 text-sm mb-2">Incident: {rca.incidentId}</p>
                      <p className="text-slate-300 text-sm mb-3">
                        <strong>Root Cause:</strong> {rca.rootCause}
                      </p>

                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <User size={14} className="text-slate-400" />
                          <span className="text-slate-400">{rca.analyst}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CheckCircle size={14} className="text-green-400" />
                          <span className="text-slate-400">Completed {formatDate(rca.completedAt)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Target size={14} className="text-blue-400" />
                          <span className="text-slate-400">{rca.correctiveActions} actions</span>
                        </div>
                      </div>
                    </div>

                    <div className="ml-6">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewRCA(rca)}
                        className="border-slate-600 text-slate-300 hover:bg-slate-800"
                      >
                        <FileText size={14} className="mr-1" />
                        View Report
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Methodology */}
        <TabsContent value="methodology" className="mt-6">
          <div className="space-y-6">
            {/* Five Whys */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Five Whys Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300 mb-4">
                  A simple but powerful technique for uncovering the root cause of a problem by asking "Why?" five times.
                </p>
                <div className="space-y-2 text-sm text-slate-400">
                  <p>• Start with the problem statement</p>
                  <p>• Ask "Why?" to get to the direct cause</p>
                  <p>• Continue asking "Why?" until you reach the root cause</p>
                  <p>• Typically requires 3-5 iterations</p>
                </div>
              </CardContent>
            </Card>

            {/* Ishikawa (Fishbone) */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Ishikawa Fishbone Diagram</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300 mb-4">
                  A cause-and-effect diagram that categorizes potential causes of a problem into major categories.
                </p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="text-white font-medium mb-2">Main Categories:</h4>
                    <ul className="space-y-1 text-slate-400">
                      <li>• People</li>
                      <li>• Processes</li>
                      <li>• Equipment</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-2">Sub-categories:</h4>
                    <ul className="space-y-1 text-slate-400">
                      <li>• Methods</li>
                      <li>• Materials</li>
                      <li>• Environment</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Fault Tree Analysis */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Fault Tree Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300 mb-4">
                  A top-down approach that starts with a failure and works backward to identify root causes using boolean logic.
                </p>
                <div className="space-y-2 text-sm text-slate-400">
                  <p>• Start with the top event (failure)</p>
                  <p>• Use logic gates (AND, OR) to connect causes</p>
                  <p>• Identify basic events and undeveloped events</p>
                  <p>• Calculate failure probabilities</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* RCA Analyzer Modal */}
      {showAnalyzer && (
        <RootCauseAnalyzer
          rca={selectedRCA}
          onClose={() => {
            setShowAnalyzer(false);
            setSelectedRCA(null);
          }}
          onComplete={(completedRCA) => {
            setShowAnalyzer(false);
            setSelectedRCA(null);
            // Refresh the list
          }}
        />
      )}
    </div>
  );
}