"use client";

import { useState } from "react";
import { Search, User } from "lucide-react";

interface NewReviewRequestModalProps {
  onClose: () => void;
  onSubmit: (data: ReviewRequestData) => void;
}

interface ReviewRequestData {
  decisionId: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  reason: string[];
  notes: string;
  assignedTo?: string;
}

export function NewReviewRequestModal({ onClose, onSubmit }: NewReviewRequestModalProps) {
  const [formData, setFormData] = useState<ReviewRequestData>({
    decisionId: '',
    priority: 'MEDIUM',
    reason: [],
    notes: '',
    assignedTo: ''
  });

  const [searchResults, setSearchResults] = useState<Array<{id: string, user: string, decision: string}>>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Mock search function
  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    // Simulate API call
    setTimeout(() => {
      const mockResults = [
        { id: 'DEC-9821', user: 'user_7823', decision: 'Loan application #7823' },
        { id: 'DEC-9819', user: 'user_445', decision: 'Hiring rec. #445' },
        { id: 'REV-4521', user: 'user_8821', decision: 'Credit Decision #4521' }
      ].filter(result =>
        result.id.toLowerCase().includes(query.toLowerCase()) ||
        result.user.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(mockResults);
      setIsSearching(false);
    }, 500);
  };

  const handleReasonChange = (reason: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      reason: checked
        ? [...prev.reason, reason]
        : prev.reason.filter(r => r !== reason)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.decisionId) {
      alert('Please select a decision ID');
      return;
    }

    if (formData.reason.length === 0) {
      alert('Please select at least one reason for review');
      return;
    }

    onSubmit(formData);
  };

  const priorityOptions = [
    { value: 'CRITICAL', label: '🔴 Critical (SLA: 1 hour)', description: 'Immediate action required' },
    { value: 'HIGH', label: '🟠 High (SLA: 4 hours)', description: 'Urgent review needed' },
    { value: 'MEDIUM', label: '🟡 Medium (SLA: 24 hours)', description: 'Standard review timeline' },
    { value: 'LOW', label: '🟢 Low (SLA: 72 hours)', description: 'Non-urgent review' }
  ];

  const reasonOptions = [
    { value: 'user_appeal', label: 'User appeal', description: 'Customer requested review' },
    { value: 'low_confidence', label: 'Low confidence score', description: 'AI confidence below threshold' },
    { value: 'high_value', label: 'High-value decision', description: 'Significant financial/business impact' },
    { value: 'compliance_concern', label: 'Compliance concern', description: 'Potential regulatory issue' },
    { value: 'bias_review', label: 'Bias/fairness review', description: 'Potential discriminatory outcome' },
    { value: 'other', label: 'Other', description: 'Specify in notes below' }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-2xl font-bold">REQUEST HUMAN REVIEW</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Decision ID Search */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">
              Decision ID *
            </label>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="🔍 Search by Decision ID or User ID..."
                value={formData.decisionId}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, decisionId: e.target.value }));
                  handleSearch(e.target.value);
                }}
                className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="mt-2 bg-slate-800 border border-slate-600 rounded-lg max-h-48 overflow-y-auto">
                {searchResults.map((result) => (
                  <button
                    key={result.id}
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, decisionId: result.id }));
                      setSearchResults([]);
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-slate-700 transition-colors border-b border-slate-700 last:border-b-0"
                  >
                    <div className="flex items-center space-x-3">
                      <User size={16} className="text-slate-400" />
                      <div>
                        <div className="text-white font-medium">{result.id}</div>
                        <div className="text-sm text-slate-400">{result.user} • {result.decision}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {isSearching && (
              <div className="mt-2 text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
              </div>
            )}
          </div>

          {/* Priority Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-3">
              Priority *
            </label>
            <div className="space-y-2">
              {priorityOptions.map((option) => (
                <label key={option.value} className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="priority"
                    value={option.value}
                    checked={formData.priority === option.value}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      priority: e.target.value as any
                    }))}
                    className="mt-1 text-blue-600 focus:ring-blue-500"
                    required
                  />
                  <div className="flex-1">
                    <div className="text-white font-medium">{option.label}</div>
                    <div className="text-sm text-slate-400">{option.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Reason for Review */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-3">
              Reason for Review *
            </label>
            <div className="space-y-3">
              {reasonOptions.map((option) => (
                <label key={option.value} className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.reason.includes(option.value)}
                    onChange={(e) => handleReasonChange(option.value, !formData.reason.includes(option.value))}
                    className="mt-1 rounded border-slate-600 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <div className="text-white">{option.label}</div>
                    <div className="text-sm text-slate-400">{option.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">
              Additional Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Provide additional context for the review request..."
              className="w-full h-24 px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Assign To (Optional) */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">
              Assign To (optional)
            </label>
            <select
              value={formData.assignedTo}
              onChange={(e) => setFormData(prev => ({ ...prev, assignedTo: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select reviewer...</option>
              <option value="john.doe@company.com">John Doe (DPO)</option>
              <option value="jane.smith@company.com">Jane Smith (Compliance)</option>
              <option value="mike.johnson@company.com">Mike Johnson (Risk)</option>
              <option value="sarah.wilson@company.com">Sarah Wilson (AI Ethics)</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors"
            >
              Submit for Review
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
