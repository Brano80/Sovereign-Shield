"use client";

import { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  AlertTriangle,
  TrendingUp,
  BarChart3,
  MessageSquare,
  ExternalLink
} from "lucide-react";

// Dynamic imports for Recharts
const LineChart: any = dynamic(async () => (await import("recharts")).LineChart as any, { ssr: false });
const Line: any = dynamic(async () => (await import("recharts")).LineChart as any, { ssr: false });
const XAxis: any = dynamic(async () => (await import("recharts")).XAxis as any, { ssr: false });
const YAxis: any = dynamic(async () => (await import("recharts")).YAxis as any, { ssr: false });
const CartesianGrid: any = dynamic(async () => (await import("recharts")).CartesianGrid as any, { ssr: false });
const Tooltip: any = dynamic(async () => (await import("recharts")).Tooltip as any, { ssr: false });
const ResponsiveContainer: any = dynamic(async () => (await import("recharts")).ResponsiveContainer as any, { ssr: false });
const Legend: any = dynamic(async () => (await import("recharts")).Legend as any, { ssr: false });

import { SeverityBadge } from '@/components/ui/severity-badge';

interface GDPRRightsOverview {
  openRequests: number;
  overdueRequests: number;
  completedThisMonth: number;
  completedChange: number;
  avgResponseTime: number;
  avgResponseTimeChange: number;
  slaCompliance30Days: number;
  lastRequestTimestamp: Date;
  complianceStatus: 'COMPLIANT' | 'NON_COMPLIANT' | 'MONITORING';

  accessRequests: number;
  erasureRequests: number;
  portabilityRequests: number;
  objectionsActive: number;

  requestsByType: Array<{
    type: string;
    count: number;
    article: string;
  }>;

  slaTimeline: Array<{
    date: string;
    requests: number;
    completed: number;
    breaches: number;
  }>;
}

interface RecentActivityItem {
  id: string;
  timestamp: Date;
  type: 'ACCESS_COMPLETED' | 'ERASURE_COMPLETED' | 'NEW_REQUEST' | 'RECTIFICATION_APPLIED' | 'EXPORT_GENERATED';
  message: string;
  requestId: string;
  dataSubject: string;
}

interface RequiresAttentionItem {
  id: string;
  type: 'SLA_CRITICAL' | 'PENDING_VERIFICATION' | 'EXCEPTION_REVIEW';
  title: string;
  description: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  requestId: string;
  dataSubject: string;
  actionLabel: string;
  daysRemaining?: number;
}

interface OverviewTabProps {
  overview: GDPRRightsOverview;
  recentActivity: RecentActivityItem[];
  requiresAttention: RequiresAttentionItem[];
}

