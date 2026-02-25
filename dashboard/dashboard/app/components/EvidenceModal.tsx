"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { X, AlertCircle, Clock, FileText, ExternalLink, Loader2 } from "lucide-react";
import { API_BASE } from "../utils/api-config";
import { getAuthHeaders } from "../utils/auth";

interface EvidenceItem {
  eventId: string;
  eventType: string;
  severity: string;
  description: string;
  detectedAt: string;
}

interface EvidenceResponse {
  articleId: string;
  articleName: string;
  regulation: string;
  evidenceCount: number;
  evidence: EvidenceItem[];
}

interface EvidenceModalProps {
  articleId: string;
  regulation: string;
  articleName: string;
  isOpen: boolean;
  onClose: () => void;
}

async function fetchEvidence(articleId: string): Promise<EvidenceResponse> {
  const headers = getAuthHeaders();
  const response = await fetch(`${API_BASE}/compliance/evidence/${articleId}`, {
    headers,
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch evidence: ${response.status}`);
  }
  
  return response.json();
}

function getSeverityColor(severity: string): string {
  switch (severity.toUpperCase()) {
    case "CRITICAL":
      return "text-red-400 bg-red-900/30 border-red-800";
    case "HIGH":
      return "text-orange-400 bg-orange-900/30 border-orange-800";
    case "MEDIUM":
      return "text-yellow-400 bg-yellow-900/30 border-yellow-800";
    case "LOW":
      return "text-green-400 bg-green-900/30 border-green-800";
    default:
      return "text-slate-400 bg-slate-900/30 border-slate-700";
  }
}

function getSeverityLabel(severity: string): string {
  switch (severity.toUpperCase()) {
    case "CRITICAL":
      return "L1 - Critical";
    case "HIGH":
      return "L2 - High";
    case "MEDIUM":
      return "L3 - Medium";
    case "LOW":
      return "L4 - Low";
    default:
      return severity;
  }
}

export default function EvidenceModal({
  articleId,
  regulation,
  articleName,
  isOpen,
  onClose,
}: EvidenceModalProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["evidence", articleId],
    queryFn: () => fetchEvidence(articleId),
    enabled: isOpen,
    staleTime: 30000, // 30 seconds
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-900/30 border border-blue-800">
              <FileText className="text-blue-400" size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">
                Evidence Trail
              </h2>
              <p className="text-sm text-slate-400">
                {regulation} · Article {articleId} · {articleName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin text-blue-400" size={32} />
              <span className="ml-3 text-slate-400">Loading evidence...</span>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-900/20 border border-red-800 rounded-lg">
              <AlertCircle className="text-red-400" size={20} />
              <div>
                <p className="text-red-400 font-medium">Failed to load evidence</p>
                <p className="text-red-300/70 text-sm">{(error as Error).message}</p>
              </div>
            </div>
          )}

          {data && data.evidence.length === 0 && (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-800 mb-4">
                <FileText className="text-slate-500" size={32} />
              </div>
              <p className="text-slate-400">No evidence records found for this article</p>
              <p className="text-slate-500 text-sm mt-1">
                Incidents will appear here when detected
              </p>
            </div>
          )}

          {data && data.evidence.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm text-slate-400 mb-4">
                <span>Showing last {data.evidence.length} of {data.evidenceCount} total incidents</span>
                <span className="flex items-center gap-1">
                  <Clock size={14} />
                  Most recent first
                </span>
              </div>
              
              {data.evidence.map((item, index) => (
                <div
                  key={item.eventId}
                  className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg hover:border-slate-600 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${getSeverityColor(item.severity)}`}>
                        {getSeverityLabel(item.severity)}
                      </span>
                      <span className="text-xs text-slate-500 font-mono">
                        {item.eventType}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500 whitespace-nowrap">
                      {item.detectedAt}
                    </span>
                  </div>
                  
                  <p className="text-sm text-slate-300 leading-relaxed mb-2">
                    {item.description}
                  </p>
                  
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="font-mono">ID: {item.eventId.slice(0, 8)}...</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-slate-700 bg-slate-800/30">
          <div className="text-xs text-slate-500">
            Evidence from monitoring_events table · Real-time sync
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

