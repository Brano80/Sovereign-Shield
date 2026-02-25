'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import {
  fetchReviewQueuePending,
  approveReviewQueueItem,
  rejectReviewQueueItem,
  ReviewQueueItem,
} from '../utils/api';

export default function ReviewQueuePage() {
  const [items, setItems] = useState<ReviewQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    loadItems();
    const interval = setInterval(loadItems, 5000); // Refresh every 5s
    return () => clearInterval(interval);
  }, []);

  async function loadItems() {
    try {
      const data = await fetchReviewQueuePending();
      setItems(data);
    } catch (error) {
      console.error('Failed to load review queue:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(item: ReviewQueueItem) {
    const sealId = item.sealId || item.evidenceId || item.id;
    setProcessing(item.id);
    try {
      await approveReviewQueueItem(sealId);
      loadItems();
    } catch (error) {
      console.error('Failed to approve:', error);
      alert('Failed to approve review item');
    } finally {
      setProcessing(null);
    }
  }

  async function handleReject(item: ReviewQueueItem) {
    const sealId = item.sealId || item.evidenceId || item.id;
    setProcessing(item.id);
    try {
      await rejectReviewQueueItem(sealId);
      loadItems();
    } catch (error) {
      console.error('Failed to reject:', error);
      alert('Failed to reject review item');
    } finally {
      setProcessing(null);
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Review Queue</h1>
          <p className="text-slate-400 text-sm">Pending REVIEW decisions requiring human oversight</p>
        </div>

        {/* Table */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-700/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Transfer Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Reason Flagged
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Suggested Decision
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-400">
                      Loading...
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-400">
                      No pending review items
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-700/30">
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="text-white font-medium">{item.action}</div>
                          <div className="text-slate-400 text-xs mt-1">
                            {new Date(item.created).toLocaleString()}
                          </div>
                          {item.context && (
                            <div className="text-slate-500 text-xs mt-1">
                              {JSON.stringify(item.context).substring(0, 100)}...
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-300">
                        {item.decisionReason || item.module || 'Manual review required'}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs font-medium">
                          {item.suggestedDecision || 'REVIEW'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprove(item)}
                            disabled={processing === item.id}
                            className="px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
                          >
                            {processing === item.id ? 'Processing...' : 'Approve'}
                          </button>
                          <button
                            onClick={() => handleReject(item)}
                            disabled={processing === item.id}
                            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
                          >
                            {processing === item.id ? 'Processing...' : 'Reject'}
                          </button>
                        </div>
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
