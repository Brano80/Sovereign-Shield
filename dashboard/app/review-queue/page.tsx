'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '../components/DashboardLayout';
import {
  fetchReviewQueuePending,
  ReviewQueueItem,
} from '../utils/api';
import { Eye } from 'lucide-react';

export default function ReviewQueuePage() {
  const router = useRouter();
  const [items, setItems] = useState<ReviewQueueItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadItems();
    const interval = setInterval(loadItems, 5000); // Refresh every 5s
    return () => clearInterval(interval);
  }, []);

  async function loadItems() {
    try {
      const data = await fetchReviewQueuePending();
      // Only show PENDING items: rejected and SCC-resolved (approved) items are excluded by API;
      // this filter is a safeguard so they never appear in the list.
      const pendingOnly = (Array.isArray(data) ? data : []).filter(
        (item: ReviewQueueItem) => (item.status || '').toUpperCase() === 'PENDING'
      );
      setItems(pendingOnly);
    } catch (error) {
      console.error('Failed to load review queue:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleView(item: ReviewQueueItem) {
    const itemId = item.id || item.sealId || item.evidenceId;
    router.push(`/transfer-detail/${itemId}`);
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
                        <button
                          onClick={() => handleView(item)}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </button>
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
