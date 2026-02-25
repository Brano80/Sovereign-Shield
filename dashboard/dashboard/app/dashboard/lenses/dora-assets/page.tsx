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
  Settings,
  BarChart3,
  List,
  Network,
  Users,
  Target,
  Computer,
  Shield,
  Archive
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

// Import tab components
import { AssetHealthBanner } from "./components/AssetHealthBanner";
import { KPICards } from "./components/KPICards";
import { DependencyMap } from "./components/DependencyMap";
import { AssetInventoryTable } from "./components/AssetInventoryTable";
import { ThirdPartyProvidersPanel } from "./components/ThirdPartyProvidersPanel";
import { CriticalFunctionsPanel } from "./components/CriticalFunctionsPanel";

// Types
interface AssetStats {
  totalAssets: number;
  criticalAssets: number;
  thirdPartyProviders: number;
  criticalFunctions: number;
  coverageScore: number;
  unclassifiedAssets: number;
  assetsAddedThisMonth: number;
  lastUpdate: string;
}

interface ComplianceStatus {
  status: 'COMPLIANT' | 'ATTENTION' | 'NON-COMPLIANT';
  totalAssets: number;
  criticalAssets: number;
  coverageScore: number;
}

export default function DORAAssetsPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [stats, setStats] = useState<AssetStats>({
    totalAssets: 247,
    criticalAssets: 34,
    thirdPartyProviders: 28,
    criticalFunctions: 12,
    coverageScore: 94,
    unclassifiedAssets: 0,
    assetsAddedThisMonth: 12,
    lastUpdate: '5 min ago'
  });

  const [complianceStatus, setComplianceStatus] = useState<ComplianceStatus>({
    status: 'COMPLIANT',
    totalAssets: 247,
    criticalAssets: 34,
    coverageScore: 94
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
      case 'ATTENTION':
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'NON-COMPLIANT':
        return 'text-red-400 bg-red-500/10 border-red-500/20';
      default:
        return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  };

  const getComplianceStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLIANT':
        return <CheckCircle size={16} />;
      case 'ATTENTION':
        return <AlertTriangle size={16} />;
      case 'NON-COMPLIANT':
        return <XCircle size={16} />;
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
              <h1 className="text-2xl font-bold text-white">DORA ASSETS</h1>
              <p className="text-slate-400 mt-1">Articles 5-9, 28-30 • ICT Asset Management</p>
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
                  console.log('[DORA Assets] Add Asset triggered');
                  // TODO: Implement full functionality
                }}
              >
                <Plus size={14} className="mr-2" />
                Add Asset
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
                  <DropdownMenuItem className="text-slate-300 hover:bg-slate-800" onClick={() => console.log('[DORA Assets] Export as PDF')}>
                    <BarChart3 size={14} className="mr-2" />
                    Asset Report (PDF)
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-slate-300 hover:bg-slate-800" onClick={() => console.log('[DORA Assets] Export All Assets as CSV')}>
                    <List size={14} className="mr-2" />
                    All Assets (CSV)
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-slate-300 hover:bg-slate-800" onClick={() => console.log('[DORA Assets] Export Third Party Providers as CSV')}>
                    <Users size={14} className="mr-2" />
                    Third Party Providers (CSV)
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-slate-300 hover:bg-slate-800" onClick={() => console.log('[DORA Assets] Export Critical Functions as CSV')}>
                    <Target size={14} className="mr-2" />
                    Critical Functions (CSV)
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-slate-300 hover:bg-slate-800" onClick={() => console.log('[DORA Assets] Export Compliance Audit Report')}>
                    <Shield size={14} className="mr-2" />
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
              Total assets: <span className="text-slate-300 font-medium">{complianceStatus.totalAssets}</span> │
              Critical assets: <span className="text-slate-300 font-medium">{complianceStatus.criticalAssets}</span> │
              Coverage: <span className="text-slate-300 font-medium">{complianceStatus.coverageScore}%</span> │
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
                  <p className="text-sm text-slate-400">TOTAL ASSETS</p>
                  <p className="text-2xl font-bold text-white">{stats.totalAssets}</p>
                  <p className="text-sm text-emerald-400">↗ +{stats.assetsAddedThisMonth}</p>
                </div>
                <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                  <Computer size={16} className="text-slate-400" />
                </div>
              </div>
              <div className="mt-2">
                <div className="w-full bg-slate-800 rounded-full h-1">
                  <div className="bg-emerald-500 h-1 rounded-full" style={{ width: '94%' }}></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">CRITICAL ASSETS</p>
                  <p className="text-2xl font-bold text-white">{stats.criticalAssets}</p>
                  <p className="text-sm text-slate-400">14% of total</p>
                  <p className="text-sm text-emerald-400">↗ 2</p>
                </div>
                <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                  <Shield size={16} className="text-red-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">THIRD PARTY</p>
                  <p className="text-lg font-bold text-white">{stats.thirdPartyProviders}</p>
                  <p className="text-sm text-slate-400">External providers</p>
                  <p className="text-sm text-yellow-400">8 critical</p>
                </div>
                <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                  <Users size={16} className="text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">UNCLASSIFIED</p>
                  <p className="text-lg font-bold text-white">{stats.unclassifiedAssets}</p>
                  <p className="text-sm text-slate-400">Require attention</p>
                  <p className="text-sm text-emerald-400">↘ 100%</p>
                </div>
                <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                  <AlertTriangle size={16} className="text-slate-400" />
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
                  <p className="text-sm text-slate-400">CRITICAL FUNCTIONS</p>
                  <p className="text-lg font-bold text-white">{stats.criticalFunctions}</p>
                  <p className="text-sm text-slate-400">Identified & mapped</p>
                  <p className="text-sm text-emerald-400">All mapped</p>
                </div>
                <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                  <Target size={16} className="text-emerald-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">COVERAGE SCORE</p>
                  <p className="text-lg font-bold text-white">{stats.coverageScore}%</p>
                  <p className="text-sm text-slate-400">Documentation</p>
                  <p className="text-sm text-emerald-400">↗ +3%</p>
                </div>
                <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                  <Shield size={16} className="text-emerald-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">DEPENDENCIES</p>
                  <p className="text-lg font-bold text-white">89</p>
                  <p className="text-sm text-slate-400">Mapped relationships</p>
                  <p className="text-sm text-emerald-400">↗ +5</p>
                </div>
                <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                  <Network size={16} className="text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">LAST AUDIT</p>
                  <p className="text-lg font-bold text-white">Dec 20</p>
                  <p className="text-sm text-slate-400">2025</p>
                  <p className="text-sm text-slate-400">Next: Jan 20</p>
                </div>
                <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                  <Archive size={16} className="text-slate-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="px-6 py-4 border-b border-slate-800">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-slate-800/50 border border-slate-800">
            <TabsTrigger value="overview" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white">
              Overview
            </TabsTrigger>
            <TabsTrigger value="inventory" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white">
              Inventory
            </TabsTrigger>
            <TabsTrigger value="dependencies" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white">
              Dependencies
            </TabsTrigger>
            <TabsTrigger value="providers" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white">
              Providers
            </TabsTrigger>
            <TabsTrigger value="functions" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white">
              Functions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <OverviewTab />
          </TabsContent>

          <TabsContent value="inventory" className="mt-6">
            <InventoryTab />
          </TabsContent>

          <TabsContent value="dependencies" className="mt-6">
            <DependenciesTab />
          </TabsContent>

          <TabsContent value="providers" className="mt-6">
            <ProvidersTab />
          </TabsContent>

          <TabsContent value="functions" className="mt-6">
            <FunctionsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// TAB COMPONENTS
// ═══════════════════════════════════════════════════════════════

function OverviewTab() {
  return (
    <div className="space-y-6 px-6">
      {/* Asset Health Banner */}
      <AssetHealthBanner />

      {/* Dependency Map */}
      <DependencyMap />

      {/* Asset Inventory Preview */}
      <AssetInventoryTable showAll={false} />

      {/* Bottom Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ThirdPartyProvidersPanel />
        <CriticalFunctionsPanel />
      </div>
    </div>
  );
}

function InventoryTab() {
  return (
    <div className="space-y-6 px-6">
      <AssetInventoryTable showAll={true} />
    </div>
  );
}

function DependenciesTab() {
  return (
    <div className="space-y-6 px-6">
      <DependencyMap fullScreen={true} />
    </div>
  );
}

function ProvidersTab() {
  return (
    <div className="space-y-6 px-6">
      <ThirdPartyProvidersPanel fullView={true} />
    </div>
  );
}

function FunctionsTab() {
  return (
    <div className="space-y-6 px-6">
      <CriticalFunctionsPanel fullView={true} />
    </div>
  );
}