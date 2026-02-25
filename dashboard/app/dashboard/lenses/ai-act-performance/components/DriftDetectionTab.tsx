'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  Calendar,
  Eye,
  ArrowRight
} from 'lucide-react';

const DriftDetectionTab: React.FC = () => {
  const driftStatus = {
    modelDrift: { status: 'stable', alerts: 0, timeframe: '7 days' },
    dataDrift: { status: 'stable', alerts: 0, timeframe: '7 days' },
    conceptDrift: { status: 'stable', alerts: 0, timeframe: '7 days' }
  };

  const driftBySystem = [
    { system: 'Credit Scoring', modelDrift: 0.02, dataDrift: 0.04, lastCheck: '5 min ago', status: 'stable' },
    { system: 'HR Recruitment', modelDrift: 0.08, dataDrift: 0.12, lastCheck: '5 min ago', status: 'watch' },
    { system: 'Content Moderation', modelDrift: 0.03, dataDrift: 0.05, lastCheck: '8 min ago', status: 'stable' },
    { system: 'Customer Service', modelDrift: 0.04, dataDrift: 0.06, lastCheck: '8 min ago', status: 'stable' },
    { system: 'Recommendation', modelDrift: 0.02, dataDrift: 0.03, lastCheck: '12 min ago', status: 'stable' },
    { system: 'Search Ranking', modelDrift: 0.01, dataDrift: 0.02, lastCheck: '12 min ago', status: 'stable' }
  ];

  const driftHistory = [
    { date: 'Dec 28', system: 'HR Recruitment', type: 'Data drift', score: 0.18, resolution: 'Resolved', cause: 'Retrained model' },
    { date: 'Dec 15', system: 'Credit Scoring', type: 'Model drift', score: 0.12, resolution: 'Resolved', cause: 'Feature update' },
    { date: 'Nov 30', system: 'Customer Service', type: 'Concept drift', score: null, resolution: 'Resolved', cause: 'Retraining' }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'stable':
        return <CheckCircle size={16} className="text-emerald-400" />;
      case 'watch':
        return <AlertTriangle size={16} className="text-yellow-400" />;
      case 'critical':
        return <AlertTriangle size={16} className="text-red-400" />;
      default:
        return <CheckCircle size={16} className="text-emerald-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'stable':
        return <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">🟢 Stable</Badge>;
      case 'watch':
        return <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20">🟡 Watch</Badge>;
      case 'critical':
        return <Badge className="bg-red-500/10 text-red-400 border-red-500/20">🔴 Critical</Badge>;
      default:
        return <Badge className="bg-slate-500/10 text-slate-400 border-slate-500/20">⚪ Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-2">DRIFT DETECTION</h2>
        <p className="text-slate-400">Monitor model and data drift to ensure consistent performance</p>
      </div>

      {/* Drift Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-800/50 border-slate-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">MODEL DRIFT</h3>
              {getStatusIcon(driftStatus.modelDrift.status)}
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-400 mb-1">
                {driftStatus.modelDrift.status === 'stable' ? '✓ Stable' : driftStatus.modelDrift.status}
              </p>
              <p className="text-slate-400 text-sm">{driftStatus.modelDrift.alerts} alerts</p>
              <p className="text-slate-500 text-xs">Last {driftStatus.modelDrift.timeframe}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">DATA DRIFT</h3>
              {getStatusIcon(driftStatus.dataDrift.status)}
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-400 mb-1">
                {driftStatus.dataDrift.status === 'stable' ? '✓ Stable' : driftStatus.dataDrift.status}
              </p>
              <p className="text-slate-400 text-sm">{driftStatus.dataDrift.alerts} alerts</p>
              <p className="text-slate-500 text-xs">Last {driftStatus.dataDrift.timeframe}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">CONCEPT DRIFT</h3>
              {getStatusIcon(driftStatus.conceptDrift.status)}
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-400 mb-1">
                {driftStatus.conceptDrift.status === 'stable' ? '✓ Stable' : driftStatus.conceptDrift.status}
              </p>
              <p className="text-slate-400 text-sm">{driftStatus.conceptDrift.alerts} alerts</p>
              <p className="text-slate-500 text-xs">Last {driftStatus.conceptDrift.timeframe}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Drift by System Table */}
      <Card className="bg-slate-800/50 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">DRIFT BY SYSTEM</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left text-slate-400 font-medium py-3">SYSTEM</th>
                  <th className="text-center text-slate-400 font-medium py-3">MODEL DRIFT</th>
                  <th className="text-center text-slate-400 font-medium py-3">DATA DRIFT</th>
                  <th className="text-center text-slate-400 font-medium py-3">LAST CHECK</th>
                  <th className="text-center text-slate-400 font-medium py-3">STATUS</th>
                </tr>
              </thead>
              <tbody>
                {driftBySystem.map((system, index) => (
                  <tr key={index} className="border-b border-slate-800/50 hover:bg-slate-800/20">
                    <td className="py-4 text-white font-medium">{system.system}</td>
                    <td className="text-center text-slate-300">{system.modelDrift}</td>
                    <td className="text-center text-slate-300">{system.dataDrift}</td>
                    <td className="text-center text-slate-400">{system.lastCheck}</td>
                    <td className="text-center">
                      {getStatusBadge(system.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 p-3 bg-slate-800/30 rounded-lg">
            <p className="text-slate-400 text-sm">
              <strong className="text-slate-300">Threshold:</strong> Model {'>'}0.10 = Warning, {'>'}0.15 = Critical │
              Data {'>'}0.15 = Warning, {'>'}0.20 = Critical
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Drift Trend Chart */}
      <Card className="bg-slate-800/50 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">DRIFT TREND</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center border border-slate-800 rounded-lg">
            <div className="text-center text-slate-400">
              <BarChart3 size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">Line chart: drift scores over time</p>
              <p className="text-xs text-slate-500">with warning/critical threshold lines</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Drift History */}
      <Card className="bg-slate-800/50 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <span>DRIFT HISTORY</span>
            <Button variant="link" size="sm" className="text-cyan-400 p-0 h-auto text-xs">
              View Full History →
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {driftHistory.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="text-white font-medium min-w-[60px]">{item.date}</div>
                  <div className="text-slate-300">{item.system}</div>
                  <Badge variant="outline" className="text-xs">
                    {item.type} {item.score ? `(${item.score})` : ''}
                  </Badge>
                  <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                    {item.resolution}
                  </Badge>
                </div>
                <div className="text-slate-400 text-sm">
                  {item.cause}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DriftDetectionTab;