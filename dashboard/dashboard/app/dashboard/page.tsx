"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import DashboardLayout from "../components/DashboardLayout";
import { useEnforcementStream } from "../hooks/useEnforcementStream";
import { useEnforcementStreamStore } from "../store/enforcementStreamStore";
import { useEnabledModules } from "../hooks/useEnabledModules";
import { useCurrentUser } from "../hooks/useCurrentUser";
import type { LensFinding, LensLevel } from "../types/lensFinding";
import { Archive, Shield, ShieldCheck, Zap, AlertCircle } from "lucide-react";
// import SyncingIndicator from "../components/SyncingIndicator"; // Removed SSE status indicator
import { 
  LENSES, 
  getEnabledLenses, 
  getLensesByCategory, 
  CATEGORY_DISPLAY_NAMES, 
  CATEGORY_ORDER,
  type LensDef,
  type LensCategory
} from "./lensRegistry";

function severityRank(level?: LensLevel): number {
  // Higher = more severe
  switch (level) {
    case "L1":
      return 4;
    case "L2":
      return 3;
    case "L3":
      return 2;
    case "L4":
      return 1;
    default:
      return 0;
  }
}

function maxLevelForLens(decisions: LensFinding[], lensId: string): LensLevel | undefined {
  let best: LensLevel | undefined;
  let bestRank = 0;
  for (const d of decisions) {
    if (d.lensId !== lensId) continue;
    const r = severityRank(d.level);
    if (r > bestRank) {
      bestRank = r;
      best = d.level;
    }
  }
  return best;
}

function Indicator({ level }: { level?: LensLevel }) {
  // Show T4 (Enterprise Tier) instead of L4 to distinguish license tier from severity level
  const tier = "T4"; // Enterprise Tier - highest license level
  const styles: Record<string, { icon: any; label: string; cls: string }> = {
    T4: { icon: Archive, label: "T4 Enterprise", cls: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  };
  return (
    <div className={`absolute top-2 right-2 rounded-full border px-2 py-1 text-xs backdrop-blur ${styles[tier].cls}`}>
      <span>{styles[tier].label}</span>
    </div>
  );
}

function SovereignPulse({ flashNonce }: { flashNonce: number }) {
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    if (!flashNonce) return;
    setFlash(true);
    const t = window.setTimeout(() => setFlash(false), 1200);
    return () => window.clearTimeout(t);
  }, [flashNonce]);

  const baseColor = flash ? "bg-red-400" : "bg-emerald-400";
  const pingColor = flash ? "bg-red-400/40" : "bg-emerald-400/30";

  return (
    <div className="absolute top-3 left-3">
      <div className="relative h-3 w-3">
        <span className={`absolute inline-flex h-full w-full rounded-full ${pingColor} animate-ping`} />
        <span className={`relative inline-flex h-3 w-3 rounded-full ${baseColor}`} />
      </div>
    </div>
  );
}

