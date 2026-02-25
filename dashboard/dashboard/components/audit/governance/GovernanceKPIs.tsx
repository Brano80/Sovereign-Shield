"use client";

import { GovernanceSummary } from "@/lib/dora/governance-types";
import { FileText, Clock, CheckCircle, Users, GraduationCap } from "lucide-react";

interface GovernanceKPIsProps {
  summary: GovernanceSummary | null;
  isLoading: boolean;
}

export function GovernanceKPIs({ summary, isLoading }: GovernanceKPIsProps) {
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
      label: "Active Policies",
      value: summary?.policies.byStatus.ACTIVE || 0,
      subtext: `${summary?.policies.pendingReview || 0} pending review`,
      icon: FileText,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "Pending Approvals",
      value: summary?.approvalQueue.pendingTotal || 0,
      subtext: `${summary?.approvalQueue.overdueApprovals || 0} overdue`,
      icon: Clock,
      color: "text-orange-400",
      bgColor: "bg-orange-500/10",
      highlight: (summary?.approvalQueue.pendingTotal || 0) > 0,
    },
    {
      label: "Avg Approval Time",
      value: `${summary?.changeRequests.avgApprovalTime || 0}h`,
      subtext: "last 30 days",
      icon: CheckCircle,
      color: "text-green-400",
      bgColor: "bg-green-500/10",
    },
    {
      label: "Oversight Activities",
      value: summary?.oversight.thisMonth || 0,
      subtext: "this month",
      icon: Users,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
    },
    {
      label: "Training Compliance",
      value: `${Math.round(summary?.training.complianceRate || 0)}%`,
      subtext: `${summary?.training.overdue || 0} overdue`,
      icon: GraduationCap,
      color: (summary?.training.complianceRate || 0) >= 90 ? "text-green-400" : "text-orange-400",
      bgColor: (summary?.training.complianceRate || 0) >= 90 ? "bg-green-500/10" : "bg-orange-500/10",
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
          <p className="text-xs text-slate-500 mt-1">{kpi.subtext}</p>
        </div>
      ))}
    </div>
  );
}

