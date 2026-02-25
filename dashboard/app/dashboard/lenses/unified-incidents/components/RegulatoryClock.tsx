"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, AlertTriangle, Shield, Activity, Zap, Globe } from 'lucide-react';
import { IncidentDeadline, Regulation } from '../types';
import { RegulationBadge } from './RegulationBadge';

interface RegulatoryClockProps {
  deadlines?: IncidentDeadline[];
  loading?: boolean;
}

interface ProcessedDeadline extends IncidentDeadline {
  timeRemaining: number;
  formattedTime: string;
  urgency: 'overdue' | 'critical' | 'urgent' | 'warning' | 'normal';
}

export function RegulatoryClock({ deadlines = [], loading }: RegulatoryClockProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every second for live countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Process deadlines with time calculations and urgency levels
  const processedDeadlines = useMemo(() => {
    const now = currentTime.getTime();

    return (deadlines || []).map(deadline => {
      const timeRemaining = new Date(deadline.dueAt).getTime() - now;
      const isOverdue = timeRemaining <= 0;

      let formattedTime: string;
      let urgency: ProcessedDeadline['urgency'];

      if (isOverdue) {
        const overdueMs = Math.abs(timeRemaining);
        const overdueHours = Math.floor(overdueMs / (1000 * 60 * 60));
        const overdueMinutes = Math.floor((overdueMs % (1000 * 60 * 60)) / (1000 * 60));

        formattedTime = overdueHours > 0
          ? `-${overdueHours}h ${overdueMinutes}m`
          : `-${overdueMinutes}m`;

        urgency = 'overdue';
      } else {
        const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
        const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

        if (hours >= 24 * 3) { // 72+ hours
          const days = Math.floor(hours / 24);
          formattedTime = `${days}d`;
          urgency = 'normal';
        } else if (hours >= 24) { // 24-72 hours
          const days = Math.floor(hours / 24);
          const remainingHours = hours % 24;
          formattedTime = `${days}d ${remainingHours}h`;
          urgency = 'normal';
        } else if (hours >= 4) { // 4-24 hours
          formattedTime = `${hours}h ${minutes}m`;
          urgency = 'warning';
        } else if (hours >= 1) { // 1-4 hours
          formattedTime = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
          urgency = 'urgent';
        } else { // Under 1 hour
          formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;
          urgency = 'critical';
        }
      }

      return {
        ...deadline,
        timeRemaining,
        formattedTime,
        urgency
      };
    });
  }, [deadlines, currentTime]);

  // Sort deadlines by urgency: overdue → critical → urgent → warning → normal
  const sortedDeadlines = useMemo(() => {
    const urgencyOrder = { overdue: 0, critical: 1, urgent: 2, warning: 3, normal: 4 };

    return processedDeadlines
      .sort((a, b) => {
        if (urgencyOrder[a.urgency] !== urgencyOrder[b.urgency]) {
          return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
        }
        return a.timeRemaining - b.timeRemaining;
      })
      .slice(0, 8); // Show top 8 most urgent
  }, [processedDeadlines]);

  const getUrgencyStyles = (urgency: ProcessedDeadline['urgency']) => {
    switch (urgency) {
      case 'overdue':
        return 'border-red-500/50 bg-red-500/10 hover:bg-red-500/20';
      case 'critical':
        return 'border-red-400/50 bg-red-400/10 hover:bg-red-400/20 animate-pulse';
      case 'urgent':
        return 'border-orange-400/50 bg-orange-400/10 hover:bg-orange-400/20';
      case 'warning':
        return 'border-yellow-400/50 bg-yellow-400/10 hover:bg-yellow-400/20';
      case 'normal':
        return 'border-slate-500/50 bg-slate-500/10 hover:bg-slate-500/20';
      default:
        return 'border-slate-500/50 bg-slate-500/10 hover:bg-slate-500/20';
    }
  };

  const getActionButton = (urgency: ProcessedDeadline['urgency']) => {
    switch (urgency) {
      case 'overdue':
      case 'critical':
        return { text: 'Submit Now', variant: 'destructive' as const };
      case 'urgent':
        return { text: 'Prepare', variant: 'default' as const };
      case 'warning':
        return { text: 'View', variant: 'outline' as const };
      default:
        return { text: 'View', variant: 'outline' as const };
    }
  };

  const getArticleReference = (deadline: IncidentDeadline) => {
    const { regulation, reportType } = deadline;

    switch (regulation) {
      case 'GDPR':
        return reportType === 'SUBJECT_NOTIFICATION' ? 'Art. 34' : 'Art. 33';
      case 'DORA':
        switch (reportType) {
          case 'INITIAL': return 'Art. 19(4)';
          case 'INTERMEDIATE': return 'Art. 19(5)';
          case 'FINAL': return 'Art. 19(6)';
          case 'CLIENT_NOTIFICATION': return 'Art. 19(3)';
          default: return 'Art. 19';
        }
      case 'NIS2':
        switch (reportType) {
          case 'EARLY_WARNING': return 'Art. 23(1)';
          case 'INCIDENT_NOTIFICATION': return 'Art. 23(2)';
          default: return 'Art. 23';
        }
      case 'AI_ACT':
        return 'Art. 62';
      default:
        return 'Standard';
    }
  };

  if (loading) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Clock className="h-5 w-5" />
            Regulatory Clock
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex-shrink-0 w-48 h-32 bg-slate-700/50 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Handle empty deadlines array
  if (!deadlines || deadlines.length === 0) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Clock className="h-5 w-5" />
            Regulatory Clock
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 text-center">
            <Clock size={32} className="mx-auto mb-3 text-slate-400" />
            <h3 className="text-lg font-semibold text-white mb-1">No Active Deadlines</h3>
            <p className="text-slate-400 text-sm">Regulatory reporting deadlines will appear here when incidents are created.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (sortedDeadlines.length === 0) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Clock className="h-5 w-5" />
            Regulatory Clock
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Clock className="w-8 h-8 mx-auto mb-2 text-emerald-400" />
            <p className="text-slate-400">All deadlines are on track. No urgent action required.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Clock className="h-5 w-5" />
          Regulatory Clock - URGENT DEADLINES
        </CardTitle>
        <p className="text-sm text-slate-400">Real-time deadline tracking with live countdown</p>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {sortedDeadlines.map((deadline) => {
            const actionButton = getActionButton(deadline.urgency);
            const articleRef = getArticleReference(deadline);

            return (
              <div
                key={deadline.id}
                className={`flex-shrink-0 w-48 p-4 rounded-lg border cursor-pointer transition-all duration-200 ${getUrgencyStyles(deadline.urgency)}`}
                onClick={() => {
                  // Navigate to incident detail - placeholder for now
                  console.log('Navigate to incident:', deadline.incidentId);
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <RegulationBadge regulation={deadline.regulation as Regulation} />
                  <span className={`text-xs font-medium ${
                    deadline.urgency === 'overdue' || deadline.urgency === 'critical' ? 'text-red-400' :
                    deadline.urgency === 'urgent' ? 'text-orange-400' :
                    deadline.urgency === 'warning' ? 'text-yellow-400' :
                    'text-slate-400'
                  }`}>
                    {deadline.formattedTime}
                  </span>
                </div>

                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-slate-400">INC-{deadline.incidentId.slice(-6)}</p>
                    <p className="text-xs text-slate-500">{deadline.article}</p>
                  </div>

                  <p className="text-xs text-slate-400">{articleRef}</p>

                  <Button
                    size="sm"
                    variant={actionButton.variant}
                    className="w-full text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Handle action - placeholder for now
                      console.log('Action:', actionButton.text, 'for deadline:', deadline.id);
                    }}
                  >
                    {actionButton.text}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 text-xs text-slate-500 text-center">
          Showing {sortedDeadlines.length} of {processedDeadlines.length} active deadlines • Updates every second
        </div>
      </CardContent>
    </Card>
  );
}