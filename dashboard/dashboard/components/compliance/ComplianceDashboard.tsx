"use client";

import { useState } from "react";
import { useComplianceSummary, useRegulationScore } from "@/hooks/useComplianceData";
import { ComplianceScoreCard } from "./ComplianceScoreCard";
import { RegulationDetailPanel } from "./RegulationDetailPanel";
import { MonthlySummaryPanel } from "./MonthlySummaryPanel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  RefreshCw,
  Download,
  AlertTriangle,
  Clock,
  TrendingUp,
  Shield,
  FileText,
  ChevronRight
} from "lucide-react";
import { Regulation } from "@/lib/compliance/compliance-score-types";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

const REGULATION_ICONS: Record<Regulation, typeof Shield> = {
  GDPR: Shield,
  DORA: FileText,
  NIS2: AlertTriangle,
  AI_ACT: TrendingUp,
};

const REGULATION_COLORS: Record<Regulation, string> = {
  GDPR: 'text-blue-500',
  DORA: 'text-purple-500',
  NIS2: 'text-orange-500',
  AI_ACT: 'text-green-500',
};

export function ComplianceDashboard() {
  const { data, isLoading, error, refresh } = useComplianceSummary();
  const [selectedRegulation, setSelectedRegulation] = useState<Regulation | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refresh();
    setIsRefreshing(false);
  };

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6">
        <div className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-5 w-5" />
          <span>Failed to load compliance data: {error}</span>
        </div>
        <Button onClick={handleRefresh} variant="outline" className="mt-4">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Compliance Overview</h2>
          <p className="text-muted-foreground">
            GDPR, EU AI Act & DORA readiness status and monthly summaries
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")} />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="default" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Overall Score + Regulation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Overall Score - Larger */}
        {isLoading ? (
          <Skeleton className="h-40 col-span-1" />
        ) : data && (
          <ComplianceScoreCard
            title="Overall Readiness"
            score={data.overall.score}
            status={data.overall.status}
            trend={data.overall.trend}
            trendPercentage={data.overall.trendPercentage}
            subtitle={`Last updated: ${formatDistanceToNow(new Date(data.calculatedAt), { addSuffix: true })}`}
            size="lg"
            className="col-span-1"
          />
        )}

        {/* Regulation Cards */}
        {isLoading ? (
          <>
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
          </>
        ) : data?.regulations.map((reg) => {
          const Icon = REGULATION_ICONS[reg.regulation];
          return (
            <ComplianceScoreCard
              key={reg.regulation}
              title={`${reg.regulation} Readiness`}
              score={reg.score}
              status={reg.status}
              trend={reg.trend}
              compliantCount={reg.compliantArticles}
              totalCount={reg.totalArticles}
              onClick={() => setSelectedRegulation(reg.regulation)}
              className={cn(
                selectedRegulation === reg.regulation && 'ring-2 ring-primary'
              )}
            />
          );
        })}
      </div>

      {/* Alerts and Clocks Summary */}
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Active Alerts */}
          <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Active Alerts</span>
              <Badge variant={data.alerts.critical > 0 ? "destructive" : "secondary"}>
                {data.alerts.total}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-sm">
              {data.alerts.critical > 0 && (
                <span className="text-red-500">
                  {data.alerts.critical} critical
                </span>
              )}
              {data.alerts.warning > 0 && (
                <span className="text-yellow-500">
                  {data.alerts.warning} warnings
                </span>
              )}
              {data.alerts.total === 0 && (
                <span className="text-green-500">All clear</span>
              )}
            </div>
          </div>

          {/* Active Clocks */}
          <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Active Regulatory Clocks</span>
              <Badge variant={data.activeClocks > 0 ? "outline" : "secondary"}>
                <Clock className="h-3 w-3 mr-1" />
                {data.activeClocks}
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              {data.activeClocks > 0
                ? `${data.activeClocks} deadline(s) being tracked`
                : 'No active deadlines'
              }
            </div>
          </div>

          {/* Critical Gaps */}
          <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Critical Gaps</span>
              <Badge variant={data.criticalGaps > 0 ? "destructive" : "secondary"}>
                {data.criticalGaps}
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              {data.criticalGaps > 0
                ? `${data.criticalGaps} gap(s) require attention`
                : 'No critical gaps identified'
              }
            </div>
          </div>
        </div>
      )}

      {/* Regulation Detail Panel (when selected) */}
      {selectedRegulation && (
        <RegulationDetailPanel
          regulation={selectedRegulation}
          onClose={() => setSelectedRegulation(null)}
        />
      )}

      {/* Monthly Summary */}
      <MonthlySummaryPanel />
    </div>
  );
}
