"use client";

import { useMonthlySummary } from "@/hooks/useComplianceData";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  FileText,
  ShieldAlert,
  Users,
  Bell,
  AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";

const TREND_CONFIG = {
  UP: { icon: TrendingUp, color: 'text-green-500', label: 'Improving' },
  DOWN: { icon: TrendingDown, color: 'text-red-500', label: 'Declining' },
  STABLE: { icon: Minus, color: 'text-gray-500', label: 'Stable' },
};

export function MonthlySummaryPanel() {
  const { data, isLoading, error } = useMonthlySummary();

  if (error) {
    return null; // Silently fail for monthly summary
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Compliance Summary</CardTitle>
        <CardDescription>
          {data?.month ? `Data for ${data.month}` : 'Current month statistics'}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="grid grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
        ) : data && (
          <div className="space-y-6">
            {/* Request Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <StatCard
                icon={FileText}
                label="Total Requests"
                value={data.totalRequests}
              />
              <StatCard
                icon={ShieldAlert}
                label="Blocked Requests"
                value={data.blockedRequests}
                valueColor={data.blockedRequests > 0 ? 'text-red-500' : undefined}
              />
              <StatCard
                icon={Users}
                label="Data Subject Requests"
                value={data.dataSubjectRequests}
              />
              <StatCard
                icon={Bell}
                label="Breach Notifications"
                value={data.breachNotifications}
                valueColor={data.breachNotifications > 0 ? 'text-orange-500' : undefined}
              />
              <StatCard
                icon={AlertTriangle}
                label="Incident Reports"
                value={data.incidentReports}
              />
            </div>

            {/* Trend Indicators */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <TrendCard label="GDPR Trend" trend={data.gdprTrend} />
              <TrendCard label="DORA Trend" trend={data.doraTrend} />
              <TrendCard label="AI Act Trend" trend={data.aiActTrend} />
              <TrendCard label="NIS2 Trend" trend={data.nis2Trend} />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  valueColor
}: {
  icon: typeof FileText;
  label: string;
  value: number;
  valueColor?: string;
}) {
  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-center gap-2 text-muted-foreground mb-2">
        <Icon className="h-4 w-4" />
        <span className="text-xs">{label}</span>
      </div>
      <div className={cn("text-2xl font-bold", valueColor)}>
        {value}
      </div>
    </div>
  );
}

function TrendCard({ label, trend }: { label: string; trend: string }) {
  const config = TREND_CONFIG[trend as keyof typeof TREND_CONFIG] || TREND_CONFIG.STABLE;
  const Icon = config.icon;

  return (
    <div className="rounded-lg border p-4 flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className={cn("flex items-center gap-1", config.color)}>
        <Icon className="h-4 w-4" />
        <span className="text-sm font-medium">{config.label}</span>
      </div>
    </div>
  );
}
