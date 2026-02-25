"use client";

import { useMemo } from "react";
import {
  Shield,
  Building,
  Zap,
  Server,
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  Activity
} from "lucide-react";
import { Incident } from "@/app/types/incidents";

interface IncidentOverviewPanelProps {
  incidents: Incident[];
}

export function IncidentOverviewPanel({ incidents }: IncidentOverviewPanelProps) {
  // Calculate regulation distribution
  const regulationStats = useMemo(() => {
    const stats = incidents.reduce((acc, incident) => {
      const reg = incident.regulation;
      if (!acc[reg]) {
        acc[reg] = { count: 0, percentage: 0 };
      }
      acc[reg].count++;
      return acc;
    }, {} as Record<string, { count: number; percentage: number }>);

    const total = incidents.length;
    Object.keys(stats).forEach(reg => {
      stats[reg].percentage = Math.round((stats[reg].count / total) * 100);
    });

    return stats;
  }, [incidents]);

  // Calculate status distribution
  const statusStats = useMemo(() => {
    const stats = incidents.reduce((acc, incident) => {
      const status = incident.status;
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const total = incidents.length;
    const result = Object.entries(stats).map(([status, count]) => ({
      status,
      count,
      percentage: Math.round((count / total) * 100)
    }));

    return result;
  }, [incidents]);

  // Calculate severity distribution
  const severityStats = useMemo(() => {
    const stats = incidents.reduce((acc, incident) => {
      const severity = incident.severity;
      acc[severity] = (acc[severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(stats).map(([severity, count]) => ({
      severity,
      count
    }));
  }, [incidents]);

  // Calculate monthly stats (mock data for now)
  const monthlyStats = useMemo(() => {
    // In real implementation, this would come from API
    const resolvedIncidents = incidents.filter(inc => inc.status === 'RESOLVED').length;
    const newIncidents = incidents.length;

    return {
      newIncidents,
      resolvedIncidents,
      avgResolutionTime: 2.4, // days
      slaCompliance: 97.3 // percentage
    };
  }, [incidents]);

  const getRegulationIcon = (regulation: string) => {
    switch (regulation) {
      case 'GDPR': return <Shield className="h-4 w-4" />;
      case 'DORA': return <Building className="h-4 w-4" />;
      case 'AI_ACT': return <Zap className="h-4 w-4" />;
      case 'NIS2': return <Server className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  const getRegulationColor = (regulation: string) => {
    switch (regulation) {
      case 'GDPR': return 'bg-blue-500';
      case 'DORA': return 'bg-purple-500';
      case 'AI_ACT': return 'bg-orange-500';
      case 'NIS2': return 'bg-green-500';
      default: return 'bg-slate-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-yellow-500';
      case 'INVESTIGATING': return 'bg-blue-500';
      case 'RESOLVED': return 'bg-green-500';
      case 'OVERDUE': return 'bg-red-500';
      default: return 'bg-slate-500';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-500';
      case 'HIGH': return 'bg-orange-500';
      case 'MEDIUM': return 'bg-yellow-500';
      case 'LOW': return 'bg-green-500';
      default: return 'bg-slate-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'New';
      case 'INVESTIGATING': return 'Investigating';
      case 'RESOLVED': return 'Resolved';
      case 'OVERDUE': return 'Overdue';
      default: return status;
    }
  };

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <BarChart3 className="h-5 w-5 text-blue-400" />
        <h3 className="text-lg font-semibold text-white">Incident Overview</h3>
        <span className="text-sm text-slate-400">Compliance analytics and metrics</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* By Regulation (Bar Chart) */}
        <div className="lg:col-span-2">
          <h4 className="text-sm font-medium text-slate-300 mb-4">By Regulation</h4>
          <div className="space-y-4">
            {Object.entries(regulationStats).map(([regulation, stats]) => (
              <div key={regulation} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getRegulationIcon(regulation)}
                    <span className="text-sm text-white capitalize">
                      {regulation.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">{stats.count} incidents</span>
                    <span className="text-xs text-slate-300">{stats.percentage}%</span>
                  </div>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${getRegulationColor(regulation)} transition-all duration-500`}
                    style={{ width: `${stats.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Status & Severity Analytics */}
        <div className="space-y-6">
          {/* By Status */}
          <div>
            <h4 className="text-sm font-medium text-slate-300 mb-4">By Status</h4>
            <div className="space-y-3">
              {statusStats.map(({ status, count, percentage }) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(status)}`} />
                    <span className="text-sm text-slate-300">{getStatusLabel(status)}</span>
                  </div>
                  <div className="text-sm text-white">
                    {count} ({percentage}%)
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* By Severity */}
          <div>
            <h4 className="text-sm font-medium text-slate-300 mb-4">By Severity</h4>
            <div className="space-y-3">
              {severityStats.map(({ severity, count }) => (
                <div key={severity} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${getSeverityColor(severity)}`} />
                    <span className="text-sm text-slate-300 capitalize">{severity.toLowerCase()}</span>
                  </div>
                  <div className="text-sm text-white font-medium">{count}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Stats */}
      <div className="mt-8">
        <h4 className="text-sm font-medium text-slate-300 mb-4">Monthly Stats</h4>
        <div className="bg-slate-800/50 rounded-lg overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-700">
            {/* New Incidents vs Resolved */}
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="h-4 w-4 text-blue-400" />
                <span className="text-xs text-slate-400">New vs Resolved</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">New</span>
                  <span className="text-sm text-blue-400 font-medium">{monthlyStats.newIncidents}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">Resolved</span>
                  <span className="text-sm text-green-400 font-medium">{monthlyStats.resolvedIncidents}</span>
                </div>
              </div>
            </div>

            {/* Avg Resolution Time */}
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-purple-400" />
                <span className="text-xs text-slate-400">Avg Resolution Time</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-white">{monthlyStats.avgResolutionTime}</span>
                <span className="text-xs text-slate-500">days</span>
              </div>
            </div>

            {/* SLA Compliance % */}
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span className="text-xs text-slate-400">SLA Compliance</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-lg font-bold ${
                  monthlyStats.slaCompliance >= 95 ? 'text-green-400' :
                  monthlyStats.slaCompliance >= 90 ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {monthlyStats.slaCompliance}%
                </span>
                <span className="text-xs text-slate-500">target: {'>'}95%</span>
              </div>
              {monthlyStats.slaCompliance >= 95 && (
                <div className="mt-1">
                  <span className="inline-flex items-center gap-1 text-xs text-green-400">
                    <CheckCircle className="h-3 w-3" />
                    On target
                  </span>
                </div>
              )}
              {monthlyStats.slaCompliance < 95 && (
                <div className="mt-1">
                  <span className="inline-flex items-center gap-1 text-xs text-yellow-400">
                    <AlertTriangle className="h-3 w-3" />
                    Below target
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Trend Indicator */}
      <div className="mt-6 pt-4 border-t border-slate-700">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-green-400" />
          <span className="text-xs text-slate-400">
            Resolution time improved by 12% compared to last month
          </span>
        </div>
      </div>
    </div>
  );
}
