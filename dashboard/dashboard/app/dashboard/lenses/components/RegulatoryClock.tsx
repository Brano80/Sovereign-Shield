"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, Shield, Building2, Bot } from "lucide-react";
import { Incident, calculateRemainingSeconds } from "@/app/types/incidents";

type ClockCard = {
  id: string;
  incidentId: string;
  title: string;
  regulation: string;
  deadline: Date;
  deadlineType: string;
  remainingSeconds: number;
  overdue: boolean;
  urgencyLevel: 'ON_TRACK' | 'URGENT' | 'OVERDUE';
  articleCitation: string | null;
};

function formatTimeDisplay(remainingSeconds: number): string {
  const absSeconds = Math.abs(remainingSeconds);

  if (absSeconds < 3600) { // Under 1 hour - show mm:ss
    const minutes = Math.floor(absSeconds / 60);
    const seconds = absSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  } else if (absSeconds < 86400) { // Under 24 hours - show hh:mm:ss
    const hours = Math.floor(absSeconds / 3600);
    const minutes = Math.floor((absSeconds % 3600) / 60);
    const seconds = absSeconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  } else { // Over 24 hours - show Xd hh:mm
    const days = Math.floor(absSeconds / 86400);
    const remainingAfterDays = absSeconds % 86400;
    const hours = Math.floor(remainingAfterDays / 3600);
    const minutes = Math.floor((remainingAfterDays % 3600) / 60);
    return `${days}d ${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
  }
}

function getArticleCitation(regulation: string, deadlineType: string): string | null {
  switch (regulation) {
    case 'GDPR':
      if (deadlineType === 'NOTIFICATION') {
        return 'Art. 33';
      }
      break;
    case 'DORA':
      if (deadlineType === 'REPORTING') {
        return 'Art. 19';
      }
      break;
    case 'AI_ACT':
      // AI Act articles would be added here when implemented
      break;
    case 'NIS2':
      // NIS2 articles would be added here when implemented
      break;
  }
  return null;
}

interface RegulatoryClockProps {
  incidents?: Incident[];
}

export function RegulatoryClock({ incidents = [] }: RegulatoryClockProps) {
  const router = useRouter();
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, []);

  const clockCards = useMemo<ClockCard[]>(() => {
    const cards: ClockCard[] = [];

    // Get incidents with active deadlines
    incidents.forEach(incident => {
      incident.deadlines?.forEach(deadline => {
        if (deadline.status === 'PENDING' || deadline.status === 'OVERDUE') {
          // Parse date string to Date object, handle null/undefined
          const deadlineDate = deadline.deadlineAt ? new Date(deadline.deadlineAt) : null;
          if (!deadlineDate || isNaN(deadlineDate.getTime())) {
            console.warn(`Invalid deadline date for incident ${incident.id}:`, deadline.deadlineAt);
            return; // Skip this deadline
          }

          const remainingSeconds = calculateRemainingSeconds(deadlineDate);

          // Use regulation-specific urgency thresholds
          const urgentThreshold = incident.regulation === 'GDPR' ? 259200 :  // 72 hours for GDPR
                                 incident.regulation === 'DORA' ? 14400 :   // 4 hours for DORA
                                 86400; // 24 hours default

          const articleCitation = getArticleCitation(incident.regulation, deadline.deadlineType);

          cards.push({
            id: `${incident.id}-${deadline.id}`,
            incidentId: incident.incidentNumber ?? incident.id,
            title: `${incident.regulation} ${incident.severity === 'CRITICAL' ? 'Breach' : 'Incident'}`,
            regulation: incident.regulation,
            deadline: deadlineDate,
            deadlineType: deadline.deadlineType,
            remainingSeconds,
            overdue: remainingSeconds < 0,
            urgencyLevel: remainingSeconds < 0 ? 'OVERDUE' :
                         remainingSeconds < urgentThreshold ? 'URGENT' : 'ON_TRACK',
            articleCitation
          });
        }
      });
    });

    // Sort by urgency (overdue first, then by remaining time)
    return cards.sort((a, b) => {
      if (a.overdue && !b.overdue) return -1;
      if (!a.overdue && b.overdue) return 1;
      return a.remainingSeconds - b.remainingSeconds;
    }).slice(0, 8); // Show top 8 most urgent
  }, [now]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Regulatory Clock</h2>
          <p className="text-sm text-slate-400">
            Real-time deadline countdowns for active incidents
          </p>
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <Clock size={16} />
          <span className="text-xs">Updates every second</span>
        </div>
      </div>

      {/* Horizontal Scroll Cards */}
      <div className="overflow-x-auto">
        <div className="flex gap-4 pb-4">
          {clockCards.length === 0 ? (
            <div className="flex-shrink-0 w-full rounded-xl border border-white/10 bg-slate-950/40 p-8 text-center">
              <Clock className="mx-auto h-12 w-12 text-slate-600 mb-4" />
              <div className="text-slate-400">
                No active incidents with deadlines
              </div>
            </div>
          ) : (
            clockCards.map((card) => (
              <div
                key={card.id}
                onClick={() => router.push(`/dashboard/lenses/unified-incidents/${card.incidentId}`)}
                className={`
                  flex-shrink-0 w-80 rounded-xl border bg-slate-950/40 p-6 cursor-pointer
                  hover:bg-slate-950/60 transition-colors
                  ${card.overdue
                    ? 'border-red-500/50 bg-red-500/10 shadow-lg shadow-red-500/20'
                    : card.urgencyLevel === 'URGENT'
                    ? 'border-amber-500/50 bg-amber-500/10'
                    : 'border-white/10'
                  }
                `}
              >
                {/* Incident ID */}
                <div className="text-sm text-slate-400 mb-2">
                  {card.incidentId}
                </div>

                {/* Regulation Type */}
                <div className="text-sm text-white font-medium mb-4">
                  {card.title}
                </div>

                {/* Large Monospace Countdown */}
                <div className="text-center mb-4">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <div className={`
                      font-mono text-3xl font-bold tabular-nums
                      ${card.overdue
                        ? 'text-red-400'
                        : card.urgencyLevel === 'URGENT'
                        ? 'text-amber-400'
                        : 'text-blue-400'
                      }
                    `}>
                      {card.overdue && '-'}
                      {formatTimeDisplay(card.remainingSeconds)}
                    </div>
                    {card.articleCitation && (
                      <div className={`
                        px-2 py-1 rounded text-sm font-semibold
                        ${card.overdue
                          ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                          : card.urgencyLevel === 'URGENT'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        }
                      `}>
                        {card.articleCitation}
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-slate-500">
                    {card.overdue ? 'Overdue' : 'Remaining'}
                  </div>
                </div>

                {/* Deadline Info */}
                <div className="text-xs text-slate-500 text-center">
                  Due: {card.deadline.toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}



