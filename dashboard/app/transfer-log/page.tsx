'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '../components/DashboardLayout';
import { fetchEvidenceEvents, EvidenceEvent } from '../utils/api';
import { FileDown } from 'lucide-react';
import { getCountryCodeFromName, getLegalBasis } from '../config/countries';

export default function TransferLogPage() {
  const router = useRouter();
  const [events, setEvents] = useState<EvidenceEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'ALLOWED' | 'BLOCKED' | 'PENDING'>('ALL');

  useEffect(() => {
    loadEvents();
    const interval = setInterval(loadEvents, 5000);
    return () => clearInterval(interval);
  }, []);

  async function loadEvents() {
    try {
      const data = await fetchEvidenceEvents();
      setEvents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load events:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }

  // Fix 1: Filter out human-oversight events; only show transfer/sovereign events or events with payload.decision
  const transferEvents = events.filter((e) => {
    const et = (e.eventType || '').toLowerCase();
    const isHumanOversight = et.includes('human-oversight') || et.includes('human_oversight') || et === 'human_oversight';
    if (isHumanOversight) return false;
    if (et.includes('transfer') || et.includes('sovereign') || e.payload?.decision) return true;
    return false;
  });

  const filteredEvents = transferEvents.filter((event) => {
    if (filter === 'ALL') return true;
    const eventType = event.eventType;
    if (filter === 'BLOCKED') {
      return eventType === 'DATA_TRANSFER_BLOCKED' || event.verificationStatus === 'BLOCK';
    }
    if (filter === 'PENDING') {
      return eventType === 'DATA_TRANSFER_REVIEW' || event.verificationStatus === 'REVIEW';
    }
    if (filter === 'ALLOWED') {
      return eventType === 'DATA_TRANSFER' || event.verificationStatus === 'ALLOW';
    }
    return true;
  });

  function handleRowClick(event: EvidenceEvent) {
    const eventId = event.eventId || event.id;
    if (eventId) router.push(`/evidence-vault?eventId=${encodeURIComponent(eventId)}`);
  }

  // Show Purpose column only if at least one event has non-empty purpose different from data category
  const showPurposeColumn = filteredEvents.some((e) => {
    const p = e.payload?.purpose;
    const dc = e.payload?.data_categories?.[0] || e.payload?.dataCategories?.[0];
    return p != null && String(p).trim() !== '' && p !== dc;
  });

  function escapeCsv(val: string): string {
    const s = String(val ?? '').replace(/"/g, '""');
    return s.includes(',') || s.includes('"') ? `"${s}"` : s;
  }

  function exportCsv() {
    const headers = ['Timestamp', 'Destination', 'Data Category', ...(showPurposeColumn ? ['Purpose'] : []), 'Legal Basis', 'Status', 'Event ID'];
    const rows = filteredEvents.map((e) => {
      const countryName =
        e.payload?.destination_country ||
        e.payload?.destinationCountry ||
        e.payload?.destination ||
        'Unknown';
      let countryCode =
        e.payload?.destination_country_code ||
        e.payload?.destinationCountryCode ||
        e.payload?.context?.destination_country_code ||
        '';
      if (!countryCode && countryName !== 'Unknown') countryCode = getCountryCodeFromName(countryName);
      const dataCategory =
        e.payload?.data_categories?.[0] || e.payload?.dataCategories?.[0] || '—';
      const purpose = e.payload?.purpose ?? '—';
      const legalBasis = getLegalBasis(countryCode);
      const status =
        e.eventType === 'DATA_TRANSFER_BLOCKED' || e.verificationStatus === 'BLOCK'
          ? 'BLOCKED'
          : e.eventType === 'DATA_TRANSFER_REVIEW' || e.verificationStatus === 'REVIEW'
          ? 'PENDING REVIEW'
          : 'ALLOWED';
      const ts = new Date(e.occurredAt).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
      const base = [ts, countryName, dataCategory];
      if (showPurposeColumn) base.push(purpose);
      base.push(legalBasis, status, e.eventId || e.id);
      return base.map(escapeCsv).join(',');
    });
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transfer-log-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Transfer Log</h1>
          <p className="text-slate-400 text-sm">Complete history of all data transfer decisions</p>
        </div>

        {/* Filters + Export */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex gap-2">
            {(['ALL', 'ALLOWED', 'BLOCKED', 'PENDING'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === f
                    ? 'bg-slate-700 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <button
            onClick={exportCsv}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors"
          >
            <FileDown className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>

        {/* Table */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
          <div className="overflow-hidden">
            <table className="w-full table-fixed" style={{ tableLayout: 'fixed' }}>
              <colgroup>
                <col style={{ width: showPurposeColumn ? '18%' : '22%' }} />
                <col style={{ width: showPurposeColumn ? '16%' : '18%' }} />
                <col style={{ width: showPurposeColumn ? '12%' : '14%' }} />
                <col style={{ width: showPurposeColumn ? '14%' : '16%' }} />
                {showPurposeColumn && <col style={{ width: '10%' }} />}
                <col style={{ width: showPurposeColumn ? '14%' : '16%' }} />
                <col style={{ width: '14%' }} />
              </colgroup>
              <thead className="bg-slate-700/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider whitespace-nowrap">
                    Timestamp
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider whitespace-nowrap">
                    Destination
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider whitespace-nowrap">
                    Data Category
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider whitespace-nowrap">
                    Agent / Endpoint
                  </th>
                  {showPurposeColumn && (
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider whitespace-nowrap">
                      Purpose
                    </th>
                  )}
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider whitespace-nowrap">
                    Legal Basis
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider whitespace-nowrap">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={showPurposeColumn ? 7 : 6} className="px-4 py-8 text-center text-slate-400">Loading...</td>
                  </tr>
                ) : filteredEvents.length === 0 ? (
                  <tr>
                    <td colSpan={showPurposeColumn ? 7 : 6} className="px-4 py-8 text-center text-slate-400">No transfers found</td>
                  </tr>
                ) : (
                  filteredEvents.map((event) => {
                    const countryName =
                      event.payload?.destination_country ||
                      event.payload?.destinationCountry ||
                      event.payload?.destination ||
                      'Unknown';
                    let countryCode =
                      event.payload?.destination_country_code ||
                      event.payload?.destinationCountryCode ||
                      event.payload?.context?.destination_country_code ||
                      '';
                    if (!countryCode && countryName !== 'Unknown') countryCode = getCountryCodeFromName(countryName);
                    const dataCategory =
                      event.payload?.data_categories?.[0] || event.payload?.dataCategories?.[0];
                    const purpose = event.payload?.purpose ?? '—';
                    const legalBasis = getLegalBasis(countryCode);
                    const skipValues = ['sovereign-shield', 'sovereign_shield'];
                    let agentOrEndpoint =
                      event.payload?.agent_id ||
                      event.payload?.agentId ||
                      event.payload?.endpoint ||
                      event.payload?.source_system ||
                      event.sourceSystem;
                    if (!agentOrEndpoint || skipValues.includes(String(agentOrEndpoint).toLowerCase())) {
                      agentOrEndpoint = null;
                    }
                    return (
                      <tr
                        key={event.id}
                        onClick={() => handleRowClick(event)}
                        className="hover:bg-slate-700/30 cursor-pointer"
                      >
                        <td className="px-4 py-3 text-xs text-slate-300 font-mono whitespace-nowrap overflow-hidden text-ellipsis">
                          {new Date(event.occurredAt).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                            hour12: false,
                          }).replace(/,\s*(\d)/, '  $1')}
                        </td>
                        <td className="px-4 py-3 text-sm text-white whitespace-nowrap overflow-hidden text-ellipsis">
                          <div className="flex items-center gap-2">
                            {countryCode ? (
                              <img
                                src={`https://flagcdn.com/16x12/${countryCode.toLowerCase()}.png`}
                                width={16}
                                height={12}
                                alt={countryName}
                                className="shrink-0"
                              />
                            ) : null}
                            <span className="min-w-0 truncate">{countryName}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap overflow-hidden text-ellipsis">
                          {dataCategory ? (
                            <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-600/50 text-slate-300">
                              {dataCategory}
                            </span>
                          ) : (
                            <span className="text-slate-500">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-400 whitespace-nowrap overflow-hidden text-ellipsis">
                          {agentOrEndpoint || '—'}
                        </td>
                        {showPurposeColumn && (
                          <td className="px-4 py-3 text-sm text-slate-300 whitespace-nowrap overflow-hidden text-ellipsis">{purpose}</td>
                        )}
                        <td className="px-4 py-3 text-xs font-mono text-slate-400 whitespace-nowrap overflow-hidden text-ellipsis">{legalBasis}</td>
                        <td className="px-4 py-3 whitespace-nowrap overflow-hidden text-ellipsis">
                          <span
                            className={`inline-block px-2 py-1 rounded text-xs font-medium border truncate max-w-full ${
                              event.eventType === 'DATA_TRANSFER_BLOCKED' || event.verificationStatus === 'BLOCK'
                                ? 'bg-red-500/15 text-red-400 border-red-500/25'
                                : event.eventType === 'DATA_TRANSFER_REVIEW' || event.verificationStatus === 'REVIEW'
                                ? 'bg-amber-500/15 text-amber-400 border-amber-500/25'
                                : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25'
                            }`}
                          >
                            {event.eventType === 'DATA_TRANSFER_BLOCKED' || event.verificationStatus === 'BLOCK'
                              ? 'BLOCKED'
                              : event.eventType === 'DATA_TRANSFER_REVIEW' || event.verificationStatus === 'REVIEW'
                              ? 'REVIEW'
                              : 'ALLOWED'}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
