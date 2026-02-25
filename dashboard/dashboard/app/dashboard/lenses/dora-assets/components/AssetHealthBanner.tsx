"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertTriangle, XCircle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

export type HealthStatus = 'COMPLIANT' | 'ATTENTION' | 'NON_COMPLIANT';

interface AssetHealthBannerProps {
  status?: HealthStatus;
  lastAudit?: string;
  nextReview?: string;
  issues?: string[];
  onReview?: () => void;
  onFix?: () => void;
}

export function AssetHealthBanner({
  status = 'COMPLIANT',
  lastAudit = 'Dec 20, 2025',
  nextReview = 'Jan 20, 2026',
  issues = [],
  onReview,
  onFix
}: AssetHealthBannerProps) {
  const configs = {
    COMPLIANT: {
      icon: CheckCircle,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/30',
      title: 'ASSET HEALTH: ✅ COMPLIANT',
      description: 'All critical assets documented │ 0 unclassified',
      showAction: false
    },
    ATTENTION: {
      icon: AlertTriangle,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/30',
      title: 'ASSET HEALTH: ⚠️ ATTENTION NEEDED',
      description: issues.length > 0 ? issues.join(' │ ') : 'Some assets require attention',
      showAction: true,
      actionLabel: 'Review',
      actionIcon: RefreshCw
    },
    NON_COMPLIANT: {
      icon: XCircle,
      color: 'text-red-500',
      bgColor: 'bg-red-500/15',
      borderColor: 'border-red-500/30',
      title: 'ASSET HEALTH: 🔴 NON-COMPLIANT',
      description: issues.length > 0 ? issues.join(' │ ') : 'Critical compliance issues detected',
      showAction: true,
      actionLabel: 'Fix Now',
      actionIcon: RefreshCw,
      pulsing: true
    }
  };

  const config = configs[status] as any;
  const Icon = config.icon;
  const ActionIcon = config.actionIcon;

  return (
    <Card className={cn(
      "border-2",
      config.borderColor,
      config.bgColor,
      config.pulsing && "animate-pulse"
    )}>
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-3">
            <Icon className={cn("h-6 w-6 mt-0.5", config.color)} />
            <div>
              <h3 className={cn("font-semibold", config.color)}>
                {config.title}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                {config.description}
              </p>
              <div className="flex items-center gap-4 mt-2 text-xs text-slate-500 dark:text-slate-400">
                <span>Last audit: {lastAudit}</span>
                <span>Next review: {nextReview}</span>
              </div>
            </div>
          </div>

          {config.showAction && (
            <Button
              variant="outline"
              size="sm"
              onClick={status === 'ATTENTION' ? onReview : onFix}
              className={cn(
                "border-2",
                status === 'ATTENTION' ? "border-yellow-500/50 text-yellow-700 hover:bg-yellow-50" :
                "border-red-500/50 text-red-700 hover:bg-red-50"
              )}
            >
              {ActionIcon && <ActionIcon className="h-4 w-4 mr-2" />}
              {config.actionLabel}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}