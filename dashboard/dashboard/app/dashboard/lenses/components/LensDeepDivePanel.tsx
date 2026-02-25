"use client";

import React from "react";
import type { LensFinding, LensLevel } from "@/app/types/lensFinding";
import { useEnforcementStreamStore } from "@/app/store/enforcementStreamStore";
import { getLensDef } from "@/app/dashboard/lensRegistry";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

function severityRank(level?: LensLevel): number {
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

function maxLevel(decisions: LensFinding[]): LensLevel | undefined {
  let best: LensLevel | undefined;
  let bestRank = 0;
  for (const d of decisions) {
    const r = severityRank(d.level);
    if (r > bestRank) {
      bestRank = r;
      best = d.level;
    }
  }
  return best;
}

function countByLevel(decisions: LensFinding[]) {
  const counts = { L1: 0, L2: 0, L3: 0, L4: 0 };
  for (const d of decisions) {
    counts[d.level] = (counts[d.level] ?? 0) + 1;
  }
  return [
    { level: "L1", count: counts.L1 },
    { level: "L2", count: counts.L2 },
    { level: "L3", count: counts.L3 },
    { level: "L4", count: counts.L4 },
  ];
}

export function LensDeepDivePanel({ lensId }: { lensId: string }) {
  const decisions = useEnforcementStreamStore((s) => s.decisions);
  const lens = getLensDef(lensId);

  const filtered = React.useMemo(
    () => decisions.filter((d) => d.lensId === lensId),
    [decisions, lensId]
  );

  const chartData = React.useMemo(() => countByLevel(filtered), [filtered]);
  const max = React.useMemo(() => maxLevel(filtered), [filtered]);
  const latest = filtered[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white">
            {lens?.title ?? `Lens: ${lensId}`}
          </h2>
          <p className="text-sm text-slate-400">{lens?.subtitle ?? "Deep-dive overview"}</p>
          {lens?.articleLabels?.length ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {lens.articleLabels.map((a) => (
                <span
                  key={a}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200 backdrop-blur"
                >
                  {a}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
          <div className="text-xs text-slate-400">Max severity (last 50 events)</div>
          <div className="mt-1 text-2xl font-extrabold text-white">{max ?? "—"}</div>
          <div className="mt-1 text-xs text-slate-500">
            latest: {latest ? new Date(latest.timestamp).toLocaleString() : "—"}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-slate-200">Level distribution</div>
            <div className="text-xs text-slate-400">events buffered client-side</div>
          </div>
          <div className="mt-3 h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="level" stroke="rgba(148,163,184,0.6)" />
                <YAxis stroke="rgba(148,163,184,0.6)" allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: "rgba(15, 23, 42, 0.92)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: 12,
                    color: "rgba(226,232,240,0.95)",
                  }}
                />
                <Bar dataKey="count" fill="rgba(56, 189, 248, 0.45)" stroke="rgba(56,189,248,0.9)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-slate-200">Recent events</div>
            <div className="text-xs text-slate-400">{filtered.length} / 50</div>
          </div>
          <div className="mt-3 space-y-2">
            {filtered.length === 0 ? (
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-400">
                Waiting for SSE events for <span className="text-slate-200">{lensId}</span>.
              </div>
            ) : null}

            {filtered.slice(0, 10).map((d) => (
              <div
                key={`${d.timestamp}|${d.moduleId}`}
                className="rounded-xl border border-white/10 bg-white/5 p-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="text-xs font-semibold text-slate-200">{d.level}</div>
                  <div className="text-[11px] text-slate-500">
                    {new Date(d.timestamp).toLocaleTimeString()}
                  </div>
                </div>
                <div className="mt-1 text-xs text-slate-400">
                  module: <span className="text-slate-300">{d.moduleId}</span>
                </div>
                {d.evidenceMetadata?.notes ? (
                  <div className="mt-1 text-[11px] text-slate-500 line-clamp-2">
                    {d.evidenceMetadata.notes}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


