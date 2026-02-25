"use client";

import { useState, useEffect } from "react";
import { X, FileText, Send, Mail, Download, Shield, AlertTriangle, Users, CheckCircle } from "lucide-react";

interface IncidentData {
  id: string;
  incidentId: string;
  title: string;
  description?: string;
  severity: string;
  discoveryTime: string;
  affectedIndividualsCount?: number;
  affectedDataCategories: string[];
  geographicScope: string;
  incidentOwner: string;
}

interface SubmitReportResponse {
  incidentId: string;
  status: string;
  submittedAt: string;
  submissionMethod: string;
  finalSealId?: string;
  finalSealHash?: string;
  timeBeforeDeadline?: number;
  regulatoryReference: string;
}

interface ReportSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  incident: IncidentData | null;
}

type SubmissionMethod = 'portal' | 'pdf' | 'email';

export function ReportSubmissionModal({ isOpen, onClose, incident }: ReportSubmissionModalProps) {
  const [formData, setFormData] = useState({
    natureOfBreach: 'CONFIDENTIALITY',
    likelyConsequences: '',
    additionalInfo: '',
    submissionMethod: 'portal' as SubmissionMethod,
    dpoName: '',
    dpoEmail: '',
    dpoPhone: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitResponse, setSubmitResponse] = useState<SubmitReportResponse | null>(null);

  const handleClose = () => {
    setSubmitResponse(null);
    setFormData({
      natureOfBreach: 'CONFIDENTIALITY',
      likelyConsequences: '',
      additionalInfo: '',
      submissionMethod: 'portal',
      dpoName: '',
      dpoEmail: '',
      dpoPhone: ''
    });
    setError(null);
    onClose();
  };

  // Auto-prefill DPO contact information (mock data - would come from company profile)
  useEffect(() => {
    if (isOpen && incident) {
      // Mock DPO data - in real app this would come from company profile API
      setFormData(prev => ({
        ...prev,
        dpoName: 'Dr. Anna Schmidt',
        dpoEmail: 'dpo@company.com',
        dpoPhone: '+49 30 12345678'
      }));
    }
  }, [isOpen, incident]);

  if (!isOpen || !incident) return null;

  // Success Screen
  if (submitResponse) {
    const timeBeforeDeadline = submitResponse.timeBeforeDeadline;
    const deadlineText = timeBeforeDeadline !== undefined
      ? timeBeforeDeadline > 0
        ? `Submitted ${Math.floor(timeBeforeDeadline / 60)}h ${timeBeforeDeadline % 60}m before deadline`
        : `Submitted ${Math.abs(Math.floor(timeBeforeDeadline / 60))}h ${Math.abs(timeBeforeDeadline % 60)}m after deadline`
      : 'Deadline timing unknown';

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-lg w-full">
          {/* Success Header */}
          <div className="text-center p-8">
            <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Notification Submitted Successfully</h2>
            <p className="text-slate-400">Your regulatory report has been submitted and sealed</p>
          </div>

          {/* Details */}
          <div className="px-8 pb-8 space-y-4">
            <div className="bg-slate-800/50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Incident ID</span>
                <span className="text-white font-mono">{submitResponse.incidentId}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Submission Time</span>
                <span className="text-white">{new Date(submitResponse.submittedAt).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Method</span>
                <span className="text-white capitalize">{submitResponse.submissionMethod}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Deadline Status</span>
                <span className={`font-medium ${timeBeforeDeadline && timeBeforeDeadline > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {deadlineText}
                </span>
              </div>
            </div>

            {/* Seal Information */}
            {submitResponse.finalSealHash && (
              <div className="bg-slate-800/50 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-blue-400 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium text-white mb-1">L4 Final Report Seal</h4>
                    <p className="text-slate-400 text-sm mb-2">Cryptographic evidence seal for audit compliance</p>
                    <div className="font-mono text-xs text-blue-400 break-all bg-slate-900/50 rounded p-2">
                      {submitResponse.finalSealHash}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Regulatory Reference */}
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="text-center">
                <div className="text-slate-400 text-sm mb-1">Regulatory Framework</div>
                <div className="text-white font-medium">{submitResponse.regulatoryReference}</div>
              </div>
            </div>
          </div>

          {/* Close Button */}
          <div className="flex justify-center p-6 border-t border-slate-700">
            <button
              onClick={handleClose}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!formData.likelyConsequences.trim()) {
      setError("Please describe the likely consequences for data subjects.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const apiPayload = {
        natureOfBreach: formData.natureOfBreach,
        likelyConsequences: formData.likelyConsequences,
        additionalInfo: formData.additionalInfo || null,
        dpoContact: {
          name: formData.dpoName,
          email: formData.dpoEmail,
          phone: formData.dpoPhone
        },
        submissionMethod: formData.submissionMethod
      };

      // Call the backend API
      const response = await fetch(`/api/v1/incidents/${incident?.id}/submit-report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add auth headers as needed
        },
        body: JSON.stringify(apiPayload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const responseData: SubmitReportResponse = await response.json();
      setSubmitResponse(responseData);

    } catch (err: any) {
      setError(err.message || "Failed to submit report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSubmissionMethodIcon = (method: SubmissionMethod) => {
    switch (method) {
      case 'portal': return <Send className="h-4 w-4" />;
      case 'pdf': return <Download className="h-4 w-4" />;
      case 'email': return <Mail className="h-4 w-4" />;
    }
  };

  const getSubmissionMethodLabel = (method: SubmissionMethod) => {
    switch (method) {
      case 'portal': return 'Direct Portal Submission';
      case 'pdf': return 'Generate PDF Report';
      case 'email': return 'Email to Authority';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <FileText className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Submit Regulatory Report</h2>
              <p className="text-slate-400 text-sm">GDPR Art. 33 / DORA Art. 19 Notification</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6">
          {error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4">
              <div className="flex items-center gap-2 text-red-400">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm">{error}</span>
              </div>
            </div>
          )}

          {/* Incident Summary */}
          <div className="bg-slate-800/50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-3">Incident Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-slate-400">Incident ID</div>
                <div className="text-white font-mono">{incident.incidentId}</div>
              </div>
              <div>
                <div className="text-slate-400">Discovery Time</div>
                <div className="text-white">{new Date(incident.discoveryTime).toLocaleString()}</div>
              </div>
              <div>
                <div className="text-slate-400">Affected Individuals</div>
                <div className="text-white">{incident.affectedIndividualsCount || 0}</div>
              </div>
              <div className="md:col-span-3">
                <div className="text-slate-400">Data Categories</div>
                <div className="flex flex-wrap gap-2 mt-1">
                  {incident.affectedDataCategories.map((category, index) => (
                    <span key={index} className="px-2 py-1 bg-slate-700 text-slate-300 rounded text-xs">
                      {category}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Nature of Breach */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Nature of Breach *
                </label>
                <select
                  value={formData.natureOfBreach}
                  onChange={(e) => setFormData(prev => ({ ...prev, natureOfBreach: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="CONFIDENTIALITY">Confidentiality - Unauthorized access or disclosure</option>
                  <option value="INTEGRITY">Integrity - Unauthorized modification or alteration</option>
                  <option value="AVAILABILITY">Availability - Data temporarily unavailable</option>
                  <option value="COMBINED">Combined - Multiple types of breach</option>
                </select>
              </div>

              {/* Likely Consequences */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Likely Consequences for Data Subjects *
                </label>
                <textarea
                  value={formData.likelyConsequences}
                  onChange={(e) => setFormData(prev => ({ ...prev, likelyConsequences: e.target.value }))}
                  placeholder="Describe the likely consequences for individuals whose personal data has been breached..."
                  className="w-full h-32 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
                  required
                />
              </div>

              {/* Additional Information */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Additional Information
                </label>
                <textarea
                  value={formData.additionalInfo}
                  onChange={(e) => setFormData(prev => ({ ...prev, additionalInfo: e.target.value }))}
                  placeholder="Any additional information relevant to the supervisory authority..."
                  className="w-full h-24 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* DPO Contact Information */}
              <div className="bg-slate-800/50 rounded-lg p-4">
                <div className="flex items-start gap-3 mb-4">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <Users className="h-5 w-5 text-green-400" />
                  </div>
                  <div>
                    <h4 className="font-medium text-white">DPO Contact Information</h4>
                    <p className="text-slate-400 text-sm">Data Protection Officer details</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Name</label>
                    <input
                      type="text"
                      value={formData.dpoName}
                      onChange={(e) => setFormData(prev => ({ ...prev, dpoName: e.target.value }))}
                      className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Email</label>
                    <input
                      type="email"
                      value={formData.dpoEmail}
                      onChange={(e) => setFormData(prev => ({ ...prev, dpoEmail: e.target.value }))}
                      className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={formData.dpoPhone}
                      onChange={(e) => setFormData(prev => ({ ...prev, dpoPhone: e.target.value }))}
                      className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500"
                    />
                  </div>
                </div>
              </div>

              {/* Submission Options */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Submission Method *
                </label>
                <div className="space-y-2">
                  {(['portal', 'pdf', 'email'] as SubmissionMethod[]).map((method) => (
                    <label
                      key={method}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        formData.submissionMethod === method
                          ? 'bg-blue-500/20 border-blue-500/50 text-blue-400'
                          : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <input
                        type="radio"
                        name="submissionMethod"
                        value={method}
                        checked={formData.submissionMethod === method}
                        onChange={(e) => setFormData(prev => ({ ...prev, submissionMethod: e.target.value as SubmissionMethod }))}
                        className="text-blue-500"
                      />
                      {getSubmissionMethodIcon(method)}
                      <div className="flex-1">
                        <div className="font-medium">{getSubmissionMethodLabel(method)}</div>
                        <div className="text-xs text-slate-400">
                          {method === 'portal' && 'Submit directly through the supervisory authority portal'}
                          {method === 'pdf' && 'Generate PDF report for manual submission'}
                          {method === 'email' && 'Send report via email to the authority'}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between p-6 border-t border-slate-700">
          <div className="text-sm text-slate-400">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span>Report will be submitted according to GDPR Art. 33 requirements</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !formData.likelyConsequences.trim()}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Submit Report
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
