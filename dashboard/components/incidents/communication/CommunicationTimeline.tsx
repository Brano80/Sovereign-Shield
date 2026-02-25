"use client";

import { useState, useEffect } from "react";
import { CommunicationTimelineEntry } from "@/lib/dora/communication-types";
import { Badge } from "@/components/ui/badge";
import {
  Send,
  CheckCircle,
  Eye,
  AlertTriangle,
  Clock,
  XCircle,
  ArrowUp,
} from "lucide-react";

interface CommunicationTimelineProps {
  incidentId: string;
}

const EVENT_ICONS: Record<string, typeof Send> = {
  COMMUNICATION_SENT: Send,
  COMMUNICATION_DELIVERED: CheckCircle,
  COMMUNICATION_READ: Eye,
  COMMUNICATION_ACKNOWLEDGED: CheckCircle,
  COMMUNICATION_FAILED: XCircle,
  ESCALATION_TRIGGERED: ArrowUp,
  ESCALATION_ACKNOWLEDGED: CheckCircle,
  REGULATORY_DEADLINE_WARNING: AlertTriangle,
  REGULATORY_DEADLINE_MET: CheckCircle,
  REGULATORY_DEADLINE_MISSED: XCircle,
};

const EVENT_COLORS: Record<string, string> = {
  COMMUNICATION_SENT: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  COMMUNICATION_DELIVERED: "bg-green-500/10 text-green-500 border-green-500/20",
  COMMUNICATION_READ: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  COMMUNICATION_ACKNOWLEDGED: "bg-green-500/10 text-green-500 border-green-500/20",
  COMMUNICATION_FAILED: "bg-red-500/10 text-red-500 border-red-500/20",
  ESCALATION_TRIGGERED: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  ESCALATION_ACKNOWLEDGED: "bg-green-500/10 text-green-500 border-green-500/20",
  REGULATORY_DEADLINE_WARNING: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  REGULATORY_DEADLINE_MET: "bg-green-500/10 text-green-500 border-green-500/20",
  REGULATORY_DEADLINE_MISSED: "bg-red-500/10 text-red-500 border-red-500/20",
};

function formatDistanceToNow(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
  return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function CommunicationTimeline({ incidentId }: CommunicationTimelineProps) {
  const [entries, setEntries] = useState<CommunicationTimelineEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTimeline();
  }, [incidentId]);

  const fetchTimeline = async () => {
    try {
      const response = await fetch(
        `/api/v1/incidents/${incidentId}/communications?view=timeline`
      );
      const data = await response.json();
      setEntries(data);
    } catch (error) {
      console.error("Failed to fetch timeline:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array(5).fill(0).map((_, i) => (
          <div key={i} className="flex gap-4 animate-pulse">
            <div className="w-10 h-10 rounded-full bg-slate-800" />
            <div className="flex-1">
              <div className="h-4 w-48 bg-slate-800 rounded mb-2" />
              <div className="h-3 w-32 bg-slate-800 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-12">
        <Clock className="h-12 w-12 mx-auto text-slate-600 mb-4" />
        <h3 className="text-lg font-semibold text-white">No Communication History</h3>
        <p className="text-slate-400 mt-2">
          Communications and escalations will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-5 top-0 bottom-0 w-px bg-slate-700" />

      <div className="space-y-6">
        {entries.map((entry, index) => {
          const Icon = EVENT_ICONS[entry.eventType] || Send;
          const colorClass = EVENT_COLORS[entry.eventType] || "bg-gray-500/10 text-gray-500 border-gray-500/20";

          return (
            <div key={entry.id} className="relative flex gap-4 pl-2">
              {/* Icon */}
              <div
                className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full border ${colorClass}`}
              >
                <Icon className="h-4 w-4" />
              </div>

              {/* Content */}
              <div className="flex-1 pb-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-white">{entry.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {entry.stakeholderName && (
                        <span className="text-sm text-slate-400">
                          {entry.stakeholderName}
                        </span>
                      )}
                      {entry.stakeholderRole && (
                        <Badge variant="outline" className="text-xs">
                          {entry.stakeholderRole}
                        </Badge>
                      )}
                      {entry.channel && (
                        <Badge variant="outline" className="text-xs">
                          {entry.channel}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-400">
                      {formatDistanceToNow(new Date(entry.timestamp))}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatDate(new Date(entry.timestamp))}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

