'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from './components/DashboardLayout';
import SovereignMap from './components/SovereignMap';
import { RefreshCw, Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { fetchEvidenceEvents, EvidenceEvent } from './utils/api';

export default function SovereignShieldPage() {
  const [events, setEvents] = useState<EvidenceEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  async function loadData() {
    try {
      const data = await fetchEvidenceEvents();
      setEvents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load data:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleRefresh() {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }

  // Calculate stats
  const today = new Date().toISOString().split('T')[0];
  const todayEvents = events.filter((e) => e.occurredAt.startsWith(today));
  const blocked = todayEvents.filter((e) => 
    e.verificationStatus === 'BLOCK' || e.severity === 'BLOCK' || 
    e.eventType === 'DATA_TRANSFER_BLOCKED'
  ).length;
  const allowed = todayEvents.filter((e) => 
    e.verificationStatus === 'ALLOW' || e.severity === 'ALLOW' ||
    e.eventType === 'DATA_TRANSFER'
  ).length;
  const review = todayEvents.filter((e) => 
    e.verificationStatus === 'REVIEW' || e.severity === 'REVIEW' ||
    e.eventType === 'DATA_TRANSFER_REVIEW'
  ).length;
  const total = todayEvents.length;

  const status = blocked > 10 ? 'AT_RISK' : blocked > 0 ? 'ATTENTION' : 'PROTECTED';

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">SOVEREIGN SHIELD</h1>
            <p className="text-sm text-slate-400">GDPR Chapter V (Art. 44-49) • International Data Transfers</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Status Header Bar */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {status === 'PROTECTED' ? (
                <CheckCircle className="w-5 h-5 text-green-400" />
              ) : status === 'ATTENTION' ? (
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-400" />
              )}
              <span className="text-sm font-medium text-white">
                Status: {status === 'PROTECTED' ? 'ENABLED' : status}
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-300">
              <span>Total transfers: {total.toLocaleString()}</span>
              <span>Blocked: {blocked}</span>
              <span>Allowed: {allowed}</span>
              <span>Last scan: {new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </div>

        {/* Stats Grid - Row 1 */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-slate-400 font-medium">TRANSFERS (24H)</div>
              <Shield className="w-4 h-4 text-slate-500" />
            </div>
            <div className="text-2xl font-bold text-white">{total}</div>
            <div className="text-xs text-slate-500 mt-1">Last 24 hours</div>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-slate-400 font-medium">ADEQUATE COUNTRIES</div>
              <AlertTriangle className="w-4 h-4 text-green-500" />
            </div>
            <div className="text-2xl font-bold text-green-400">15</div>
            <div className="text-xs text-slate-500 mt-1">Distinct adequate countries today</div>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-slate-400 font-medium">HIGH RISK DESTINATIONS</div>
              <AlertTriangle className="w-4 h-4 text-red-500" />
            </div>
            <div className="text-2xl font-bold text-red-400">0</div>
            <div className="text-xs text-slate-500 mt-1">Non-adequate countries</div>
            <div className="mt-2 h-1 bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-red-500" style={{ width: '0%' }}></div>
            </div>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-slate-400 font-medium">BLOCKED TODAY</div>
              <Shield className="w-4 h-4 text-red-500" />
            </div>
            <div className="text-2xl font-bold text-red-400">{blocked}</div>
            <div className="text-xs text-slate-500 mt-1">Transfers prevented</div>
          </div>
        </div>

        {/* Stats Grid - Row 2 */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-slate-400 font-medium">SCC COVERAGE</div>
              <CheckCircle className="w-4 h-4 text-yellow-500" />
            </div>
            <div className="text-2xl font-bold text-yellow-400">0%</div>
            <div className="text-xs text-slate-500 mt-1">No SCC-required transfers yet</div>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-slate-400 font-medium">EXPIRING SCCs</div>
              <AlertTriangle className="w-4 h-4 text-yellow-500" />
            </div>
            <div className="text-2xl font-bold text-yellow-400">0</div>
            <div className="text-xs text-slate-500 mt-1">within 30 days</div>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-slate-400 font-medium">PENDING APPROVALS</div>
              <AlertTriangle className="w-4 h-4 text-yellow-500" />
            </div>
            <div className="text-2xl font-bold text-yellow-400">{review}</div>
            <div className="text-xs text-slate-500 mt-1">Awaiting review</div>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-slate-400 font-medium">ACTIVE AGENTS</div>
              <Shield className="w-4 h-4 text-slate-500" />
            </div>
            <div className="text-2xl font-bold text-white">0</div>
            <div className="text-xs text-slate-500 mt-1">Unique agents performing transfers</div>
          </div>
        </div>

        {/* Thin line separator */}
        <div className="border-b border-slate-700" />

        <div className="space-y-6">
            {/* Top Row - Map + Requires Attention */}
            <div className="grid grid-cols-12 gap-6">
              {/* World Map - Takes 7 columns */}
              <div className="col-span-7 bg-slate-800 border border-slate-700 rounded-lg p-4">
                <SovereignMap evidenceEvents={events} isLoading={loading} />
              </div>

              {/* Requires Attention Panel - Takes 5 columns */}
              <div className="col-span-5 bg-slate-800 border border-slate-700 rounded-lg flex flex-col">
                <div className="p-4 border-b border-slate-700 flex items-center justify-between flex-shrink-0">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-500" />
                    REQUIRES ATTENTION
                  </h3>
                  <button className="text-xs text-blue-400 hover:text-blue-300">View All →</button>
                </div>
                <div className="p-4 pb-5">
                  {events.filter(e => 
                      e.eventType === 'DATA_TRANSFER_BLOCKED' || 
                      e.eventType === 'DATA_TRANSFER_REVIEW' ||
                      e.verificationStatus === 'BLOCK' ||
                      e.verificationStatus === 'REVIEW'
                    ).length === 0 ? (
                      <div className="text-center py-8">
                        <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500 opacity-50" />
                        <p className="text-sm text-slate-300 font-medium mb-1">All SCC-required transfers are covered</p>
                        <p className="text-xs text-slate-500">No action required</p>
                      </div>
                    ) : (
                      <div className="space-y-2 pb-1">
                      {events
                        .filter(e => 
                          e.eventType === 'DATA_TRANSFER_BLOCKED' || 
                          e.eventType === 'DATA_TRANSFER_REVIEW' ||
                          e.verificationStatus === 'BLOCK' ||
                          e.verificationStatus === 'REVIEW'
                        )
                        .slice(0, 5)
                        .map((event) => {
                          const isBlocked = event.eventType === 'DATA_TRANSFER_BLOCKED' || event.verificationStatus === 'BLOCK';
                          const country = event.payload?.destination_country || 'Unknown';
                          return (
                            <div
                              key={event.id}
                              className="p-3 bg-slate-700/50 rounded-lg border border-slate-600"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <div className="text-sm text-white font-medium">{country}</div>
                                    {isBlocked ? (
                                      <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded text-xs font-medium">
                                        Blocked
                                      </span>
                                    ) : (
                                      <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded text-xs font-medium">
                                        SCC Required
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-xs text-slate-400 mt-1">
                                    {new Date(event.occurredAt).toLocaleString()}
                                  </div>
                                </div>
                                {!isBlocked && (
                                  <button
                                    onClick={() => window.location.href = '/scc-registry'}
                                    className="px-2.5 py-1 bg-orange-600 hover:bg-orange-700 text-white text-xs rounded flex-shrink-0"
                                  >
                                    Register SCC →
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg">
              <div className="p-4 border-b border-slate-700">
                <h2 className="text-lg font-semibold text-white">RECENT ACTIVITY</h2>
              </div>
              <div className="p-4">
                {loading ? (
                  <div className="text-center text-slate-400 py-8">Loading...</div>
                ) : events.length === 0 ? (
                  <div className="text-center text-slate-400 py-8">No recent activity</div>
                ) : (
                  <div className="space-y-2">
                    {events.slice(0, 10).map((event) => (
                      <div
                        key={event.id}
                        className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-sm text-slate-300">
                            {new Date(event.occurredAt).toLocaleString()}
                          </div>
                          <div className="text-sm text-white">
                            Transfer to {event.payload?.destination_country || 'Unknown'}
                          </div>
                        </div>
                        <div className={`px-2 py-1 rounded text-xs font-medium flex-shrink-0 ${
                          event.eventType === 'DATA_TRANSFER_BLOCKED' || event.verificationStatus === 'BLOCK'
                            ? 'bg-red-500/20 text-red-400'
                            : event.eventType === 'DATA_TRANSFER_REVIEW' || event.verificationStatus === 'REVIEW'
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-green-500/20 text-green-400'
                        }`}>
                          {event.eventType === 'DATA_TRANSFER_BLOCKED' || event.verificationStatus === 'BLOCK'
                            ? 'BLOCK'
                            : event.eventType === 'DATA_TRANSFER_REVIEW' || event.verificationStatus === 'REVIEW'
                            ? 'REVIEW'
                            : 'ALLOW'}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
      </div>
    </DashboardLayout>
  );
}
