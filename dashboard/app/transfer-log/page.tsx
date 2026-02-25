'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { fetchEvidenceEvents, EvidenceEvent } from '../utils/api';

export default function TransferLogPage() {
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

  const filteredEvents = events.filter((event) => {
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Transfer Log</h1>
          <p className="text-slate-400 text-sm">Complete history of all data transfer decisions</p>
        </div>

        {/* Filters */}
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

        {/* Table */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-700/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Destination
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Purpose
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Legal Basis
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-400">Loading...</td>
                  </tr>
                ) : filteredEvents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-400">No transfers found</td>
                  </tr>
                ) : (
                  filteredEvents.map((event) => (
                    <tr key={event.id} className="hover:bg-slate-700/30">
                      <td className="px-6 py-4 text-sm text-slate-300">
                        {new Date(event.occurredAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-white">
                        {event.payload?.destination_country || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-300">
                        {event.payload?.data_category || '—'}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-300">
                        {event.payload?.mechanism || '—'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          event.eventType === 'DATA_TRANSFER_BLOCKED' || event.verificationStatus === 'BLOCK'
                            ? 'bg-red-500/20 text-red-400'
                            : event.eventType === 'DATA_TRANSFER_REVIEW' || event.verificationStatus === 'REVIEW'
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-green-500/20 text-green-400'
                        }`}>
                          {event.eventType === 'DATA_TRANSFER_BLOCKED' || event.verificationStatus === 'BLOCK'
                            ? 'BLOCKED'
                            : event.eventType === 'DATA_TRANSFER_REVIEW' || event.verificationStatus === 'REVIEW'
                            ? 'PENDING REVIEW'
                            : 'ALLOWED'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
