"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Activity, Zap, Globe, BarChart3 } from 'lucide-react';

interface RegulationData {
  regulation: 'GDPR' | 'DORA' | 'AI_ACT' | 'NIS2' | 'MULTI';
  count: number;
  percentage: number;
  color: string;
  icon: any;
  name: string;
}

interface IncidentsByRegulationProps {
  data?: RegulationData[];
  loading?: boolean;
  onRegulationClick?: (regulation: string) => void;
}

// Mock data for demonstration
const mockData: RegulationData[] = [
  {
    regulation: 'GDPR',
    count: 12,
    percentage: 34,
    color: 'bg-blue-500',
    icon: Shield,
    name: 'GDPR'
  },
  {
    regulation: 'DORA',
    count: 9,
    percentage: 26,
    color: 'bg-green-500',
    icon: Activity,
    name: 'DORA'
  },
  {
    regulation: 'AI_ACT',
    count: 5,
    percentage: 14,
    color: 'bg-purple-500',
    icon: Zap,
    name: 'AI Act'
  },
  {
    regulation: 'NIS2',
    count: 7,
    percentage: 20,
    color: 'bg-orange-500',
    icon: Globe,
    name: 'NIS2'
  },
  {
    regulation: 'MULTI',
    count: 2,
    percentage: 6,
    color: 'bg-slate-500',
    icon: BarChart3,
    name: 'Multi'
  }
];

export function IncidentsByRegulation({ data = mockData, loading, onRegulationClick }: IncidentsByRegulationProps) {
  const [selectedRegulation, setSelectedRegulation] = useState<string | null>(null);

  const handleRegulationClick = (regulation: string) => {
    setSelectedRegulation(regulation);
    onRegulationClick?.(regulation);
  };

  if (loading) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <BarChart3 className="h-5 w-5" />
            Incidents by Regulation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-8 bg-slate-700 rounded animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalIncidents = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <BarChart3 className="h-5 w-5" />
          Incidents by Regulation
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((item) => {
            const IconComponent = item.icon;
            const isSelected = selectedRegulation === item.regulation;

            return (
              <div
                key={item.regulation}
                className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? 'border-slate-500 bg-slate-700/50'
                    : 'border-slate-600 bg-slate-700/30 hover:bg-slate-600/50'
                }`}
                onClick={() => handleRegulationClick(item.regulation)}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${item.color}`}>
                    <IconComponent className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white">{item.name}</span>
                      <span className="text-xs text-slate-400">{item.count} incidents</span>
                    </div>
                    <div className="text-xs text-slate-500">({item.percentage}%)</div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="flex-1 mx-4">
                  <div className="w-full bg-slate-600 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${item.color}`}
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-400 hover:text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRegulationClick(item.regulation);
                  }}
                >
                  Filter →
                </Button>
              </div>
            );
          })}

          {/* Total summary */}
          <div className="pt-4 border-t border-slate-600">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Total Incidents</span>
              <span className="text-white font-medium">{totalIncidents}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}