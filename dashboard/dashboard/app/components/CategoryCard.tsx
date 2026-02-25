"use client";

import { CheckCircle, AlertCircle, Clock, Shield, FileText, Lock, Eye, Database, Activity, AlertTriangle, Zap, Timer, Power, X, TrendingUp, TrendingDown, BarChart3, MessageSquare } from "lucide-react";
import { EnabledModule } from "../hooks/useEnabledModules";
import { useState, useEffect } from "react";
import { API_BASE } from "../utils/api-config";
import { getAuthHeaders } from "../utils/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface CategoryCardProps {
  category: string;
  modules: EnabledModule[];
  enforcementMode?: string;
}

// Category metadata mapping
const categoryMetadata: Record<string, {
  title: string;
  icon: typeof Shield;
  colorClasses: {
    bg: string;
    border: string;
    text: string;
    icon: string;
    badge: string;
  };
}> = {
  // GDPR Categories
  "gdpr_consent": {
    title: "GDPR Consent & Lawful Basis",
    icon: FileText,
    colorClasses: {
      bg: "bg-blue-900/20",
      border: "border-blue-800/50",
      text: "text-blue-400",
      icon: "text-blue-400",
      badge: "bg-blue-900/30 border-blue-800/50 text-blue-400",
    },
  },
  "gdpr_consent_management": {
    title: "GDPR Consent & Lawful Basis",
    icon: FileText,
    colorClasses: {
      bg: "bg-blue-900/20",
      border: "border-blue-800/50",
      text: "text-blue-400",
      icon: "text-blue-400",
      badge: "bg-blue-900/30 border-blue-800/50 text-blue-400",
    },
  },
  "gdpr_subject_rights": {
    title: "GDPR Subject Rights",
    icon: Shield,
    colorClasses: {
      bg: "bg-emerald-900/20",
      border: "border-emerald-800/50",
      text: "text-emerald-400",
      icon: "text-emerald-400",
      badge: "bg-emerald-900/30 border-emerald-800/50 text-emerald-400",
    },
  },
  "gdpr_data_sovereignty": {
    title: "GDPR Data Sovereignty & Transfers",
    icon: Lock,
    colorClasses: {
      bg: "bg-purple-900/20",
      border: "border-purple-800/50",
      text: "text-purple-400",
      icon: "text-purple-400",
      badge: "bg-purple-900/30 border-purple-800/50 text-purple-400",
    },
  },
  "gdpr_ai_transparency": {
    title: "GDPR AI Transparency & Information",
    icon: Eye,
    colorClasses: {
      bg: "bg-cyan-900/20",
      border: "border-cyan-800/50",
      text: "text-cyan-400",
      icon: "text-cyan-400",
      badge: "bg-cyan-900/30 border-cyan-800/50 text-cyan-400",
    },
  },
  "gdpr_risk_incidents": {
    title: "GDPR Risk & Incident Management",
    icon: AlertCircle,
    colorClasses: {
      bg: "bg-orange-900/20",
      border: "border-orange-800/50",
      text: "text-orange-400",
      icon: "text-orange-400",
      badge: "bg-orange-900/30 border-orange-800/50 text-orange-400",
    },
  },
  // EU AI Act Categories
  "aia_prohibited": {
    title: "AI Act: Prohibited Practices & Gatekeeping",
    icon: Shield,
    colorClasses: {
      bg: "bg-red-900/20",
      border: "border-red-800/50",
      text: "text-red-400",
      icon: "text-red-400",
      badge: "bg-red-900/30 border-red-800/50 text-red-400",
    },
  },
  "aia_risk_registry": {
    title: "AI Act: System Inventory & Risk",
    icon: Database,
    colorClasses: {
      bg: "bg-indigo-900/20",
      border: "border-indigo-800/50",
      text: "text-indigo-400",
      icon: "text-indigo-400",
      badge: "bg-indigo-900/30 border-indigo-800/50 text-indigo-400",
    },
  },
  "aia_transparency": {
    title: "AI Act: Transparency & Human Oversight",
    icon: Eye,
    colorClasses: {
      bg: "bg-teal-900/20",
      border: "border-teal-800/50",
      text: "text-teal-400",
      icon: "text-teal-400",
      badge: "bg-teal-900/30 border-teal-800/50 text-teal-400",
    },
  },
  "aia_evidence": {
    title: "AI Act: Documentation & Data Governance",
    icon: FileText,
    colorClasses: {
      bg: "bg-amber-900/20",
      border: "border-amber-800/50",
      text: "text-amber-400",
      icon: "text-amber-400",
      badge: "bg-amber-900/30 border-amber-800/50 text-amber-400",
    },
  },
  "aia_monitoring": {
    title: "AI Act: Model Performance & Monitoring",
    icon: Activity,
    colorClasses: {
      bg: "bg-violet-900/20",
      border: "border-violet-800/50",
      text: "text-violet-400",
      icon: "text-violet-400",
      badge: "bg-violet-900/30 border-violet-800/50 text-violet-400",
    },
  },
  // DORA Categories (Deep Blues & Safety Yellows Theme)
  "dora_inventory": {
    title: "DORA: ICT Asset & System Inventory",
    icon: Database,
    colorClasses: {
      bg: "bg-blue-900/20",
      border: "border-blue-800/50",
      text: "text-blue-400",
      icon: "text-blue-400",
      badge: "bg-blue-900/30 border-blue-800/50 text-blue-400",
    },
  },
  "dora_tprm": {
    title: "DORA: Third-Party Risk Management",
    icon: Shield,
    colorClasses: {
      bg: "bg-blue-900/20",
      border: "border-blue-800/50",
      text: "text-blue-400",
      icon: "text-blue-400",
      badge: "bg-blue-900/30 border-blue-800/50 text-blue-400",
    },
  },
  "dora_protection": {
    title: "DORA: Real-time Protection & Detection",
    icon: Shield,
    colorClasses: {
      bg: "bg-blue-900/20",
      border: "border-blue-800/50",
      text: "text-blue-400",
      icon: "text-blue-400",
      badge: "bg-blue-900/30 border-blue-800/50 text-blue-400",
    },
  },
  "dora_incidents": {
    title: "DORA: Incident Management",
    icon: AlertCircle,
    colorClasses: {
      bg: "bg-yellow-900/20",
      border: "border-yellow-800/50",
      text: "text-yellow-400",
      icon: "text-yellow-400",
      badge: "bg-yellow-900/30 border-yellow-800/50 text-yellow-400",
    },
  },
  "dora_resilience": {
    title: "DORA: Resilience & Governance",
    icon: Activity,
    colorClasses: {
      bg: "bg-blue-900/20",
      border: "border-blue-800/50",
      text: "text-blue-400",
      icon: "text-blue-400",
      badge: "bg-blue-900/30 border-blue-800/50 text-blue-400",
    },
  },
};

