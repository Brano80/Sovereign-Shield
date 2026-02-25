"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import {
  AlertTriangle,
  Clock,
  CheckCircle,
  Eye,
  EyeOff,
  Pause,
  Play,
  Filter
} from "lucide-react";

// Dynamic imports for Recharts
const PieChart: any = dynamic(async () => (await import("recharts")).PieChart as any, { ssr: false });
const Pie: any = dynamic(async () => (await import("recharts")).Pie as any, { ssr: false });
const Cell: any = dynamic(async () => (await import("recharts")).Cell as any, { ssr: false });
const ResponsiveContainer: any = dynamic(async () => (await import("recharts")).ResponsiveContainer as any, { ssr: false });

interface ReviewQueueData {
  reviews: Array<{
    id: string;
    priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    category: string;
    subject: string;
    waitingTime: string;
    assignedTo?: string;
    userId: string;
    systemName: string;
    confidence: number;
    timestamp: Date;
    slaBreach: boolean;
  }>;
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  overdue: number;
}

interface ActivityFeedItem {
  id: string;
  timestamp: Date;
  type: 'AUTO_APPROVED' | 'QUEUED_REVIEW' | 'HUMAN_OVERRIDE' | 'APPEAL_RECEIVED';
  message: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  decisionId?: string;
}

interface RequiresAttentionItem {
  id: string;
  type: 'OVERDUE_REVIEW' | 'APPEAL_DEADLINE' | 'MISSING_DISCLOSURE';
  title: string;
  description: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  actionLabel: string;
  actionUrl?: string;
}

interface OverviewTabProps {
  reviewQueue: ReviewQueueData | null;
  activityFeed: ActivityFeedItem[];
  requiresAttention: RequiresAttentionItem[];
  activityPaused: boolean;
  setActivityPaused: (paused: boolean) => void;
  eventFilter: 'ALL' | 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  setEventFilter: (filter: 'ALL' | 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW') => void;
}

const DECISION_COLORS = {
  autoApproved: '#10b981', // green
  humanApproved: '#3b82f6', // blue
  humanRejected: '#f59e0b', // amber
  escalated: '#ef4444'   // red
};

export function OverviewTab({
  reviewQueue,
  activityFeed,
  requiresAttention,
  activityPaused,
  setActivityPaused,
  eventFilter,
  setEventFilter
}: OverviewTabProps) {
  // Calculate decision distribution for the pie chart
  const decisionDistribution = useMemo(() => {
    // Mock data - in real implementation, this would come from the API
    return [
      { name: 'Auto-Approved', value: 72, color: DECISION_COLORS.autoApproved },
      { name: 'Human Approved', value: 18, color: DECISION_COLORS.humanApproved },
      { name: 'Human Rejected', value: 6, color: DECISION_COLORS.humanRejected },
      { name: 'Escalated', value: 4, color: DECISION_COLORS.escalated }
    ];
  }, []);

  // Calculate queue summary by category
  const categorySummary = useMemo(() => {
    if (!reviewQueue?.reviews) return [];

    const categories: { [key: string]: number } = {};
    reviewQueue.reviews.forEach(review => {
      categories[review.category] = (categories[review.category] || 0) + 1;
    });

    return Object.entries(categories)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6); // Top 6 categories
  }, [reviewQueue]);

