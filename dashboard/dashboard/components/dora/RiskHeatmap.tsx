"use client";

import { useState, useEffect } from "react";
import { RiskHeatmapData, RiskLevel } from "@/lib/dora/ict-risk-types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Download, AlertTriangle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { API_BASE } from "@/app/utils/api-config";
import { getAuthHeaders } from "@/app/utils/auth";

interface RiskHeatmapProps {
  data?: RiskHeatmapData;
  onCellClick?: (x: string, y: string) => void;
}

const RISK_COLORS: Record<RiskLevel, string> = {
  MINIMAL: "bg-green-500/20 text-green-700 dark:text-green-400",
  LOW: "bg-green-500/40 text-green-700 dark:text-green-400",
  MEDIUM: "bg-yellow-500/40 text-yellow-700 dark:text-yellow-400",
  HIGH: "bg-orange-500/40 text-orange-700 dark:text-orange-400",
  CRITICAL: "bg-red-500/40 text-red-700 dark:text-red-400",
};

const RISK_ICONS: Record<RiskLevel, string> = {
  MINIMAL: "🟢",
  LOW: "🟢",
  MEDIUM: "🟡",
  HIGH: "🟠",
  CRITICAL: "🔴",
};

const ASSET_TYPE_LABELS: Record<string, string> = {
  APPLICATION: "APP",
  DATABASE: "DB",
  SERVER: "SRV",
  CLOUD_SERVICE: "CLOUD",
  API: "API",
  THIRD_PARTY_SERVICE: "3RD",
};

const CATEGORY_LABELS: Record<string, string> = {
  AVAILABILITY: "Availability",
  INTEGRITY: "Integrity",
  CONFIDENTIALITY: "Confid.",
  CONTINUITY: "Continuity",
  THIRD_PARTY: "Third-Party",
  VULNERABILITY: "Vulnerab.",
};

export function RiskHeatmap({ data, onCellClick }: RiskHeatmapProps) {
  const [heatmapData, setHeatmapData] = useState<RiskHeatmapData | null>(data || null);
  const [isLoading, setIsLoading] = useState(!data);
  const [filters, setFilters] = useState({
    criticality: "all",
    department: "all",
    period: "30d",
  });

  useEffect(() => {
    if (!data) {
      fetchHeatmapData();
    }
  }, [data, filters]);

  const fetchHeatmapData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${API_BASE}/dora/risk?view=heatmap&period=${filters.period}`,
        { headers: getAuthHeaders() }
      );
      if (!response.ok) throw new Error("Failed to fetch");
      const result = await response.json();
      setHeatmapData(result);
    } catch (error) {
      console.error("Failed to fetch heatmap data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCellData = (x: string, y: string) => {
    if (!heatmapData) return null;
    return heatmapData.cells.find((cell) => cell.x === x && cell.y === y);
  };

  const handleExport = () => {
    // Export heatmap as CSV or image
    console.log("Exporting heatmap...");
  };

  if (isLoading) {
    return (
      <div className="rounded-lg border bg-card p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-48 bg-muted rounded" />
          <div className="h-64 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (!heatmapData) {
    return (
      <div className="rounded-lg border bg-card p-6 text-center">
        <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground" />
        <p className="mt-2 text-muted-foreground">Failed to load heatmap data</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold">🔥 ICT Risk Heatmap</h3>
          <span className="text-xs bg-purple-500/10 text-purple-500 px-2 py-0.5 rounded">
            DORA Art.6
          </span>
        </div>
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 p-4 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Criticality:</span>
          <Select
            value={filters.criticality}
            onValueChange={(value) => setFilters({ ...filters, criticality: value })}
          >
            <SelectTrigger className="w-32 h-8">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="CRITICAL">Critical</SelectItem>
              <SelectItem value="IMPORTANT">Important</SelectItem>
              <SelectItem value="STANDARD">Standard</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Period:</span>
          <Select
            value={filters.period}
            onValueChange={(value) => setFilters({ ...filters, period: value })}
          >
            <SelectTrigger className="w-36 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="p-4 overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="p-2 text-left text-sm font-medium text-muted-foreground w-32" />
              {heatmapData.xAxis.categories.map((category) => (
                <th
                  key={category}
                  className="p-2 text-center text-sm font-medium text-muted-foreground"
                >
                  {ASSET_TYPE_LABELS[category] || category}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {heatmapData.yAxis.categories.map((yCategory) => (
              <tr key={yCategory}>
                <td className="p-2 text-sm font-medium text-muted-foreground">
                  {CATEGORY_LABELS[yCategory] || yCategory}
                </td>
                {heatmapData.xAxis.categories.map((xCategory) => {
                  const cell = getCellData(xCategory, yCategory);
                  return (
                    <td key={`${xCategory}-${yCategory}`} className="p-1">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => onCellClick?.(xCategory, yCategory)}
                              className={`
                                w-full h-12 rounded flex items-center justify-center
                                transition-all hover:ring-2 hover:ring-primary
                                ${cell ? RISK_COLORS[cell.level] : "bg-muted"}
                              `}
                            >
                              {cell && (
                                <span className="font-mono text-sm font-medium">
                                  {RISK_ICONS[cell.level]} {Math.round(cell.value)}
                                </span>
                              )}
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {cell ? (
                              <div className="text-sm">
                                <p className="font-medium">
                                  {ASSET_TYPE_LABELS[xCategory]} × {CATEGORY_LABELS[yCategory]}
                                </p>
                                <p>Risk Score: {cell.value.toFixed(1)}</p>
                                <p>Assets: {cell.count}</p>
                                <p>Level: {cell.level}</p>
                              </div>
                            ) : (
                              <p>No data</p>
                            )}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 p-4 border-t bg-muted/30 text-sm">
        <span className="text-muted-foreground">Legend:</span>
        <span className="flex items-center gap-1">
          <span className="w-4 h-4 rounded bg-green-500/40" /> Low (0-39)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-4 h-4 rounded bg-yellow-500/40" /> Medium (40-59)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-4 h-4 rounded bg-orange-500/40" /> High (60-79)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-4 h-4 rounded bg-red-500/40" /> Critical (80+)
        </span>
      </div>
    </div>
  );
}

