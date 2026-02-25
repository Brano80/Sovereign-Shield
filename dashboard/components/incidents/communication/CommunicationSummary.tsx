"use client";

import { Send, CheckCircle, Eye, AlertTriangle } from "lucide-react";

interface CommunicationSummaryProps {
  summary: any;
  isLoading: boolean;
}

export function CommunicationSummary({ summary, isLoading }: CommunicationSummaryProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-4 gap-4">
        {Array(4).fill(0).map((_, i) => (
          <div key={i} className="rounded-lg border border-slate-700 bg-slate-900/50 p-4 animate-pulse">
            <div className="h-4 w-24 bg-slate-800 rounded mb-2" />
            <div className="h-8 w-16 bg-slate-800 rounded" />
          </div>
        ))}
      </div>
    );
  }

  const kpis = [
    {
      label: "Communications Sent",
      value: summary?.totalCommunications || 0,
      icon: Send,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "Delivery Rate",
      value: `${Math.round(summary?.deliveryRate || 0)}%`,
      icon: CheckCircle,
      color: (summary?.deliveryRate || 0) >= 90 ? "text-green-500" : "text-orange-500",
      bgColor: (summary?.deliveryRate || 0) >= 90 ? "bg-green-500/10" : "bg-orange-500/10",
    },
    {
      label: "Acknowledged",
      value: `${Math.round(summary?.acknowledgmentRate || 0)}%`,
      icon: Eye,
      color: (summary?.acknowledgmentRate || 0) >= 80 ? "text-green-500" : "text-yellow-500",
      bgColor: (summary?.acknowledgmentRate || 0) >= 80 ? "bg-green-500/10" : "bg-yellow-500/10",
    },
    {
      label: "Escalation Level",
      value: summary?.escalationLevel || 0,
      subtext: summary?.escalationStatus || "None",
      icon: AlertTriangle,
      color: summary?.escalationStatus === "ACTIVE" ? "text-orange-500" : "text-gray-500",
      bgColor: summary?.escalationStatus === "ACTIVE" ? "bg-orange-500/10" : "bg-gray-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-4">
      {kpis.map((kpi) => (
        <div key={kpi.label} className="rounded-lg border border-slate-700 bg-slate-900/50 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">{kpi.label}</span>
            <div className={`p-1.5 rounded ${kpi.bgColor}`}>
              <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
            </div>
          </div>
          <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
          {kpi.subtext && (
            <p className="text-xs text-slate-400 mt-1">{kpi.subtext}</p>
          )}
        </div>
      ))}
    </div>
  );
}

