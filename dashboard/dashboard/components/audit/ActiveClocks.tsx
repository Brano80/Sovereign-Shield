"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { API_BASE } from "@/app/utils/api-config";
import { getAuthHeaders } from "@/utils/auth";
import Link from "next/link";

type Clock = {
  id: string;
  regulation: string;
  type: string;
  incidentId: string;
  deadline: Date;
  remaining: string;
  status: "critical" | "warning" | "ok" | "monitoring";
};

const FALLBACK_CLOCKS: Clock[] = [];

export function ActiveClocks() {
  const [clocks, setClocks] = useState<Clock[]>(FALLBACK_CLOCKS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/audit/clocks?status=RUNNING`, {
          headers: getAuthHeaders(),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as {
          clocks: {
            id: string;
            regulation: string;
            type: string;
            incidentId: string;
            deadline: string;
            remaining: string;
            status: "critical" | "warning" | "ok" | "monitoring";
          }[];
        };
        const mapped: Clock[] = data.clocks.map((c) => ({ ...c, deadline: new Date(c.deadline) }));
        if (!cancelled) setClocks(mapped);
      } catch {
        // keep fallback
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const statusColors: Record<Clock["status"], string> = {
    critical: "text-red-400",
    warning: "text-yellow-400",
    ok: "text-emerald-400",
    monitoring: "text-blue-400",
  };

  const statusIcons: Record<Clock["status"], string> = {
    critical: "\uD83D\uDD34", // red circle
    warning: "\uD83D\uDFE1", // yellow circle
    ok: "\uD83D\uDFE2", // green circle
    monitoring: "\uD83D\uDFE2", // green circle for monitoring
  };

  const getClockDisplay = (clock: Clock) => {
    // Special handling for GDPR 72h clocks - always show as critical with red indicator
    const isGdpr72h = clock.regulation === "GDPR" && clock.type === "72h";
    const displayStatus = isGdpr72h ? "critical" : clock.status;
    const displayColor = isGdpr72h ? "text-red-500 font-bold" : statusColors[displayStatus];

    return { displayStatus, displayColor };
  };

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900 p-4" aria-busy={loading}>
      <h3 className="mb-4 font-semibold text-white">Active Regulatory Clocks</h3>
      {clocks.length === 0 ? (
        <div className="text-center py-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
            <span className="text-slate-300 text-sm font-medium">System Monitoring</span>
          </div>
          <p className="text-slate-400 text-sm">No active regulatory countdowns. Clocks will initiate automatically upon incident detection.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {clocks.map((clock) => {
            const { displayStatus, displayColor } = getClockDisplay(clock);
            const isGdpr72h = clock.regulation === "GDPR" && clock.type === "72h";

            return (
              <div key={clock.id} className={`flex items-center justify-between p-2 rounded ${isGdpr72h ? 'bg-red-500/10 border border-red-500/20' : ''}`}>
                <div className="flex items-center gap-2">
                  <span className={isGdpr72h ? "animate-pulse" : ""}>{statusIcons[displayStatus]}</span>
                  <span className="font-medium text-white">
                    {clock.regulation} {clock.type}:
                  </span>
                  <Link
                    href={`/audit-evidence?tab=clocks&id=${clock.id}`}
                    className="text-blue-400 hover:text-blue-300 underline cursor-pointer"
                  >
                    {clock.incidentId}
                  </Link>
                </div>
                <span className={`${displayColor} font-medium`}>
                  {clock.remaining}
                </span>
              </div>
            );
          })}
        </div>
      )}
      <Button variant="link" className="mt-4">View All Clocks →</Button>
    </div>
  );
}
