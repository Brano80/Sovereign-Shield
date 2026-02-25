"use client";

import { useState, useMemo } from "react";
import {
  Search,
  Filter,
  MoreHorizontal,
  CheckSquare,
  Clock,
  AlertTriangle,
  User,
  ChevronDown
} from "lucide-react";

interface ReviewItem {
  id: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  category: string;
  subject: string;
  waitingTime: string;
  assignedTo?: string;
  userId: string;
  systemName: string;
  confidence: number;
  timestamp: Date;
  slaBreach: boolean;
}

interface ReviewQueueData {
  reviews: ReviewItem[];
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  overdue: number;
}

interface ReviewQueueTabProps {
  reviewQueue: ReviewQueueData | null;
  showReviewPanel: ReviewItem | null;
  setShowReviewPanel: (review: ReviewItem | null) => void;
}

export function ReviewQueueTab({
  reviewQueue,
  showReviewPanel,
  setShowReviewPanel
}: ReviewQueueTabProps) {
  const [selectedReviews, setSelectedReviews] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<'ALL' | 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [assignedFilter, setAssignedFilter] = useState('ALL');

  // Get unique categories for filter
  const categories = useMemo(() => {
    if (!reviewQueue?.reviews) return [];
    const uniqueCategories = [...new Set(reviewQueue.reviews.map(r => r.category))];
    return uniqueCategories.sort();
  }, [reviewQueue]);

  // Get unique assignees for filter
  const assignees = useMemo(() => {
    if (!reviewQueue?.reviews) return [];
    const uniqueAssignees = [...new Set(reviewQueue.reviews.map(r => r.assignedTo).filter(Boolean))];
    return uniqueAssignees.sort();
  }, [reviewQueue]);

  // Filter reviews
  const filteredReviews = useMemo(() => {
    if (!reviewQueue?.reviews) return [];

    return reviewQueue.reviews.filter(review => {
      // Search filter
      if (searchTerm && !review.id.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !review.subject.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !review.userId.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      // Priority filter
      if (priorityFilter !== 'ALL' && review.priority !== priorityFilter) {
        return false;
      }

      // Category filter
      if (categoryFilter !== 'ALL' && review.category !== categoryFilter) {
        return false;
      }

      // Status filter (based on assigned status)
      if (statusFilter !== 'ALL') {
        const isAssigned = !!review.assignedTo;
        if (statusFilter === 'ASSIGNED' && !isAssigned) return false;
        if (statusFilter === 'UNASSIGNED' && isAssigned) return false;
      }

      // Assigned filter
      if (assignedFilter !== 'ALL' && review.assignedTo !== assignedFilter) {
        return false;
      }

      return true;
    });
  }, [reviewQueue, searchTerm, priorityFilter, categoryFilter, statusFilter, assignedFilter]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedReviews(filteredReviews.map(r => r.id));
    } else {
      setSelectedReviews([]);
    }
  };

  const handleSelectReview = (reviewId: string, checked: boolean) => {
    if (checked) {
      setSelectedReviews(prev => [...prev, reviewId]);
    } else {
      setSelectedReviews(prev => prev.filter(id => id !== reviewId));
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return '🔴';
      case 'HIGH': return '🟠';
      case 'MEDIUM': return '🟡';
      case 'LOW': return '🟢';
      default: return '⚪';
    }
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      CRITICAL: 'bg-red-500/20 text-red-400 border-red-500/30',
      HIGH: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      MEDIUM: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      LOW: 'bg-green-500/20 text-green-400 border-green-500/30'
    };
    return colors[priority as keyof typeof colors] || colors.LOW;
  };

  const formatWaitingTime = (waitingTime: string, slaBreach: boolean) => {
    return (
      <span className={`font-mono text-sm ${slaBreach ? 'text-red-400' : 'text-slate-300'}`}>
        {waitingTime}
        {slaBreach && <AlertTriangle size={12} className="inline ml-1" />}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">HUMAN REVIEW QUEUE</h2>
        <div className="flex items-center space-x-4">
          <button className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-medium transition-colors">
            View SLA Dashboard →
          </button>
          {selectedReviews.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-slate-400">
                {selectedReviews.length} selected
              </span>
              <button className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-sm transition-colors">
                Bulk Actions ▼
              </button>
            </div>
          )}
          <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium transition-colors">
            Export Queue
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-slate-800/50 border border-slate-600 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by ID, user, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as any)}
            className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Priorities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Status</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="UNASSIGNED">Unassigned</option>
          </select>

          {/* Assigned Filter */}
          <select
            value={assignedFilter}
            onChange={(e) => setAssignedFilter(e.target.value)}
            className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Assignees</option>
            {assignees.map(assignee => (
              <option key={assignee} value={assignee}>{assignee}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Queue Table */}
      <div className="bg-slate-800/50 border border-slate-600 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-700/50">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedReviews.length === filteredReviews.length && filteredReviews.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-slate-600 text-blue-600"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Waiting
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Assigned
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-600">
              {filteredReviews.map((review) => (
                <tr
                  key={review.id}
                  className="hover:bg-slate-800/50 transition-colors cursor-pointer"
                  onClick={() => setShowReviewPanel(review)}
                >
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedReviews.includes(review.id)}
                      onChange={(e) => handleSelectReview(review.id, e.target.checked)}
                      className="rounded border-slate-600 text-blue-600"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityBadge(review.priority)}`}>
                      {getPriorityIcon(review.priority)} {review.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-sm text-slate-300">{review.id}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-slate-300">{review.category}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <div className="text-sm font-medium text-white">{review.subject}</div>
                      <div className="text-xs text-slate-500">{review.systemName}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {formatWaitingTime(review.waitingTime, review.slaBreach)}
                  </td>
                  <td className="px-4 py-3">
                    {review.assignedTo ? (
                      <span className="text-sm text-slate-300">{review.assignedTo}</span>
                    ) : (
                      <span className="text-slate-500 italic">Unassigned</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredReviews.length === 0 && (
          <div className="text-center py-12">
            <div className="text-slate-400 mb-2">No reviews match the current filters</div>
            <button
              onClick={() => {
                setSearchTerm('');
                setPriorityFilter('ALL');
                setCategoryFilter('ALL');
                setStatusFilter('ALL');
                setAssignedFilter('ALL');
              }}
              className="text-blue-400 hover:text-blue-300 text-sm"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Pagination and Summary */}
      {filteredReviews.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-400">
            Showing 1-{Math.min(filteredReviews.length, 25)} of {filteredReviews.length} reviews
            {reviewQueue && (
              <span className="ml-4">
                Critical: {reviewQueue.critical} • High: {reviewQueue.high} •
                Medium: {reviewQueue.medium} • Low: {reviewQueue.low}
                {reviewQueue.overdue > 0 && (
                  <span className="text-red-400 ml-2">
                    ⚠ {reviewQueue.overdue} overdue (SLA breach)
                  </span>
                )}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-sm transition-colors">
              ← Prev
            </button>
            <span className="px-3 py-1 bg-blue-600 rounded text-sm">1</span>
            <button className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-sm transition-colors">
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
