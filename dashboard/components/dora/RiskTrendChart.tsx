"use client";

import { useState, useEffect } from "react";
interface HistoricalScore {
  date: string;
  score: number;
  regulation?: string;
}
import { API_BASE } from "@/app/utils/api-config";
import { getAuthHeaders } from "@/app/utils/auth";

interface RiskTrendsResponse {
  trends: HistoricalScore[];
  period: string;
}

export function RiskTrendChart() {
  const [trends, setTrends] = useState<HistoricalScore[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState("30d");

  useEffect(() => {
    fetchTrends();
  }, [period]);

  const fetchTrends = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${API_BASE}/dora/risk?view=trends&period=${period}`,
        { headers: getAuthHeaders() }
      );
      if (!response.ok) throw new Error("Failed to fetch");
      const result: RiskTrendsResponse = await response.json();
      setTrends(result.trends || []);
    } catch (error) {
      console.error("Failed to fetch trends:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-lg border bg-card p-6 animate-pulse">
        <div className="h-48 bg-muted rounded" />
      </div>
    );
  }

  if (trends.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-6 text-center">
        <p className="text-muted-foreground">No trend data available</p>
      </div>
    );
  }

  const maxScore = Math.max(...trends.map((t) => t.score), 100);
  const minScore = Math.min(...trends.map((t) => t.score), 0);

  return (
    <div className="rounded-lg border bg-card">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold">Risk Score Trends</h3>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="rounded-md border border-slate-700 bg-slate-900 px-3 py-1.5 text-sm"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </select>
      </div>

      <div className="p-4">
        <div className="h-64 flex items-end gap-1">
          {trends.map((trend, index) => {
            const height = ((trend.score - minScore) / (maxScore - minScore || 1)) * 100;
            const color =
              trend.score >= 80
                ? "bg-red-500"
                : trend.score >= 60
                ? "bg-orange-500"
                : trend.score >= 40
                ? "bg-yellow-500"
                : "bg-green-500";

            return (
              <div key={index} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className={`w-full ${color} rounded-t transition-all hover:opacity-80`}
                  style={{ height: `${height}%`, minHeight: "4px" }}
                  title={`${trend.date}: ${trend.score.toFixed(1)}`}
                />
                {index % Math.ceil(trends.length / 5) === 0 && (
                  <span className="text-xs text-muted-foreground">
                    {new Date(trend.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
          <span>Min: {minScore.toFixed(1)}</span>
          <span>Max: {maxScore.toFixed(1)}</span>
        </div>
      </div>
    </div>
  );
}

