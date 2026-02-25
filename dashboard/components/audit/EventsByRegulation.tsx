"use client";
import { useEffect, useState } from "react";
import { API_BASE } from "@/app/utils/api-config";
import { getAuthHeaders } from "@/utils/auth";

type RegulationStat = {
  regulation: string;
  count: number;
  percentage: number;
  color: string; // tailwind bg color class
};

type ApiResponse = {
  regulations: { name: string; count: number; percentage: number }[];
};

const COLOR_MAP: Record<string, string> = {
  GDPR: "bg-blue-500",
  DORA: "bg-purple-500",
  "AI Act": "bg-orange-500",
  NIS2: "bg-green-500",
  Multi: "bg-slate-500",
};

const FALLBACK: RegulationStat[] = [
  { regulation: "GDPR", count: 0, percentage: 0, color: COLOR_MAP.GDPR },
  { regulation: "DORA", count: 0, percentage: 0, color: COLOR_MAP.DORA },
  { regulation: "AI Act", count: 0, percentage: 0, color: COLOR_MAP["AI Act"] },
  { regulation: "NIS2", count: 0, percentage: 0, color: COLOR_MAP.NIS2 },
  { regulation: "Multi", count: 0, percentage: 0, color: COLOR_MAP.Multi },
];

// Fixed list of regulation categories to always display
const FIXED_CATEGORIES = ['GDPR', 'DORA', 'AI Act', 'NIS2', 'Multi'];

export function EventsByRegulation() {
  const [stats, setStats] = useState<RegulationStat[]>(FALLBACK);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/audit/events-by-regulation`, {
          headers: getAuthHeaders(),
        });
        if (!res.ok) throw new Error("Failed to load");
        const data = (await res.json()) as ApiResponse;

        // Create complete stats array with all fixed categories
        const apiDataMap = new Map(data.regulations.map(r => [r.name, r]));
        const completeStats = FIXED_CATEGORIES.map(category => {
          const apiData = apiDataMap.get(category);
          return {
            regulation: category,
            count: apiData?.count ?? 0,
            percentage: apiData?.percentage ?? 0,
            color: COLOR_MAP[category] || "bg-slate-500",
          };
        });

        if (!cancelled) setStats(completeStats);
      } catch (_) {
        // keep fallback
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const totalEvents = stats.reduce((sum, stat) => sum + stat.count, 0);

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900 p-4" aria-busy={loading}>
      <h3 className="mb-4 font-semibold text-white">Events by Regulation</h3>
      <div className="space-y-3">
        {stats.map((stat) => (
          <div key={stat.regulation}>
            <div className="mb-1 flex justify-between text-sm">
              <span className="text-slate-300">{stat.regulation}</span>
              <span className="text-slate-500">
                {stat.count === 0 ? '0 events (0%)' : `${stat.count.toLocaleString()} events (${stat.percentage}%)`}
              </span>
            </div>
            <div className="h-2 rounded-full bg-slate-800">
              <div
                className={`h-full rounded-full ${stat.count === 0 ? 'bg-slate-600' : stat.color}`}
                style={{ width: `${Math.max(stat.percentage, 2)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