function LensCard({
  def,
  level,
  sovereignFlashNonce,
}: {
  def: (typeof LENSES)[number];
  level?: LensLevel;
  sovereignFlashNonce: number;
}) {
  const accentRing: Record<(typeof LENSES)[number]["accent"], string> = {
    emerald: "hover:border-emerald-400/30 hover:shadow-emerald-500/10",
    cyan: "hover:border-cyan-400/30 hover:shadow-cyan-500/10",
    violet: "hover:border-violet-400/30 hover:shadow-violet-500/10",
    amber: "hover:border-amber-400/30 hover:shadow-amber-500/10",
    red: "hover:border-red-400/30 hover:shadow-red-500/10",
    blue: "hover:border-blue-400/30 hover:shadow-blue-500/10",
  };

  return (
    <Link
      href={def.href}
      className={[
        "group relative overflow-hidden rounded-2xl border border-white/10",
        "bg-white/5 backdrop-blur-xl",
        "shadow-lg shadow-black/30",
        "transition-all duration-200 hover:bg-white/7 hover:shadow-xl",
        accentRing[def.accent],
      ].join(" ")}
    >
      {/* subtle gradient sheen */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-60" />

      {def.showSovereignPulse && <SovereignPulse flashNonce={sovereignFlashNonce} />}
      <Indicator level={level} />

      <div className="relative p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-white tracking-tight">{def.title}</h2>
            <p className="mt-1 text-xs text-slate-300/80">{def.subtitle}</p>
            {def.articleLabels?.length ? (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {def.articleLabels.slice(0, 4).map((a) => (
                  <span
                    key={a}
                    className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[11px] text-slate-200/90 backdrop-blur"
                  >
                    {a}
                  </span>
                ))}
                {def.articleLabels.length > 4 ? (
                  <span className="text-[11px] text-slate-400">+{def.articleLabels.length - 4}</span>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            Live feed • T4 Enterprise
          </div>
          <div className="text-xs font-semibold text-slate-200/70 group-hover:text-white transition-colors">
            Open →
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function DashboardPage() {
  useEnforcementStream({ enabled: true });
  const decisions = useEnforcementStreamStore((s) => s.decisions);
  const connection = useEnforcementStreamStore((s) => s.connection);
  const sovereignFlashNonce = useEnforcementStreamStore((s) => s.sovereignShieldFlashNonce);

  // Get current user to check if admin
  const { user } = useCurrentUser();
  const isAdmin = user?.roles?.includes("admin") || user?.username === "admin" || user?.enforcement_override === true;

  // Get enabled modules from module service
  const { data: enabledModules = [], isLoading: modulesLoading } = useEnabledModules();
  
  // Extract module names for filtering
  const enabledModuleNames = useMemo(() => {
    const names = enabledModules.map((m) => m.name);
    console.log("🔍 Dashboard: Enabled module names:", names);
    console.log("🔍 Dashboard: Enabled modules count:", enabledModules.length);
    return names;
  }, [enabledModules]);

  // Get filtered lenses based on enabled modules
  const filteredLenses = useMemo(() => {
    // Admin users always see all lenses
    if (isAdmin) {
      console.log("🔍 Dashboard: Admin user detected - showing ALL lenses");
      return LENSES;
    }
    
    // Show all lenses during loading, error, or when no modules data
    if (modulesLoading || !enabledModules || enabledModules.length === 0) {
      console.log("🔍 Dashboard: Showing ALL lenses (loading or no modules)");
      return LENSES;
    }
    const filtered = getEnabledLenses(enabledModuleNames);
    console.log("🔍 Dashboard: Filtered lenses count:", filtered.length);
    console.log("🔍 Dashboard: Filtered lens IDs:", filtered.map(l => l.lensId));
    console.log("🔍 Dashboard: All lens IDs:", LENSES.map(l => l.lensId));
    console.log("🔍 Dashboard: Enabled module names:", enabledModuleNames);
    
    // If filtering results in fewer than expected lenses (less than 9), show all lenses
    // This handles cases where module names don't match lens requirements
    if (filtered.length < 9 && enabledModules.length > 0) {
      console.warn("🔍 Dashboard: Only", filtered.length, "lenses enabled, but expected 9. Showing ALL lenses.");
      return LENSES;
    }
    
    return filtered;
  }, [enabledModuleNames, modulesLoading, enabledModules, isAdmin]);

  // Group lenses by category for display
  const lensesByCategory = useMemo(() => {
    // If enabledModules is empty or undefined, group ALL lenses
    if (modulesLoading || !enabledModules || enabledModules.length === 0) {
      // During loading or error, group all lenses
      const grouped: Record<LensCategory, LensDef[]> = {
        cross: [],
        gdpr: [],
        dora: [],
        ai_act: [],
      };
      for (const lens of LENSES) {
        grouped[lens.category].push(lens);
      }
      return grouped;
    }
    return getLensesByCategory(enabledModuleNames);
  }, [enabledModuleNames, modulesLoading, enabledModules]);

  const levelsByLens = useMemo(() => {
    const map = new Map<string, LensLevel | undefined>();
    for (const def of LENSES) {
      map.set(def.lensId, maxLevelForLens(decisions, def.lensId));
    }
    return map;
  }, [decisions]);

  // Check if any lenses are available
  const hasAnyLenses = filteredLenses.length > 0;
  const totalEnabledCount = filteredLenses.length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Dashboard</h1>
            <p className="mt-1 text-sm text-slate-400">
              Enforcement overview • {totalEnabledCount} active lenses • real-time decisions stream
            </p>
          </div>
        </div>

        {/* Empty state when no modules are enabled */}
        {!modulesLoading && !hasAnyLenses && (
          <div className="bg-slate-900/50 border border-slate-700 rounded-2xl p-8 text-center">
            <AlertCircle className="mx-auto mb-4 text-slate-400" size={48} />
            <h2 className="text-xl font-semibold text-slate-200 mb-2">No Compliance Modules Enabled</h2>
            <p className="text-slate-400 mb-4 max-w-md mx-auto">
              Enable compliance modules in Configuration to activate enforcement lenses for GDPR, DORA, and EU AI Act.
            </p>
            <Link
              href="/settings"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
            >
              Enable Modules
            </Link>
          </div>
        )}

        {/* Render lenses grouped by category */}
        {hasAnyLenses && CATEGORY_ORDER.map((category) => {
          const lenses = lensesByCategory[category];
          
          // Skip empty categories
          if (!lenses || lenses.length === 0) return null;
          
          return (
            <div key={category} className="space-y-3">
              <h2 className="text-lg font-semibold text-slate-300 flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${
                  category === "cross" ? "bg-emerald-400" :
                  category === "gdpr" ? "bg-cyan-400" :
                  category === "dora" ? "bg-blue-400" :
                  "bg-violet-400"
                }`} />
                {CATEGORY_DISPLAY_NAMES[category]}
                <span className="text-xs text-slate-500 font-normal">({lenses.length})</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {lenses.map((def) => (
                  <LensCard
                    key={def.lensId}
                    def={def}
                    level={levelsByLens.get(def.lensId)}
                    sovereignFlashNonce={def.lensId === "sovereign-shield" ? sovereignFlashNonce : 0}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </DashboardLayout>
  );
}

