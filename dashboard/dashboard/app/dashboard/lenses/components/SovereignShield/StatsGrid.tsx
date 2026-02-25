'use client';

import React from 'react';
import { Shield, MapPin, AlertTriangle, TrendingUp, TrendingDown, Info } from 'lucide-react';
import { SovereignShieldStats } from './types';

interface StatsGridProps {
  stats: SovereignShieldStats | null;
  isLoading?: boolean;
  dataFreshness?: 'fresh' | 'stale' | 'cached' | 'offline' | 'error' | 'loading' | 'retrying' | 'unknown';
  evidenceEvents?: any[];
  countriesData?: any[];
}

const KPICard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: number;
  subtitle?: string;
  color?: string;
  showProgress?: boolean;
  progressValue?: number;
  progressTarget?: number;
  showViewAll?: boolean;
  onViewAll?: () => void;
  showSparkline?: boolean;
  dataFreshness?: 'fresh' | 'stale' | 'cached' | 'offline' | 'error' | 'loading' | 'retrying' | 'unknown';
}> = ({
  title,
  value,
  icon,
  trend,
  subtitle,
  color = 'text-white',
  showProgress = false,
  progressValue,
  progressTarget,
  showViewAll = false,
  onViewAll,
  showSparkline = false,
  dataFreshness
}) => {
  const trendColor = trend && trend > 0 ? 'text-green-400' : 'text-red-400';
  const trendIcon = trend && trend > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />;

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <div className="text-slate-400 text-sm font-medium">{title}</div>
            {dataFreshness && title === 'TRANSFERS (24H)' && (
              <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                dataFreshness === 'fresh' ? 'bg-green-500/20 text-green-400' :
                dataFreshness === 'cached' ? 'bg-yellow-500/20 text-yellow-400' :
                dataFreshness === 'offline' ? 'bg-red-500/20 text-red-400' :
                dataFreshness === 'error' ? 'bg-red-500/20 text-red-400' :
                'bg-slate-500/20 text-slate-400'
              }`}>
                {dataFreshness === 'fresh' ? 'Live' :
                 dataFreshness === 'cached' ? 'Cached' :
                 dataFreshness === 'offline' ? 'Offline' :
                 dataFreshness === 'error' ? 'Error' :
                 'Loading'}
              </span>
            )}
          </div>
          <div className={`text-2xl font-bold ${color} mb-1`}>{value}</div>
          {trend !== undefined && (
            <div className={`flex items-center gap-1 text-xs ${trendColor}`}>
              {trendIcon}
              {Math.abs(trend)}%
            </div>
          )}
          {subtitle && <div className="text-xs text-slate-500 mt-1">{subtitle}</div>}
          {showViewAll && (
            <button
              onClick={onViewAll}
              className="text-cyan-400 text-xs mt-1 hover:text-cyan-300 transition-colors"
            >
              View All →
            </button>
          )}
          {showProgress && progressValue !== undefined && progressTarget !== undefined && (
            <div className="mt-2">
              <div className="w-full bg-slate-700 rounded-full h-1">
                <div
                  className="bg-blue-500 h-1 rounded-full"
                  style={{ width: `${Math.min(100, (progressValue / progressTarget) * 100)}%` }}
                ></div>
              </div>
            </div>
          )}
          {showSparkline && (
            <div className="mt-2 h-8 flex items-end justify-center">
              <svg width="60" height="20" className="text-blue-400">
                <path
                  d="M0,15 L8,12 L16,18 L24,8 L32,14 L40,6 L48,10 L56,4 L60,8"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  fill="none"
                />
              </svg>
            </div>
          )}
        </div>
        <div className="text-slate-300 ml-2">
          {icon}
        </div>
      </div>
    </div>
  );
};

const StatsGrid: React.FC<StatsGridProps> = ({ stats, isLoading, dataFreshness, evidenceEvents = [], countriesData = [] }) => {
  // Calculate transfers in last 24 hours (FIX 2)
  const transfers24h = React.useMemo(() => {
    const now = Date.now();
    const twentyFourHoursAgo = now - 24 * 60 * 60 * 1000;
    
    return evidenceEvents.filter((event: any) => {
      const eventType = event.eventType;
      const isValidType = eventType === 'DATA_TRANSFER' || 
                         eventType === 'DATA_TRANSFER_BLOCKED' || 
                         eventType === 'DATA_TRANSFER_REVIEW';
      
      if (!isValidType) return false;
      
      const eventTime = event.occurredAt || event.recordedAt || event.createdAt;
      if (!eventTime) return false;
      
      const eventTimestamp = new Date(eventTime).getTime();
      return eventTimestamp >= twentyFourHoursAgo;
    }).length;
  }, [evidenceEvents]);

  // Calculate distinct adequate destinations in last 24h (FIX 3)
  const adequateDestinations24h = React.useMemo(() => {
    const now = Date.now();
    const twentyFourHoursAgo = now - 24 * 60 * 60 * 1000;
    
    // Build set of adequate country codes from countriesData
    const adequateCountryCodes = new Set(
      countriesData
        .filter((c: any) => c.status === 'adequate_protection')
        .map((c: any) => c.code.toUpperCase())
    );
    
    // Get distinct destination country codes from DATA_TRANSFER events in last 24h
    const destinationCodes = new Set<string>();
    
    evidenceEvents.forEach((event: any) => {
      if (event.eventType !== 'DATA_TRANSFER') return;
      
      const eventTime = event.occurredAt || event.recordedAt || event.createdAt;
      if (!eventTime) return;
      
      const eventTimestamp = new Date(eventTime).getTime();
      if (eventTimestamp < twentyFourHoursAgo) return;
      
      const payload = event.payload || {};
      const countryCode = (payload.destination_country_code || payload.country_code || '').toUpperCase();
      
      if (countryCode && adequateCountryCodes.has(countryCode)) {
        destinationCodes.add(countryCode);
      }
    });
    
    return destinationCodes.size;
  }, [evidenceEvents, countriesData]);

  // Use activeAgents from backend stats (Issue 3)
  const activeAgents24h = React.useMemo(() => {
    const value = stats?.activeAgents ?? (stats as any)?.active_agents ?? 0;
    console.log('🔍 StatsGrid - activeAgents24h calculation:', {
      'stats?.activeAgents': stats?.activeAgents,
      'stats?.active_agents': (stats as any)?.active_agents,
      'final value': value,
      'stats object': stats
    });
    return value;
  }, [stats]);
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 animate-pulse">
            <div className="h-4 bg-slate-700 rounded mb-2"></div>
            <div className="h-8 bg-slate-700 rounded mb-2"></div>
            <div className="h-3 bg-slate-700 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 text-center text-slate-400">
          No data available
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 mb-8">
      {/* Row 1 - Top KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="TRANSFERS (24H)"
          value={transfers24h.toLocaleString()}
          icon={<MapPin className="w-5 h-5" />}
          subtitle="Last 24 hours"
          color="text-slate-400"
          showSparkline={transfers24h > 0}
          dataFreshness={dataFreshness}
        />
        <KPICard
          title="ADEQUATE DESTINATIONS (24H)"
          value={adequateDestinations24h}
          icon={<Shield className="w-5 h-5" />}
          subtitle="Distinct adequate countries today"
          color={adequateDestinations24h > 0 ? "text-green-400" : "text-slate-400"}
        />
        <KPICard
          title="HIGH-RISK DESTINATIONS"
          value={stats.highRiskDestinations}
          icon={<AlertTriangle className="w-5 h-5" />}
          subtitle="Non-adequate countries"
          color="text-red-400"
          showProgress={true}
          progressValue={stats.highRiskDestinations}
          progressTarget={50}
        />
        <KPICard
          title="BLOCKED TODAY"
          value={stats.blockedToday ?? 0}
          icon={<AlertTriangle className="w-5 h-5" />}
          subtitle="Transfers prevented"
          color="text-slate-400"
        />
      </div>

      {/* DPF conditional adequacy notice */}
      <div className="flex items-start gap-2 px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs text-amber-300/90">
        <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
        <span>
          US transfers require EU-US Data Privacy Framework (DPF) certification verification per recipient.
          Shown as SCC-required pending runtime DPF registry check.
        </span>
      </div>

      {/* Row 2 - Bottom KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {(() => {
          // SCC Coverage KPI with dynamic behavior
          const sccCoverage = stats.sccCoverage;
          const covered = sccCoverage?.covered ?? 0;
          const total = sccCoverage?.total ?? 0;
          const percentage = sccCoverage?.percentage ?? 0;
          const trend = sccCoverage?.trend ?? 0;

          // Edge case: No SCC-required transfers yet → show "—"
          if (total === 0) {
            return (
              <KPICard
                title="SCC COVERAGE BY DESTINATION"
                value="—"
                icon={<Shield className="w-5 h-5" />}
                subtitle="No SCC-required transfers yet"
                color="text-slate-400"
              />
            );
          }

          // Determine color: green for 100%, amber otherwise
          const isFullyCovered = percentage === 100;
          const color = isFullyCovered ? "text-green-400" : "text-amber-400";

          // Subtitle: "X of Y SCC-required destinations covered"
          const subtitle = `${covered} of ${total} SCC-required destinations covered`;

          return (
            <KPICard
              title="SCC COVERAGE BY DESTINATION"
              value={`${percentage}%`}
              icon={<Shield className="w-5 h-5" />}
              trend={trend !== 0 ? trend : undefined}
              subtitle={subtitle}
              color={color}
            />
          );
        })()}
        <KPICard
          title="EXPIRING SCCs"
          value={stats.expiringSccs}
          icon={<AlertTriangle className="w-5 h-5" />}
          subtitle="within 30 days"
          color="text-slate-400"
          showViewAll={true}
        />
        <KPICard
          title="PENDING APPROVALS"
          value={stats.pendingApprovals}
          icon={<AlertTriangle className="w-5 h-5" />}
          subtitle="Awaiting review"
          color="text-slate-400"
          showViewAll={true}
        />
        <KPICard
          title="ACTIVE AGENTS (24H)"
          value={activeAgents24h}
          icon={<TrendingUp className="w-5 h-5" />}
          subtitle="Unique agents performing transfers"
          color="text-slate-400"
        />
      </div>
    </div>
  );
};

export default StatsGrid;
