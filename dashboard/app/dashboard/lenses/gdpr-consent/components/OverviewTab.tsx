'use client';

import React from 'react';
import {
  CheckCircle,
  AlertTriangle,
  Eye,
  BarChart3,
  RefreshCw,
  Mail,
  Database,
  Target,
  Share,
  Cpu,
  MapPin,
  Clock,
  User,
  Shield
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ConsentStats {
  totalConsents: number;
  consentRate: number;
  validConsents: number;
  expiringSoon: number;
  expiredConsents: number;
  withdrawnConsents: number;
  blockedToday: number;
  withdrawalsThisMonth: number;
  avgConsentAge: number;
  lawfulBasisCoverage: number;
  lastUpdate: string;
}

interface OverviewTabProps {
  stats: ConsentStats;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ stats }) => {
  // Mock data for charts
  const consentByPurpose = [
    { purpose: 'Marketing', count: 8234, percentage: 82 },
    { purpose: 'Analytics', count: 7123, percentage: 71 },
    { purpose: 'Profiling', count: 5412, percentage: 54 },
    { purpose: 'Third-Party', count: 3845, percentage: 38 },
    { purpose: 'AI Training', count: 2929, percentage: 29 },
    { purpose: 'Geolocation', count: 2121, percentage: 21 },
  ];

  const lawfulBasisData = [
    { basis: 'Consent', count: 45, color: 'bg-blue-500' },
    { basis: 'Contract', count: 28, color: 'bg-green-500' },
    { basis: 'Legit. Int.', count: 18, color: 'bg-yellow-500' },
    { basis: 'Legal Obl.', count: 6, color: 'bg-red-500' },
    { basis: 'Vital Int.', count: 2, color: 'bg-purple-500' },
    { basis: 'Public Task', count: 1, color: 'bg-indigo-500' },
  ];

  const recentActivity = [
    {
      id: 1,
      type: 'granted',
      purpose: 'Marketing',
      user: 'user_9281',
      time: '9:52 AM',
      icon: CheckCircle,
      color: 'text-emerald-400'
    },
    {
      id: 2,
      type: 'withdrawn',
      purpose: 'Analytics',
      user: 'user_8172',
      time: '9:48 AM',
      icon: AlertTriangle,
      color: 'text-red-400'
    },
    {
      id: 3,
      type: 'blocked',
      purpose: 'Profiling',
      user: 'user_7623',
      time: '9:45 AM',
      icon: Shield,
      color: 'text-yellow-400'
    },
    {
      id: 4,
      type: 'granted',
      purpose: 'Third-Party',
      user: 'user_6891',
      time: '9:41 AM',
      icon: CheckCircle,
      color: 'text-emerald-400'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Charts Section - 2 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Consent by Purpose */}
        <Card className="bg-slate-800/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <BarChart3 size={20} />
              CONSENT BY PURPOSE
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {consentByPurpose.map((item) => (
                <div key={item.purpose} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
                    <span className="text-slate-300 text-sm">{item.purpose}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-slate-800 rounded-full h-2">
                      <div
                        className="bg-cyan-500 h-2 rounded-full"
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-slate-400 text-xs w-10 text-right">{item.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-slate-800">
              <Button variant="link" size="sm" className="text-cyan-400 p-0 h-auto">
                Manage Consent Types →
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Right Column: Lawful Basis Distribution */}
        <Card className="bg-slate-800/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Shield size={20} />
              LAWFUL BASIS DISTRIBUTION
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center mb-6">
              {/* Simple donut chart representation */}
              <div className="relative w-32 h-32">
                <div className="absolute inset-0 rounded-full bg-slate-800"></div>
                <div className="absolute inset-2 rounded-full bg-slate-900 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">6</div>
                    <div className="text-xs text-slate-400">bases</div>
                  </div>
                </div>
                {/* Color indicators */}
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 flex gap-1">
                  {lawfulBasisData.map((item, index) => (
                    <div key={item.basis} className="flex items-center gap-1">
                      <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                      <span className="text-xs text-slate-400">{item.count}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {lawfulBasisData.map((item) => (
                <div key={item.basis} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                    <span className="text-slate-300">{item.basis}</span>
                  </div>
                  <span className="text-slate-400">{item.count}%</span>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-800">
              <Button variant="link" size="sm" className="text-cyan-400 p-0 h-auto">
                Configure Lawful Basis →
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Consent Health Panel */}
      <Card className="bg-slate-800/50 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <BarChart3 size={20} />
            CONSENT HEALTH
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-emerald-500 rounded"></div>
                <span className="text-slate-300">Valid</span>
              </div>
              <span className="text-slate-400">89% ({stats.validConsents.toLocaleString()})</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                <span className="text-slate-300">Expiring</span>
              </div>
              <span className="text-slate-400">7% ({stats.expiringSoon})</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span className="text-slate-300">Expired</span>
              </div>
              <span className="text-slate-400">3% ({stats.expiredConsents})</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-slate-500 rounded"></div>
                <span className="text-slate-300">Withdrawn</span>
              </div>
              <span className="text-slate-400">1% ({stats.withdrawnConsents})</span>
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-lg p-4">
            <div className="w-full bg-slate-700 rounded-full h-3 mb-2">
              <div className="bg-emerald-500 h-3 rounded-full" style={{ width: '89%' }}></div>
            </div>
            <div className="flex justify-between text-xs text-slate-400">
              <span>Valid: {stats.validConsents.toLocaleString()}</span>
              <span>Expiring (30d): {stats.expiringSoon}</span>
              <span>Expired: {stats.expiredConsents}</span>
              <span>Withdrawn: {stats.withdrawnConsents}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Requires Attention Panel */}
      <Card className="bg-slate-800/50 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <AlertTriangle size={20} className="text-yellow-400" />
            REQUIRES ATTENTION
            <Button variant="link" size="sm" className="text-cyan-400 ml-auto">
              View All →
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-red-900/20 border border-red-800/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle size={16} className="text-red-400" />
                <span className="text-red-400 font-medium">Expired Consents</span>
              </div>
              <p className="text-slate-300 text-sm mb-2">{stats.expiredConsents} users</p>
              <p className="text-slate-400 text-xs mb-3">Processing blocked</p>
              <Button size="sm" variant="outline" className="border-red-800 text-red-400 hover:bg-red-900/20">
                Send Re-consent
              </Button>
            </div>

            <div className="bg-yellow-900/20 border border-yellow-800/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock size={16} className="text-yellow-400" />
                <span className="text-yellow-400 font-medium">Expiring Soon</span>
              </div>
              <p className="text-slate-300 text-sm mb-2">{stats.expiringSoon} users (30 days)</p>
              <p className="text-slate-400 text-xs mb-3">Re-consent campaign</p>
              <Button size="sm" variant="outline" className="border-yellow-800 text-yellow-400 hover:bg-yellow-900/20">
                Schedule Campaign
              </Button>
            </div>

            <div className="bg-yellow-900/20 border border-yellow-800/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield size={16} className="text-yellow-400" />
                <span className="text-yellow-400 font-medium">Missing Basis</span>
              </div>
              <p className="text-slate-300 text-sm mb-2">AI Training</p>
              <p className="text-slate-400 text-xs mb-3">No lawful basis</p>
              <Button size="sm" variant="outline" className="border-yellow-800 text-yellow-400 hover:bg-yellow-900/20">
                Configure
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity Feed */}
      <Card className="bg-slate-800/50 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Clock size={20} />
            RECENT ACTIVITY
            <Button variant="link" size="sm" className="text-cyan-400 ml-auto">
              View All →
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="bg-slate-800/50 rounded-lg p-3 border border-slate-600/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.type === 'granted' ? 'bg-green-400' :
                      activity.type === 'withdrawn' ? 'bg-red-400' :
                      'bg-yellow-400'
                    }`} />
                    <span className="text-xs text-slate-400 font-mono">{activity.time}</span>
                    <Badge className={
                      activity.type === 'granted' ? 'bg-green-500/20 text-green-400 border-green-500/50' :
                      activity.type === 'withdrawn' ? 'bg-red-500/20 text-red-400 border-red-500/50' :
                      'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
                    }>
                      {activity.type.toUpperCase()}
                    </Badge>
                  </div>
                  <span className="text-xs text-slate-500">{activity.purpose}</span>
                </div>
                <div className="mt-1 text-xs text-slate-400">
                  User: {activity.user} | Purpose: {activity.purpose}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OverviewTab;