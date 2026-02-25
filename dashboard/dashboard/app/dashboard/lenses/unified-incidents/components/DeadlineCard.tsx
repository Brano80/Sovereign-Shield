"use client";

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, AlertTriangle } from 'lucide-react';
import { IncidentDeadline, Regulation, SealLevel } from '../types';
import { RegulationBadge } from './RegulationBadge';

interface DeadlineCardProps {
  deadline: IncidentDeadline;
  onClick?: () => void;
  onView?: () => void;
  onSubmit?: () => void;
  onAction?: (action: string) => void;
  className?: string;
}

export function DeadlineCard({ deadline, onClick, onAction, className = '' }: DeadlineCardProps) {
  const getUrgencyStyles = (deadline: IncidentDeadline) => {
    const now = new Date().getTime();
    const dueTime = new Date(deadline.dueAt).getTime();
    const timeRemaining = dueTime - now;
    const isOverdue = timeRemaining <= 0;

    if (isOverdue) {
      return 'border-red-500/50 bg-red-500/10 hover:bg-red-500/20';
    } else if (timeRemaining <= 4 * 60 * 60 * 1000) { // 4 hours
      return 'border-orange-400/50 bg-orange-400/10 hover:bg-orange-400/20';
    } else if (timeRemaining <= 24 * 60 * 60 * 1000) { // 24 hours
      return 'border-yellow-400/50 bg-yellow-400/10 hover:bg-yellow-400/20';
    } else {
      return 'border-slate-500/50 bg-slate-500/10 hover:bg-slate-500/20';
    }
  };

  const getTimeRemaining = (deadline: IncidentDeadline) => {
    const now = new Date().getTime();
    const dueTime = new Date(deadline.dueAt).getTime();
    const timeRemaining = dueTime - now;
    const isOverdue = timeRemaining <= 0;

    if (isOverdue) {
      const overdueMs = Math.abs(timeRemaining);
      const overdueHours = Math.floor(overdueMs / (1000 * 60 * 60));
      const overdueMinutes = Math.floor((overdueMs % (1000 * 60 * 60)) / (1000 * 60));

      return overdueHours > 0
        ? `-${overdueHours}h ${overdueMinutes}m`
        : `-${overdueMinutes}m`;
    } else {
      const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
      const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));

      if (hours >= 24) {
        const days = Math.floor(hours / 24);
        return `${days}d ${hours % 24}h`;
      } else if (hours > 0) {
        return `${hours}h ${minutes}m`;
      } else {
        return `${minutes}m`;
      }
    }
  };

  const getActionButton = (deadline: IncidentDeadline) => {
    const now = new Date().getTime();
    const dueTime = new Date(deadline.dueAt).getTime();
    const timeRemaining = dueTime - now;
    const isOverdue = timeRemaining <= 0;

    if (isOverdue) {
      return { text: '⚡ Submit Immediately', variant: 'destructive' as const };
    } else if (timeRemaining <= 4 * 60 * 60 * 1000) { // 4 hours
      return { text: 'Prepare Report', variant: 'default' as const };
    } else {
      return { text: 'View Details', variant: 'outline' as const };
    }
  };

  const getReportTypeLabel = (reportType: string) => {
    switch (reportType) {
      case 'INITIAL': return 'Initial Report';
      case 'INTERMEDIATE': return 'Intermediate Report';
      case 'FINAL': return 'Final Report';
      case 'EARLY_WARNING': return 'Early Warning';
      case 'CLIENT_NOTIFICATION': return 'Client Notification';
      case 'SUBJECT_NOTIFICATION': return 'Subject Notification';
      default: return reportType;
    }
  };

  const actionButton = getActionButton(deadline);
  const timeRemaining = getTimeRemaining(deadline);

  return (
    <div
      className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${getUrgencyStyles(deadline)} ${className}`}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <RegulationBadge regulation={deadline.regulation as Regulation} />
          <Badge variant="outline" className="text-xs">
            {deadline.article}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium ${
            timeRemaining.startsWith('-') ? 'text-red-400' :
            'text-slate-400'
          }`}>
            {timeRemaining}
          </span>
          {deadline.status === 'OVERDUE' && (
            <AlertTriangle className="h-3 w-3 text-red-400" />
          )}
        </div>
      </div>

      {/* Content */}
      <div className="space-y-2">
        <div>
          <p className="text-xs text-slate-400">INC-{deadline.incidentId.slice(-6)}</p>
          <p className="text-sm font-medium text-white">{getReportTypeLabel(deadline.reportType)}</p>
        </div>

        {/* Evidence Seal Indicator */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Lock className="h-3 w-3" />
          <span>L4 Sealed</span>
        </div>

        {/* Action Button */}
        <Button
          size="sm"
          variant={actionButton.variant}
          className="w-full text-xs"
          onClick={(e) => {
            e.stopPropagation();
            onAction?.(actionButton.text);
          }}
        >
          {actionButton.text}
        </Button>
      </div>
    </div>
  );
}