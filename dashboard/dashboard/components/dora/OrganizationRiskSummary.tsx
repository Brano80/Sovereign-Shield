"use client";

import { useState, useEffect } from "react";
import { OrganizationRiskSummary as RiskSummaryType, RiskLevel } from "@/lib/dora/ict-risk-types";
import { TrendingUp, TrendingDown, Minus, Shield } from "lucide-react";
import { API_BASE } from "@/app/utils/api-config";
import { getAuthHeaders } from "@/app/utils/auth";

const RISK_LEVEL_COLORS: Record<RiskLevel, string> = {
  CRITICAL: "text-red-500 bg-red-500/10",
  HIGH: "text-orange-500 bg-orange-500/10",
  MEDIUM: "text-yellow-500 bg-yellow-500/10",
  LOW: "text-green-500 bg-green-500/10",
  MINIMAL: "text-green-500 bg-green-500/10",
};

export function OrganizationRiskSummary() {
  const [summary, setSummary] = useState<RiskSummaryType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      const response = await fetch(`${API_BASE}/dora/risk?view=summary`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch");
      const result = await response.json();
      setSummary(result);
    } catch (error) {
      console.error("Failed to fetch risk summary:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !summary) {
    return (
      <div className="rounded-lg border bg-card p-6 animate-pulse">
        <div className="h-24 bg-muted rounded" />
      </div>
    );
  }

  const TrendIcon =
    summary.trend === "INCREASING"
      ? TrendingUp
      : summary.trend === "DECREASING"
      ? TrendingDown
      : Minus;
  const trendColor =
    summary.trend === "INCREASING"
      ? "text-red-500"
      : summary.trend === "DECREASING"
      ? "text-green-500"
      : "text-muted-foreground";

  return (
    <div className="rounded-lg border bg-card">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-purple-500" />
          <h3 className="font-semibold">ICT Risk Management Framework</h3>
          <span className="text-xs bg-purple-500/10 text-purple-500 px-2 py-0.5 rounded">
            DORA Art.6
          </span>
        </div>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-5 gap-4">
          {/* Overall Risk Score */}
          <div className="col-span-1">
            <div className={`rounded-lg p-4 ${RISK_LEVEL_COLORS[summary.overallRiskLevel]}`}>
              <p className="text-sm opacity-80">Overall Risk Score</p>
              <div className="flex items-end gap-2 mt-1">
                <span className="text-3xl font-bold">
                  {summary.overallRiskScore.toFixed(1)}
                </span>
                <span className="text-sm opacity-80 mb-1">/ 100</span>
              </div>
              <div className={`flex items-center gap-1 mt-2 text-sm ${trendColor}`}>
                <TrendIcon className="h-4 w-4" />
                <span>{summary.trend}</span>
              </div>
            </div>
          </div>

          {/* Assets by Risk Level */}
          <div className="col-span-2 rounded-lg border p-4">
            <p className="text-sm text-muted-foreground mb-3">Assets by Risk Level</p>
            <div className="space-y-2">
              {(["CRITICAL", "HIGH", "MEDIUM", "LOW", "MINIMAL"] as RiskLevel[]).map((level) => (
                <div key={level} className="flex items-center gap-2">
                  <span className="text-xs w-16">{level}</span>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        RISK_LEVEL_COLORS[level].split(" ")[1]
                      }`}
                      style={{
                        width: `${
                          summary.totalAssets > 0
                            ? (summary.assetsByRiskLevel[level] / summary.totalAssets) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                  <span className="text-xs font-mono w-8 text-right">
                    {summary.assetsByRiskLevel[level]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Risks */}
          <div className="col-span-2 rounded-lg border p-4">
            <p className="text-sm text-muted-foreground mb-3">Top Risks</p>
            <div className="space-y-2">
              {summary.topRisks.slice(0, 4).map((risk, index) => (
                <div
                  key={risk.assetId}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">{index + 1}.</span>
                    <span className="font-medium truncate max-w-[150px]">
                      {risk.assetName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {risk.primaryRiskFactor}
                    </span>
                    <span
                      className={`font-mono font-medium ${
                        risk.score >= 80
                          ? "text-red-500"
                          : risk.score >= 60
                          ? "text-orange-500"
                          : risk.score >= 40
                          ? "text-yellow-500"
                          : "text-green-500"
                      }`}
                    >
                      {risk.score.toFixed(0)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

