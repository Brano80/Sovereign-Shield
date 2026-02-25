"use client";

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import {
  Clock,
  CheckCircle,
  XCircle,
  Timer,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  Shield,
  Send,
  User,
  Calendar,
} from 'lucide-react';
import DashboardLayout from '@/app/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8080';

function getAuthHeaders(): Record<string, string> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}

interface ReviewItem {
  id: string;
  created: Date;
  agentId: string;
  action: string;
  module: string;
  suggestedDecision: 'REVIEW' | 'ALLOW' | 'BLOCK';
  context: Record<string, any>;
  status: 'PENDING' | 'DECIDED' | 'EXPIRED';
  evidenceId: string;
  decidedBy?: string;
  decisionReason?: string;
  finalDecision?: 'ALLOW' | 'BLOCK';
  decidedAt?: Date;
  expiresAt?: Date;
}

export default function ReviewQueuePage() {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [regulationFilter, setRegulationFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('Newest first');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [decisionModal, setDecisionModal] = useState<string | null>(null);
  const [decisionReason, setDecisionReason] = useState('');
  const [decisionType, setDecisionType] = useState<'ALLOW' | 'BLOCK' | null>(null);

  const fetchReviews = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/review-queue`, { headers: getAuthHeaders() });
      if (!res.ok) return;
      const data = await res.json();
      const items: ReviewItem[] = (data.reviews || []).map((r: any) => ({
        id: r.id,
        created: new Date(r.created),
        agentId: r.agentId || r.agent_id || '',
        action: r.action || '',
        module: r.module || 'sovereign-shield',
        suggestedDecision: r.suggestedDecision || r.suggested_decision || 'REVIEW',
        context: r.context || {},
        status: r.status || 'PENDING',
        evidenceId: r.evidenceId || r.evidence_id || '',
        decidedBy: r.decidedBy || r.decided_by,
        decisionReason: r.decisionReason || r.decision_reason,
        finalDecision: r.finalDecision || r.final_decision,
        decidedAt: r.decidedAt || r.decided_at ? new Date(r.decidedAt || r.decided_at) : undefined,
        expiresAt: r.expiresAt || r.expires_at ? new Date(r.expiresAt || r.expires_at) : undefined,
      }));
      setReviews(items);
    } catch (e) {
      console.error('Failed to fetch reviews:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchReviews();
    setIsRefreshing(false);
  };

  // Calculate stats
  const stats = useMemo(() => {
    const pending = reviews.filter(r => r.status === 'PENDING').length;
    const decidedToday = reviews.filter(r => {
      if (r.status !== 'DECIDED' || !r.decidedAt) return false;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return r.decidedAt >= today;
    }).length;
    const expired = reviews.filter(r => r.status === 'EXPIRED').length;
    
    const decidedReviews = reviews.filter(r => r.status === 'DECIDED' && r.decidedAt && r.created);
    const avgDecisionTime = decidedReviews.length > 0
      ? decidedReviews.reduce((sum, r) => {
          const timeDiff = r.decidedAt!.getTime() - r.created.getTime();
          return sum + timeDiff;
        }, 0) / decidedReviews.length
      : 0;
    
    const avgHours = Math.round(avgDecisionTime / (1000 * 60 * 60));
    
    return { pending, decidedToday, expired, avgHours };
  }, [reviews]);

  // Filter and sort reviews
  const filteredReviews = useMemo(() => {
    let filtered = [...reviews];
    
    if (statusFilter !== 'All') {
      filtered = filtered.filter(r => r.status === statusFilter.toUpperCase());
    }
    
    if (regulationFilter !== 'All') {
      filtered = filtered.filter(r => {
        if (regulationFilter === 'GDPR') return r.module === 'sovereign-shield';
        if (regulationFilter === 'AI Act') return r.module === 'ai-act-art5';
        return true;
      });
    }
    
    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'Newest first') {
        return b.created.getTime() - a.created.getTime();
      } else if (sortBy === 'Oldest first') {
        return a.created.getTime() - b.created.getTime();
      } else if (sortBy === 'Urgency') {
        // PENDING first, then by age (oldest first)
        if (a.status === 'PENDING' && b.status !== 'PENDING') return -1;
        if (a.status !== 'PENDING' && b.status === 'PENDING') return 1;
        if (a.status === 'PENDING' && b.status === 'PENDING') {
          return a.created.getTime() - b.created.getTime();
        }
        return 0;
      }
      return 0;
    });
    
    return filtered;
  }, [reviews, statusFilter, regulationFilter, sortBy]);

  const handleDecision = (reviewId: string, decision: 'ALLOW' | 'BLOCK') => {
    setDecisionModal(reviewId);
    setDecisionType(decision);
    setDecisionReason('');
  };

  const submitDecision = async () => {
    if (decisionReason.length < 10) {
      alert('Decision reason must be at least 10 characters for audit trail.');
      return;
    }
    
    const sealId = decisionModal;
    const endpoint = decisionType === 'ALLOW' ? 'approve' : 'reject';
    
    try {
      const res = await fetch(`${API_BASE}/api/v1/action/${sealId}/${endpoint}`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          decision: decisionType,
          reason: decisionReason,
        }),
      });
      
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(`Failed to submit decision: ${err.error || res.statusText}`);
        return;
      }
    } catch (e) {
      console.error('Failed to submit decision:', e);
      alert('Failed to submit decision. Check console for details.');
      return;
    }
    
    setDecisionModal(null);
    setDecisionType(null);
    setDecisionReason('');
    
    await handleRefresh();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            PENDING
          </Badge>
        );
      case 'DECIDED':
        return <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">DECIDED</Badge>;
      case 'EXPIRED':
        return <Badge className="bg-red-500/10 text-red-400 border-red-500/20">EXPIRED</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getModuleBadge = (module: string) => {
    const moduleMap: Record<string, { label: string; color: string }> = {
      'sovereign-shield': { label: 'GDPR', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
      'ai-act-art5': { label: 'AI Act', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
    };
    const moduleInfo = moduleMap[module] || { label: module, color: 'bg-slate-500/10 text-slate-400 border-slate-500/20' };
    return <Badge className={moduleInfo.color}>{moduleInfo.label}</Badge>;
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-slate-950">
        {/* Header */}
        <div className="border-b border-slate-800 bg-slate-800/50 backdrop-blur supports-[backdrop-filter]:bg-slate-800/50">
          <div className="px-6 py-6">
            {/* Regulatory Note Banner */}
            <div className="mb-4 p-3 bg-blue-900/20 border border-blue-700/50 rounded-lg">
              <p className="text-sm text-blue-300">
                <Shield className="inline w-4 h-4 mr-2" />
                Under AI Act Art. 14, high-risk AI systems require meaningful human oversight. Under GDPR Art. 22, data subjects have the right not to be subject to purely automated decisions. All decisions are sealed in the evidence chain.
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">Human Review Queue</h1>
                <p className="text-slate-400 mt-1">AI Act Art. 14 • GDPR Art. 22 — Human oversight for automated decisions</p>
              </div>

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
            </div>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="px-6 py-6 border-b border-slate-800">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Pending */}
            <Card className="bg-slate-800/50 border-slate-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">PENDING</p>
                    <p className="text-2xl font-bold text-amber-400">{stats.pending}</p>
                    <p className="text-sm text-slate-400">Awaiting decision</p>
                  </div>
                  <div className="w-8 h-8 bg-amber-500/10 rounded-lg flex items-center justify-center">
                    <Clock size={16} className="text-amber-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Decided Today */}
            <Card className="bg-slate-800/50 border-slate-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">DECIDED TODAY</p>
                    <p className="text-2xl font-bold text-emerald-400">{stats.decidedToday}</p>
                    <p className="text-sm text-slate-400">Completed</p>
                  </div>
                  <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                    <CheckCircle size={16} className="text-emerald-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Expired */}
            <Card className="bg-slate-800/50 border-slate-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">EXPIRED</p>
                    <p className="text-2xl font-bold text-red-400">{stats.expired}</p>
                    <p className="text-sm text-slate-400">Timed out</p>
                  </div>
                  <div className="w-8 h-8 bg-red-500/10 rounded-lg flex items-center justify-center">
                    <XCircle size={16} className="text-red-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Avg Decision Time */}
            <Card className="bg-slate-800/50 border-slate-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">AVG DECISION TIME</p>
                    <p className="text-2xl font-bold text-blue-400">{stats.avgHours}h</p>
                    <p className="text-sm text-slate-400">Average</p>
                  </div>
                  <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
                    <Timer size={16} className="text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-800/30">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400">Filter by:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option>All</option>
                <option>Pending</option>
                <option>Decided</option>
                <option>Expired</option>
              </select>
              <select
                value={regulationFilter}
                onChange={(e) => setRegulationFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option>All</option>
                <option>GDPR</option>
                <option>AI Act</option>
              </select>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-sm text-slate-400">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option>Newest first</option>
                <option>Oldest first</option>
                <option>Urgency</option>
              </select>
            </div>
          </div>
        </div>

        {/* Review Queue Table */}
        <div className="px-6 py-6">
          <Card className="bg-slate-800/50 border-slate-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-white">Review Queue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-2 px-3 text-xs font-semibold text-slate-400">Created</th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-slate-400">Agent</th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-slate-400">Action</th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-slate-400">Module</th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-slate-400">Suggested Decision</th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-slate-400">Context</th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-slate-400">Status</th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-slate-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReviews.map((review) => {
                      const isExpanded = expandedRow === review.id;
                      const isDecisionModal = decisionModal === review.id;
                      const contextPreview = JSON.stringify(review.context).substring(0, 50) + '...';
                      
                      return (
                        <React.Fragment key={review.id}>
                          <tr 
                            className={`border-b border-slate-800 hover:bg-slate-900/50 transition-colors cursor-pointer ${
                              review.status === 'PENDING' ? 'border-l-2 border-l-amber-500/50' : ''
                            }`}
                            onClick={() => setExpandedRow(isExpanded ? null : review.id)}
                          >
                            <td className="py-3 px-3 text-xs text-slate-300">
                              {formatDistanceToNow(review.created, { addSuffix: true })}
                            </td>
                            <td className="py-3 px-3 text-xs text-slate-300 font-mono">{review.agentId}</td>
                            <td className="py-3 px-3 text-xs text-slate-300">{review.action}</td>
                            <td className="py-3 px-3">{getModuleBadge(review.module)}</td>
                            <td className="py-3 px-3">
                              <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20">
                                {review.suggestedDecision}
                              </Badge>
                            </td>
                            <td className="py-3 px-3 text-xs text-slate-400 font-mono max-w-xs truncate">
                              {contextPreview}
                            </td>
                            <td className="py-3 px-3">{getStatusBadge(review.status)}</td>
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                {review.status === 'PENDING' && (
                                  <>
                                    <Button
                                      size="sm"
                                      onClick={() => handleDecision(review.id, 'ALLOW')}
                                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-7"
                                    >
                                      Approve
                                    </Button>
                                    <Button
                                      size="sm"
                                      onClick={() => handleDecision(review.id, 'BLOCK')}
                                      className="bg-red-600 hover:bg-red-700 text-white text-xs h-7"
                                    >
                                      Reject
                                    </Button>
                                  </>
                                )}
                                {review.status === 'DECIDED' && review.finalDecision && (
                                  <Badge className={
                                    review.finalDecision === 'ALLOW' 
                                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                      : 'bg-red-500/10 text-red-400 border-red-500/20'
                                  }>
                                    {review.finalDecision}
                                  </Badge>
                                )}
                                {isExpanded ? (
                                  <ChevronDown size={14} className="text-slate-400" />
                                ) : (
                                  <ChevronRight size={14} className="text-slate-400" />
                                )}
                              </div>
                            </td>
                          </tr>
                          
                          {/* Expanded Row - Full Details */}
                          {isExpanded && (
                            <tr className="bg-slate-900/50">
                              <td colSpan={8} className="px-6 py-4">
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <p className="text-xs text-slate-400 mb-1">Evidence ID</p>
                                      <Link 
                                        href={`/dashboard/evidence?id=${review.evidenceId}`}
                                        className="text-sm text-blue-400 hover:text-blue-300 underline"
                                      >
                                        {review.evidenceId}
                                      </Link>
                                    </div>
                                    <div>
                                      <p className="text-xs text-slate-400 mb-1">Created</p>
                                      <p className="text-sm text-slate-300">{review.created.toLocaleString()}</p>
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <p className="text-xs text-slate-400 mb-2">Full Context</p>
                                    <pre className="bg-slate-950 p-3 rounded-lg text-xs text-slate-300 overflow-x-auto">
                                      {JSON.stringify(review.context, null, 2)}
                                    </pre>
                                  </div>
                                  
                                  {review.status === 'DECIDED' && review.decidedBy && (
                                    <div className="space-y-2 pt-2 border-t border-slate-700">
                                      <div className="flex items-center gap-2">
                                        <User size={14} className="text-slate-400" />
                                        <span className="text-xs text-slate-400">Decided by:</span>
                                        <span className="text-sm text-slate-300">{review.decidedBy}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Calendar size={14} className="text-slate-400" />
                                        <span className="text-xs text-slate-400">Decided at:</span>
                                        <span className="text-sm text-slate-300">
                                          {review.decidedAt?.toLocaleString()}
                                        </span>
                                      </div>
                                      <div>
                                        <p className="text-xs text-slate-400 mb-1">Decision Reason</p>
                                        <p className="text-sm text-slate-300">{review.decisionReason}</p>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                          
                          {/* Decision Modal (Inline) */}
                          {isDecisionModal && (
                            <tr className="bg-slate-900/80">
                              <td colSpan={8} className="px-6 py-4">
                                <div className="space-y-4">
                                  <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-white">
                                      {decisionType === 'ALLOW' ? 'Approve (Allow)' : 'Reject (Block)'} Review
                                    </h3>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        setDecisionModal(null);
                                        setDecisionType(null);
                                        setDecisionReason('');
                                      }}
                                      className="border-slate-700 text-slate-300 hover:bg-slate-800"
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                  
                                  <div>
                                    <p className="text-sm text-slate-400 mb-2">Review Context</p>
                                    <pre className="bg-slate-950 p-3 rounded-lg text-xs text-slate-300 overflow-x-auto mb-4">
                                      {JSON.stringify(review.context, null, 2)}
                                    </pre>
                                  </div>
                                  
                                  <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">
                                      Decision Reason <span className="text-red-400">*</span>
                                      <span className="text-xs text-slate-500 ml-2">(Minimum 10 characters for audit trail)</span>
                                    </label>
                                    <textarea
                                      value={decisionReason}
                                      onChange={(e) => setDecisionReason(e.target.value)}
                                      placeholder="Explain your decision for the audit trail..."
                                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      rows={4}
                                    />
                                    <p className="text-xs text-slate-500 mt-1">
                                      {decisionReason.length}/10 characters minimum
                                    </p>
                                  </div>
                                  
                                  <div className="flex items-center gap-3 pt-2">
                                    <Button
                                      onClick={submitDecision}
                                      disabled={decisionReason.length < 10}
                                      className={`${
                                        decisionType === 'ALLOW'
                                          ? 'bg-emerald-600 hover:bg-emerald-700'
                                          : 'bg-red-600 hover:bg-red-700'
                                      } text-white`}
                                    >
                                      <Send size={14} className="mr-2" />
                                      Submit Decision
                                    </Button>
                                    {decisionReason.length < 10 && (
                                      <span className="text-xs text-amber-400">
                                        Please provide a decision reason (minimum 10 characters)
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