export function OverviewTab({ overview, recentActivity, requiresAttention }: OverviewTabProps) {
  const formatTime = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
      return 'Invalid date';
    }
    return dateObj.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'ACCESS_COMPLETED': return '🟢';
      case 'ERASURE_COMPLETED': return '🗑️';
      case 'NEW_REQUEST': return '🆕';
      case 'RECTIFICATION_APPLIED': return '✏️';
      case 'EXPORT_GENERATED': return '📤';
      default: return '📋';
    }
  };

  const getPrioritySeverity = (priority: string): 1 | 2 | 3 | 4 => {
    switch (priority) {
      case 'CRITICAL': return 4;
      case 'HIGH': return 3;
      case 'MEDIUM': return 2;
      case 'LOW': return 1;
      default: return 2;
    }
  };

  return (
    <div className="p-6 space-y-8">
      {/* Top Row: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Requests by Type */}
        <div className="bg-slate-800/50 border border-slate-600 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">REQUESTS BY TYPE</h3>
            <BarChart3 size={20} className="text-slate-400" />
          </div>

          <div className="space-y-3">
            {overview.requestsByType.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-white">{item.type}</span>
                  <span className="text-xs text-slate-500">{item.article}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-slate-700 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{
                        width: `${(item.count / Math.max(...overview.requestsByType.map(r => r.count))) * 100}%`
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-bold text-white w-8 text-right">{item.count}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-600">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Total Open:</span>
              <span className="font-bold text-white">{overview.openRequests}</span>
            </div>
            <button className="mt-2 text-blue-400 hover:text-blue-300 text-sm">
              View All Requests →
            </button>
          </div>
        </div>

        {/* Right: SLA Timeline */}
        <div className="bg-slate-800/50 border border-slate-600 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">SLA TIMELINE</h3>
            <TrendingUp size={20} className="text-slate-400" />
          </div>

          <div className="h-48 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={overview.slaTimeline}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #475569',
                    borderRadius: '6px'
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="requests"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Requests"
                />
                <Line
                  type="monotone"
                  dataKey="completed"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Completed"
                />
                <Line
                  type="monotone"
                  dataKey="breaches"
                  stroke="#ef4444"
                  strokeWidth={2}
                  name="SLA Breaches"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">This month:</span>
              <span className="text-red-400">2 SLA breaches</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Last month:</span>
              <span className="text-green-400">0 SLA breaches</span>
            </div>
          </div>
        </div>
      </div>

      {/* Requires Attention Panel */}
      <div className="bg-slate-800/50 border border-slate-600 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            <AlertTriangle size={20} className="text-red-400 mr-2" />
            REQUIRES ATTENTION
          </h3>
          <button className="text-blue-400 hover:text-blue-300 text-sm">
            View All →
          </button>
        </div>

        <div className="space-y-3">
          {requiresAttention.slice(0, 3).map((item) => (
            <div key={item.id} className="flex items-center space-x-4 p-4 bg-slate-800/50 rounded-lg border border-slate-600">
              <SeverityBadge level={getPrioritySeverity(item.priority)} />

              <div className="flex-1">
                <h4 className="font-medium text-white">{item.title}</h4>
                <p className="text-sm text-slate-400">{item.description}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-xs text-slate-500">{item.requestId}</span>
                  <span className="text-xs text-slate-500">•</span>
                  <span className="text-xs text-slate-500">{item.dataSubject}</span>
                  {item.daysRemaining && (
                    <>
                      <span className="text-xs text-slate-500">•</span>
                      <span className="text-xs text-red-400">{item.daysRemaining} days remaining</span>
                    </>
                  )}
                </div>
              </div>

              <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors">
                {item.actionLabel}
              </button>
            </div>
          ))}
        </div>

        {requiresAttention.length === 0 && (
          <div className="text-center py-8 text-slate-400">
            No urgent items require attention
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="bg-slate-800/50 border border-slate-600 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">RECENT ACTIVITY</h3>
          <button className="text-blue-400 hover:text-blue-300 text-sm">
            View All →
          </button>
        </div>

        <div className="space-y-2">
          {recentActivity.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              No recent activity
            </div>
          ) : (
            recentActivity.slice(0, 5).map((item) => (
              <div key={item.id} className="flex items-center space-x-4 p-3 bg-slate-800/30 rounded-lg hover:bg-slate-800/50 transition-colors">
                <span className="text-lg">{getActivityIcon(item.type)}</span>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-mono text-slate-400">{formatTime(item.timestamp)}</span>
                    <span className={`px-2 py-1 rounded text-xs border ${
                      item.type.includes('COMPLETED') ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                      item.type === 'NEW_REQUEST' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                      'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                    }`}>
                      {item.type.replace('_', ' ').toLowerCase()}
                    </span>
                  </div>
                  <p className="text-sm text-white mt-1">{item.message}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs text-slate-500">{item.requestId}</span>
                    <span className="text-xs text-slate-500">•</span>
                    <span className="text-xs text-slate-500">{item.dataSubject}</span>
                  </div>
                </div>
                <button className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-xs transition-colors">
                  View
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Link to Transparency Lens */}
      <div className="bg-slate-800/50 border border-slate-600 rounded-lg p-6">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center">
            <MessageSquare size={24} className="text-blue-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-2">
              AUTOMATED DECISIONS (Art. 22)
            </h3>
            <p className="text-slate-400 mb-4">
              Automated decision-making and profiling rights are managed in the Transparency & Human Oversight lens. This includes rights to human intervention, meaningful information about logic involved, and the right to contest automated decisions.
            </p>
            <Link
              href="/dashboard/lenses/transparency-oversight"
              className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors"
            >
              <span>Go to Transparency & Human Oversight</span>
              <ExternalLink size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
