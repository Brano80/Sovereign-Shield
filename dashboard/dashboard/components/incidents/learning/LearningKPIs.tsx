"use client";

import { LearningSummary } from "@/lib/dora/incident-learning-types";
import { GitBranch, Lightbulb, Target, TrendingDown, Brain } from "lucide-react";

interface LearningKPIsProps {
  summary: LearningSummary | null;
  isLoading: boolean;
}

export function LearningKPIs({ summary, isLoading }: LearningKPIsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-5 gap-4">
        {Array(5).fill(0).map((_, i) => (
          <div key={i} className="rounded-lg border border-slate-800 bg-slate-900 p-4 animate-pulse">
            <div className="h-4 w-24 bg-slate-700 rounded mb-2" />
            <div className="h-8 w-16 bg-slate-700 rounded" />
          </div>
        ))}
      </div>
    );
  }

  const kpis = [
    {
      label: "Active Patterns",
      value: summary?.patterns.active || 0,
      subtext: `${summary?.patterns.newThisMonth || 0} new this month`,
      icon: GitBranch,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "Proposed Actions",
      value: summary?.recommendations.proposed || 0,
      subtext: `${summary?.recommendations.inProgress || 0} in progress`,
      icon: Lightbulb,
      color: "text-orange-400",
      bgColor: "bg-orange-500/10",
      highlight: (summary?.recommendations.proposed || 0) > 0,
    },
    {
      label: "Implemented",
      value: summary?.recommendations.implemented || 0,
      subtext: `${summary?.recommendations.verified || 0} verified`,
      icon: Target,
      color: "text-green-400",
      bgColor: "bg-green-500/10",
    },
    {
      label: "Incident Reduction",
      value: `${summary?.trends.incidentReduction || 0}%`,
      subtext: "vs previous period",
      icon: TrendingDown,
      color: (summary?.trends.incidentReduction || 0) > 0 ? "text-green-400" : "text-red-400",
      bgColor: (summary?.trends.incidentReduction || 0) > 0 ? "bg-green-500/10" : "bg-red-500/10",
    },
    {
      label: "Avg Effectiveness",
      value: `${summary?.recommendations.averageEffectiveness || 0}%`,
      subtext: "of verified actions",
      icon: Brain,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-5 gap-4">
      {kpis.map((kpi) => (
        <div
          key={kpi.label}
          className={`rounded-lg border border-slate-800 bg-slate-900 p-4 ${kpi.highlight ? "ring-2 ring-orange-500" : ""}`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">{kpi.label}</span>
            <div className={`p-1.5 rounded ${kpi.bgColor}`}>
              <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
            </div>
          </div>
          <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
          {kpi.subtext && (
            <p className="text-xs text-slate-500 mt-1">{kpi.subtext}</p>
          )}
        </div>
      ))}
    </div>
  );
}

