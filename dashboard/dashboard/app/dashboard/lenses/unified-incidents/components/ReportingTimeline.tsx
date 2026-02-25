"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { formatDateDDMMYYYY } from "@/lib/utils";
import {
  AlertTriangle,
  Clock,
  Shield,
  Building,
  Zap,
  Server,
  Calendar,
  ArrowRight
} from "lucide-react";
import { Incident, IncidentDeadline } from "@/app/types/incidents";

interface ReportingTimelineProps {
  incidents: Incident[];
}

type TimelineColumn = 'OVERDUE' | 'TODAY' | 'TOMORROW' | 'THIS_WEEK' | 'UPCOMING';

interface TimelineItem {
  incident: Incident;
  deadline: IncidentDeadline;
  timeRemaining: string;
  isOverdue: boolean;
}

export function ReportingTimeline({ incidents }: ReportingTimelineProps) {
  const router = useRouter();

  // Group incidents by timeline columns
  const timelineData = useMemo(() => {
    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const endOfWeek = new Date(today);
    endOfWeek.setDate(endOfWeek.getDate() + (7 - today.getDay()));

    const endOfNextWeek = new Date(endOfWeek);
    endOfNextWeek.setDate(endOfNextWeek.getDate() + 7);

    const grouped: Record<TimelineColumn, TimelineItem[]> = {
      OVERDUE: [],
      TODAY: [],
      TOMORROW: [],
      THIS_WEEK: [],
      UPCOMING: []
    };

    incidents.forEach(incident => {
      incident.deadlines?.forEach(deadline => {
        // Parse date string to Date object, handle null/undefined
        const deadlineDate = deadline.deadlineAt ? new Date(deadline.deadlineAt) : null;
        if (!deadlineDate || isNaN(deadlineDate.getTime())) {
          console.warn(`Invalid deadline date for incident ${incident.id}:`, deadline.deadlineAt);
          return; // Skip this deadline
        }

        const isOverdue = deadlineDate < now;

        let column: TimelineColumn;
        if (isOverdue) {
          column = 'OVERDUE';
        } else if (deadlineDate >= today && deadlineDate < tomorrow) {
          column = 'TODAY';
        } else if (deadlineDate >= tomorrow && deadlineDate < new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000)) {
          column = 'TOMORROW';
        } else if (deadlineDate >= tomorrow && deadlineDate <= endOfWeek) {
          column = 'THIS_WEEK';
        } else {
          column = 'UPCOMING';
        }

        // Calculate remaining time display
        const timeDiff = deadlineDate.getTime() - now.getTime();
        const absMinutes = Math.abs(Math.floor(timeDiff / (1000 * 60)));
        const hours = Math.floor(absMinutes / 60);
        const minutes = absMinutes % 60;

        const timeRemaining = isOverdue
          ? `-${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
          : `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

        grouped[column].push({
          incident,
          deadline,
          timeRemaining,
          isOverdue
        });
      });
    });

    return grouped;
  }, [incidents]);

  const getRegulatoryIcon = (regulation: string) => {
    switch (regulation) {
      case 'GDPR': return <Shield className="h-4 w-4" />;
      case 'DORA': return <Building className="h-4 w-4" />;
      case 'AI_ACT': return <Zap className="h-4 w-4" />;
      case 'NIS2': return <Server className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  const getRegulatoryLabel = (regulation: string, deadlineType: string) => {
    const baseLabel = regulation === 'GDPR' ? 'Art. 33' :
                     regulation === 'DORA' ? 'Art. 19' :
                     regulation === 'AI_ACT' ? 'Art. 62' : 'Art. 19';

    switch (deadlineType) {
      case 'REPORTING': return `Initial Report`;
      case 'NOTIFICATION': return `Breach Notif.`;
      case 'RESOLUTION': return `Full Report`;
      default: return `${baseLabel}`;
    }
  };

  const getColumnConfig = (column: TimelineColumn) => {
    switch (column) {
      case 'OVERDUE':
        return {
          title: 'OVERDUE',
          bgColor: 'bg-red-500/20',
          borderColor: 'border-red-500/30',
          textColor: 'text-red-400',
          icon: AlertTriangle
        };
      case 'TODAY':
        return {
          title: 'TODAY',
          bgColor: 'bg-orange-500/20',
          borderColor: 'border-orange-500/30',
          textColor: 'text-orange-400',
          icon: Clock
        };
      case 'TOMORROW':
        return {
          title: 'TOMORROW',
          bgColor: 'bg-yellow-500/20',
          borderColor: 'border-yellow-500/30',
          textColor: 'text-yellow-400',
          icon: Calendar
        };
      case 'THIS_WEEK':
        return {
          title: 'THIS WEEK',
          bgColor: 'bg-blue-500/20',
          borderColor: 'border-blue-500/30',
          textColor: 'text-blue-400',
          icon: Calendar
        };
      case 'UPCOMING':
        return {
          title: 'UPCOMING',
          bgColor: 'bg-slate-500/20',
          borderColor: 'border-slate-500/30',
          textColor: 'text-slate-400',
          icon: ArrowRight
        };
    }
  };

  const handleCardClick = (incidentId: string) => {
    router.push(`/dashboard/lenses/unified-incidents/${incidentId}`);
  };

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <Clock className="h-5 w-5 text-blue-400" />
        <h3 className="text-lg font-semibold text-white">Reporting Timeline</h3>
        <span className="text-sm text-slate-400">Deadline tracking and compliance overview</span>
      </div>

      {/* Timeline Columns */}
      <div className="grid grid-cols-5 gap-4 min-h-[600px]">
        {(Object.keys(timelineData) as TimelineColumn[]).map((column) => {
          const config = getColumnConfig(column);
          const items = timelineData[column];
          const IconComponent = config.icon;

          return (
            <div key={column} className="flex flex-col">
              {/* Column Header */}
              <div className={`rounded-lg p-3 mb-4 ${config.bgColor} border ${config.borderColor}`}>
                <div className="flex items-center gap-2 mb-2">
                  <IconComponent className={`h-4 w-4 ${config.textColor}`} />
                  <span className={`font-semibold text-sm ${config.textColor}`}>
                    {config.title}
                  </span>
                </div>
                <div className="text-xs text-slate-400">
                  {items.length} {items.length === 1 ? 'item' : 'items'}
                </div>
              </div>

              {/* Column Content */}
              <div className="flex-1 space-y-3">
                {items.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 text-sm">
                    No deadlines
                  </div>
                ) : (
                  items.map((item, index) => (
                    <div
                      key={`${item.incident.id}-${item.deadline.id}-${index}`}
                      onClick={() => handleCardClick(item.incident.id)}
                      className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 cursor-pointer hover:bg-slate-800/70 hover:border-slate-600 transition-colors group"
                    >
                      {/* Time Remaining */}
                      <div className="flex items-center justify-between mb-2">
                        <div className={`font-mono text-lg font-bold ${
                          item.isOverdue ? 'text-red-400' : 'text-green-400'
                        }`}>
                          {item.timeRemaining}
                        </div>
                        <div className={`px-2 py-1 rounded text-xs font-medium ${
                          item.deadline.urgencyLevel === 'OVERDUE'
                            ? 'bg-red-500/20 text-red-400'
                            : item.deadline.urgencyLevel === 'URGENT'
                            ? 'bg-orange-500/20 text-orange-400'
                            : 'bg-green-500/20 text-green-400'
                        }`}>
                          {item.deadline.urgencyLevel.replace('_', ' ')}
                        </div>
                      </div>

                      {/* Regulatory Label */}
                      <div className="flex items-center gap-2 mb-2">
                        {getRegulatoryIcon(item.deadline.regulation)}
                        <span className="text-xs text-slate-300">
                          {getRegulatoryLabel(item.deadline.regulation, item.deadline.deadlineType)}
                        </span>
                      </div>

                      {/* Incident Info */}
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors">
                          {item.incident.incidentNumber}
                        </div>
                        <div className="text-xs text-slate-400 line-clamp-2">
                          {item.incident.title}
                        </div>

                        {/* Severity Badge and Runtime Mode */}
                        <div className="flex gap-1">
                          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            item.incident.severity === 'CRITICAL'
                              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                              : item.incident.severity === 'HIGH'
                              ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                              : item.incident.severity === 'MEDIUM'
                              ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                              : 'bg-green-500/20 text-green-400 border border-green-500/30'
                          }`}>
                            {item.incident.severity}
                          </div>

                          {/* Runtime Mode Badge */}
                          {item.incident.runtimeMode && (
                            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              item.incident.runtimeMode === 'PRODUCTION'
                                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                            }`}>
                              {item.incident.runtimeMode === 'PRODUCTION' ? '🔴 ACTIVE ENFORCEMENT' : '🟡 SHADOW MODE'}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Deadline Date */}
                      <div className="mt-2 pt-2 border-t border-slate-700">
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {item.deadline.deadlineAt && !isNaN(new Date(item.deadline.deadlineAt).getTime())
                              ? formatDateDDMMYYYY(item.deadline.deadlineAt)
                              : 'Invalid date'
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