// Get default metadata for uncategorized modules
const getDefaultMetadata = (category: string) => {
  if (category.startsWith("gdpr_")) {
    return categoryMetadata["gdpr_subject_rights"];
  }
  if (category.startsWith("aia_")) {
    return categoryMetadata["aia_risk_registry"];
  }
  if (category.startsWith("dora_")) {
    return categoryMetadata["dora_inventory"];
  }
  // Fallback for core/integration modules
  return {
    title: category.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
    icon: Shield,
    colorClasses: {
      bg: "bg-slate-900/20",
      border: "border-slate-800/50",
      text: "text-slate-400",
      icon: "text-slate-400",
      badge: "bg-slate-900/30 border-slate-800/50 text-slate-400",
    },
  };
};

// Helper component for LIVE pulse indicator
function LivePulseIndicator() {
  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-75"></div>
        <div className="relative bg-emerald-500 rounded-full w-2 h-2"></div>
      </div>
      <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">LIVE</span>
    </div>
  );
}

// Helper component for countdown timer (72h placeholder)
function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({
    hours: 48,
    minutes: 23,
    seconds: 15,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const totalMinutes = timeLeft.hours * 60 + timeLeft.minutes;
  const isUrgent = totalMinutes < 24 * 60; // Less than 24 hours

  return (
    <div className={`flex items-center gap-2 p-2 rounded-lg border ${
      isUrgent 
        ? "bg-red-900/20 border-red-800/50" 
        : "bg-yellow-900/20 border-yellow-800/50"
    }`}>
      <Timer className={isUrgent ? "text-red-400" : "text-yellow-400"} size={16} />
      <div className="flex flex-col">
        <span className={`text-xs font-medium ${isUrgent ? "text-red-400" : "text-yellow-400"}`}>
          Regulator Reporting
        </span>
        <span className={`text-xs font-mono ${isUrgent ? "text-red-300" : "text-yellow-300"}`}>
          {String(timeLeft.hours).padStart(2, "0")}h {String(timeLeft.minutes).padStart(2, "0")}m {String(timeLeft.seconds).padStart(2, "0")}s
        </span>
      </div>
    </div>
  );
}

// GDPR AI Transparency & Decisions (Dashboard 5) specialized stats
type AiTransparencyCardData = {
  decisionsToday: {
    total: number;
    approved: number;
    rejected: number;
    pending: number;
  };
  transparency: {
    injection: number; // percentage
    purpose: number; // percentage
    contactInfo: number; // percentage
  };
  queuePending: number;
  source: "live" | "mock";
};

const mockAiTransparencyStats: AiTransparencyCardData = {
  decisionsToday: { total: 24, approved: 18, rejected: 2, pending: 4 },
  transparency: { injection: 96, purpose: 92, contactInfo: 88 },
  queuePending: 3,
  source: "mock",
};

function mapApiToAiTransparencyStats(apiData: any): AiTransparencyCardData {
  const decisionStats = apiData?.decision_stats || {};
  const transparencyStats = apiData?.transparency_stats || {};

  const total = Number(decisionStats.total_decisions ?? mockAiTransparencyStats.decisionsToday.total);
  const approved = Number(decisionStats.reviewed ?? decisionStats.reviewed_count ?? decisionStats.under_review ?? mockAiTransparencyStats.decisionsToday.approved);
  const rejected = Number(decisionStats.rejected ?? decisionStats.low_confidence_decisions ?? 0);
  const pending = Number(decisionStats.pending_review ?? decisionStats.human_review_required_count ?? mockAiTransparencyStats.decisionsToday.pending);

  const totalInteractions = Number(transparencyStats.total_interactions ?? 0);
  const successful = Number(transparencyStats.successful_injections ?? 0);
  const purposeCount = Number(transparencyStats.purpose_injections ?? 0);
  const contactCount = Number(transparencyStats.contact_info_injections ?? 0);

  const pct = (value: number, denom: number) => (denom > 0 ? Math.min(100, Math.max(0, (value / denom) * 100)) : undefined);

  const injectionPct = pct(successful, totalInteractions) ?? Number(transparencyStats.success_rate ?? mockAiTransparencyStats.transparency.injection);
  const purposePct = pct(purposeCount, totalInteractions) ?? mockAiTransparencyStats.transparency.purpose;
  const contactPct = pct(contactCount, totalInteractions) ?? mockAiTransparencyStats.transparency.contactInfo;

  return {
    decisionsToday: {
      total,
      approved,
      rejected,
      pending,
    },
    transparency: {
      injection: Number(injectionPct.toFixed ? injectionPct.toFixed(0) : injectionPct),
      purpose: Number(purposePct.toFixed ? purposePct.toFixed(0) : purposePct),
      contactInfo: Number(contactPct.toFixed ? contactPct.toFixed(0) : contactPct),
    },
    queuePending: Number(decisionStats.pending_review ?? decisionStats.human_review_required_count ?? mockAiTransparencyStats.queuePending),
    source: "live",
  };
}

function GdprAiTransparencyPanel({ stats, loading }: { stats: AiTransparencyCardData; loading: boolean }) {
  return (
    <div className="mb-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold text-cyan-300 uppercase tracking-wide">AI Transparency & Decisions</div>
          <div className="text-sm text-cyan-200/80">Art. 13-14 disclosure + Art. 22 automated decisions</div>
        </div>
        <div className="flex items-center gap-2">
          <LivePulseIndicator />
          {stats.source === "mock" && (
            <span className="text-[10px] px-2 py-1 rounded bg-slate-900/40 border border-slate-800/60 text-slate-300 uppercase tracking-wide">
              Mock until live stats
            </span>
          )}
          {loading && <span className="text-[10px] text-cyan-200/80">Refreshing...</span>}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <div className="bg-cyan-900/30 border border-cyan-800/50 rounded-lg p-4 shadow-inner">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs font-semibold text-cyan-300 uppercase tracking-wide">Automated Decisions Today</div>
            <Eye className="text-cyan-300" size={16} />
          </div>
          <div className="grid grid-cols-2 gap-3 text-cyan-100">
            <div>
              <div className="text-3xl font-bold text-white">{stats.decisionsToday.total}</div>
              <div className="text-xs text-cyan-200/70">Total</div>
            </div>
            <div className="text-right">
              <div className="text-xl font-semibold text-emerald-300">{stats.decisionsToday.approved}</div>
              <div className="text-xs text-emerald-200/80">Approved</div>
            </div>
            <div>
              <div className="text-xl font-semibold text-rose-300">{stats.decisionsToday.rejected}</div>
              <div className="text-xs text-rose-200/80">Rejected</div>
            </div>
            <div className="text-right">
              <div className="text-xl font-semibold text-amber-300">{stats.decisionsToday.pending}</div>
              <div className="text-xs text-amber-200/80">Pending</div>
            </div>
          </div>
        </div>

        <div className="bg-sky-900/30 border border-sky-800/50 rounded-lg p-4 shadow-inner">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs font-semibold text-sky-200 uppercase tracking-wide">Transparency Compliance</div>
            <Shield className="text-sky-200" size={16} />
          </div>
          <div className="space-y-2">
            {[
              { label: "Injection", value: stats.transparency.injection, color: "bg-cyan-500" },
              { label: "Purpose", value: stats.transparency.purpose, color: "bg-sky-400" },
              { label: "Contact Info", value: stats.transparency.contactInfo, color: "bg-blue-400" },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between text-xs text-sky-100 mb-1">
                  <span>{item.label}</span>
                  <span className="font-mono text-sm text-white">{item.value}%</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full">
                  <div
                    className={`${item.color} h-2 rounded-full transition-all`}
                    style={{ width: `${Math.min(100, Math.max(0, item.value))}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between p-3 rounded-lg border border-cyan-800/50 bg-cyan-900/20">
        <div className="flex items-center gap-2">
          <Clock className="text-cyan-300" size={16} />
          <span className="text-sm text-cyan-100">Queue</span>
        </div>
        <div className="text-sm text-white">
          <span className="font-semibold text-cyan-200">{stats.queuePending}</span>{" "}
          awaiting human oversight
        </div>
      </div>
    </div>
  );
}

// Helper component for Circuit Breaker status
function CircuitBreakerStatus({ isOpen }: { isOpen: boolean }) {
  return (
    <div className={`flex items-center gap-2 p-2 rounded-lg border ${
      isOpen 
        ? "bg-red-900/20 border-red-800/50" 
        : "bg-emerald-900/20 border-emerald-800/50"
    }`}>
      <Power className={isOpen ? "text-red-400" : "text-emerald-400"} size={16} />
      <div className="flex flex-col">
        <span className={`text-xs font-medium ${isOpen ? "text-red-400" : "text-emerald-400"}`}>
          Circuit Breaker
        </span>
        <span className={`text-xs ${isOpen ? "text-red-300" : "text-emerald-300"}`}>
          {isOpen ? "OPEN" : "CLOSED"}
        </span>
      </div>
    </div>
  );
}

// AI Act: Prohibited Practices Security Alert
function ProhibitedPracticesAlert() {
  const blockedPractices = [
    { practice: "Social Scoring", status: "BLOCKED", timestamp: "2m ago" },
    { practice: "Biometric Categorization", status: "BLOCKED", timestamp: "15m ago" },
    { practice: "Emotion Recognition", status: "BLOCKED", timestamp: "1h ago" },
  ];

  return (
    <div className="bg-red-900/30 border-2 border-red-800 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="text-red-400 animate-pulse" size={20} />
        <span className="text-sm font-bold text-red-400 uppercase tracking-wider">SECURITY ALERT</span>
        <span className="text-xs text-red-300/80 ml-auto">Art. 5</span>
      </div>
      <div className="space-y-2">
        {blockedPractices.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between p-2 bg-red-950/30 rounded border border-red-900/50">
            <div className="flex items-center gap-2">
              <X className="text-red-400" size={14} />
              <span className="text-xs font-medium text-red-300">{item.practice}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-0.5 bg-red-800/50 border border-red-700/50 rounded text-red-200 font-medium">
                {item.status}
              </span>
              <span className="text-xs text-red-400/60">{item.timestamp}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// AI Act: Risk Registry Status Table
function RiskRegistryTable() {
  const highRiskSystems = [
    { system: "Credit Scoring AI", riskScore: 8.5, friaStatus: "COMPLETED", lastAssessed: "2d ago" },
    { system: "HR Recruitment AI", riskScore: 7.2, friaStatus: "IN_PROGRESS", lastAssessed: "5d ago" },
    { system: "Medical Diagnosis AI", riskScore: 9.1, friaStatus: "COMPLETED", lastAssessed: "1d ago" },
  ];

  const getRiskColor = (score: number) => {
    if (score >= 8) return "text-red-400";
    if (score >= 6) return "text-yellow-400";
    return "text-emerald-400";
  };

  const getFriaBadgeColor = (status: string) => {
    if (status === "COMPLETED") return "bg-emerald-900/30 border-emerald-800/50 text-emerald-400";
    if (status === "IN_PROGRESS") return "bg-yellow-900/30 border-yellow-800/50 text-yellow-400";
    return "bg-slate-900/30 border-slate-800/50 text-slate-400";
  };

  return (
    <div className="bg-indigo-900/20 border border-indigo-800/50 rounded-lg p-3">
      <div className="text-xs font-semibold text-indigo-400 mb-3 uppercase tracking-wide">High-Risk Systems</div>
      <div className="space-y-2">
        {highRiskSystems.map((system, idx) => (
          <div key={idx} className="flex items-center justify-between p-2 bg-slate-900/30 rounded border border-slate-800/50">
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-white truncate">{system.system}</div>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs font-mono ${getRiskColor(system.riskScore)}`}>
                  Risk: {system.riskScore}/10
                </span>
                <span className="text-xs text-slate-500">•</span>
                <span className="text-xs text-slate-400">{system.lastAssessed}</span>
              </div>
            </div>
            <span className={`text-xs px-2 py-1 rounded font-medium ${getFriaBadgeColor(system.friaStatus)}`}>
              {system.friaStatus.replace("_", " ")}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// AI Act: Transparency Live Injection Log
function TransparencyInjectionLog() {
  const [injections] = useState([
    { id: 1, notice: "This is an AI-generated response", timestamp: "2s ago", model: "GPT-4" },
    { id: 2, notice: "AI decision-making in use", timestamp: "1m ago", model: "Claude-3" },
    { id: 3, notice: "Automated content generation", timestamp: "5m ago", model: "GPT-4" },
  ]);

  return (
    <div className="bg-teal-900/20 border border-teal-800/50 rounded-lg p-3">
      <div className="flex items-center gap-2 mb-3">
        <MessageSquare className="text-teal-400" size={16} />
        <span className="text-xs font-semibold text-teal-400 uppercase tracking-wide">Live Injection Log</span>
        <div className="ml-auto flex items-center gap-1">
          <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse"></div>
          <span className="text-xs text-teal-300/80">Live</span>
        </div>
      </div>
      <div className="space-y-2 max-h-32 overflow-y-auto">
        {injections.map((injection) => (
          <div key={injection.id} className="flex items-start gap-2 p-2 bg-slate-900/30 rounded border border-slate-800/50">
            <div className="w-1.5 h-1.5 bg-teal-400 rounded-full mt-1.5 flex-shrink-0"></div>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-teal-300 font-medium">{injection.notice}</div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-slate-500 font-mono">{injection.model}</span>
                <span className="text-xs text-slate-600">•</span>
                <span className="text-xs text-slate-500">{injection.timestamp}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// AI Act: Evidence Progress Bars and Bias Sparkline
function EvidenceProgress() {
  const annexProgress = 78; // Percentage
  const biasScore = 0.12; // Bias metric (lower is better)

  // Simple sparkline data (mock)
  const sparklineData = [0.15, 0.14, 0.13, 0.12, 0.12, 0.12];

  return (
    <div className="space-y-3">
      {/* Annex IV Documentation Progress */}
      <div className="bg-amber-900/20 border border-amber-800/50 rounded-lg p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-amber-400 uppercase tracking-wide">Annex IV Documentation</span>
          <span className="text-xs font-mono text-amber-300">{annexProgress}%</span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-2">
          <div
            className="bg-amber-500 h-2 rounded-full transition-all"
            style={{ width: `${annexProgress}%` }}
          ></div>
        </div>
      </div>

      {/* Bias Metric Sparkline */}
      <div className="bg-amber-900/20 border border-amber-800/50 rounded-lg p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-amber-400 uppercase tracking-wide">Bias Metric</span>
          <span className={`text-xs font-mono ${biasScore < 0.15 ? "text-emerald-400" : "text-yellow-400"}`}>
            {biasScore.toFixed(3)}
          </span>
        </div>
        <div className="flex items-end gap-0.5 h-8">
          {sparklineData.map((value, idx) => {
            const height = (value / 0.15) * 100; // Normalize to 0-100%
            return (
              <div
                key={idx}
                className="flex-1 bg-amber-500/60 rounded-t transition-all hover:bg-amber-500"
                style={{ height: `${height}%` }}
                title={`${value.toFixed(3)}`}
              ></div>
            );
          })}
        </div>
        <div className="flex items-center justify-between mt-1 text-xs text-slate-500">
          <span>Trending down</span>
          <TrendingDown className="text-emerald-400" size={12} />
        </div>
      </div>
    </div>
  );
}

// AI Act: Monitoring Model Drift Chart Placeholder
function ModelDriftChart() {
  const driftData = [
    { model: "GPT-4", drift: 2.3, status: "NORMAL" },
    { model: "Claude-3", drift: 4.1, status: "WARNING" },
    { model: "Llama-2", drift: 1.8, status: "NORMAL" },
  ];

  const getDriftColor = (drift: number) => {
    if (drift >= 4) return "text-red-400";
    if (drift >= 2.5) return "text-yellow-400";
    return "text-emerald-400";
  };

  const getStatusColor = (status: string) => {
    if (status === "WARNING") return "bg-yellow-900/30 border-yellow-800/50 text-yellow-400";
    return "bg-emerald-900/30 border-emerald-800/50 text-emerald-400";
  };

  return (
    <div className="space-y-3">
      {/* Model Drift Chart Placeholder */}
      <div className="bg-violet-900/20 border border-violet-800/50 rounded-lg p-3">
        <div className="text-xs font-semibold text-violet-400 mb-3 uppercase tracking-wide">Model Drift</div>
        <div className="space-y-2">
          {driftData.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between p-2 bg-slate-900/30 rounded border border-slate-800/50">
              <div className="flex-1">
                <div className="text-xs font-medium text-white">{item.model}</div>
                <div className="flex items-center gap-2 mt-1">
                  <BarChart3 className="text-violet-400" size={12} />
                  <span className={`text-xs font-mono ${getDriftColor(item.drift)}`}>
                    {item.drift}% drift
                  </span>
                </div>
              </div>
              <span className={`text-xs px-2 py-1 rounded font-medium ${getStatusColor(item.status)}`}>
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Post-Market Monitoring Status */}
      <div className="bg-violet-900/20 border border-violet-800/50 rounded-lg p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="text-violet-400" size={16} />
            <span className="text-xs font-semibold text-violet-400 uppercase tracking-wide">Post-Market Monitoring</span>
          </div>
          <span className="text-xs px-2 py-1 bg-emerald-900/30 border border-emerald-800/50 rounded text-emerald-400 font-medium">
            ACTIVE
          </span>
        </div>
        <div className="mt-2 text-xs text-violet-300/80">
          Continuous monitoring enabled • Art. 72
        </div>
      </div>
    </div>
  );
}

export function CategoryCard({ category, modules, enforcementMode = "ACTIVE" }: CategoryCardProps) {
  const metadata = categoryMetadata[category] || getDefaultMetadata(category);
  const Icon = metadata.icon;
  const { bg, border, text, icon, badge } = metadata.colorClasses;
  const router = useRouter();

  // Determine enforcement status display
  const isEnforcing = enforcementMode === "ENFORCING" || enforcementMode === "ACTIVE";
  const statusText = isEnforcing ? "ACTIVE - ENFORCING" : enforcementMode || "ACTIVE";

  // Check if this is a DORA or AI Act category
  const isDoraCategory = category.startsWith("dora_");
  const isAiaCategory = category.startsWith("aia_");
  const isGdprAiTransparency = category === "gdpr_ai_transparency";

  const [aiTransparencyStats, setAiTransparencyStats] = useState<AiTransparencyCardData>(mockAiTransparencyStats);
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    if (!isGdprAiTransparency) return;

    let cancelled = false;
    const fetchStats = async () => {
      setLoadingStats(true);
      try {
        const res = await fetch(`${API_BASE}/ai-compliance/stats`, {
          headers: getAuthHeaders(),
        });
        if (!res.ok) {
          throw new Error(`Failed to fetch AI transparency stats: ${res.status}`);
        }
        const data = await res.json();
        if (!cancelled) {
          setAiTransparencyStats(mapApiToAiTransparencyStats(data));
        }
      } catch (err) {
        console.warn("AI transparency stats falling back to mock data:", err);
        if (!cancelled) {
          setAiTransparencyStats(mockAiTransparencyStats);
        }
      } finally {
        if (!cancelled) {
          setLoadingStats(false);
        }
      }
    };

    fetchStats();
    return () => {
      cancelled = true;
    };
  }, [isGdprAiTransparency]);

  const destination =
    category === "gdpr_risk_incidents"
      ? "/dashboard/gdpr/risk-incidents"
      : category === "gdpr_consent_management"
      ? "/dashboard/gdpr/consent"
      : category === "gdpr_consent"
      ? "/dashboard/gdpr/consent"
      : undefined;

  const CardWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    if (destination) {
      return (
        <Link href={destination} className="block">
          <div className={`${bg} border ${border} rounded-lg p-6 hover:shadow-lg hover:border-emerald-500/50 transition-all cursor-pointer`}>
            {children}
          </div>
        </Link>
      );
    }
    return (
      <div
        className={`${bg} border ${border} rounded-lg p-6 hover:shadow-lg hover:border-emerald-500/50 transition-all cursor-pointer`}
        onClick={() => {
          if (destination) {
            router.push(destination);
          }
        }}
      >
        {children}
      </div>
    );
  };

  return (
    <CardWrapper>
      {/* Category Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 flex-1">
          <div className={`p-2 ${bg} rounded-lg border ${border}`}>
            <Icon className={icon} size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className={`text-lg font-bold ${text} mb-1`}>{metadata.title}</h3>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-xs px-2 py-1 ${badge} rounded font-medium`}>
                {statusText}
              </span>
              <span className="text-xs text-slate-500">
                {modules.length} module{modules.length !== 1 ? "s" : ""}
              </span>
              {/* DORA Protection: LIVE indicator */}
              {category === "dora_protection" && <LivePulseIndicator />}
            </div>
          </div>
        </div>
      </div>

      {/* GDPR AI Transparency specialized display */}
      {isGdprAiTransparency && <GdprAiTransparencyPanel stats={aiTransparencyStats} loading={loadingStats} />}

      {/* AI Act-specific specialized displays */}
      {isAiaCategory && (
        <div className="mb-4 space-y-3">
          {/* aia_prohibited: Security Alert */}
          {category === "aia_prohibited" && <ProhibitedPracticesAlert />}

          {/* aia_risk_registry: Risk Registry Table */}
          {category === "aia_risk_registry" && <RiskRegistryTable />}

          {/* aia_transparency: Live Injection Log */}
          {category === "aia_transparency" && <TransparencyInjectionLog />}

          {/* aia_evidence: Progress Bars and Bias Sparkline */}
          {category === "aia_evidence" && <EvidenceProgress />}

          {/* aia_monitoring: Model Drift Chart and Post-Market Status */}
          {category === "aia_monitoring" && <ModelDriftChart />}
        </div>
      )}

      {/* DORA-specific specialized displays */}
      {isDoraCategory && (
        <div className="mb-4 space-y-3">
          {/* dora_inventory: Shadow AI Detected warning */}
          {category === "dora_inventory" && (
            <div className="flex items-center gap-2 p-3 bg-yellow-900/20 border border-yellow-800/50 rounded-lg">
              <AlertTriangle className="text-yellow-400" size={18} />
              <div className="flex-1">
                <div className="text-sm font-medium text-yellow-400">Shadow AI Detected</div>
                <div className="text-xs text-yellow-300/80">Unauthorized AI services detected in network traffic</div>
              </div>
            </div>
          )}

          {/* dora_tprm: SLA Status mini-table */}
          {category === "dora_tprm" && (
            <div className="bg-slate-900/30 border border-slate-800/50 rounded-lg p-3">
              <div className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">SLA Status</div>
              <div className="space-y-2">
                {[
                  { vendor: "OpenAI API", sla: 98.7, status: "warning" },
                  { vendor: "Azure AI", sla: 99.2, status: "good" },
                  { vendor: "AWS Bedrock", sla: 97.8, status: "warning" },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <span className="text-slate-300">{item.vendor}</span>
                    <div className="flex items-center gap-2">
                      <span className={`font-mono ${
                        item.status === "warning" ? "text-yellow-400" : "text-emerald-400"
                      }`}>
                        {item.sla}%
                      </span>
                      {item.status === "warning" && (
                        <AlertTriangle className="text-yellow-400" size={14} />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* dora_protection: Sovereign Lock badge */}
          {category === "dora_protection" && (
            <div className="flex items-center gap-2 p-3 bg-emerald-900/20 border border-emerald-800/50 rounded-lg">
              <Lock className="text-emerald-400" size={18} />
              <div className="flex-1">
                <div className="text-sm font-medium text-emerald-400">Sovereign Lock: ACTIVE</div>
                <div className="text-xs text-emerald-300/80">Geofencing and data sovereignty protection enabled</div>
              </div>
            </div>
          )}

          {/* dora_incidents: Countdown timer */}
          {category === "dora_incidents" && <CountdownTimer />}

          {/* dora_resilience: Circuit Breaker status */}
          {category === "dora_resilience" && <CircuitBreakerStatus isOpen={false} />}
        </div>
      )}

      {/* Modules List */}
      <div className="space-y-2 mt-4">
        {modules.map((module) => (
          <div
            key={module.id}
            className="flex items-center justify-between p-3 bg-slate-900/30 rounded-lg border border-slate-800/30 hover:border-slate-700/50 transition-colors"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <CheckCircle className="text-emerald-400 flex-shrink-0" size={16} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white truncate">
                  {module.display_name}
                </div>
                {module.description && (
                  <div className="text-xs text-slate-400 truncate mt-0.5">
                    {module.description}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 ml-2">
              {module.requires_license && (
                <span className="text-xs px-1.5 py-0.5 bg-amber-900/30 border border-amber-800/50 rounded text-amber-400">
                  Licensed
                </span>
              )}
              <span className="text-xs px-2 py-1 bg-emerald-900/30 border border-emerald-800/50 rounded text-emerald-400 font-medium">
                Active
              </span>
            </div>
          </div>
        ))}
      </div>
    </CardWrapper>
  );
}

