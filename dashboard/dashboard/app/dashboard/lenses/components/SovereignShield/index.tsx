'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw, AlertTriangle, Shield, Eye, Download } from 'lucide-react';
import StatsGrid from './StatsGrid';
import SovereignMap from './SovereignMap';
import EvidenceDetail from './EvidenceDetail';
import TransferLog from './TransferLog';
import SCCRegistry from './SCCRegistry';
import { useSccRegistries } from '@/app/hooks/useSccRegistries';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { SeverityBadge } from '@/components/ui/severity-badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SovereignShieldData, SovereignShieldStats, BlockEvent, ApiCountryData } from './types';
import { complianceApi } from '@/app/lib/api-client';

type TabType = 'overview' | 'transfer-log' | 'scc-registry' | 'adequate-countries';

const SovereignShield: React.FC = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isEmptyState, setIsEmptyState] = useState(false);
  const [recentActivityPage, setRecentActivityPage] = useState(1);
  const recentActivityPageSize = 10;
  const [blockedTransfersPage, setBlockedTransfersPage] = useState(1);
  const blockedTransfersPageSize = 5; // ~52px per row, fits ~5 entries in panel height
  const [data, setData] = useState<SovereignShieldData>({
    status: 'PROTECTED',
    lastScan: new Date().toISOString(),
    stats: {
      totalTransfers: 0,
      activeAdequateCount: 0,
      totalAdequateWhitelistCount: 15,
      sccCoverage: { percentage: 0, trend: 0, covered: 0, total: 0 },
      blockedToday: 0,
      transfersByDestination: [],
      recentBlocks: [],
      pendingApprovals: 0,
      expiringSccs: 0,
      dataVolumeToday: 0,
      highRiskDestinations: 0,
      activeAgents: 0
    },
    isLoading: true,
    error: undefined,
    lastSuccessfulFetch: undefined,
    dataFreshness: 'unknown'
  });

  const [refreshing, setRefreshing] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState<BlockEvent | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [blocksWithEvidence, setBlocksWithEvidence] = useState<Set<string>>(new Set());
  const [evidenceEvents, setEvidenceEvents] = useState<any[]>([]);
  
  // Fetch SCC registries for map logic
  const { data: sccRegistries = [] } = useSccRegistries();

  /**
   * SOVEREIGN SHIELD EMPTY STATE RULE IMPLEMENTATION
   *
   * Rule: When receiving command "enable Sovereign Shield empty state",
   * apply same pattern as "Audit & Evidence" module.
   *
   * Implementation:
   * - Resets data to null/empty while preserving business logic, bug fixes, and API connections
   * - Shows defined placeholder: L1 neutral visual indication, shield icon, title "Sovereign Shield Inactive", CTA button
   * - Achieved through state manipulation, not component code deletion
   *
   * Usage:
   * - Command: window.dispatchEvent(new CustomEvent('sovereignShieldCommand', { detail: 'enable Sovereign Shield empty state' }))
   * - Direct call: window.enableSovereignShieldEmptyState()
   * - Return to normal: window.returnSovereignShieldToNormalState()
   */
  const enableEmptyState = () => {
    console.log('🔧 Sovereign Shield: Enabling empty state as per rule implementation');
    setIsEmptyState(true);
    // Reset data to null/empty while preserving business logic and API connections
    setData({
      status: 'PROTECTED',
      lastScan: new Date().toISOString(),
      stats: {
        totalTransfers: 0,
        activeAdequateCount: 0,
        totalAdequateWhitelistCount: 15,
        sccCoverage: { percentage: 0, trend: 0, covered: 0, total: 0 },
        blockedToday: 0,
        transfersByDestination: [],
        recentBlocks: [],
        pendingApprovals: 0,
        expiringSccs: 0,
        dataVolumeToday: 0,
        highRiskDestinations: 0,
        activeAgents: 0,
        requiresAttention: []
      },
      isLoading: false,
      error: undefined,
      lastSuccessfulFetch: undefined,
      dataFreshness: 'unknown'
    });
  };

  // Function to disable empty state and return to normal operation
  const disableEmptyState = () => {
    setIsEmptyState(false);
    fetchData(); // Re-fetch data to return to normal operation
  };

  const fetchData = async (isRetry = false) => {
    const startTime = Date.now();
    let blockedTodayCount = 0;
    let now = new Date().toISOString();
    let recentBlocks: BlockEvent[] = [];
    try {
      setData(prev => ({
        ...prev,
        isLoading: true,
        error: undefined,
        dataFreshness: isRetry ? 'retrying' : 'loading'
      }));

      let stats: any = {};
      let apiSuccess = false;

      try {
        stats = await complianceApi.get('/lenses/sovereign-shield/stats');
        apiSuccess = true;
        console.log('🔍 Sovereign Shield API response:', stats);
        console.log('🔍 Active Agents from API:', stats.activeAgents, 'or', stats.active_agents);
        console.log('🔍 Requires Attention count from API:', stats.requiresAttention?.length ?? 0);
        if (stats.requiresAttention && stats.requiresAttention.length === 0) {
          console.warn('⚠️ API returned empty requiresAttention array - this might indicate a company_id mismatch');
          console.warn('⚠️ Check if your JWT token has company_id matching the test data');
        }
      } catch (apiError: any) {
        console.error(`❌ API failed (${apiError.message}), using cached/offline mode:`, apiError.message);
        console.error('❌ Full error:', apiError);
        // Check if it's a timeout error
        if (apiError.message?.includes('timeout') || apiError.message?.includes('API unavailable')) {
          console.warn('🔍 API timeout detected - switching to offline mode immediately');
        }
        // Check if it's an authentication error
        if (apiError.message?.includes('Unauthorized') || apiError.message?.includes('401')) {
          console.error('❌ Authentication failed - check your JWT token in localStorage');
        }
      }

      // Always try to fetch evidence events for real-time blocked count
      let fetchedEvents: any[] = [];
      try {
        const evidenceResponse = await complianceApi.getEvidenceEvents();
        fetchedEvents = evidenceResponse.events || [];
        setEvidenceEvents(fetchedEvents);
        console.log('🔍 Evidence events fetched:', fetchedEvents.length, 'events');
        console.log('🔍 Sample evidence event:', fetchedEvents[0] || 'No events');
      } catch (evidenceError: unknown) {
        const errorMessage = evidenceError instanceof Error ? evidenceError.message : 'Unknown error';
        console.warn('Failed to fetch evidence events:', errorMessage);
        fetchedEvents = [];
        setEvidenceEvents([]);
      }

      // Calculate blocked count in last 24 hours (rolling window, matches backend)
      const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000;
      const blockedTodayCount = fetchedEvents.filter((event: any) => {
        if (event.eventType !== 'DATA_TRANSFER_BLOCKED') return false;
        const eventTime = new Date(event.recordedAt || event.createdAt).getTime();
        return eventTime >= twentyFourHoursAgo;
      }).length;

      // Update blocked today count with real evidence data regardless of API success
      if (stats && typeof stats.blockedToday === 'number') {
        stats.blockedToday = blockedTodayCount;
      }

      if (apiSuccess) {
        // Validate successful API response structure
        if (!stats || typeof stats.totalTransfers !== 'number') {
          throw new Error('Invalid API response structure');
        }
      } else {
        // Check if we have cached data from previous successful fetches
        const cachedData = localStorage.getItem('sovereign_shield_cache');
        if (cachedData) {
          try {
            const parsedCache = JSON.parse(cachedData);
            if (parsedCache.timestamp && (Date.now() - parsedCache.timestamp) < 24 * 60 * 60 * 1000) { // 24 hours
              console.log('📦 Using cached Sovereign Shield data (last updated:', new Date(parsedCache.timestamp).toLocaleString(), ')');
              console.log('📦 Cached activeAgents:', parsedCache.stats?.activeAgents ?? parsedCache.stats?.active_agents ?? 'missing');
              // Don't use cached data if it's missing activeAgents - force fresh fetch
              if (parsedCache.stats?.activeAgents === undefined && parsedCache.stats?.active_agents === undefined) {
                console.log('⚠️ Cached data missing activeAgents - clearing cache and forcing fresh fetch');
                localStorage.removeItem('sovereign_shield_cache');
              } else {
                stats = parsedCache.stats;
              }
            }
          } catch (cacheError) {
            console.warn('Failed to parse cached data:', cacheError);
          }
        }

        if (!stats.totalTransfers) {
          stats = {
            totalTransfers: 0,
            activeAdequateCount: 0,
            totalAdequateWhitelistCount: 15,
            sccCoverage: { percentage: 0, trend: 0, covered: 0, total: 0 },
            blockedToday: blockedTodayCount,
            pendingApprovals: 0,
            expiringSccs: 0,
            dataVolumeToday: 0,
            highRiskDestinations: 0,
            activeAgents: 0,
            requiresAttention: []
          };
        }
      }

      // Fetch real country data from /countries API
      let countriesData: ApiCountryData[] = [];
      try {
        countriesData = await complianceApi.get<ApiCountryData[]>('/lenses/sovereign-shield/countries');
      } catch (countriesError: any) {
        console.warn('Failed to fetch countries data:', countriesError.message);
      }

      // Check for recent critical blocked transfer from evidence events
      const recentIncident = fetchedEvents.find((event: any) =>
        event.eventType === 'DATA_TRANSFER_BLOCKED' &&
        event.severity === 'L4'
      );

      // Create recent activity from evidence events — include all transfer types
      const transferEventTypes = ['DATA_TRANSFER', 'DATA_TRANSFER_BLOCKED', 'DATA_TRANSFER_REVIEW'];
      recentBlocks = fetchedEvents
        .filter((event: any) => transferEventTypes.includes(event.eventType))
        .map((event: any) => {
          const payload = event.payload || {};
          const countryName = payload.destination_country ||
                             payload.country_code || 'Unknown';

          // Determine event type badge and color
          const eventType = event.eventType;
          const isBlocked = eventType === 'DATA_TRANSFER_BLOCKED';
          const isReview = eventType === 'DATA_TRANSFER_REVIEW';
          const isTransfer = eventType === 'DATA_TRANSFER';

          return {
            id: event.eventId || event.id,
            timestamp: event.recordedAt || event.createdAt,
            destination: {
              country: countryName,
              countryCode: payload.destination_country_code || payload.country_code || 'XX',
              endpoint: payload.source_country || 'unknown'
            },
            reason: payload.blocked_reason || payload.reason || (isReview ? 'Requires review' : 'Transfer allowed'),
            source: 'Sovereign Shield',
            user: 'system',
            blockLevel: event.severity === 'L4' ? 'L3' :
                       event.severity === 'L3' ? 'L3' :
                       event.severity === 'L2' ? 'L2' : 'L1',
            transferVolume: {
              records: 1,
              size: payload.data_category || 'Unknown'
            },
            shadowMode: false,
            evidenceVault: {
              requestId: event.eventId || event.id,
              sourceIP: payload.source_country || 'unknown',
              dataCategory: payload.data_category || 'Personal Data',
              gdprCitation: 'GDPR Art. 44-49',
              sccStatus: 'NOT_APPLICABLE',
              legalBasis: payload.mechanism || 'None'
            },
            eventType: eventType as 'DATA_TRANSFER' | 'DATA_TRANSFER_BLOCKED' | 'DATA_TRANSFER_REVIEW' // Store event type for badge display
          };
        });

      // Add recent incident if found
      if (recentIncident) {
        const payload = recentIncident.payload || {};

        // Determine destination with fallback logic
        let destinationCountry = payload.location || 'Unknown';
        let destinationEndpoint = payload.destination_ip || 'unknown.endpoint';

        // If destination is empty, check payload.destination
        if (!payload.location && payload.destination) {
          destinationCountry = payload.destination;
        }

        // Add flag for Russian incidents
        if (payload.country_code === 'RU') {
          destinationCountry = `🇷🇺 Russia`;
        }

        recentBlocks.unshift({
          id: recentIncident.id || recentIncident.eventId || 'incident-001',
          timestamp: recentIncident.recordedAt || recentIncident.createdAt || new Date().toISOString(),
          destination: {
            country: destinationCountry,
            countryCode: payload.country_code || 'XX',
            endpoint: destinationEndpoint
          },
          reason: payload.note || 'Attempted transfer to high-risk destination',
          source: recentIncident.eventType === 'UnauthorisedDataTransfer' ? 'Sovereign Shield' : 'Proxy Shield',
          user: payload.subject_id || 'system',
          blockLevel: 'L3', // L4 (Critical) mapped to L3 (Hard Block) for BlockEvent
          transferVolume: {
            records: payload.purpose ? 1 : 1, // Keep as number
            size: payload.purpose || 'AI Gateway' // Use purpose instead of "Unknown"
          },
          shadowMode: false,
          evidenceVault: {
            requestId: recentIncident.eventId || 'incident-req-001',
            sourceIP: payload.destination_ip || 'blocked.ip',
            dataCategory: 'Personal Data',
            gdprCitation: 'GDPR Art. 44, 48',
            sccStatus: 'NOT_APPLICABLE', // Blocked transfers don't have valid SCC status
            legalBasis: payload.legal_basis || 'None'
          }
        });
      }

      console.log('🔍 Sovereign Shield setting data - blockedToday:', stats.blockedToday);
      console.log('🔍 Active Agents before setting:', stats.activeAgents ?? stats.active_agents ?? 'undefined');
      console.log('🔍 Requires Attention count:', stats.requiresAttention?.length ?? 0);
      if (stats.requiresAttention && stats.requiresAttention.length > 0) {
        console.log('✅ Requires Attention items:', stats.requiresAttention.slice(0, 3).map((item: any) => 
          `${item.systemName} -> ${item.destinationCountry} (${item.decision})`
        ));
      } else {
        console.warn('⚠️ Requires Attention is empty - check company_id mismatch');
      }
      console.log('🔍 Full stats object keys:', Object.keys(stats));
      console.log('🔍 Full stats object:', JSON.stringify(stats, null, 2));

      now = new Date().toISOString();
      const fetchDuration = Date.now() - startTime;

      // Cache successful API responses
      if (apiSuccess) {
        localStorage.setItem('sovereign_shield_cache', JSON.stringify({
          stats,
          timestamp: Date.now(),
          fetchDuration
        }));
      }

      // Determine data freshness status
      let dataFreshness: 'fresh' | 'stale' | 'cached' | 'offline' = 'fresh';
      if (!apiSuccess) {
        dataFreshness = stats.totalTransfers > 0 ? 'cached' : 'offline';
      }

      // Determine status based on data and API health
      let status: 'PROTECTED' | 'ATTENTION' | 'AT_RISK' = 'PROTECTED';
      if (!apiSuccess) {
        status = 'ATTENTION'; // API issues but we have cached data
      } else if (stats.blockedToday > 10) {
        status = 'AT_RISK'; // High number of blocks indicates issues
      }


      setData({
        status: fetchedEvents.length > 0 ? status : 'PROTECTED',
        lastScan: now,
        stats: {
          totalTransfers: stats.totalTransfers || 0,
          activeAdequateCount: stats.activeAdequateCount || 0,
          totalAdequateWhitelistCount: stats.totalAdequateWhitelistCount || 15,
          sccCoverage: {
            percentage: stats.scc_coverage?.percentage ?? stats.sccCoverage?.percentage ?? 0,
            trend: stats.scc_coverage?.trend ?? stats.sccCoverage?.trend ?? 0,
            covered: stats.scc_coverage?.covered ?? stats.sccCoverage?.covered ?? 0,
            total: stats.scc_coverage?.total ?? stats.sccCoverage?.total ?? 0
          },
          blockedToday: blockedTodayCount,
          transfersByDestination: countriesData.length > 0 ? countriesData : [],
          recentBlocks: fetchedEvents.length > 0 ? recentBlocks : [],
          pendingApprovals: stats.pendingApprovals || 0,
          expiringSccs: stats.expiringSccs || 0,
          dataVolumeToday: stats.dataVolumeToday || 0,
          highRiskDestinations: stats.highRiskDestinations || 0,
          activeAgents: stats.activeAgents ?? stats.active_agents ?? 0,
          requiresAttention: stats.requiresAttention || []
        },
        isLoading: false,
        error: apiSuccess ? undefined : `API unavailable (${fetchDuration}ms) - using offline mode.`,
        lastSuccessfulFetch: apiSuccess ? now : undefined,
        dataFreshness: fetchedEvents.length > 0 ? dataFreshness : 'offline'
      });

    } catch (outerError) {
      console.error('Error in fetchData:', outerError);
      // Use fallback data structure on error
      const fallbackStats: SovereignShieldStats = {
        totalTransfers: 0,
        activeAdequateCount: 0, // Empty state
        totalAdequateWhitelistCount: 15, // Total countries in adequacy whitelist
        sccCoverage: { percentage: 0, trend: 0, covered: 0, total: 0 },
        blockedToday: blockedTodayCount,
        transfersByDestination: [],
        recentBlocks: recentBlocks || [],
        pendingApprovals: 0,
        expiringSccs: 0,
        dataVolumeToday: 0,
        highRiskDestinations: 0,
        activeAgents: 0
      };

      setData({
        status: 'PROTECTED',
        lastScan: now,
        stats: fallbackStats,
        isLoading: false,
        error: outerError instanceof Error ? outerError.message : 'Unknown error',
        lastSuccessfulFetch: undefined,
        dataFreshness: 'error'
      });
    }

    // Check for evidence existence for all blocks
    try {
      const blocks = recentBlocks || [];
      const evidenceChecks = blocks.map(async (block) => {
        const hasEvidence = await checkEvidenceExists(block.id);
        return { blockId: block.id, hasEvidence };
      });

      const evidenceResults = await Promise.all(evidenceChecks);
      const evidenceSet = new Set<string>();
      evidenceResults.forEach((result: { blockId: string; hasEvidence: boolean }) => {
        if (result.hasEvidence) {
          evidenceSet.add(result.blockId);
        }
      });
      setBlocksWithEvidence(evidenceSet);
    } catch (evidenceError) {
      console.error('Error checking evidence existence:', evidenceError);
      setBlocksWithEvidence(new Set());
    }
  };

  useEffect(() => {
    fetchData();

    // Expose empty state functions to window for command execution
    if (typeof window !== 'undefined') {
      (window as any).sovereignShieldEmptyState = enableEmptyState;
      (window as any).sovereignShieldNormalState = disableEmptyState;

      // Listen for the specific command "enable Sovereign Shield empty state"
      const handleEmptyStateCommand = (event: CustomEvent) => {
        if (event.detail === 'enable Sovereign Shield empty state') {
          console.log('🎯 Command received: "enable Sovereign Shield empty state" - applying empty state pattern');
          enableEmptyState();
        } else if (event.detail === 'return Sovereign Shield to normal state') {
          console.log('🎯 Command received: "return Sovereign Shield to normal state" - returning to normal operation');
          disableEmptyState();
        }
      };

      // Also expose direct function calls for testing
      (window as any).enableSovereignShieldEmptyState = () => {
        console.log('🎯 Direct function call: enableSovereignShieldEmptyState()');
        enableEmptyState();
      };
      (window as any).returnSovereignShieldToNormalState = () => {
        console.log('🎯 Direct function call: returnSovereignShieldToNormalState()');
        disableEmptyState();
      };

      window.addEventListener('sovereignShieldCommand' as any, handleEmptyStateCommand as any);

      return () => {
        window.removeEventListener('sovereignShieldCommand' as any, handleEmptyStateCommand as any);
      };
    }
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const handleBlockClick = (block: BlockEvent) => {
    setSelectedBlock(block);
    setDrawerOpen(true);
  };

  const handleViewEvidence = (block: BlockEvent) => {
    // Navigate to Audit & Evidence page with eventId parameter
    router.push(`/audit-evidence?eventId=${block.id}`);
  };

  const checkEvidenceExists = async (blockId: string): Promise<boolean> => {
    try {
      const result = await complianceApi.get<{ events?: any[] }>(`/evidence/events?limit=1&search=${blockId}`);
      return !!(result.events && result.events.length > 0);
    } catch (error: unknown) {
      console.error('Error checking evidence existence:', error);
      return false;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PROTECTED':
        return 'text-green-400 bg-green-500/10 border-green-500/20';
      case 'ATTENTION':
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'AT_RISK':
        return 'text-red-400 bg-red-500/10 border-red-500/20';
      default:
        return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PROTECTED':
        return <Shield className="w-5 h-5" />;
      case 'ATTENTION':
        return <AlertTriangle className="w-5 h-5" />;
      case 'AT_RISK':
        return <AlertTriangle className="w-5 h-5" />;
      default:
        return <Shield className="w-5 h-5" />;
    }
  };


  if (data.error) {
    const isAuthError = data.error.includes('Authentication failed') || data.error.includes('No authentication token');

    return (
      <div className="min-h-screen bg-slate-950 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-medium">
                {isAuthError ? 'Authentication Required' : 'Error loading Sovereign Shield data'}
              </span>
            </div>
            <p className="text-red-300 mt-2">{data.error}</p>
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleRefresh}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
              {isAuthError && (
                <button
                  onClick={() => router.push('/')}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2"
                >
                  Go to Developer Login
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Empty State UI - applied when "daj Sovereign Shield do stavu empty state" command is issued
  if (isEmptyState) {
    return (
      <div className="min-h-screen bg-slate-950 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              {/* L1 Neutral Visual Indication */}
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500/10 border border-blue-500/20 rounded-full mb-4 relative">
                <Shield className="w-8 h-8 text-blue-400" />
                <div className="absolute -top-2 -right-2">
                  <SeverityBadge level={1} />
                </div>
              </div>

              {/* Title */}
              <h1 className="text-3xl font-bold text-white mb-4">
                Sovereign Shield Inactive
              </h1>

              {/* Description */}
              <p className="text-slate-400 mb-8 max-w-md mx-auto">
                The Sovereign Shield module is currently inactive. Enable it to monitor international data transfers and ensure GDPR Art. 44-49 compliance.
              </p>

              {/* CTA Button to Start Wizard */}
              <button
                onClick={disableEmptyState}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
              >
                <Shield className="w-5 h-5" />
                Start Sovereign Shield Wizard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold text-white">SOVEREIGN SHIELD</h1>
            <p className="text-slate-400">GDPR Art. 44-49 • International Data Transfers</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-transparent border border-slate-700 text-slate-300 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <div className="relative">
              <button className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors">
                <Download className="w-4 h-4" />
                Export
                <span className="ml-1">▾</span>
              </button>
            </div>
          </div>
        </div>

        {/* Status Header Bar */}
        <div className="mt-6 flex items-center gap-4">
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium ${getStatusColor(data.status)}`}>
            {getStatusIcon(data.status)}
            Status: {data.status === 'PROTECTED' ? 'ENABLED' : data.status}
          </div>

          <div className="text-sm text-slate-400 flex items-center gap-4">
            <span>
              Total transfers: <span className="text-slate-300 font-medium">{data.stats?.totalTransfers?.toLocaleString() || '0'}</span>
            </span>
            <span>
              Adequate countries: <span className="text-slate-300 font-medium">{data.stats?.activeAdequateCount ?? 0}/{data.stats?.totalAdequateWhitelistCount ?? 15}</span>
            </span>
            <span>
              SCC Coverage by Destination: <span className="text-slate-300 font-medium">{data.stats?.sccCoverage?.percentage || 0}%</span>
            </span>
            <span className="flex items-center gap-1">
              Last scan: <span className="text-slate-300 font-medium">
                {data.lastSuccessfulFetch ?
                  `${Math.floor((Date.now() - new Date(data.lastSuccessfulFetch).getTime()) / 1000 / 60)} min ago` :
                  'Never'
                }
              </span>
              {data.dataFreshness && (
                <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                  data.dataFreshness === 'fresh' ? 'bg-green-500/20 text-green-400' :
                  data.dataFreshness === 'cached' ? 'bg-yellow-500/20 text-yellow-400' :
                  data.dataFreshness === 'offline' ? 'bg-orange-500/20 text-orange-400' :
                  data.dataFreshness === 'error' ? 'bg-red-500/20 text-red-400' :
                  'bg-slate-500/20 text-slate-400'
                }`}>
                  {data.dataFreshness === 'fresh' ? '🔄 Live' :
                   data.dataFreshness === 'cached' ? '💾 Cached' :
                   data.dataFreshness === 'offline' ? 'Offline' :
                   data.dataFreshness === 'error' ? '❌ Error' :
                   '⏳ Loading'}
                </span>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Error Banner for Non-Critical Errors */}
      {data.error && !data.error.includes('Authentication') && (
        <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <div className="flex items-center gap-2 text-yellow-400">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-medium">
              {data.errorType === 'network' ? 'Connection Issue' :
               data.errorType === 'server' ? 'Server Unavailable' :
               data.errorType === 'validation' ? 'Data Error' :
               'Data Loading Issue'}
            </span>
          </div>
          <p className="text-yellow-300 mt-2 text-sm">{data.error}</p>
          <div className="flex items-center gap-2 mt-3 text-xs text-slate-400">
            <span>Using {data.dataFreshness === 'cached' ? 'cached data' : data.dataFreshness === 'offline' ? 'offline mode' : 'fallback data'}</span>
            {data.lastSuccessfulFetch && (
              <span>• Last successful fetch: {Math.floor((Date.now() - new Date(data.lastSuccessfulFetch).getTime()) / 1000 / 60)} min ago</span>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchData(true)}
            className="mt-3 border-yellow-500/20 text-yellow-400 hover:bg-yellow-500/10"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry Connection
          </Button>
        </div>
      )}

      {/* Loading State Banner */}
      {data.isLoading && (
        <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <div className="flex items-center gap-2 text-blue-400">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span className="font-medium">Refreshing Sovereign Shield Data</span>
          </div>
          <p className="text-blue-300 mt-2 text-sm">
            {data.dataFreshness === 'retrying' ? 'Retrying connection...' : 'Fetching latest compliance metrics...'}
          </p>
        </div>
      )}

      {/* KPI Cards */}
      <StatsGrid
        stats={data.stats}
        isLoading={data.isLoading}
        dataFreshness={data.dataFreshness}
        evidenceEvents={evidenceEvents}
        countriesData={data.stats?.transfersByDestination || []}
      />

      {/* Tab Navigation */}
      <div className="px-6 py-4 border-b border-slate-800">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabType)} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-slate-800/50 border border-slate-800">
            <TabsTrigger value="overview" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white">
              Overview
            </TabsTrigger>
            <TabsTrigger value="transfer-log" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white">
              Transfer Log
            </TabsTrigger>
            <TabsTrigger value="scc-registry" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white">
              SCC Registry
            </TabsTrigger>
            <TabsTrigger value="adequate-countries" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white">
              Adequate Countries
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Top Row - Transfer Map (left, ~60%) + Requires Attention (right, ~40%) */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Transfer Map - Takes 3/5 columns (~60%) */}
            <div className="lg:col-span-3">
              <SovereignMap
                countries={data.stats.transfersByDestination}
                evidenceEvents={evidenceEvents}
                isLoading={data.isLoading}
                sccRegistries={sccRegistries}
              />
            </div>

            {/* Requires Attention Panel - Takes 2/5 columns (~40%) */}
            <div className="lg:col-span-2">
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 h-full">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">⚠ REQUIRES ATTENTION</h3>
                  <button className="text-blue-400 hover:text-blue-300 text-sm">View All →</button>
                </div>

                {(() => {
                  // Use requiresAttention from stats API (SCC-required countries with transfers but no SCC registered)
                  const requiresAttention = data.stats?.requiresAttention || [];
                  const hasRequiresAttention = requiresAttention.length > 0;

                  // Empty state: All SCC-required transfers are covered
                  if (!hasRequiresAttention) {
                    return (
                      <div className="text-center text-slate-400 py-6">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-green-400 font-medium">All SCC-required transfers are covered</span>
                        </div>
                        <div className="text-sm mt-1">No action required</div>
                      </div>
                    );
                  }

                  // Paginate requires attention entries
                  const attentionStartIndex = (blockedTransfersPage - 1) * blockedTransfersPageSize;
                  const attentionEndIndex = attentionStartIndex + blockedTransfersPageSize;
                  const paginatedAttention = requiresAttention.slice(attentionStartIndex, attentionEndIndex);
                  const attentionTotalPages = Math.ceil(requiresAttention.length / blockedTransfersPageSize);

                  // Format timestamp helper
                  const formatTimestamp = (timestamp: string) => {
                    try {
                      const date = new Date(timestamp);
                      const now = new Date();
                      const diffMs = now.getTime() - date.getTime();
                      const diffMins = Math.floor(diffMs / 60000);
                      const diffHours = Math.floor(diffMs / 3600000);
                      const diffDays = Math.floor(diffMs / 86400000);

                      if (diffMins < 1) return 'Just now';
                      if (diffMins < 60) return `${diffMins}m ago`;
                      if (diffHours < 24) return `${diffHours}h ago`;
                      if (diffDays < 7) return `${diffDays}d ago`;
                      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    } catch {
                      return 'Unknown';
                    }
                  };

                  // Truncate agent ID helper
                  const truncateAgentId = (agentId: string, maxLength: number = 20) => {
                    if (!agentId) return 'Unknown';
                    if (agentId.length <= maxLength) return agentId;
                    return `${agentId.substring(0, maxLength - 3)}...`;
                  };

                  return (
                    <div className="space-y-3">
                      {/* SCC-Required Countries Without SCCs */}
                      <div className="space-y-2">
                        {paginatedAttention.map((entry: any) => {
                          const countryName = entry.destinationCountry || entry.destination_country || 'Unknown';
                          const agentId = entry.systemName || entry.system_name || 'Unknown';
                          // Use new grouped fields: occurrenceCount, firstSeen, lastSeen
                          const occurrenceCount = entry.occurrenceCount || entry.occurrence_count || 1;
                          const firstSeen = entry.firstSeen || entry.first_seen || entry.recordedAt || entry.recorded_at;
                          const lastSeen = entry.lastSeen || entry.last_seen || entry.recordedAt || entry.recorded_at;
                          // Read decision field from backend (defaults to REVIEW if missing)
                          const decision = entry.decision || 'REVIEW';
                          const isBlocked = decision === 'BLOCKED';

                          // Format time helper for first/last seen
                          const formatTime = (timestamp: string) => {
                            try {
                              const date = new Date(timestamp);
                              return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
                            } catch {
                              return 'N/A';
                            }
                          };

                          return (
                            <div 
                              key={entry.eventId || entry.event_id}
                              className={`flex items-center justify-between p-2.5 rounded-lg transition-colors ${
                                isBlocked 
                                  ? 'bg-red-500/10 border border-red-500/20 hover:bg-red-500/15'
                                  : 'bg-orange-500/10 border border-orange-500/20 hover:bg-orange-500/15'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                                {/* Badge: Red "Permanently Blocked" for BLOCKED, Orange "SCC Required" for REVIEW */}
                                {isBlocked ? (
                                  <div className="px-1.5 py-0.5 bg-red-500/20 border border-red-500/40 rounded text-xs font-medium text-red-300 flex-shrink-0">
                                    Permanently Blocked
                                  </div>
                                ) : (
                                  <div className="px-1.5 py-0.5 bg-orange-500/20 border border-orange-500/40 rounded text-xs font-medium text-orange-300 flex-shrink-0">
                                    SCC Required
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <div className="text-white font-medium text-sm truncate">{countryName}</div>
                                  <div className="flex items-center gap-2 text-xs text-slate-400 flex-wrap">
                                    <span className="truncate">{truncateAgentId(agentId, 18)}</span>
                                    {occurrenceCount > 1 && (
                                      <>
                                        <span>•</span>
                                        <span className="font-medium text-slate-300">{occurrenceCount} occurrences</span>
                                      </>
                                    )}
                                    <span>•</span>
                                    <span>First: {formatTime(firstSeen)}</span>
                                    <span>•</span>
                                    <span>Last: {formatTime(lastSeen)}</span>
                                  </div>
                                </div>
                              </div>
                              {/* Only show "Register SCC →" button for REVIEW entries (not BLOCKED) */}
                              {!isBlocked && (
                                <button 
                                  onClick={() => router.push('/dashboard/scc-registry')}
                                  className="px-2.5 py-1 bg-orange-600 hover:bg-orange-700 text-white text-xs rounded flex-shrink-0 ml-2"
                                >
                                  Register SCC →
                                </button>
                              )}
                            </div>
                          );
                        })}

                        {/* Pagination for Requires Attention */}
                        {attentionTotalPages > 1 && (
                          <div className="flex items-center justify-between pt-2 border-t border-slate-700">
                            <div className="text-xs text-slate-400">
                              Showing {attentionStartIndex + 1}-{Math.min(attentionEndIndex, requiresAttention.length)} of {requiresAttention.length}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => setBlockedTransfersPage(Math.max(1, blockedTransfersPage - 1))}
                                disabled={blockedTransfersPage === 1}
                                className="px-2 py-0.5 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed rounded text-xs text-white transition-colors"
                              >
                                Prev
                              </button>
                              <button
                                onClick={() => setBlockedTransfersPage(Math.min(attentionTotalPages, blockedTransfersPage + 1))}
                                disabled={blockedTransfersPage === attentionTotalPages}
                                className="px-2 py-0.5 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed rounded text-xs text-white transition-colors"
                              >
                                Next
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>

          {/* Bottom Row - Recent Activity (full width) */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">RECENT ACTIVITY</h3>
              <div className="flex items-center gap-2">
                <select className="bg-slate-700 border border-slate-600 rounded px-2 py-1 text-sm text-white">
                  <option>All</option>
                  <option>Today</option>
                  <option>Last 7 days</option>
                </select>
                <input
                  type="text"
                  placeholder="🔍 Search..."
                  className="bg-slate-700 border border-slate-600 rounded px-2 py-1 text-sm text-white placeholder-slate-400"
                />
              </div>
            </div>

            {data.isLoading ? (
              <div className="text-center text-slate-400 py-8">Loading activity data...</div>
            ) : data.stats.recentBlocks.length === 0 ? (
              <div className="text-center text-slate-400 py-8">No recent activity</div>
            ) : (() => {
              const startIndex = (recentActivityPage - 1) * recentActivityPageSize;
              const endIndex = startIndex + recentActivityPageSize;
              const paginatedBlocks = data.stats.recentBlocks.slice(startIndex, endIndex);
              const totalPages = Math.ceil(data.stats.recentBlocks.length / recentActivityPageSize);

              return (
                <>
                  <div className="space-y-2">
                    {paginatedBlocks.map((block) => {
                      const eventType = (block as any).eventType || 'DATA_TRANSFER_BLOCKED';
                      const isBlocked = eventType === 'DATA_TRANSFER_BLOCKED';
                      const isReview = eventType === 'DATA_TRANSFER_REVIEW';
                      const isTransfer = eventType === 'DATA_TRANSFER';

                      return (
                        <div
                          key={block.id}
                          className="bg-slate-800/50 rounded-lg p-3 border border-slate-600/50 cursor-pointer hover:bg-slate-800/70 transition-colors"
                          onClick={() => handleBlockClick(block)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${
                                isBlocked ? 'bg-red-400' : isReview ? 'bg-orange-400' : 'bg-green-400'
                              }`} />
                              <span className="text-xs text-slate-400 font-mono">
                                {new Date(block.timestamp).toLocaleString()}
                              </span>
                              <Badge className={
                                isBlocked 
                                  ? 'bg-red-500/20 text-red-400 border-red-500/50'
                                  : isReview
                                  ? 'bg-orange-500/20 text-orange-400 border-orange-500/50'
                                  : 'bg-green-500/20 text-green-400 border-green-500/50'
                              }>
                                {isBlocked ? 'BLOCK' : isReview ? 'REVIEW' : 'ALLOW'}
                              </Badge>
                            </div>
                            <span className="text-xs text-slate-500">
                              {block.source === 'Sovereign Shield' ? 'Sovereign Shield' : `${block.destination.country}`}
                            </span>
                          </div>
                          <div className="mt-1 text-xs text-slate-400">
                            → {block.destination.countryCode || block.destination.country} | 
                            {block.evidenceVault?.legalBasis ? ` Legal Basis: ${block.evidenceVault.legalBasis}` : ' Legal Basis: NONE'}
                            {block.shadowMode && ' | Shadow Mode'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-700">
                      <div className="text-sm text-slate-400">
                        Showing {startIndex + 1}-{Math.min(endIndex, data.stats.recentBlocks.length)} of {data.stats.recentBlocks.length}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setRecentActivityPage(Math.max(1, recentActivityPage - 1))}
                          disabled={recentActivityPage === 1}
                          className="px-3 py-1 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed rounded text-sm text-white transition-colors"
                        >
                          Previous
                        </button>
                        <span className="text-sm text-slate-400">
                          Page {recentActivityPage} of {totalPages}
                        </span>
                        <button
                          onClick={() => setRecentActivityPage(Math.min(totalPages, recentActivityPage + 1))}
                          disabled={recentActivityPage === totalPages}
                          className="px-3 py-1 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed rounded text-sm text-white transition-colors"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        </div>
      )}

      {activeTab === 'transfer-log' && (
        <TransferLog isLoading={data.isLoading} />
      )}

      {activeTab === 'scc-registry' && (
        <SCCRegistry isLoading={data.isLoading} />
      )}

      {activeTab === 'adequate-countries' && (
        <div className="p-6">
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-2">EU-Recognised Adequate Countries</h3>
            <p className="text-sm text-slate-400 mb-6">Countries with valid EU Commission adequacy decisions</p>
            
            {data.isLoading ? (
              <div className="animate-pulse space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 bg-slate-700 rounded"></div>
                ))}
              </div>
            ) : (() => {
              // Filter to only show adequate countries
              const adequateCountries = (data.stats?.transfersByDestination || []).filter(
                (country: ApiCountryData) => country.status === 'adequate_protection'
              );
              
              // Helper function to get country flag emoji
              const getCountryFlag = (code: string): string => {
                const flagMap: Record<string, string> = {
                  'AT': '🇦🇹', 'BE': '🇧🇪', 'BG': '🇧🇬', 'HR': '🇭🇷', 'CY': '🇨🇾',
                  'CZ': '🇨🇿', 'DK': '🇩🇰', 'EE': '🇪🇪', 'FI': '🇫🇮', 'FR': '🇫🇷',
                  'DE': '🇩🇪', 'GR': '🇬🇷', 'HU': '🇭🇺', 'IE': '🇮🇪', 'IT': '🇮🇹',
                  'LV': '🇱🇻', 'LT': '🇱🇹', 'LU': '🇱🇺', 'MT': '🇲🇹', 'NL': '🇳🇱',
                  'PL': '🇵🇱', 'PT': '🇵🇹', 'RO': '🇷🇴', 'SK': '🇸🇰', 'SI': '🇸🇮',
                  'ES': '🇪🇸', 'SE': '🇸🇪', 'IS': '🇮🇸', 'LI': '🇱🇮', 'NO': '🇳🇴',
                  'CH': '🇨🇭', 'AD': '🇦🇩', 'AR': '🇦🇷', 'CA': '🇨🇦', 'FO': '🇫🇴',
                  'GG': '🇬🇬', 'IL': '🇮🇱', 'IM': '🇮🇲', 'JP': '🇯🇵', 'JE': '🇯🇪',
                  'NZ': '🇳🇿', 'KR': '🇰🇷', 'GB': '🇬🇧', 'UY': '🇺🇾'
                };
                return flagMap[code?.toUpperCase()] || '🌍';
              };
              
              return adequateCountries.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {adequateCountries.map((country: ApiCountryData) => (
                    <div key={country.code} className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg border border-slate-600/50">
                      <span className="text-2xl">{getCountryFlag(country.code)}</span>
                      <div className="flex-1">
                        <div className="text-white font-medium">{country.name}</div>
                        <div className="text-xs text-slate-400 font-mono">{country.code}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-slate-400">No adequate countries data available</p>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Evidence Detail Drawer */}
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle className="text-white">Block Evidence Detail</DrawerTitle>
          </DrawerHeader>
          {selectedBlock && <EvidenceDetail blockEvent={selectedBlock} />}
        </DrawerContent>
      </Drawer>

    </div>
  );
};

export default SovereignShield;
