'use client';

import React, { useState, useEffect } from 'react';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Plus,
  Download,
  ChevronDown,
  Eye,
  BarChart3,
  FileText,
  MapPin,
  UserX,
  Shield,
  ShieldCheck,
  Zap,
  Archive
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

// Import tab components (will create these next)
import OverviewTab from './components/OverviewTab';
import ConsentRegistryTab from './components/ConsentRegistryTab';
import LawfulBasisTab from './components/LawfulBasisTab';
import ConsentTypesTab from './components/ConsentTypesTab';
import CollectionPointsTab from './components/CollectionPointsTab';
import WithdrawalsTab from './components/WithdrawalsTab';

// Types
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

interface ComplianceStatus {
  status: 'COMPLIANT' | 'NON-COMPLIANT' | 'WARNING';
  validConsents: number;
  consentRate: number;
}

const GDPRConsent: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [stats, setStats] = useState<ConsentStats>({
    totalConsents: 12340,
    consentRate: 73.2,
    validConsents: 10987,
    expiringSoon: 89,
    expiredConsents: 371,
    withdrawnConsents: 234,
    blockedToday: 847,
    withdrawalsThisMonth: 234,
    avgConsentAge: 8.2,
    lawfulBasisCoverage: 94,
    lastUpdate: '3 min ago'
  });

  const [complianceStatus, setComplianceStatus] = useState<ComplianceStatus>({
    status: 'COMPLIANT',
    validConsents: 10987,
    consentRate: 73.2
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  const getComplianceStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLIANT':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'NON-COMPLIANT':
        return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'WARNING':
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      default:
        return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  };

  const getComplianceStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLIANT':
        return <CheckCircle size={16} />;
      case 'NON-COMPLIANT':
        return <XCircle size={16} />;
      case 'WARNING':
        return <AlertTriangle size={16} />;
      default:
        return <AlertTriangle size={16} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-800/50 backdrop-blur supports-[backdrop-filter]:bg-slate-800/50">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">GDPR CONSENT</h1>
              <p className="text-slate-400 mt-1">Articles 6-7 • Lawful Basis & Consent Management</p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                <RefreshCw size={14} className={`mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
                onClick={() => {
                  console.log('[GDPR Consent] New Consent Type triggered');
                  // TODO: Implement full functionality
                }}
              >
                <Plus size={14} className="mr-2" />
                New Consent Type
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-slate-700 text-slate-300 hover:bg-slate-800"
                  >
                    <Download size={14} className="mr-2" />
                    Export <ChevronDown size={14} className="ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-slate-900 border-slate-700">
                  <DropdownMenuItem className="text-slate-300 hover:bg-slate-800" onClick={() => console.log('[GDPR Consent] Export as PDF')}>
                    <FileText size={14} className="mr-2" />
                    Consent Report (PDF)
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-slate-300 hover:bg-slate-800" onClick={() => console.log('[GDPR Consent] Export All Consents as CSV')}>
                    <BarChart3 size={14} className="mr-2" />
                    All Consents (CSV)
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-slate-300 hover:bg-slate-800" onClick={() => console.log('[GDPR Consent] Export Consent by Purpose as CSV')}>
                    <BarChart3 size={14} className="mr-2" />
                    Consent by Purpose (CSV)
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-slate-300 hover:bg-slate-800" onClick={() => console.log('[GDPR Consent] Export Withdrawals as CSV')}>
                    <UserX size={14} className="mr-2" />
                    Withdrawals (CSV)
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-slate-300 hover:bg-slate-800" onClick={() => console.log('[GDPR Consent] Export Lawful Basis Documentation')}>
                    <Shield size={14} className="mr-2" />
                    Lawful Basis Documentation
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-slate-300 hover:bg-slate-800" onClick={() => console.log('[GDPR Consent] Export Compliance Audit Report')}>
                    <ShieldCheck size={14} className="mr-2" />
                    Compliance Audit Report
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Status Banner */}
          <div className="mt-6 flex items-center gap-4">
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium ${getComplianceStatusColor(complianceStatus.status)}`}>
              {getComplianceStatusIcon(complianceStatus.status)}
              Status: {complianceStatus.status}
            </div>

            <div className="text-sm text-slate-400">
              Valid consents: <span className="text-slate-300 font-medium">{complianceStatus.validConsents.toLocaleString()}</span> │
              Consent rate: <span className="text-slate-300 font-medium">{complianceStatus.consentRate}%</span> │
              Last update: <span className="text-slate-300 font-medium">{stats.lastUpdate}</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="px-6 py-6 border-b border-slate-800">
        {/* Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="bg-slate-800/50 border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">TOTAL CONSENTS</p>
                  <p className="text-2xl font-bold text-white">{stats.totalConsents.toLocaleString()}</p>
                  <p className="text-sm text-emerald-400">↗ 8%</p>
                </div>
                <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                  <BarChart3 size={16} className="text-slate-400" />
                </div>
              </div>
              <div className="mt-2">
                <div className="w-full bg-slate-800 rounded-full h-1">
                  <div className="bg-emerald-500 h-1 rounded-full" style={{ width: '73%' }}></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">CONSENT RATE</p>
                  <p className="text-2xl font-bold text-white">{stats.consentRate}%</p>
                  <p className="text-sm text-emerald-400">↗ 2.1%</p>
                  <p className="text-xs text-slate-500 mt-1">Target: 80%</p>
                </div>
                <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                  <CheckCircle size={16} className="text-emerald-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">WITHDRAWALS</p>
                  <p className="text-lg font-bold text-white">{stats.withdrawalsThisMonth}</p>
                  <p className="text-sm text-slate-400">This Month</p>
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
                  <p className="text-sm text-slate-400">BLOCKED TODAY</p>
                  <p className="text-lg font-bold text-white">{stats.blockedToday}</p>
                  <p className="text-sm text-slate-400">(No Consent)</p>
                  <p className="text-sm text-red-400">↘ 5%</p>
                </div>
                <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                  <XCircle size={16} className="text-red-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-slate-800/50 border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">EXPIRING SOON</p>
                  <p className="text-lg font-bold text-white">{stats.expiringSoon}</p>
                  <p className="text-sm text-slate-400">within 30 days</p>
                  <Button variant="link" size="sm" className="text-cyan-400 p-0 h-auto text-xs">
                    View All →
                  </Button>
                </div>
                <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                  <AlertTriangle size={16} className="text-yellow-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">PENDING</p>
                  <p className="text-lg font-bold text-white">156</p>
                  <p className="text-sm text-slate-400">RE-CONSENT</p>
                  <p className="text-sm text-slate-400">Annual renewal</p>
                </div>
                <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                  <RefreshCw size={16} className="text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">AVG CONSENT</p>
                  <p className="text-lg font-bold text-white">{stats.avgConsentAge} months</p>
                  <p className="text-sm text-emerald-400">↗ 1.2mo</p>
                </div>
                <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                  <Archive size={16} className="text-slate-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">LAWFUL BASIS</p>
                  <p className="text-lg font-bold text-white">{stats.lawfulBasisCoverage}%</p>
                  <p className="text-sm text-slate-400">6/6 purposes</p>
                </div>
                <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                  <Shield size={16} className="text-emerald-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="px-6 py-4 border-b border-slate-800">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 bg-slate-800/50 border border-slate-800">
            <TabsTrigger value="overview" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white">
              Overview
            </TabsTrigger>
            <TabsTrigger value="registry" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white">
              Consent Registry
            </TabsTrigger>
            <TabsTrigger value="lawful-basis" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white">
              Lawful Basis
            </TabsTrigger>
            <TabsTrigger value="consent-types" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white">
              Consent Types
            </TabsTrigger>
            <TabsTrigger value="collection-points" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white">
              Collection Points
            </TabsTrigger>
            <TabsTrigger value="withdrawals" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white">
              Withdrawals
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <OverviewTab stats={stats} />
          </TabsContent>

          <TabsContent value="registry" className="mt-6">
            <ConsentRegistryTab />
          </TabsContent>

          <TabsContent value="lawful-basis" className="mt-6">
            <LawfulBasisTab />
          </TabsContent>

          <TabsContent value="consent-types" className="mt-6">
            <ConsentTypesTab />
          </TabsContent>

          <TabsContent value="collection-points" className="mt-6">
            <CollectionPointsTab />
          </TabsContent>

          <TabsContent value="withdrawals" className="mt-6">
            <WithdrawalsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default GDPRConsent;