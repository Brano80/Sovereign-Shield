"use client";

import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle, XCircle } from "lucide-react";

interface ComplianceScoreCardProps {
  title: string;
  score: number;
  status: string;
  trend?: string;
  trendPercentage?: number;
  compliantCount?: number;
  totalCount?: number;
  subtitle?: string;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  className?: string;
}

const STATUS_CONFIG = {
  COMPLIANT: {
    color: 'text-green-500',
    bg: 'bg-green-500/10',
    border: 'border-green-500/30',
    icon: CheckCircle,
    label: 'Compliant',
  },
  PARTIAL: {
    color: 'text-yellow-500',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
    icon: AlertTriangle,
    label: 'Partial',
  },
  NON_COMPLIANT: {
    color: 'text-red-500',
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    icon: XCircle,
    label: 'Non-Compliant',
  },
  NOT_ASSESSED: {
    color: 'text-gray-500',
    bg: 'bg-gray-500/10',
    border: 'border-gray-500/30',
    icon: Minus,
    label: 'Not Assessed',
  },
};

const TREND_CONFIG = {
  UP: { icon: TrendingUp, color: 'text-green-500', label: 'Improving' },
  DOWN: { icon: TrendingDown, color: 'text-red-500', label: 'Declining' },
  STABLE: { icon: Minus, color: 'text-gray-500', label: 'Stable' },
};

export function ComplianceScoreCard({
  title,
  score,
  status,
  trend = 'STABLE',
  trendPercentage,
  compliantCount,
  totalCount,
  subtitle,
  size = 'md',
  onClick,
  className,
}: ComplianceScoreCardProps) {
  const statusConfig = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.NOT_ASSESSED;
  const trendConfig = TREND_CONFIG[trend as keyof typeof TREND_CONFIG] || TREND_CONFIG.STABLE;
  const StatusIcon = statusConfig.icon;
  const TrendIcon = trendConfig.icon;

  const sizeClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  const scoreSizes = {
    sm: 'text-2xl',
    md: 'text-3xl',
    lg: 'text-4xl',
  };

  return (
    <div
      className={cn(
        'rounded-lg border bg-card transition-all',
        statusConfig.border,
        onClick && 'cursor-pointer hover:shadow-md hover:border-primary/50',
        sizeClasses[size],
        className
      )}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <StatusIcon className={cn('h-4 w-4', statusConfig.color)} />
          <span className="font-medium text-sm">{title}</span>
        </div>
        {trend && (
          <div className={cn('flex items-center gap-1', trendConfig.color)}>
            <TrendIcon className="h-3 w-3" />
            {trendPercentage !== undefined && (
              <span className="text-xs">
                {trendPercentage > 0 ? '+' : ''}{trendPercentage}%
              </span>
            )}
          </div>
        )}
      </div>

      {/* Score */}
      <div className="flex items-baseline gap-2 mb-2">
        <span className={cn('font-bold', scoreSizes[size], statusConfig.color)}>
          {score}%
        </span>
        <Badge
          variant="outline"
          className={cn('text-xs', statusConfig.bg, statusConfig.color)}
        >
          {statusConfig.label}
        </Badge>
      </div>

      {/* Progress Bar */}
      <Progress
        value={score}
        className="h-2 mb-2"
        // Custom color based on status
      />

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        {compliantCount !== undefined && totalCount !== undefined ? (
          <span>{compliantCount} of {totalCount} articles compliant</span>
        ) : subtitle ? (
          <span>{subtitle}</span>
        ) : (
          <span>{statusConfig.label}</span>
        )}
      </div>
    </div>
  );
}
