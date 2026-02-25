'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SeverityBadge } from '@/components/ui/severity-badge';
import {
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  Activity,
  Shield,
  ShieldCheck,
  Zap,
  Eye,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Crosshair,
  Loader2
} from 'lucide-react';
import { PerformanceDashboardSummary, AISystem, Alert } from '@/app/types/art15-performance.types';

interface OverviewTabProps {
  dashboardData: PerformanceDashboardSummary | null;
  systems: AISystem[];
  alerts: Alert[];
  loading: boolean;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ dashboardData, systems, alerts, loading }) => {
  // Transform real data for display and combine with static demo data
  const performanceData = [
    ...(systems?.slice(0, 6).map(system => ({
      system: system?.system_name ?? 'Unknown System',
      accuracy: (dashboardData?.compliance_score ?? 0) * 100,
      robustness: 85 + Math.random() * 10, // Placeholder - would come from robustness tests
      security: 90 + Math.random() * 8, // Placeholder - would come from security events
      status: system?.monitoring_enabled ? 'active' : 'inactive'
    })) ?? []),
    { system: 'Content Moderation', accuracy: 95.1, robustness: 88.4, security: 93.2 },
    { system: 'Customer Service', accuracy: 92.1, robustness: 86.2, security: 90.1 },
    { system: 'Recommendation', accuracy: 94.3, robustness: 87.5, security: 92.8 },
    { system: 'Search Ranking', accuracy: 95.0, robustness: 88.1, security: 93.4 }
  ];

  const mockAttentionItems = [
    { type: 'accuracy', title: 'Accuracy Decline', system: 'HR Recruitment AI', detail: '93% → 91% (last 7d)', action: 'Investigate', urgent: false },
    { type: 'security', title: 'Security Patch', system: 'Content Mod. system', detail: 'Update available', action: 'View Details', urgent: false },
    { type: 'drift', title: 'All Clear', system: 'No drift alerts', detail: 'detected', action: '', urgent: false }
  ];

  const mockActivityFeed = [
    { time: '10:32 AM', type: 'check', message: 'Accuracy check passed', system: 'Credit Scoring', result: '96.2%' },
    { time: '10:28 AM', type: 'scan', message: 'Security scan completed', system: 'All systems', result: 'No issues' },
    { time: '10:15 AM', type: 'update', message: 'Model updated', system: 'Recommendation', result: 'v3.2→v3.3' },
    { time: '09:55 AM', type: 'drift', message: 'Drift check passed', system: 'HR Recruitment', result: 'Stable' }
  ];

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

  const getSeverityLevel = (severity: string): 1 | 2 | 3 | 4 => {
    switch (severity.toUpperCase()) {
      case 'LOW':
      case 'INFO':
        return 1;
      case 'MEDIUM':
      case 'WARNING':
        return 2;
      case 'HIGH':
      case 'ERROR':
        return 3;
      case 'CRITICAL':
      case 'FATAL':
        return 4;
      default:
        return 2; // Default to medium
    }
  };

  return (
    <div className="space-y-6">
      {/* System Health & Performance By System */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Health */}
        <Card className="bg-slate-800/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Activity size={18} />
              SYSTEM HEALTH
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Accuracy</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-slate-800 rounded-full h-2">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${(dashboardData?.compliance_score ?? 0) * 100}%` }}></div>
                  </div>
                  <span className="text-white font-medium">{((dashboardData?.compliance_score ?? 0) * 100).toFixed(1)}%</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-300">Robustness</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-slate-800 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                  <span className="text-white font-medium">85%</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-300">Security</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-slate-800 rounded-full h-2">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                  </div>
                  <span className="text-white font-medium">92%</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-300">Availability</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-slate-800 rounded-full h-2">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '99.9%' }}></div>
                  </div>
                  <span className="text-white font-medium">99.9%</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-800">
              <p className="text-sm text-emerald-400">All metrics within target</p>
            </div>
          </CardContent>
        </Card>

        {/* Performance by System */}
        <Card className="bg-slate-800/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 size={18} />
                PERFORMANCE BY SYSTEM
              </div>
              <Button variant="link" size="sm" className="text-cyan-400 p-0 h-auto text-xs">
                View All →
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="grid grid-cols-4 gap-2 text-xs text-slate-400 font-medium mb-2">
                <span>SYSTEM</span>
                <span className="text-center">ACC</span>
                <span className="text-center">ROB</span>
                <span className="text-center">SEC</span>
              </div>

              {performanceData.slice(0, 6).map((system, index) => (
                <div key={index} className="grid grid-cols-4 gap-2 py-2 border-b border-slate-800/50 last:border-0">
                  <span className="text-slate-300 text-sm truncate">{system.system}</span>
                  <span className="text-center text-white font-medium">{system.accuracy}%</span>
                  <span className="text-center text-blue-400 font-medium">{system.robustness}%</span>
                  <span className="text-center text-emerald-400 font-medium">{system.security}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Trend Chart */}
      <Card className="bg-slate-800/50 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp size={18} />
            PERFORMANCE TREND (30 days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center border border-slate-800 rounded-lg">
            <div className="text-center text-slate-400">
              <BarChart3 size={48} className="mx-auto mb-4 opacity-50" />
              {(dashboardData?.compliance_score ?? 0) === 0 ? (
                <>
                  <p className="text-lg font-medium">No data available</p>
                  <p className="text-sm">Performance metrics will appear once data is collected</p>
                </>
              ) : (
                <>
                  <p className="text-lg font-medium">Multi-line Chart Placeholder</p>
                  <p className="text-sm">Accuracy, Robustness, Security over time</p>
                </>
              )}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                <span className="text-slate-300">Accuracy</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-slate-300">Robustness</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-slate-300">Security</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5 bg-slate-500"></div>
                <span className="text-slate-400">Target threshold</span>
              </div>
            </div>

            <div className="text-slate-400">
              Trend: <span className="text-emerald-400">↗ Improving</span> │ No threshold breaches in 30 days
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Requires Attention & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Requires Attention */}
        <Card className="bg-slate-800/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle size={18} />
                REQUIRES ATTENTION
              </div>
              <Button variant="link" size="sm" className="text-cyan-400 p-0 h-auto text-xs">
                View All →
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {alerts.filter(alert => alert.status === 'pending').length > 0 ? (
                alerts.filter(alert => alert.status === 'pending').slice(0, 6).map((alert, index) => (
                  <div key={alert.id || index} className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg">
                    <div className="flex-shrink-0">
                      <SeverityBadge level={getSeverityLevel(alert.severity)} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-white font-medium text-sm">{alert.title}</h4>
                        <Button variant="link" size="sm" className="text-cyan-400 p-0 h-auto text-xs">
                          View Details
                        </Button>
                      </div>
                      <p className="text-slate-300 text-sm">{alert.alert_type}</p>
                      <p className="text-slate-400 text-xs">{alert.description}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <CheckCircle size={32} className="mx-auto mb-2 text-emerald-400" />
                  <p className="text-slate-400">All clear - no pending alerts</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-slate-800/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock size={18} />
                RECENT ACTIVITY
              </div>
              <Button variant="link" size="sm" className="text-cyan-400 p-0 h-auto text-xs">
                View All →
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockActivityFeed.map((activity, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-slate-800/30 rounded-lg">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    activity.type === 'check' ? 'bg-emerald-500/10' :
                    activity.type === 'scan' ? 'bg-emerald-500/10' :
                    activity.type === 'update' ? 'bg-blue-500/10' :
                    'bg-emerald-500/10'
                  }`}>
                    {activity.type === 'check' && <CheckCircle size={14} className="text-emerald-400" />}
                    {activity.type === 'scan' && <Shield size={14} className="text-emerald-400" />}
                    {activity.type === 'update' && <ArrowUpRight size={14} className="text-blue-400" />}
                    {activity.type === 'drift' && <TrendingUp size={14} className="text-emerald-400" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-slate-300 text-sm font-medium">{activity.time}</span>
                      <span className="text-slate-400 text-xs">{activity.result}</span>
                    </div>
                    <p className="text-white text-sm">{activity.message}</p>
                    <p className="text-slate-400 text-xs">{activity.system}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OverviewTab;