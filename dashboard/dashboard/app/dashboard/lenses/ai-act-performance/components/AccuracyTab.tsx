'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from 'lucide-react';

const AccuracyTab: React.FC = () => {
  const accuracyData = [
    { system: 'Credit Scoring', current: 96.2, weekAvg: 95.8, monthAvg: 95.1, trend: 1.1, status: 'good' },
    { system: 'Content Moderation', current: 95.1, weekAvg: 94.9, monthAvg: 94.5, trend: 0.6, status: 'good' },
    { system: 'Search Ranking', current: 95.0, weekAvg: 94.8, monthAvg: 94.7, trend: 0.3, status: 'good' },
    { system: 'Recommendation', current: 94.3, weekAvg: 94.1, monthAvg: 93.8, trend: 0.5, status: 'good' },
    { system: 'HR Recruitment', current: 91.3, weekAvg: 92.4, monthAvg: 93.1, trend: -1.8, status: 'warning' },
    { system: 'Customer Service', current: 92.1, weekAvg: 91.8, monthAvg: 91.5, trend: 0.6, status: 'good' }
  ];

  const errorData = {
    falsePositive: 42,
    falseNegative: 31,
    confidenceError: 18,
    timeoutFailure: 9
  };

  const accuracyAlerts = [
    {
      time: 'Jan 06, 14:23',
      system: 'HR Recruitment',
      message: 'accuracy dropped below 92% threshold',
      detail: 'Current: 91.3%',
      status: 'investigating'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'good':
        return <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">🟢 Good</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20">🟡 Warning</Badge>;
      default:
        return <Badge className="bg-slate-500/10 text-slate-400 border-slate-500/20">⚪ Unknown</Badge>;
    }
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <ArrowUpRight size={14} className="text-emerald-400" />;
    if (trend < 0) return <ArrowDownRight size={14} className="text-red-400" />;
    return <Minus size={14} className="text-slate-400" />;
  };

  const getTrendColor = (trend: number) => {
    if (trend > 0) return 'text-emerald-400';
    if (trend < 0) return 'text-red-400';
    return 'text-slate-400';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-2">ACCURACY MONITORING</h2>
        <p className="text-slate-400">Model prediction accuracy and error analysis</p>
      </div>

      {/* Accuracy by System Table */}
      <Card className="bg-slate-800/50 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">ACCURACY BY SYSTEM</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left text-slate-400 font-medium py-3">SYSTEM</th>
                  <th className="text-center text-slate-400 font-medium py-3">CURRENT</th>
                  <th className="text-center text-slate-400 font-medium py-3">7D AVG</th>
                  <th className="text-center text-slate-400 font-medium py-3">30D AVG</th>
                  <th className="text-center text-slate-400 font-medium py-3">TREND</th>
                  <th className="text-center text-slate-400 font-medium py-3">STATUS</th>
                </tr>
              </thead>
              <tbody>
                {accuracyData.map((system, index) => (
                  <tr key={index} className="border-b border-slate-800/50 hover:bg-slate-800/20">
                    <td className="py-4 text-white font-medium">{system.system}</td>
                    <td className="text-center text-white font-semibold">{system.current}%</td>
                    <td className="text-center text-slate-300">{system.weekAvg}%</td>
                    <td className="text-center text-slate-300">{system.monthAvg}%</td>
                    <td className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        {getTrendIcon(system.trend)}
                        <span className={`font-medium ${getTrendColor(system.trend)}`}>
                          {system.trend > 0 ? '+' : ''}{system.trend}%
                        </span>
                      </div>
                    </td>
                    <td className="text-center">
                      {getStatusBadge(system.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Error Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Error Type Distribution */}
        <Card className="bg-slate-800/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">ERROR TYPE DISTRIBUTION</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">False Positive</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-slate-800 rounded-full h-2">
                    <div className="bg-red-500 h-2 rounded-full" style={{ width: `${errorData.falsePositive}%` }}></div>
                  </div>
                  <span className="text-white font-medium">{errorData.falsePositive}%</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-300">False Negative</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-slate-800 rounded-full h-2">
                    <div className="bg-orange-500 h-2 rounded-full" style={{ width: `${errorData.falseNegative}%` }}></div>
                  </div>
                  <span className="text-white font-medium">{errorData.falseNegative}%</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-300">Confidence Error</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-slate-800 rounded-full h-2">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${errorData.confidenceError}%` }}></div>
                  </div>
                  <span className="text-white font-medium">{errorData.confidenceError}%</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-300">Timeout/Failure</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-slate-800 rounded-full h-2">
                    <div className="bg-slate-500 h-2 rounded-full" style={{ width: `${errorData.timeoutFailure}%` }}></div>
                  </div>
                  <span className="text-white font-medium">{errorData.timeoutFailure}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Trend Chart */}
        <Card className="bg-slate-800/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">ERROR TREND (30 days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 flex items-center justify-center border border-slate-800 rounded-lg">
              <div className="text-center text-slate-400">
                <BarChart3 size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">Line chart showing error rate over time</p>
                <p className="text-xs text-slate-500">with threshold line</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Accuracy Alerts */}
      <Card className="bg-slate-800/50 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">ACCURACY ALERTS</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {accuracyAlerts.map((alert, index) => (
              <div key={index} className="flex items-start gap-4 p-4 bg-slate-800/30 rounded-lg border border-yellow-500/20">
                <div className="w-8 h-8 bg-yellow-500/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertTriangle size={16} className="text-yellow-400" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-yellow-400 font-medium">
                      🟡 {alert.time} {alert.message}
                    </p>
                    <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                      {alert.status}
                    </Badge>
                  </div>
                  <p className="text-slate-300 text-sm">{alert.system}</p>
                  <p className="text-slate-400 text-sm">{alert.detail}</p>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="border-slate-700 text-slate-300 hover:bg-slate-800">
                    <Eye size={14} className="mr-1" />
                    View Details
                  </Button>
                  <Button variant="outline" size="sm" className="border-slate-700 text-slate-300 hover:bg-slate-800">
                    Acknowledge
                  </Button>
                </div>
              </div>
            ))}

            {accuracyAlerts.length === 0 && (
              <div className="text-center py-8 text-slate-400">
                <CheckCircle size={32} className="mx-auto mb-2 opacity-50" />
                <p>No accuracy alerts at this time</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccuracyTab;