"use client";

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  GitBranch,
  Target,
  Shield,
  Clock,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

interface PatternAnalysisStats {
  patternsDetected: number;
  patternConfidence: number;
  incidentsPrevented: number;
  mttrImprovement: number;
  lastAnalysis: Date;
  isAnalyzing: boolean;
}

interface LearningKPIsProps {
  stats: PatternAnalysisStats;
}

export function LearningKPIs({ stats }: LearningKPIsProps) {
  const kpis = [
    {
      title: "Patterns Detected",
      value: stats.patternsDetected,
      trend: "+2",
      trendType: "positive" as const,
      target: null,
      icon: GitBranch,
      color: "text-blue-400",
      bgColor: "bg-blue-500/20",
      description: "Active patterns identified"
    },
    {
      title: "Pattern Confidence",
      value: `${stats.patternConfidence}%`,
      trend: "+3%",
      trendType: "positive" as const,
      target: "Target: >80%",
      icon: Target,
      color: "text-green-400",
      bgColor: "bg-green-500/20",
      description: "AI accuracy rate"
    },
    {
      title: "Incidents Prevented",
      value: stats.incidentsPrevented,
      trend: "+1",
      trendType: "positive" as const,
      target: null,
      icon: Shield,
      color: "text-purple-400",
      bgColor: "bg-purple-500/20",
      description: "Through proactive measures"
    },
    {
      title: "MTTR Improvement",
      value: `${stats.mttrImprovement}%`,
      trend: "+2%",
      trendType: "positive" as const,
      target: "Target: >20%",
      icon: Clock,
      color: "text-orange-400",
      bgColor: "bg-orange-500/20",
      description: "Mean time to resolution"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi, index) => {
        const Icon = kpi.icon;
        const TrendIcon = kpi.trendType === 'positive' ? TrendingUp : TrendingDown;

        return (
          <Card key={index} className={`${kpi.bgColor} border-slate-700`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 ${kpi.bgColor} rounded-lg flex items-center justify-center`}>
                  <Icon size={20} className={kpi.color} />
                </div>
                {kpi.trend && (
                  <Badge
                    className={`${
                      kpi.trendType === 'positive'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-red-500/20 text-red-400'
                    } border-0`}
                  >
                    <TrendIcon size={12} className="mr-1" />
                    {kpi.trend}
                  </Badge>
                )}
              </div>

              <div className="space-y-1">
                <p className="text-sm text-slate-400">{kpi.title}</p>
                <p className="text-2xl font-bold text-white">{kpi.value}</p>
                <p className="text-xs text-slate-500">{kpi.description}</p>
                {kpi.target && (
                  <Badge variant="outline" className="text-xs border-slate-600 text-slate-400">
                    {kpi.target}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}