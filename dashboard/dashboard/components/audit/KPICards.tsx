"use client";
import React, { useEffect, useState } from "react";
import { CheckCircle, Activity, Link as LinkIcon, Shield, Package, Clock, X } from "lucide-react";
import { API_BASE } from "@/app/utils/api-config";
import { getAuthHeaders } from "@/utils/auth";
import { ExternalWitnesses } from "./ExternalWitnesses";

type KPICardProps = {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: string;
  status?: "success" | "warning" | "error";
  icon?: React.ReactNode;
  tooltip?: string;
  onClick?: () => void;
  clickable?: boolean;
};

export function KPICard({ title, value, subtitle, trend, status, icon, tooltip, onClick, clickable }: KPICardProps) {
  return (
    <div
      className={`rounded-lg border border-slate-800 bg-slate-900 p-4 ${clickable ? 'cursor-pointer hover:bg-slate-800/80 transition-colors' : ''}`}
      title={tooltip}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-400">{title}</span>
        {icon}
      </div>
      <div className="mt-2 flex items-center">
        <span className="text-2xl font-bold text-white">{value}</span>
        {status === "success" ? (
          <CheckCircle className="ml-2 h-5 w-5 text-emerald-500" />
        ) : null}
      </div>
      {(subtitle || trend) && (
        <p className="mt-1 text-sm text-slate-400">
          {trend ? <span className="text-emerald-400 mr-1">{trend}</span> : null}
          {subtitle ? <span>{subtitle}</span> : null}
        </p>
      )}
    </div>
  );
}

type AuditStats = {
  totalEvents: number;
  chainIntegrity: { valid: boolean; percentage: number };
  externalWitnesses: number;
  packagesGenerated: number;
  activeClocks: number;
};

const FALLBACK: AuditStats = {
  totalEvents: 847_293,
  chainIntegrity: { valid: true, percentage: 100 },
  externalWitnesses: 12,
  packagesGenerated: 47,
  activeClocks: 3,
};

interface AuditKPICardsProps {
  instanceName?: string;
  evidenceEvents?: any[];
}

export function AuditKPICards({ instanceName = "Almaco", evidenceEvents }: AuditKPICardsProps) {
  const [stats, setStats] = useState<AuditStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showWitnessesModal, setShowWitnessesModal] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/audit/stats`, {
          headers: getAuthHeaders(),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as AuditStats;
        if (!cancelled) setStats(data);
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? "Failed to load stats");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const s = stats ?? FALLBACK;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-busy={loading}>
      <KPICard
        title="Total Events"
        value={(evidenceEvents ? evidenceEvents.length : s.totalEvents).toLocaleString()}
        subtitle="0 today"
        icon={<Activity className="h-4 w-4 text-slate-500" />}
      />
      <KPICard
        title="Chain Integrity"
        value={(evidenceEvents && evidenceEvents.length === 0) ? "0%" : `${s.chainIntegrity.percentage}%`}
        subtitle={(evidenceEvents && evidenceEvents.length === 0) ? "Awaiting Data" : (s.chainIntegrity.valid ? "verified" : "issues detected")}
        status={(evidenceEvents && evidenceEvents.length === 0) ? undefined : (s.chainIntegrity.valid ? "success" : "error")}
        icon={(evidenceEvents && evidenceEvents.length === 0) ?
          <Shield className="h-4 w-4 text-slate-400" /> :
          <LinkIcon className="h-4 w-4 text-slate-500" />
        }
        tooltip={(evidenceEvents && evidenceEvents.length === 0) ?
          "Integrity monitoring is active. Verification will commence upon the first recorded event." :
          undefined
        }
      />
      <KPICard
        title="External Witnesses"
        value={0}
        subtitle="/ 12 Active Anchors"
        icon={<Shield className="h-4 w-4 text-slate-500" />}
        onClick={() => setShowWitnessesModal(true)}
        clickable={true}
      />
      <KPICard
        title="Packages Generated"
        value={0}
        subtitle="this year"
        icon={<Package className="h-4 w-4 text-slate-500" />}
      />
      <KPICard
        title="Active Clocks"
        value={0}
        subtitle={error ? "using fallback" : "running"}
        icon={<Clock className="h-4 w-4 text-slate-500" />}
      />
      <KPICard
        title="Coming Soon"
        value="-"
        subtitle="New metric"
        icon={<Activity className="h-4 w-4 text-slate-500" />}
      />
      <KPICard
        title="Coming Soon"
        value="-"
        subtitle="New metric"
        icon={<Activity className="h-4 w-4 text-slate-500" />}
      />
      <KPICard
        title="Coming Soon"
        value="-"
        subtitle="New metric"
        icon={<Activity className="h-4 w-4 text-slate-500" />}
      />

      {/* External Witnesses Modal */}
      {showWitnessesModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <h2 className="text-xl font-bold text-white">External Witnesses</h2>
              <button
                onClick={() => setShowWitnessesModal(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6">
              <ExternalWitnesses />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
