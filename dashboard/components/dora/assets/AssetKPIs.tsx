"use client";

import { InventorySummary } from "@/lib/dora/asset-inventory-types";
import { Server, CheckCircle, AlertTriangle, Clock, Globe } from "lucide-react";

interface AssetKPIsProps {
  summary: InventorySummary | null;
  isLoading: boolean;
}

export function AssetKPIs({ summary, isLoading }: AssetKPIsProps) {
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

  const complianceRate = summary?.totalAssets
    ? (summary.complianceStats.compliant / summary.totalAssets) * 100
    : 0;

  const kpis = [
    {
      label: "Total Assets",
      value: summary?.totalAssets || 0,
      icon: Server,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "Compliant",
      value: `${Math.round(complianceRate)}%`,
      subtext: `${summary?.complianceStats.compliant || 0} assets`,
      icon: CheckCircle,
      color: complianceRate >= 90 ? "text-green-400" : "text-orange-400",
      bgColor: complianceRate >= 90 ? "bg-green-500/10" : "bg-orange-500/10",
    },
    {
      label: "Violations",
      value: summary?.violations.open || 0,
      subtext: `${summary?.violations.critical || 0} critical`,
      icon: AlertTriangle,
      color: (summary?.violations.open || 0) > 0 ? "text-red-400" : "text-green-400",
      bgColor: (summary?.violations.open || 0) > 0 ? "bg-red-500/10" : "bg-green-500/10",
      highlight: (summary?.violations.critical || 0) > 0,
    },
    {
      label: "Pending Approval",
      value: summary?.approvalStats.pending || 0,
      icon: Clock,
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/10",
    },
    {
      label: "External Integrations",
      value: summary?.externalInteractions.active || 0,
      subtext: `${summary?.externalInteractions.total || 0} total`,
      icon: Globe,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-5 gap-4">
      {kpis.map((kpi) => (
        <div
          key={kpi.label}
          className={`rounded-lg border border-slate-800 bg-slate-900 p-4 ${kpi.highlight ? "ring-2 ring-red-500" : ""}`}
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

