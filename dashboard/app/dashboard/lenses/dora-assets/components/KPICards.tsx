"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Computer,
  Shield,
  Users,
  Target,
  TrendingUp,
  TrendingDown
} from "lucide-react";
import { cn } from "@/lib/utils";

interface KPICard {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  value: string | number;
  trend?: {
    direction: 'up' | 'down' | 'stable';
    change: number;
  };
  color?: string;
}

interface KPICardsProps {
  kpis?: {
    totalAssets: { count: number; newThisMonth: number };
    criticalAssets: { count: number; percentage: number };
    thirdPartyProviders: { count: number; critical: number };
    criticalFunctions: { count: number; allMapped: boolean };
    coverageScore: { percentage: number; trend: number };
  };
}

export function KPICards({ kpis }: KPICardsProps) {
  // Mock data for demonstration - replace with real data
  const mockKPIs = {
    totalAssets: { count: 247, newThisMonth: 12 },
    criticalAssets: { count: 34, percentage: 14 },
    thirdPartyProviders: { count: 28, critical: 8 },
    criticalFunctions: { count: 12, allMapped: true },
    coverageScore: { percentage: 94, trend: 3 }
  };

  const data = kpis || mockKPIs;

  const cards: KPICard[] = [
    {
      icon: Computer,
      title: "TOTAL ASSETS",
      subtitle: "ICT assets registered",
      value: data.totalAssets.count,
      trend: {
        direction: 'up',
        change: data.totalAssets.newThisMonth
      }
    },
    {
      icon: Shield,
      title: "CRITICAL ASSETS",
      subtitle: "Support critical functions",
      value: data.criticalAssets.count,
      trend: {
        direction: 'up',
        change: data.criticalAssets.percentage
      }
    },
    {
      icon: Users,
      title: "THIRD PARTY",
      subtitle: "External ICT providers",
      value: data.thirdPartyProviders.count,
      trend: {
        direction: 'stable',
        change: data.thirdPartyProviders.critical
      }
    },
    {
      icon: Target,
      title: "CRITICAL FUNCTIONS",
      subtitle: "Identified & mapped",
      value: data.criticalFunctions.count,
      trend: {
        direction: data.criticalFunctions.allMapped ? 'up' : 'stable',
        change: data.criticalFunctions.allMapped ? 100 : 0
      }
    },
    {
      icon: Shield,
      title: "COVERAGE SCORE",
      subtitle: "Documentation completeness",
      value: `${data.coverageScore.percentage}%`,
      trend: {
        direction: 'up',
        change: data.coverageScore.trend
      }
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      {cards.map((card, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <card.icon className="h-5 w-5 text-blue-500" />
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                  {card.title}
                </span>
              </div>
              {card.trend && (
                <TrendBadge trend={card.trend} />
              )}
            </div>

            <div className="space-y-1">
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {card.value}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {card.subtitle}
                {card.trend && card.trend.direction === 'up' && card.trend.change > 0 && (
                  <span className="ml-1 text-green-600">
                    +{card.trend.change} new
                  </span>
                )}
                {card.trend && card.trend.direction === 'up' && card.title === 'CRITICAL ASSETS' && (
                  <span className="ml-1 text-blue-600">
                    {card.trend.change}%
                  </span>
                )}
                {card.title === 'THIRD PARTY' && card.trend && (
                  <span className="ml-1 text-red-600">
                    {card.trend.change} critical
                  </span>
                )}
                {card.title === 'CRITICAL FUNCTIONS' && data.criticalFunctions.allMapped && (
                  <span className="ml-1 text-green-600">
                    all mapped
                  </span>
                )}
                {card.title === 'COVERAGE SCORE' && card.trend && (
                  <span className="ml-1 text-green-600">
                    ↑ {card.trend.change}%
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function TrendBadge({ trend }: { trend: { direction: 'up' | 'down' | 'stable'; change: number } }) {
  const configs = {
    up: {
      icon: TrendingUp,
      color: 'text-green-600 bg-green-50 border-green-200',
      arrow: '↑'
    },
    down: {
      icon: TrendingDown,
      color: 'text-red-600 bg-red-50 border-red-200',
      arrow: '↓'
    },
    stable: {
      icon: TrendingUp,
      color: 'text-gray-600 bg-gray-50 border-gray-200',
      arrow: ''
    }
  };

  const config = configs[trend.direction];
  const Icon = config.icon;

  return (
    <div className={cn(
      "flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium",
      config.color
    )}>
      <Icon className="h-3 w-3" />
      {trend.direction === 'up' && trend.change > 0 && (
        <span>+{trend.change}</span>
      )}
      {trend.direction === 'down' && trend.change < 0 && (
        <span>{trend.change}</span>
      )}
    </div>
  );
}