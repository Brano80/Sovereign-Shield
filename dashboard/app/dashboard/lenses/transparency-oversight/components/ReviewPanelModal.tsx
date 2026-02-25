"use client";

import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  MessageSquare,
  User,
  Bot,
  Shield,
  TrendingUp,
  TrendingDown,
  Minus
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

interface ReviewPanelModalProps {
  review: ReviewItem;
  onClose: () => void;
  onAction: (action: 'APPROVE' | 'OVERRIDE' | 'MORE_INFO', notes: string) => void;
}

export function ReviewPanelModal({ review, onClose, onAction }: ReviewPanelModalProps) {
  const [reviewerNotes, setReviewerNotes] = useState('');
  const [selectedAction, setSelectedAction] = useState<'APPROVE' | 'OVERRIDE' | 'MORE_INFO' | null>(null);

  // Mock AI decision data
  const aiDecision = {
    action: 'DENY',
    confidence: 78,
    model: 'credit-scoring-v3',
    timestamp: review.timestamp,
    riskFactors: [
      { label: 'Debt-to-income', value: 0.42, threshold: 0.35, status: 'HIGH' },
      { label: 'Recent inquiries', value: 4, threshold: 2, status: 'MEDIUM' },
      { label: 'Credit score', value: 645, threshold: 700, status: 'MEDIUM' },
      { label: 'Account age', value: 3, threshold: 5, status: 'LOW' }
    ]
  };

  // Mock user context
  const userContext = {
    userId: review.userId,
    name: 'John Smith',
    requestType: 'personal loan',
    amount: '€15,000',
    creditScore: 645,
    income: '€42,000/year',
    debt: '€8,200',
    employment: '2 years',
    recentInquiries: 4
  };

  // Mock decision history
  const decisionHistory = [
    { date: '2024-08-15', outcome: 'APPROVED', amount: '€5,000' },
    { date: '2024-01-20', outcome: 'DENIED', amount: '€20,000' }
  ];

  const getRiskFactorIcon = (status: string) => {
    switch (status) {
      case 'HIGH': return <TrendingUp size={16} className="text-red-400" />;
      case 'MEDIUM': return <Minus size={16} className="text-yellow-400" />;
      case 'LOW': return <TrendingDown size={16} className="text-green-400" />;
      default: return <Minus size={16} className="text-gray-400" />;
    }
  };

  const getRiskFactorColor = (status: string) => {
    switch (status) {
      case 'HIGH': return 'text-red-400';
      case 'MEDIUM': return 'text-yellow-400';
      case 'LOW': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const handleAction = (action: 'APPROVE' | 'OVERRIDE' | 'MORE_INFO') => {
    if (!reviewerNotes.trim() && action !== 'APPROVE') {
      alert('Please add reviewer notes for this action');
      return;
    }
    onAction(action, reviewerNotes);
  };

  const formatDateTime = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
      return 'Invalid date';
    }
    return dateObj.toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <h2 className="text-2xl font-bold">REVIEW: {review.id}</h2>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${
              review.priority === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
              review.priority === 'HIGH' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
              review.priority === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
              'bg-green-500/20 text-green-400 border-green-500/30'
            }`}>
              {review.priority === 'CRITICAL' ? '🔴' : review.priority === 'HIGH' ? '🟠' : review.priority === 'MEDIUM' ? '🟡' : '🟢'} {review.priority}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* AI Decision & Context */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* AI Decision */}
            <div className="bg-slate-800/50 border border-slate-600 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                <Bot size={20} className="text-blue-400" />
                <span>AI DECISION</span>
              </h3>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Action:</span>
                  <span className="text-red-400 font-semibold">{aiDecision.action} LOAN</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Confidence:</span>
                  <span className={`font-semibold ${aiDecision.confidence >= 80 ? 'text-green-400' :
                                                   aiDecision.confidence >= 60 ? 'text-yellow-400' :
                                                   'text-red-400'}`}>
                    {aiDecision.confidence}%
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Model:</span>
                  <span className="text-slate-300 font-mono">{aiDecision.model}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Timestamp:</span>
                  <span className="text-slate-300 text-sm">{formatDateTime(aiDecision.timestamp)}</span>
                </div>

                <div>
                  <h4 className="text-slate-400 mb-2">Risk Factors:</h4>
                  <div className="space-y-2">
                    {aiDecision.riskFactors.map((factor, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm text-slate-300">{factor.label}:</span>
                        <div className="flex items-center space-x-2">
                          <span className={`text-sm font-semibold ${getRiskFactorColor(factor.status)}`}>
                            {typeof factor.value === 'number' && factor.value < 1
                              ? `${(factor.value * 100).toFixed(0)}%`
                              : factor.value
                            }
                          </span>
                          {getRiskFactorIcon(factor.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Context & Evidence */}
            <div className="bg-slate-800/50 border border-slate-600 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                <User size={20} className="text-green-400" />
                <span>CONTEXT & EVIDENCE</span>
              </h3>

              <div className="space-y-4">
                <div>
                  <span className="text-slate-400">User:</span>
                  <span className="text-white ml-2">{userContext.name} ({userContext.userId})</span>
                </div>

                <div>
                  <span className="text-slate-400">Request:</span>
                  <span className="text-white ml-2">{userContext.amount} {userContext.requestType}</span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-400">Credit Score:</span>
                    <span className="text-white ml-2 font-semibold">{userContext.creditScore}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Income:</span>
                    <span className="text-white ml-2">{userContext.income}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Debt:</span>
                    <span className="text-white ml-2">{userContext.debt}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Employment:</span>
                    <span className="text-white ml-2">{userContext.employment}</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-slate-400 mb-2">Previous Decisions:</h4>
                  <div className="space-y-1 text-sm">
                    {decisionHistory.map((decision, index) => (
                      <div key={index} className="flex justify-between">
                        <span className="text-slate-500">{decision.date}:</span>
                        <span className={decision.outcome === 'APPROVED' ? 'text-green-400' : 'text-red-400'}>
                          {decision.outcome} {decision.amount}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Explainability Section */}
          <div className="bg-slate-800/50 border border-slate-600 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">EXPLAINABILITY (Art. 13)</h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="text-slate-400 mb-3">Feature Importance:</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-300">Debt-to-Income</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-red-500 rounded-full" style={{ width: '68%' }}></div>
                      </div>
                      <span className="text-sm text-red-400 font-semibold w-8">68%</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-300">Recent Inquiries</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-orange-500 rounded-full" style={{ width: '35%' }}></div>
                      </div>
                      <span className="text-sm text-orange-400 font-semibold w-8">35%</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-300">Credit Score</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-yellow-500 rounded-full" style={{ width: '28%' }}></div>
                      </div>
                      <span className="text-sm text-yellow-400 font-semibold w-8">28%</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-300">Account Age</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: '15%' }}></div>
                      </div>
                      <span className="text-sm text-green-400 font-semibold w-8">15%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-slate-400 mb-3">Plain Language:</h4>
                <div className="bg-slate-800/50 border border-slate-600 rounded p-4">
                  <p className="text-sm text-slate-300 leading-relaxed">
                    "Loan denied primarily due to high debt-to-income ratio (42%) exceeding threshold (35%)
                    and multiple recent credit inquiries suggesting financial stress."
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Reviewer Notes */}
          <div className="bg-slate-800/50 border border-slate-600 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">REVIEWER NOTES</h3>
            <textarea
              value={reviewerNotes}
              onChange={(e) => setReviewerNotes(e.target.value)}
              placeholder="Add notes for audit trail..."
              className="w-full h-24 px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-700">
            <div className="text-sm text-amber-400 flex items-center space-x-2">
              <Shield size={16} />
              <span>This decision will be sealed to Evidence Graph with L3 integrity</span>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => handleAction('APPROVE')}
                className={`px-6 py-3 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
                  selectedAction === 'APPROVE'
                    ? 'bg-green-600 text-white'
                    : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                }`}
              >
                <CheckCircle size={16} />
                <span>✓ Approve AI Decision</span>
              </button>

              <button
                onClick={() => handleAction('OVERRIDE')}
                className={`px-6 py-3 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
                  selectedAction === 'OVERRIDE'
                    ? 'bg-orange-600 text-white'
                    : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                }`}
              >
                <XCircle size={16} />
                <span>Override & Approve Loan</span>
              </button>

              <button
                onClick={() => handleAction('MORE_INFO')}
                className={`px-6 py-3 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
                  selectedAction === 'MORE_INFO'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                }`}
              >
                <MessageSquare size={16} />
                <span>Request More Info</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
