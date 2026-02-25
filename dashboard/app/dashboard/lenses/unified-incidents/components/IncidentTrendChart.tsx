"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, Calendar } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

interface TrendData {
  date: string;
  newIncidents: number;
  resolvedIncidents: number;
  overdueIncidents: number;
}

interface IncidentTrendChartProps {
  data?: TrendData[];
  loading?: boolean;
}

// Mock data for 30 days
const generateMockData = (days: number): TrendData[] => {
  const data: TrendData[] = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);

    data.push({
      date: date.toISOString().split('T')[0],
      newIncidents: Math.floor(Math.random() * 5) + 1,
      resolvedIncidents: Math.floor(Math.random() * 4) + 1,
      overdueIncidents: Math.floor(Math.random() * 2)
    });
  }

  return data;
};

const mockData30d = generateMockData(30);
const mockData7d = generateMockData(7);
const mockData90d = generateMockData(90);

export function IncidentTrendChart({ data, loading }: IncidentTrendChartProps) {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  const getChartData = () => {
    switch (timeRange) {
      case '7d': return mockData7d;
      case '30d': return mockData30d;
      case '90d': return mockData90d;
      default: return mockData30d;
    }
  };

  const chartData = data || getChartData();

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 shadow-lg">
          <p className="text-white font-medium mb-2">{formatDate(label)}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <TrendingUp className="h-5 w-5" />
            Incident Trend (30 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-slate-700/50 rounded animate-pulse"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-white">
            <TrendingUp className="h-5 w-5" />
            Incident Trend ({timeRange === '7d' ? '7' : timeRange === '30d' ? '30' : '90'} Days)
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant={timeRange === '7d' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('7d')}
              className="text-xs"
            >
              7d
            </Button>
            <Button
              variant={timeRange === '30d' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('30d')}
              className="text-xs"
            >
              30d
            </Button>
            <Button
              variant={timeRange === '90d' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('90d')}
              className="text-xs"
            >
              90d
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{
                top: 10,
                right: 30,
                left: 0,
                bottom: 0,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                stroke="#9CA3AF"
                fontSize={12}
              />
              <YAxis stroke="#9CA3AF" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />

              {/* New Incidents - Blue */}
              <Area
                type="monotone"
                dataKey="newIncidents"
                stackId="1"
                stroke="#3B82F6"
                fill="#3B82F6"
                fillOpacity={0.6}
                name="New Incidents"
              />

              {/* Resolved Incidents - Green */}
              <Area
                type="monotone"
                dataKey="resolvedIncidents"
                stackId="2"
                stroke="#10B981"
                fill="#10B981"
                fillOpacity={0.6}
                name="Resolved Incidents"
              />

              {/* Overdue Incidents - Red */}
              <Area
                type="monotone"
                dataKey="overdueIncidents"
                stackId="3"
                stroke="#EF4444"
                fill="#EF4444"
                fillOpacity={0.8}
                name="Overdue Incidents"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          <div className="p-3 bg-slate-700/30 rounded-lg">
            <div className="text-lg font-semibold text-blue-400">
              {chartData.reduce((sum, item) => sum + item.newIncidents, 0)}
            </div>
            <div className="text-xs text-slate-400">New Incidents</div>
          </div>
          <div className="p-3 bg-slate-700/30 rounded-lg">
            <div className="text-lg font-semibold text-green-400">
              {chartData.reduce((sum, item) => sum + item.resolvedIncidents, 0)}
            </div>
            <div className="text-xs text-slate-400">Resolved</div>
          </div>
          <div className="p-3 bg-slate-700/30 rounded-lg">
            <div className="text-lg font-semibold text-red-400">
              {chartData.reduce((sum, item) => sum + item.overdueIncidents, 0)}
            </div>
            <div className="text-xs text-slate-400">Overdue</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}