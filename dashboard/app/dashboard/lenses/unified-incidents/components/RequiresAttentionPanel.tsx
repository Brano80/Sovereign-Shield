"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Clock, CheckCircle, ExternalLink } from 'lucide-react';
import { IncidentDeadline, Regulation } from '../types';
import { RegulationBadge } from './RegulationBadge';

interface AttentionItem {
  id: string;
  incidentId: string;
  title: string;
  regulation: Regulation;
  priority: 'OVERDUE' | 'URGENT' | 'PENDING';
  dueAt: string;
  article: string;
  description: string;
  actionRequired: string;
}

interface RequiresAttentionPanelProps {
  items?: AttentionItem[];
  loading?: boolean;
  maxItems?: number;
  onViewAll?: () => void;
  onItemClick?: (item: AttentionItem) => void;
}

// Mock data for demonstration
const mockItems: AttentionItem[] = [
  {
    id: 'att-001',
    incidentId: 'INC-2026-012',
    title: 'DORA Initial Report Overdue',
    regulation: 'DORA',
    priority: 'OVERDUE',
    dueAt: '2026-01-15T14:00:00Z',
    article: 'Art. 19(4)',
    description: 'Major ICT incident requires immediate initial report submission',
    actionRequired: 'Submit Immediately'
  },
  {
    id: 'att-002',
    incidentId: 'INC-2026-015',
    title: 'GDPR Authority Notification',
    regulation: 'GDPR',
    priority: 'URGENT',
    dueAt: '2026-01-15T18:45:00Z',
    article: 'Art. 33(1)',
    description: 'Data breach affecting 2,340 subjects requires authority notification',
    actionRequired: 'Prepare Report'
  },
  {
    id: 'att-003',
    incidentId: 'INC-2026-012',
    title: 'Client Notification Required',
    regulation: 'DORA',
    priority: 'PENDING',
    dueAt: '2026-01-16T10:00:00Z',
    article: 'Art. 19(3)',
    description: 'Financial interests impacted - client notification without undue delay',
    actionRequired: 'Draft Notification'
  }
];

export function RequiresAttentionPanel({
  items = mockItems,
  loading,
  maxItems = 5,
  onViewAll,
  onItemClick
}: RequiresAttentionPanelProps) {

  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case 'OVERDUE':
        return {
          border: 'border-red-500/50',
          background: 'bg-red-500/10',
          hover: 'hover:bg-red-500/20',
          icon: <AlertTriangle className="h-4 w-4 text-red-400" />,
          badge: 'bg-red-500/20 text-red-400 border-red-500/30'
        };
      case 'URGENT':
        return {
          border: 'border-orange-500/50',
          background: 'bg-orange-500/10',
          hover: 'hover:bg-orange-500/20',
          icon: <Clock className="h-4 w-4 text-orange-400" />,
          badge: 'bg-orange-500/20 text-orange-400 border-orange-500/30'
        };
      case 'PENDING':
        return {
          border: 'border-yellow-500/50',
          background: 'bg-yellow-500/10',
          hover: 'hover:bg-yellow-500/20',
          icon: <AlertTriangle className="h-4 w-4 text-yellow-400" />,
          badge: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
        };
      default:
        return {
          border: 'border-slate-500/50',
          background: 'bg-slate-500/10',
          hover: 'hover:bg-slate-500/20',
          icon: <CheckCircle className="h-4 w-4 text-slate-400" />,
          badge: 'bg-slate-500/20 text-slate-400 border-slate-500/30'
        };
    }
  };

  const getTimeRemaining = (dueAt: string) => {
    const now = new Date().getTime();
    const dueTime = new Date(dueAt).getTime();
    const diffMs = dueTime - now;

    if (diffMs <= 0) {
      const overdueMs = Math.abs(diffMs);
      const hours = Math.floor(overdueMs / (1000 * 60 * 60));
      const minutes = Math.floor((overdueMs % (1000 * 60 * 60)) / (1000 * 60));
      return hours > 0 ? `${hours}h ${minutes}m ago` : `${minutes}m ago`;
    } else {
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
    }
  };

  const displayedItems = items.slice(0, maxItems);
  const hasMoreItems = items.length > maxItems;

  if (loading) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Requires Attention
            </div>
            <Badge className="bg-slate-500/20 text-slate-400 border-slate-500/30">
              Loading...
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-slate-700/50 rounded animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (displayedItems.length === 0) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Requires Attention
            </div>
            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
              All Clear
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <CheckCircle className="w-8 h-8 mx-auto mb-2 text-emerald-400" />
            <p className="text-slate-400">No urgent actions required at this time.</p>
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
            <AlertTriangle className="h-5 w-5" />
            Requires Attention
          </div>
          <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
            {displayedItems.length} items
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {displayedItems.map((item) => {
            const styles = getPriorityStyles(item.priority);
            const timeRemaining = getTimeRemaining(item.dueAt);

            return (
              <div
                key={item.id}
                className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${styles.border} ${styles.background} ${styles.hover}`}
                onClick={() => onItemClick?.(item)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {styles.icon}
                    <Badge className={styles.badge}>
                      {item.priority}
                    </Badge>
                  </div>
                  <span className={`text-xs font-medium ${
                    item.priority === 'OVERDUE' ? 'text-red-400' :
                    item.priority === 'URGENT' ? 'text-orange-400' :
                    'text-yellow-400'
                  }`}>
                    Due: {timeRemaining}
                  </span>
                </div>

                <div className="mb-3">
                  <h4 className="text-sm font-medium text-white mb-1">{item.title}</h4>
                  <div className="flex items-center gap-2 mb-1">
                    <RegulationBadge regulation={item.regulation} />
                    <span className="text-xs text-slate-400">{item.article}</span>
                  </div>
                  <p className="text-xs text-slate-400">{item.description}</p>
                </div>

                <Button
                  size="sm"
                  variant={item.priority === 'OVERDUE' ? 'destructive' : 'default'}
                  className="w-full text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Handle action - placeholder
                    console.log('Action:', item.actionRequired, 'for item:', item.id);
                  }}
                >
                  {item.actionRequired}
                </Button>
              </div>
            );
          })}

          {hasMoreItems && (
            <Button
              variant="outline"
              className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
              onClick={onViewAll}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View All {items.length} Items
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}