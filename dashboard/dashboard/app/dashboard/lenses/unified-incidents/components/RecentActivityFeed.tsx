"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Activity, CheckCircle, AlertTriangle, FileText, Clock, ExternalLink } from 'lucide-react';

interface ActivityItem {
  id: string;
  timestamp: string;
  type: 'CREATED' | 'UPDATED' | 'REPORT_SUBMITTED' | 'DEADLINE_WARNING' | 'CLIENT_NOTIFIED' | 'STATUS_CHANGED' | 'INCIDENT_CREATED';
  incidentId: string;
  incidentTitle: string;
  description: string;
  user?: string;
}

interface RecentActivityFeedProps {
  activities?: ActivityItem[];
  loading?: boolean;
  maxItems?: number;
  onViewAll?: () => void;
  onActivityClick?: (activity: ActivityItem) => void;
}

// Mock data for demonstration
const mockActivities: ActivityItem[] = [
  {
    id: 'act-001',
    timestamp: '2026-01-15T10:42:00Z',
    type: 'REPORT_SUBMITTED',
    incidentId: 'INC-2026-010',
    incidentTitle: 'Data Export Issue',
    description: 'Final report submitted to DORA authority',
    user: 'J. Smith'
  },
  {
    id: 'act-002',
    timestamp: '2026-01-15T10:15:00Z',
    type: 'INCIDENT_CREATED',
    incidentId: 'INC-2026-018',
    incidentTitle: 'Network Intrusion Detected',
    description: 'New NIS2 significant incident created',
    user: 'System'
  },
  {
    id: 'act-003',
    timestamp: '2026-01-15T09:58:00Z',
    type: 'STATUS_CHANGED',
    incidentId: 'INC-2026-015',
    incidentTitle: 'Customer Data Exposure',
    description: 'Status changed from NEW to INVESTIGATING',
    user: 'M. Jones'
  },
  {
    id: 'act-004',
    timestamp: '2026-01-15T09:32:00Z',
    type: 'DEADLINE_WARNING',
    incidentId: 'INC-2026-012',
    incidentTitle: 'Major ICT Service Outage',
    description: 'DORA 4-hour deadline warning issued',
    user: 'System'
  },
  {
    id: 'act-005',
    timestamp: '2026-01-15T09:15:00Z',
    type: 'CLIENT_NOTIFIED',
    incidentId: 'INC-2026-009',
    incidentTitle: 'Payment System Disruption',
    description: 'Affected clients notified per DORA Art. 19(3)',
    user: 'K. Brown'
  }
];

export function RecentActivityFeed({
  activities = mockActivities,
  loading,
  maxItems = 5,
  onViewAll,
  onActivityClick
}: RecentActivityFeedProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every 30 seconds for relative timestamps
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 30000);

    return () => clearInterval(timer);
  }, []);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'REPORT_SUBMITTED':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'INCIDENT_CREATED':
        return <AlertTriangle className="h-4 w-4 text-blue-400" />;
      case 'STATUS_CHANGED':
        return <Activity className="h-4 w-4 text-purple-400" />;
      case 'DEADLINE_WARNING':
        return <Clock className="h-4 w-4 text-orange-400" />;
      case 'CLIENT_NOTIFIED':
        return <FileText className="h-4 w-4 text-cyan-400" />;
      default:
        return <Activity className="h-4 w-4 text-slate-400" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'REPORT_SUBMITTED':
        return 'border-green-500/20 bg-green-500/5';
      case 'INCIDENT_CREATED':
        return 'border-blue-500/20 bg-blue-500/5';
      case 'STATUS_CHANGED':
        return 'border-purple-500/20 bg-purple-500/5';
      case 'DEADLINE_WARNING':
        return 'border-orange-500/20 bg-orange-500/5';
      case 'CLIENT_NOTIFIED':
        return 'border-cyan-500/20 bg-cyan-500/5';
      default:
        return 'border-slate-500/20 bg-slate-500/5';
    }
  };

  const formatRelativeTime = (timestamp: string) => {
    const now = currentTime.getTime();
    const activityTime = new Date(timestamp).getTime();
    const diffMs = now - activityTime;
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return new Date(timestamp).toLocaleDateString();
  };

  const getActivityTypeLabel = (type: string) => {
    switch (type) {
      case 'REPORT_SUBMITTED':
        return '✓ Report submitted';
      case 'INCIDENT_CREATED':
        return '⚡ Incident created';
      case 'STATUS_CHANGED':
        return '📝 Status updated';
      case 'DEADLINE_WARNING':
        return '⚠️ Deadline warning';
      case 'CLIENT_NOTIFIED':
        return '✓ Client notified';
      default:
        return type.replace('_', ' ').toLowerCase();
    }
  };

  const displayedActivities = activities.slice(0, maxItems);
  const hasMoreActivities = activities.length > maxItems;

  if (loading) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </div>
            <Badge className="bg-slate-500/20 text-slate-400 border-slate-500/30">
              Loading...
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-4 h-4 bg-slate-700 rounded animate-pulse"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-slate-700 rounded animate-pulse"></div>
                  <div className="h-2 bg-slate-700 rounded animate-pulse w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (displayedActivities.length === 0) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </div>
            <Badge className="bg-slate-500/20 text-slate-400 border-slate-500/30">
              No Activity
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Activity className="w-8 h-8 mx-auto mb-2 text-slate-400" />
            <p className="text-slate-400">No recent activity to display.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-400 hover:text-white"
            onClick={onViewAll}
          >
            View All →
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {displayedActivities.map((activity) => (
            <div
              key={activity.id}
              className="bg-slate-800/50 rounded-lg p-3 border border-slate-600/50 cursor-pointer hover:bg-slate-800/70 transition-colors"
              onClick={() => onActivityClick?.(activity)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.type === 'INCIDENT_CREATED' ? 'bg-red-400' :
                    activity.type === 'DEADLINE_WARNING' ? 'bg-yellow-400' :
                    activity.type === 'REPORT_SUBMITTED' ? 'bg-green-400' :
                    'bg-blue-400'
                  }`} />
                  <span className="text-xs text-slate-400 font-mono">
                    {formatRelativeTime(activity.timestamp)}
                  </span>
                  <Badge className={
                    activity.type === 'INCIDENT_CREATED' ? 'bg-red-500/20 text-red-400 border-red-500/50' :
                    activity.type === 'DEADLINE_WARNING' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' :
                    activity.type === 'REPORT_SUBMITTED' ? 'bg-green-500/20 text-green-400 border-green-500/50' :
                    'bg-blue-500/20 text-blue-400 border-blue-500/50'
                  }>
                    {activity.type.replace('_', ' ')}
                  </Badge>
                </div>
                <span className="text-xs text-slate-500">{activity.incidentId}</span>
              </div>
              <div className="mt-1 text-xs text-slate-400">
                {activity.incidentTitle} {activity.user && `| User: ${activity.user}`}
              </div>
            </div>
          ))}

          {hasMoreActivities && (
            <Button
              variant="outline"
              className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
              onClick={onViewAll}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View All {activities.length} Activities
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}