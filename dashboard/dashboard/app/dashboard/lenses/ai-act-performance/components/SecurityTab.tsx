'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Shield,
  ShieldCheck,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText
} from 'lucide-react';

const SecurityTab: React.FC = () => {
  const securityOverview = {
    overallScore: 92,
    vulnerabilities: 0,
    lastScan: '1 hour ago'
  };

  const securityBySystem = [
    { system: 'Credit Scoring', score: 94, vulns: 0, lastScan: '1h ago', threats: 0, status: 'secure' },
    { system: 'Content Moderation', score: 93, vulns: 0, lastScan: '1h ago', threats: 0, status: 'secure' },
    { system: 'Search Ranking', score: 93, vulns: 0, lastScan: '1h ago', threats: 0, status: 'secure' },
    { system: 'Recommendation', score: 92, vulns: 0, lastScan: '1h ago', threats: 0, status: 'secure' },
    { system: 'HR Recruitment', score: 91, vulns: 1, lastScan: '1h ago', threats: 0, status: 'review' },
    { system: 'Customer Service', score: 90, vulns: 0, lastScan: '1h ago', threats: 0, status: 'secure' }
  ];

  const securityChecks = [
    { name: 'Adversarial Attack Testing', status: 'passed', lastRun: '1h ago', nextRun: 'In 23h' },
    { name: 'Input Validation', status: 'passed', lastRun: '1h ago', nextRun: 'In 23h' },
    { name: 'Model Integrity Verification', status: 'passed', lastRun: '1h ago', nextRun: 'In 23h' },
    { name: 'API Security Scan', status: 'passed', lastRun: '1h ago', nextRun: 'In 23h' },
    { name: 'Dependency Vulnerability Scan', status: 'passed', lastRun: '6h ago', nextRun: 'In 18h' },
    { name: 'Encryption Verification', status: 'passed', lastRun: '1h ago', nextRun: 'In 23h' }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'secure':
        return <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">🟢 Secure</Badge>;
      case 'review':
        return <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20">🟡 Review</Badge>;
      case 'critical':
        return <Badge className="bg-red-500/10 text-red-400 border-red-500/20">🔴 Critical</Badge>;
      default:
        return <Badge className="bg-slate-500/10 text-slate-400 border-slate-500/20">⚪ Unknown</Badge>;
    }
  };

  const getCheckStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle size={16} className="text-emerald-400" />;
      case 'failed':
        return <AlertTriangle size={16} className="text-red-400" />;
      case 'warning':
        return <AlertTriangle size={16} className="text-yellow-400" />;
      default:
        return <Clock size={16} className="text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-2">CYBERSECURITY MONITORING</h2>
        <p className="text-slate-400">AI system security posture and vulnerability management</p>
      </div>

      {/* Security Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-800/50 border-slate-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">OVERALL SCORE</h3>
              <ShieldCheck size={20} className="text-emerald-400" />
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-emerald-400 mb-2">{securityOverview.overallScore}%</p>
              <div className="w-full bg-slate-800 rounded-full h-2">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${securityOverview.overallScore}%` }}></div>
              </div>
              <p className="text-slate-500 text-xs mt-1">Target: {'>'}90%</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">VULNERABILITIES</h3>
              <Shield size={20} className="text-emerald-400" />
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-emerald-400 mb-2">{securityOverview.vulnerabilities}</p>
              <p className="text-emerald-400 text-sm">✓ None found</p>
              <p className="text-slate-500 text-xs mt-1">Open/Critical</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">LAST SCAN</h3>
              <Clock size={20} className="text-slate-400" />
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-white mb-2">{securityOverview.lastScan}</p>
              <p className="text-slate-400 text-sm">All systems</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security by System Table */}
      <Card className="bg-slate-800/50 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">SECURITY BY SYSTEM</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left text-slate-400 font-medium py-3">SYSTEM</th>
                  <th className="text-center text-slate-400 font-medium py-3">SCORE</th>
                  <th className="text-center text-slate-400 font-medium py-3">VULNS</th>
                  <th className="text-center text-slate-400 font-medium py-3">LAST SCAN</th>
                  <th className="text-center text-slate-400 font-medium py-3">THREATS</th>
                  <th className="text-center text-slate-400 font-medium py-3">STATUS</th>
                </tr>
              </thead>
              <tbody>
                {securityBySystem.map((system, index) => (
                  <tr key={index} className="border-b border-slate-800/50 hover:bg-slate-800/20">
                    <td className="py-4 text-white font-medium">{system.system}</td>
                    <td className="text-center text-emerald-400 font-semibold">{system.score}%</td>
                    <td className="text-center text-slate-300">{system.vulns}</td>
                    <td className="text-center text-slate-400">{system.lastScan}</td>
                    <td className="text-center text-slate-300">{system.threats}</td>
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

      {/* Security Checks */}
      <Card className="bg-slate-800/50 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">SECURITY CHECKS</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {securityChecks.map((check, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg">
                <div className="flex items-center gap-3">
                  {getCheckStatusIcon(check.status)}
                  <div>
                    <p className="text-white font-medium">{check.name}</p>
                    <p className="text-slate-400 text-xs">Status: {check.status === 'passed' ? '✓ Passed' : check.status}</p>
                  </div>
                </div>
                <div className="text-right text-sm">
                  <p className="text-slate-300">Last run: {check.lastRun}</p>
                  <p className="text-slate-400">Next: {check.nextRun}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex gap-3">
            <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800">
              <Shield size={14} className="mr-2" />
              Run Full Security Scan
            </Button>
            <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800">
              <FileText size={14} className="mr-2" />
              View Vulnerability Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityTab;