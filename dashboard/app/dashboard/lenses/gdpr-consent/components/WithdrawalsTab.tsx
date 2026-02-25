'use client';

import React, { useState } from 'react';
import {
  UserX,
  Clock,
  TrendingDown,
  Download,
  BarChart3,
  AlertTriangle,
  Mail,
  Settings,
  MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface WithdrawalStats {
  thisMonth: number;
  avgProcessingTime: string;
  reasons: {
    tooManyCommunications: number;
    privacyConcerns: number;
    notUsingService: number;
    generalUnsubscribe: number;
    changedPreferences: number;
    other: number;
  };
}

interface WithdrawalRecord {
  time: string;
  user: string;
  consentType: string;
  method: string;
  reason: string;
  sealLevel: string;
}

const WithdrawalsTab: React.FC = () => {
  const [reasonsModalOpen, setReasonsModalOpen] = useState(false);

  // Mock data
  const stats: WithdrawalStats = {
    thisMonth: 234,
    avgProcessingTime: '< 1 minute',
    reasons: {
      tooManyCommunications: 82,
      privacyConcerns: 51,
      notUsingService: 42,
      generalUnsubscribe: 33,
      changedPreferences: 19,
      other: 7
    }
  };

  const withdrawalRecords: WithdrawalRecord[] = [
    {
      time: '9:48 AM',
      user: 'user_8172@...',
      consentType: 'Analytics',
      method: 'App',
      reason: 'Not needed',
      sealLevel: 'L2'
    },
    {
      time: '9:32 AM',
      user: 'user_7891@...',
      consentType: 'Marketing',
      method: 'Email',
      reason: 'Too many',
      sealLevel: 'L2'
    },
    {
      time: '9:15 AM',
      user: 'user_6723@...',
      consentType: 'Third-Party',
      method: 'Web',
      reason: 'Privacy',
      sealLevel: 'L2'
    },
    {
      time: '8:58 AM',
      user: 'user_5612@...',
      consentType: 'Profiling',
      method: 'App',
      reason: 'Not using',
      sealLevel: 'L2'
    },
    {
      time: '8:41 AM',
      user: 'user_4501@...',
      consentType: 'Marketing',
      method: 'Email',
      reason: 'Unsubscribe',
      sealLevel: 'L2'
    }
  ];

  const reasonsBreakdown = [
    { reason: 'Too many communications', count: stats.reasons.tooManyCommunications, percentage: 35 },
    { reason: 'Privacy concerns', count: stats.reasons.privacyConcerns, percentage: 22 },
    { reason: 'Not using service', count: stats.reasons.notUsingService, percentage: 18 },
    { reason: 'General unsubscribe', count: stats.reasons.generalUnsubscribe, percentage: 14 },
    { reason: 'Changed preferences', count: stats.reasons.changedPreferences, percentage: 8 },
    { reason: 'Other', count: stats.reasons.other, percentage: 3 }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-slate-800/50 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">● CONSENT WITHDRAWALS</CardTitle>
          <p className="text-slate-400">Track and process withdrawal requests</p>
        </CardHeader>
      </Card>

      {/* Statistics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-800/50 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">THIS MONTH</p>
                <p className="text-2xl font-bold text-white">{stats.thisMonth}</p>
                <p className="text-sm text-red-400">↘ 12%</p>
              </div>
              <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                <UserX size={16} className="text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">AVG PROCESSING</p>
                <p className="text-2xl font-bold text-white">{stats.avgProcessingTime}</p>
                <p className="text-sm text-slate-400">TIME</p>
                <p className="text-sm text-emerald-400">(immediate)</p>
              </div>
              <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                <Clock size={16} className="text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">REASONS</p>
                <p className="text-2xl font-bold text-white">BREAKDOWN</p>
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => setReasonsModalOpen(true)}
                  className="text-cyan-400 p-0 h-auto text-xs"
                >
                  View Chart →
                </Button>
              </div>
              <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                <BarChart3 size={16} className="text-cyan-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Withdrawal Trend Chart */}
      <Card className="bg-slate-800/50 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingDown size={20} />
            WITHDRAWAL TREND
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-end justify-center space-x-2 mb-4">
            {/* Mock chart bars */}
            {[
              { day: 'Jan 6', count: 2, height: '10%' },
              { day: 'Jan 7', count: 4, height: '20%' },
              { day: 'Jan 8', count: 3, height: '15%' },
              { day: 'Jan 9', count: 6, height: '30%' },
              { day: 'Jan 10', count: 8, height: '40%' },
              { day: 'Jan 11', count: 12, height: '60%' },
              { day: 'Jan 12', count: 15, height: '75%' },
              { day: 'Jan 13', count: 18, height: '90%' },
              { day: 'Jan 14', count: 23, height: '100%' },
              { day: 'Jan 15', count: 19, height: '85%' },
              { day: 'Jan 16', count: 16, height: '80%' },
              { day: 'Jan 17', count: 14, height: '70%' },
              { day: 'Jan 18', count: 11, height: '55%' },
              { day: 'Jan 19', count: 9, height: '45%' },
              { day: 'Jan 20', count: 7, height: '35%' }
            ].map((data, index) => (
              <div key={index} className="flex flex-col items-center">
                <div
                  className="w-8 bg-red-500/60 rounded-t hover:bg-red-500/80 transition-colors cursor-pointer"
                  style={{ height: data.height }}
                  title={`${data.day}: ${data.count} withdrawals`}
                ></div>
                <span className="text-xs text-slate-400 mt-2 transform -rotate-45 origin-top">
                  {data.day.split(' ')[1]}
                </span>
              </div>
            ))}
          </div>

          <div className="flex justify-center space-x-8 text-sm text-slate-400">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span>Avg: 7.8/day</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-600 rounded"></div>
              <span>Peak: 23 (Jan 2)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-400 rounded"></div>
              <span>Low: 2 (Jan 6)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Withdrawals Table */}
      <Card className="bg-slate-800/50 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Clock size={20} />
            RECENT WITHDRAWALS
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-800/50 border-slate-700">
                  <TableHead className="text-slate-300">TIME</TableHead>
                  <TableHead className="text-slate-300">USER</TableHead>
                  <TableHead className="text-slate-300">CONSENT TYPE</TableHead>
                  <TableHead className="text-slate-300">METHOD</TableHead>
                  <TableHead className="text-slate-300">REASON</TableHead>
                  <TableHead className="text-slate-300">SEALED</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {withdrawalRecords.map((record, index) => (
                  <TableRow key={index} className="border-slate-700 hover:bg-slate-800/30">
                    <TableCell className="text-slate-300">{record.time}</TableCell>
                    <TableCell className="text-slate-300 font-mono text-sm">{record.user}</TableCell>
                    <TableCell className="text-slate-300">{record.consentType}</TableCell>
                    <TableCell className="text-slate-300">{record.method}</TableCell>
                    <TableCell className="text-slate-300">{record.reason}</TableCell>
                    <TableCell className="text-slate-300">{record.sealLevel}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-slate-400">
              Showing 1-25 of {stats.thisMonth}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled className="border-slate-700 text-slate-500">
                ← Prev
              </Button>
              <Button variant="outline" size="sm" className="border-slate-700 text-slate-300 bg-slate-800">
                1
              </Button>
              <Button variant="outline" size="sm" className="border-slate-700 text-slate-300 hover:bg-slate-800">
                2
              </Button>
              <Button variant="outline" size="sm" className="border-slate-700 text-slate-300 hover:bg-slate-800">
                ...
              </Button>
              <Button variant="outline" size="sm" className="border-slate-700 text-slate-300 hover:bg-slate-800">
                Next →
              </Button>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800">
              <Download size={14} className="mr-2" />
              Export Withdrawals CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Withdrawal Reasons Breakdown Modal */}
      <Dialog open={reasonsModalOpen} onOpenChange={setReasonsModalOpen}>
        <DialogContent className="max-w-2xl bg-slate-900 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl">WITHDRAWAL REASONS</DialogTitle>
            <p className="text-slate-400">January 2026</p>
          </DialogHeader>

          <div className="space-y-6">
            {/* Chart */}
            <div className="space-y-4">
              {reasonsBreakdown.map((reason, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-4 h-4 bg-red-500 rounded"></div>
                    <span className="text-slate-300 text-sm">{reason.reason}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-slate-800 rounded-full h-2">
                      <div
                        className="bg-red-500 h-2 rounded-full"
                        style={{ width: `${reason.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-slate-400 text-xs w-12 text-right">{reason.percentage}% ({reason.count})</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Insight */}
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle size={16} className="text-yellow-400 mt-0.5" />
                <div>
                  <p className="text-white font-medium mb-1">INSIGHT</p>
                  <p className="text-slate-300 text-sm">
                    "Too many communications" is the top reason. Consider reducing email frequency or adding preference options.
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-slate-700">
              <Button variant="outline" onClick={() => setReasonsModalOpen(false)} className="border-slate-700 text-slate-300 hover:bg-slate-800">
                Close
              </Button>
              <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800">
                <Download size={14} className="mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WithdrawalsTab;