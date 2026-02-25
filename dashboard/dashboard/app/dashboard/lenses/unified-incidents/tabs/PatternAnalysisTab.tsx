"use client";

import { useState } from "react";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  TrendingUp,
  Brain,
  Target,
  Clock,
  Play,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { LearningKPIs } from '../components/LearningKPIs';
import { PatternsList } from '../components/PatternsList';
import { RecommendationsList } from '../components/RecommendationsList';

interface PatternAnalysisStats {
  patternsDetected: number;
  patternConfidence: number;
  incidentsPrevented: number;
  mttrImprovement: number;
  lastAnalysis: Date;
  isAnalyzing: boolean;
}

export function PatternAnalysisTab() {
  const [stats, setStats] = useState<PatternAnalysisStats>({
    patternsDetected: 12,
    patternConfidence: 87,
    incidentsPrevented: 5,
    mttrImprovement: 23,
    lastAnalysis: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    isAnalyzing: false
  });

  const handleRunAnalysis = async () => {
    setStats(prev => ({ ...prev, isAnalyzing: true }));

    // Mock analysis process
    setTimeout(() => {
      setStats(prev => ({
        ...prev,
        patternsDetected: prev.patternsDetected + Math.floor(Math.random() * 3),
        patternConfidence: Math.min(100, prev.patternConfidence + Math.floor(Math.random() * 5)),
        incidentsPrevented: prev.incidentsPrevented + Math.floor(Math.random() * 2),
        mttrImprovement: Math.min(100, prev.mttrImprovement + Math.floor(Math.random() * 3)),
        lastAnalysis: new Date(),
        isAnalyzing: false
      }));
    }, 3000);
  };

  const formatLastAnalysis = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m ago`;
    }
    return `${minutes}m ago`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Pattern Analysis</h2>
          <p className="text-slate-400 mt-1">
            AI-powered incident pattern recognition • DORA Article 13 • Learning & Evolving
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-slate-400">Last Analysis</p>
            <p className="text-white text-sm">{formatLastAnalysis(stats.lastAnalysis)}</p>
          </div>

          <Button
            onClick={handleRunAnalysis}
            disabled={stats.isAnalyzing}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {stats.isAnalyzing ? (
              <>
                <Loader2 size={14} className="mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Play size={14} className="mr-2" />
                Run Analysis
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Analysis Progress (when running) */}
      {stats.isAnalyzing && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <Brain size={16} className="text-white animate-pulse" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-medium">AI Pattern Analysis Running</h3>
                <p className="text-slate-400 text-sm">
                  Analyzing historical incidents for patterns and generating recommendations...
                </p>
                <div className="mt-3">
                  <Progress value={75} className="h-2" />
                  <p className="text-xs text-slate-500 mt-1">Processing incident data...</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Learning KPIs */}
      <LearningKPIs stats={stats} />

      {/* Patterns and Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PatternsList isAnalyzing={stats.isAnalyzing} />
        <RecommendationsList isAnalyzing={stats.isAnalyzing} />
      </div>

      {/* Pattern Insights */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp size={20} />
            Pattern Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Target className="h-8 w-8 text-green-400" />
              </div>
              <h4 className="text-white font-medium mb-1">Prevention Success</h4>
              <p className="text-2xl font-bold text-green-400 mb-1">83%</p>
              <p className="text-sm text-slate-400">Patterns addressed</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Clock className="h-8 w-8 text-blue-400" />
              </div>
              <h4 className="text-white font-medium mb-1">MTTR Trend</h4>
              <p className="text-2xl font-bold text-blue-400 mb-1">↓ 23%</p>
              <p className="text-sm text-slate-400">Average reduction</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Brain className="h-8 w-8 text-purple-400" />
              </div>
              <h4 className="text-white font-medium mb-1">AI Confidence</h4>
              <p className="text-2xl font-bold text-purple-400 mb-1">{stats.patternConfidence}%</p>
              <p className="text-sm text-slate-400">Pattern accuracy</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}