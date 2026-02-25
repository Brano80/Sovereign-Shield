"use client";

import { useState, useEffect } from "react";
import { ThresholdBreach } from "@/lib/dora/ict-risk-types";
import { Button } from "@/components/ui/button";
import { AlertTriangle, AlertCircle, ChevronRight } from "lucide-react";
import Link from "next/link";
import { API_BASE } from "@/app/utils/api-config";
import { getAuthHeaders } from "@/app/utils/auth";

interface ThresholdBreachResponse {
  breaches: ThresholdBreach[];
  total: number;
}

export function ThresholdBreachesSummary() {
  const [breaches, setBreaches] = useState<ThresholdBreach[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBreaches();
  }, []);

  const fetchBreaches = async () => {
    try {
      const response = await fetch(
        `${API_BASE}/dora/risk?view=breaches&status=OPEN`,
        { headers: getAuthHeaders() }
      );
      if (!response.ok) throw new Error("Failed to fetch");
      const result: ThresholdBreachResponse = await response.json();
      setBreaches(result.breaches || []);
    } catch (error) {
      console.error("Failed to fetch breaches:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const criticalCount = breaches.filter((b) => b.breachType === "CRITICAL").length;
  const warningCount = breaches.filter((b) => b.breachType === "WARNING").length;

  if (isLoading) {
    return (
      <div className="rounded-lg border bg-card p-4 animate-pulse">
        <div className="h-6 w-48 bg-muted rounded" />
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card p-4">
      <h4 className="font-semibold mb-3">Threshold Breaches</h4>

      <div className="flex items-center gap-6">
        {/* Critical */}
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-500/10">
            <AlertCircle className="h-5 w-5 text-red-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-red-500">{criticalCount}</p>
            <p className="text-xs text-muted-foreground">Critical</p>
          </div>
        </div>

        <div className="h-10 w-px bg-border" />

        {/* Warning */}
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-500/10">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-orange-500">{warningCount}</p>
            <p className="text-xs text-muted-foreground">Warning</p>
          </div>
        </div>

        <div className="h-10 w-px bg-border" />

        {/* Total */}
        <div>
          <p className="text-sm text-muted-foreground">
            Total: <span className="font-medium text-foreground">{breaches.length}</span> open breaches
          </p>
        </div>

        <div className="flex-1" />

        {/* View All Link */}
        <Link href="/dashboard/lenses/risk-overview?tab=breaches">
          <Button variant="ghost" size="sm">
            View All Breaches
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </Link>
      </div>

      {/* Recent Critical Breaches */}
      {criticalCount > 0 && (
        <div className="mt-4 pt-4 border-t">
          <p className="text-sm font-medium mb-2">Recent Critical Breaches:</p>
          <div className="space-y-2">
            {breaches
              .filter((b) => b.breachType === "CRITICAL")
              .slice(0, 3)
              .map((breach) => (
                <div
                  key={breach.id}
                  className="flex items-center justify-between text-sm p-2 rounded bg-red-500/5"
                >
                  <div>
                    <span className="font-medium">{breach.assetName}</span>
                    <span className="text-muted-foreground"> - {breach.thresholdName}</span>
                  </div>
                  <div className="text-red-500 font-mono">
                    {breach.actualValue.toFixed(1)} / {breach.thresholdValue.toFixed(1)}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

