"use client";

import { useState } from "react";
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  ArrowDown,
  Plus,
  Target,
  Lightbulb,
  FileText
} from 'lucide-react';

interface WhyStep {
  id: string;
  question: string;
  answer: string;
  evidence: string;
  isRootCause: boolean;
}

interface FiveWhysAnalysis {
  problem: string;
  steps: WhyStep[];
  rootCause: string;
}

interface FiveWhysEditorProps {
  analysis: any;
  onUpdate: (analysis: FiveWhysAnalysis) => void;
  rootCause: string;
  onRootCauseUpdate: (rootCause: string) => void;
}

export function FiveWhysEditor({ analysis, onUpdate, rootCause, onRootCauseUpdate }: FiveWhysEditorProps) {
  const [data, setData] = useState<FiveWhysAnalysis>(
    analysis || {
      problem: '',
      steps: [
        { id: '1', question: 'Why did this happen?', answer: '', evidence: '', isRootCause: false },
        { id: '2', question: 'Why?', answer: '', evidence: '', isRootCause: false },
        { id: '3', question: 'Why?', answer: '', evidence: '', isRootCause: false },
        { id: '4', question: 'Why?', answer: '', evidence: '', isRootCause: false },
        { id: '5', question: 'Why?', answer: '', evidence: '', isRootCause: false }
      ],
      rootCause: rootCause || ''
    }
  );

  const updateData = (updates: Partial<FiveWhysAnalysis>) => {
    const newData = { ...data, ...updates };
    setData(newData);
    onUpdate(newData);
  };

  const updateStep = (stepId: string, field: keyof WhyStep, value: any) => {
    const updatedSteps = data.steps.map(step =>
      step.id === stepId ? { ...step, [field]: value } : step
    );
    updateData({ steps: updatedSteps });
  };

  const addStep = () => {
    const newStep: WhyStep = {
      id: (data.steps.length + 1).toString(),
      question: 'Why?',
      answer: '',
      evidence: '',
      isRootCause: false
    };
    updateData({ steps: [...data.steps, newStep] });
  };

  const markAsRootCause = (stepId: string) => {
    const updatedSteps = data.steps.map(step => ({
      ...step,
      isRootCause: step.id === stepId
    }));
    const rootCauseStep = updatedSteps.find(step => step.isRootCause);
    updateData({
      steps: updatedSteps,
      rootCause: rootCauseStep?.answer || ''
    });
    if (rootCauseStep) {
      onRootCauseUpdate(rootCauseStep.answer);
    }
  };

  const hasRootCause = data.steps.some(step => step.isRootCause);

  return (
    <div className="space-y-6">
      {/* Problem Statement */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-6">
          <Label className="text-white text-lg font-medium">Problem Statement</Label>
          <Textarea
            value={data.problem}
            onChange={(e) => updateData({ problem: e.target.value })}
            placeholder="Describe the incident and immediate symptoms..."
            rows={3}
            className="bg-slate-900/50 border-slate-600 text-white mt-3"
          />
        </CardContent>
      </Card>

      {/* Five Whys Steps */}
      <div className="space-y-4">
        {data.steps.map((step, index) => (
          <Card
            key={step.id}
            className={`border-slate-700 ${
              step.isRootCause ? 'bg-red-500/10 border-red-500/50' :
              step.answer ? 'bg-slate-800/50' : 'bg-slate-800/30'
            }`}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step.isRootCause ? 'bg-red-600 text-white' :
                    'bg-slate-700 text-slate-300'
                  }`}>
                    {step.id}
                  </div>
                  <h3 className="text-white font-medium">{step.question}</h3>
                  {step.isRootCause && (
                    <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                      <Target size={12} className="mr-1" />
                      Root Cause
                    </Badge>
                  )}
                </div>

                {!step.isRootCause && step.answer && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => markAsRootCause(step.id)}
                    className="border-red-600 text-red-400 hover:bg-red-900"
                  >
                    <Target size={14} className="mr-1" />
                    Mark as Root Cause
                  </Button>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-slate-400">Answer</Label>
                  <Textarea
                    value={step.answer}
                    onChange={(e) => updateStep(step.id, 'answer', e.target.value)}
                    placeholder="What caused this..."
                    rows={2}
                    className="bg-slate-900/50 border-slate-600 text-white mt-2"
                  />
                </div>

                <div>
                  <Label className="text-slate-400">Evidence</Label>
                  <Textarea
                    value={step.evidence}
                    onChange={(e) => updateStep(step.id, 'evidence', e.target.value)}
                    placeholder="Supporting evidence, logs, data..."
                    rows={2}
                    className="bg-slate-900/50 border-slate-600 text-white mt-2"
                  />
                </div>
              </div>

              {/* Arrow to next step */}
              {index < data.steps.length - 1 && (
                <div className="flex justify-center mt-4">
                  <ArrowDown size={20} className="text-slate-500" />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add More Steps */}
      <div className="flex justify-center">
        <Button
          variant="outline"
          onClick={addStep}
          className="border-slate-600 text-slate-300 hover:bg-slate-800"
        >
          <Plus size={14} className="mr-2" />
          Add Another Why
        </Button>
      </div>

      {/* Root Cause Summary */}
      {hasRootCause && (
        <Card className="bg-red-500/10 border-red-500/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Target className="text-red-400" size={24} />
              <h3 className="text-white font-medium text-lg">Identified Root Cause</h3>
            </div>

            <div className="bg-slate-900/50 p-4 rounded-lg">
              <p className="text-white font-medium mb-2">{data.rootCause}</p>
              <p className="text-slate-400 text-sm">
                This root cause has been identified through systematic Five Whys analysis.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analysis Tips */}
      <Card className="bg-blue-500/10 border-blue-500/30">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Lightbulb className="text-blue-400" size={20} />
            <h3 className="text-white font-medium">Analysis Tips</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-300">
            <div>
              <h4 className="text-white font-medium mb-2">Ask Specific Questions</h4>
              <p>Focus on what caused the immediate problem, not symptoms or effects.</p>
            </div>
            <div>
              <h4 className="text-white font-medium mb-2">Look for Evidence</h4>
              <p>Support each answer with logs, data, or witness statements.</p>
            </div>
            <div>
              <h4 className="text-white font-medium mb-2">Find the Real Cause</h4>
              <p>Continue asking "why" until you reach something you can actually fix.</p>
            </div>
            <div>
              <h4 className="text-white font-medium mb-2">Verify the Chain</h4>
              <p>Each answer should logically lead to the next level of causality.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}