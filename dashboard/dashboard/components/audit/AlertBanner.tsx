"use client";

import React, { useState, useEffect } from "react";
import { Alert, AlertSeverity } from "@/lib/audit/alert-types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  Bell,
  CheckCircle,
  X,
  ChevronRight,
  Clock
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { API_BASE } from "@/app/utils/api-config";
import { getAuthHeaders } from "@/utils/auth";

const SEVERITY_STYLES: Record<AlertSeverity, { bg: string; border: string; icon: typeof AlertTriangle }> = {
  BREACH: { bg: 'bg-red-500/10', border: 'border-red-500', icon: AlertTriangle },
  CRITICAL: { bg: 'bg-orange-500/10', border: 'border-orange-500', icon: AlertTriangle },
  WARNING: { bg: 'bg-yellow-500/10', border: 'border-yellow-500', icon: Bell },
  INFO: { bg: 'bg-blue-500/10', border: 'border-blue-500', icon: Bell },
};

interface AlertBannerProps {
  maxAlerts?: number;
  onViewAll?: () => void;
}

export function AlertBanner({ maxAlerts = 3, onViewAll }: AlertBannerProps): React.ReactElement | null {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchAlerts();
    // Poll every 30 seconds
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchAlerts = async () => {
    try {
      const response = await fetch(`${API_BASE}/audit/alerts?view=active`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        setAlerts([]);
        return;
      }
      const text = await response.text();
      if (!text.trim()) {
        setAlerts([]);
        return;
      }
      const data = JSON.parse(text);
      setAlerts(data.alerts || []);
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
      setAlerts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcknowledge = async (alertId: string) => {
    try {
      await fetch(`${API_BASE}/audit/alerts`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          action: 'acknowledge',
          alertId,
          userId: 'current-user', // TODO: Get from auth
        }),
      });
      fetchAlerts();
    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
    }
  };

  const handleDismiss = (alertId: string) => {
    setDismissedIds(prev => new Set(prev).add(alertId));
  };

  // Filter out dismissed alerts and limit
  const visibleAlerts = alerts
    .filter(a => !dismissedIds.has(a.alertId))
    .slice(0, maxAlerts);

  // Count critical and breach alerts
  const criticalCount = alerts.filter(a =>
    a.severity === 'CRITICAL' || a.severity === 'BREACH'
  ).length;

  if (isLoading || visibleAlerts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2 mb-4">
      {/* Summary bar if many alerts */}
      {alerts.length > maxAlerts && (
        <div className="flex items-center justify-between px-4 py-2 bg-muted rounded-lg">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="text-sm">
              {alerts.length} active alerts
              {criticalCount > 0 && (
                <span className="text-red-500 ml-2">
                  ({criticalCount} critical)
                </span>
              )}
            </span>
          </div>
          <Button variant="ghost" size="sm" onClick={onViewAll}>
            View All
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}

      {/* Individual alert cards */}
      {visibleAlerts.map(alert => {
        const style = SEVERITY_STYLES[alert.severity];
        const Icon = style.icon;

        return (
          <div
            key={alert.alertId}
            className={`flex items-start gap-3 p-4 rounded-lg border ${style.bg} ${style.border}`}
          >
            <Icon className={`h-5 w-5 mt-0.5 ${
              alert.severity === 'BREACH' ? 'text-red-500' :
              alert.severity === 'CRITICAL' ? 'text-orange-500' :
              alert.severity === 'WARNING' ? 'text-yellow-500' : 'text-blue-500'
            }`} />

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium truncate">{alert.title}</span>
                <Badge variant="outline" className="shrink-0">
                  {alert.regulation} {alert.article}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1 truncate">
                {alert.message}
              </p>
              <div className="flex items-center gap-4 mt-2">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })}
                </span>
                {alert.actionUrl && (
                  <a
                    href={alert.actionUrl}
                    className="text-sm text-blue-400 hover:text-blue-300 hover:underline"
                  >
                    {alert.actionLabel || 'View Details'}
                  </a>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => handleAcknowledge(alert.alertId)}
                title="Acknowledge"
              >
                <CheckCircle className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => handleDismiss(alert.alertId)}
                title="Dismiss"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