  // Filter activity feed
  const filteredActivity = useMemo(() => {
    if (eventFilter === 'ALL') return activityFeed;
    return activityFeed.filter(item => item.priority === eventFilter);
  }, [activityFeed, eventFilter]);

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
      case 'AUTO_APPROVED': return '🟢';
      case 'QUEUED_REVIEW': return '🟡';
      case 'HUMAN_OVERRIDE': return '🔵';
      case 'APPEAL_RECEIVED': return '🟠';
      default: return '⚪';
    }
  };

  const getAttentionIcon = (type: string) => {
    switch (type) {
      case 'OVERDUE_REVIEW': return '🔴';
      case 'APPEAL_DEADLINE': return '🔴';
      case 'MISSING_DISCLOSURE': return '🟡';
      default: return '⚠️';
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">OVERVIEW</h2>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Queue Summary */}
        <div className="space-y-6">
          <div className="bg-slate-800/50 border border-slate-600 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">REVIEW QUEUE SUMMARY</h3>

            {/* Priority Breakdown */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-slate-400 mb-3">By Priority</h4>
              <div className="space-y-2">
                {[
                  { label: 'Critical', count: reviewQueue?.critical || 0, color: 'bg-red-500', icon: '🔴' },
                  { label: 'High', count: reviewQueue?.high || 0, color: 'bg-orange-500', icon: '🟠' },
                  { label: 'Medium', count: reviewQueue?.medium || 0, color: 'bg-yellow-500', icon: '🟡' },
                  { label: 'Low', count: reviewQueue?.low || 0, color: 'bg-green-500', icon: '🟢' }
                ].map(({ label, count, color, icon }) => (
                  <div key={label} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span>{icon}</span>
                      <span className="text-sm">{label}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-mono">{count}</span>
                      <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${color} rounded-full`}
                          style={{ width: reviewQueue?.total ? `${(count / reviewQueue.total) * 100}%` : '0%' }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Category Breakdown */}
            <div>
              <h4 className="text-sm font-medium text-slate-400 mb-3">By Category</h4>
              <div className="space-y-2">
                {categorySummary.map(({ category, count }) => (
                  <div key={category} className="flex items-center justify-between">
                    <span className="text-sm">{category}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-mono">{count}</span>
                      <div className="w-16 h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: reviewQueue?.total ? `${(count / reviewQueue.total) * 100}%` : '0%' }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-600">
              <button className="w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium transition-colors">
                View Full Queue →
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Decision Distribution */}
        <div className="space-y-6">
          <div className="bg-slate-800/50 border border-slate-600 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">DECISION DISTRIBUTION</h3>
            <p className="text-sm text-slate-400 mb-4">Today's automated decision outcomes</p>

            {/* Pie Chart */}
            <div className="h-64 mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={decisionDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }: { name: string; value: number }) => `${name}: ${value}%`}
                  >
                    {decisionDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              {decisionDistribution.map((item) => (
                <div key={item.name} className="flex items-center space-x-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-slate-300">{item.name}</span>
                  <span className="text-slate-500 ml-auto">{item.value}%</span>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-600 text-center">
              <div className="text-2xl font-bold text-white">1,847</div>
              <div className="text-sm text-slate-400">Total decisions today</div>
              <div className="text-xs text-slate-500 mt-1">Automated: 1,680 (91%) • Human: 167 (9%)</div>
            </div>

            <div className="mt-4">
              <button className="w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium transition-colors">
                View Decision Log →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Requires Attention Panel */}
      {requiresAttention.length > 0 && (
        <div className="bg-slate-800/50 border border-slate-600 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <AlertTriangle className="text-red-400" size={20} />
              <span>REQUIRES ATTENTION</span>
            </h3>
            <button className="text-sm text-slate-400 hover:text-white transition-colors">
              View All →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {requiresAttention.slice(0, 3).map((item) => (
              <div key={item.id} className="bg-slate-800/50 border border-slate-500 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <span className="text-lg">{getAttentionIcon(item.type)}</span>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    item.priority === 'CRITICAL' ? 'bg-red-500/20 text-red-400' :
                    item.priority === 'HIGH' ? 'bg-orange-500/20 text-orange-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {item.priority}
                  </span>
                </div>
                <h4 className="font-medium text-white mb-1">{item.title}</h4>
                <p className="text-sm text-slate-400 mb-3">{item.description}</p>
                <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium transition-colors">
                  {item.actionLabel}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Real-time Activity Feed */}
      <div className="bg-slate-800/50 border border-slate-600 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">REAL-TIME ACTIVITY</h3>
          <div className="flex items-center space-x-4">
            {/* Activity Controls */}
            <button
              onClick={() => setActivityPaused(!activityPaused)}
              className="flex items-center space-x-2 px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-sm transition-colors"
            >
              {activityPaused ? <Play size={14} /> : <Pause size={14} />}
              <span>{activityPaused ? 'Resume' : 'Pause'}</span>
            </button>

            {/* Filter */}
            <div className="flex items-center space-x-2">
              <Filter size={14} className="text-slate-400" />
              <select
                value={eventFilter}
                onChange={(e) => setEventFilter(e.target.value as any)}
                className="bg-slate-700 border border-slate-600 rounded px-2 py-1 text-sm"
              >
                <option value="ALL">All Events</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredActivity.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              No activity matches the selected filter
            </div>
          ) : (
            filteredActivity.slice(0, 20).map((item) => (
              <div key={item.id} className="flex items-center space-x-4 p-3 bg-slate-900/30 rounded-lg hover:bg-slate-800/50 transition-colors">
                <span className="text-lg">{getActivityIcon(item.type)}</span>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-mono text-slate-400">{formatTime(item.timestamp)}</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      item.priority === 'CRITICAL' ? 'bg-red-500/20 text-red-400' :
                      item.priority === 'HIGH' ? 'bg-orange-500/20 text-orange-400' :
                      item.priority === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>
                      {item.priority}
                    </span>
                  </div>
                  <p className="text-sm text-white mt-1">{item.message}</p>
                </div>
                <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs transition-colors">
                  View Sealed Evidence →
                </button>
              </div>
            ))
          )}
        </div>

        {filteredActivity.length > 20 && (
          <div className="text-center mt-4">
            <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium transition-colors">
              Load More ({filteredActivity.length - 20} older events)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
