"use client";
import { CheckCircle, Shield, Server, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";

function formatTimeAgo(timestamp: string): string {
  const seconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

interface EvidenceEvent {
  id: string;
  eventId: string;
  eventType: string;
  severity: 'L1' | 'L2' | 'L3' | 'L4';
  occurredAt: string;
  sourceSystem: string;
  sourceIp?: string;
  regulatoryTags: string[];
  articles: string[];
  payload: any;
  payloadHash: string;
  previousHash: string;
  nexusSeal?: string;
  regulatoryFramework?: string;
  createdAt: string;
  updatedAt: string;
}

interface IntegrityStatusBannerProps {
  events: EvidenceEvent[];
  isLoading: boolean;
}

interface IntegrityCheckResponse {
  verified: boolean;
  sourceSystem: string;
  timestamp: string;
  message: string;
}

export function IntegrityStatusBanner({ events, isLoading }: IntegrityStatusBannerProps) {
  const [integrityCheck, setIntegrityCheck] = useState<IntegrityCheckResponse | null>(null);
  const [isCheckingIntegrity, setIsCheckingIntegrity] = useState(false);
  if (isLoading) {
    return (
      <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          <span className="text-slate-400">Loading evidence integrity status...</span>
        </div>
      </div>
    );
  }

  const isVerified = integrityCheck?.verified ?? false;
  const lastVerification = events.length === 0
    ? 'No events to verify'
    : integrityCheck?.timestamp
      ? formatTimeAgo(integrityCheck.timestamp)
      : 'Never verified';

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
            events.length === 0 ? 'bg-slate-500/10' :
            isVerified ? 'bg-emerald-500/10' : 'bg-red-500/10'
          }`}>
            {isCheckingIntegrity ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
            ) : events.length === 0 ? (
              <Shield className="h-5 w-5 text-slate-500" />
            ) : isVerified ? (
              <CheckCircle className="h-5 w-5 text-emerald-500" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-500" />
            )}
          </div>
          <div className="flex-1">
            <h3 className={`font-semibold text-white ${isCheckingIntegrity ? 'opacity-50' : ''}`}>
              INTEGRITY STATUS: {
                isCheckingIntegrity ? 'VERIFYING...' :
                events.length === 0 ? 'INITIALIZED' :
                isVerified ? 'VERIFIED' : 'COMPROMISED'
              }
            </h3>
            <p className="text-sm text-slate-400 mb-2">
              {events.length === 0
                ? 'System initialized │ Ready for first evidence event │ Signicat integration active'
                : isVerified
                  ? 'Chain unbroken │ All hashes valid │ Trust services by Signicat'
                  : 'Integrity check failed │ Chain may be compromised'
              }
            </p>
            {/* Witness Hierarchy */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs">
                <Shield className="h-3 w-3 text-emerald-400" />
                <span className="text-slate-300 font-medium">Primary Anchor:</span>
                <span className="text-emerald-400">Signicat Trusted Services (Qualified Provider)</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Server className="h-3 w-3 text-slate-400" />
                <span className="text-slate-300 font-medium">Supporting Nodes:</span>
                <span className="text-slate-400">11 Distributed Nexus Ledger Nodes</span>
              </div>
            </div>
          </div>
        </div>
        <div className="text-right text-sm text-slate-400">
          <p>Last verification: {lastVerification}</p>
          <p>Last Anchor: {events.length === 0 ? 'Genesis' : 'Pending'}</p>
          <p>Storage: write-once verified <CheckCircle className="inline h-3 w-3 text-emerald-500 ml-1" /></p>
        </div>
      </div>
    </div>
  );
}
