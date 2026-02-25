"use client";

import { useState, useEffect } from "react";
import { EscalationPath } from "@/lib/dora/communication-types";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, CheckCircle, Clock } from "lucide-react";

interface EscalationStatusProps {
  incidentId: string;
}

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

export function EscalationStatus({ incidentId }: EscalationStatusProps) {
  const [escalation, setEscalation] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchEscalation();
  }, [incidentId]);

  const fetchEscalation = async () => {
    try {
      const response = await fetch(
        `/api/v1/incidents/${incidentId}/communications?view=escalation`
      );
      const data = await response.json();
      setEscalation(data);
    } catch (error) {
      console.error("Failed to fetch escalation:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !escalation?.escalation) {
    return null;
  }

  const path = escalation.escalation as EscalationPath;
  const progress = (path.currentLevel / path.maxLevel) * 100;
  const levels = path.levels as any[];

  return (
    <div className="rounded-lg border border-orange-500/20 bg-orange-500/5 p-4">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          <h4 className="font-semibold text-orange-500">Escalation Active</h4>
        </div>
        <Badge
          className={
            path.status === "ACTIVE"
              ? "bg-orange-500/10 text-orange-500"
              : "bg-green-500/10 text-green-500"
          }
        >
          {path.status}
        </Badge>
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-1 text-slate-300">
          <span>Level {path.currentLevel} of {path.maxLevel}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Levels */}
      <div className="space-y-3">
        {levels.map((level, index) => (
          <div
            key={index}
            className={`flex items-center justify-between p-3 rounded ${
              level.triggered
                ? level.acknowledgedAt
                  ? "bg-green-500/10"
                  : "bg-orange-500/10"
                : "bg-slate-800/50"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  level.triggered
                    ? level.acknowledgedAt
                      ? "bg-green-500/20"
                      : "bg-orange-500/20"
                    : "bg-slate-700"
                }`}
              >
                {level.acknowledgedAt ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : level.triggered ? (
                  <Clock className="h-4 w-4 text-orange-500" />
                ) : (
                  <span className="text-sm text-slate-400">{level.level}</span>
                )}
              </div>
              <div>
                <p className="font-medium text-white">Level {level.level}</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {level.stakeholderRoles.map((role: string) => (
                    <Badge key={role} variant="outline" className="text-xs">
                      {role}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            <div className="text-right text-sm">
              {level.acknowledgedAt ? (
                <div>
                  <p className="text-green-500">Acknowledged</p>
                  <p className="text-xs text-slate-400">
                    by {level.acknowledgedBy}
                  </p>
                  <p className="text-xs text-slate-400">
                    {formatDistanceToNow(new Date(level.acknowledgedAt))}
                  </p>
                </div>
              ) : level.triggered ? (
                <div>
                  <p className="text-orange-500">Awaiting response</p>
                  <p className="text-xs text-slate-400">
                    Triggered {formatDistanceToNow(new Date(level.triggeredAt))}
                  </p>
                </div>
              ) : (
                <p className="text-slate-400">
                  Triggers after {level.triggerAfterMinutes} min
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Started info */}
      <div className="mt-4 pt-4 border-t border-orange-500/20 text-sm text-slate-400">
        Escalation started {formatDistanceToNow(new Date(path.startedAt))}
      </div>
    </div>
  );
}

