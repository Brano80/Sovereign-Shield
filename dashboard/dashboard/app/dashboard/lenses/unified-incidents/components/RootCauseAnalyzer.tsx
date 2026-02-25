"use client";

import { useState } from "react";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  X,
  Activity,
  CheckCircle,
  ArrowRight,
  Target,
  FileText,
  Save
} from 'lucide-react';
import { FiveWhysEditor } from './FiveWhysEditor';
import { CorrectiveActionsTracker } from './CorrectiveActionsTracker';

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

interface RootCauseAnalyzerProps {
  rca?: ActiveRCA | null;
  onClose: () => void;
  onComplete: (completedRCA: any) => void;
}

interface RCAData {
  methodology: 'FIVE_WHYS' | 'ISHIKAWA' | 'FAULT_TREE';
  analysis: any;
  rootCause: string;
  correctiveActions: any[];
  status: 'IN_PROGRESS' | 'REVIEW' | 'FINALIZING' | 'COMPLETED';
}

export function RootCauseAnalyzer({ rca, onClose, onComplete }: RootCauseAnalyzerProps) {
  const [activeTab, setActiveTab] = useState('analysis');
  const [data, setData] = useState<RCAData>({
    methodology: rca?.methodology || 'FIVE_WHYS',
    analysis: rca?.id ? {} : null,
    rootCause: '',
    correctiveActions: [],
    status: rca?.status || 'IN_PROGRESS'
  });

  const isNewRCA = !rca;

  const updateData = (updates: Partial<RCAData>) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  const handleMethodologyChange = (methodology: string) => {
    updateData({ methodology: methodology as any, analysis: {} });
  };

  const handleAnalysisUpdate = (analysis: any) => {
    updateData({ analysis });
  };

  const handleRootCauseUpdate = (rootCause: string) => {
    updateData({ rootCause });
  };

  const handleActionsUpdate = (actions: any[]) => {
    updateData({ correctiveActions: actions });
  };

  const handleSave = () => {
    console.log('Saving RCA:', data);
  };

  const handleComplete = () => {
    const completedRCA = {
      ...data,
      completedAt: new Date(),
      evidenceSealLevel: 'L4'
    };
    onComplete(completedRCA);
  };

  const canComplete = data.rootCause && data.correctiveActions.length > 0;

  if (isNewRCA) {
    return (
      <Dialog open={true} onOpenChange={() => onClose()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white text-xl">Start Root Cause Analysis</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-6">
            <div>
              <Label className="text-white">Select Incident</Label>
              <Select>
                <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                  <SelectValue placeholder="Choose an incident to analyze" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700">
                  <SelectItem value="INC-2025-047">INC-2025-047 - Database Connection Failures</SelectItem>
                  <SelectItem value="INC-2025-046">INC-2025-046 - Payment System Outage</SelectItem>
                  <SelectItem value="INC-2025-045">INC-2025-045 - Email Service Disruption</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-white">Analysis Methodology</Label>
              <Select value={data.methodology} onValueChange={handleMethodologyChange}>
                <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700">
                  <SelectItem value="FIVE_WHYS">Five Whys Analysis</SelectItem>
                  <SelectItem value="ISHIKAWA">Ishikawa Fishbone Diagram</SelectItem>
                  <SelectItem value="FAULT_TREE">Fault Tree Analysis</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-white">Initial Problem Statement</Label>
              <Textarea
                placeholder="Describe the incident and immediate symptoms..."
                rows={4}
                className="bg-slate-800 border-slate-600 text-white"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-slate-700">
            <Button variant="outline" onClick={onClose} className="border-slate-600 text-slate-300">
              Cancel
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              Start Analysis
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-700">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-white text-xl">
              Root Cause Analysis - {rca?.incidentId}
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-slate-400">
              <X size={16} />
            </Button>
          </div>
          <div className="flex items-center gap-4 mt-2">
            <Badge className="bg-blue-500/20 text-blue-400">
              {data.methodology.replace('_', ' ')}
            </Badge>
            <Badge className={`${
              data.status === 'IN_PROGRESS' ? 'bg-blue-500/20 text-blue-400' :
              data.status === 'REVIEW' ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-purple-500/20 text-purple-400'
            }`}>
              {data.status.replace('_', ' ')}
            </Badge>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800/50 border border-slate-800">
            <TabsTrigger value="analysis" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white">
              Analysis
            </TabsTrigger>
            <TabsTrigger value="actions" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white">
              Corrective Actions
            </TabsTrigger>
            <TabsTrigger value="summary" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white">
              Summary
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analysis" className="mt-6">
            <FiveWhysEditor
              analysis={data.analysis}
              onUpdate={handleAnalysisUpdate}
              rootCause={data.rootCause}
              onRootCauseUpdate={handleRootCauseUpdate}
            />
          </TabsContent>

          <TabsContent value="actions" className="mt-6">
            <CorrectiveActionsTracker
              actions={data.correctiveActions}
              onUpdate={handleActionsUpdate}
            />
          </TabsContent>

          <TabsContent value="summary" className="mt-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">RCA Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-slate-400">Root Cause</Label>
                  <Textarea
                    value={data.rootCause}
                    onChange={(e) => handleRootCauseUpdate(e.target.value)}
                    placeholder="Summarize the identified root cause..."
                    rows={3}
                    className="bg-slate-900/50 border-slate-600 text-white mt-2"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-400">Methodology Used</Label>
                    <p className="text-white mt-2">{data.methodology.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <Label className="text-slate-400">Corrective Actions</Label>
                    <p className="text-white mt-2">{data.correctiveActions.length} identified</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-4 bg-slate-900/50 rounded-lg">
                  <Target className="text-blue-400" size={20} />
                  <div>
                    <p className="text-white font-medium">Evidence Sealing</p>
                    <p className="text-slate-400 text-sm">This RCA will be sealed with L4 integrity</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex items-center justify-between pt-6 border-t border-slate-700">
          <Button variant="outline" onClick={handleSave} className="border-slate-600 text-slate-300">
            <Save size={14} className="mr-2" />
            Save Draft
          </Button>

          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="border-slate-600 text-slate-300">
              Close
            </Button>
            <Button
              onClick={handleComplete}
              disabled={!canComplete}
              className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
            >
              <CheckCircle size={14} className="mr-2" />
              Complete RCA
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}