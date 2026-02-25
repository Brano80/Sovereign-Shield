"use client";

import React from "react";
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { LensFinding } from "@/app/types/lensFinding";
import { complianceApi } from "@/app/lib/api-client";
import { useCurrentUser } from "@/app/hooks/useCurrentUser";
import { getApiBase } from "@/app/utils/api-config";
import { getAuthHeaders } from "@/app/utils/auth";

type RadarAxis =
  | "Social Scoring"
  | "Emotion Recognition"
  | "Biometric Categorization"
  | "Predictive Policing"
  | "Manipulation";

const RADAR_AXES: RadarAxis[] = [
  "Social Scoring",
  "Emotion Recognition",
  "Biometric Categorization",
  "Predictive Policing",
  "Manipulation",
];

function normalizeCategory(raw?: string): RadarAxis | null {
  if (!raw) return null;
  const s = raw.trim().toLowerCase().replace(/[\s_\-]+/g, "");

  if (s.includes("social") && s.includes("scoring")) return "Social Scoring";
  if (s.includes("emotion") && s.includes("recognition")) return "Emotion Recognition";
  if (s.includes("biometric") && (s.includes("categorization") || s.includes("category")))
    return "Biometric Categorization";
  if (s.includes("predictive") && (s.includes("policing") || s.includes("police")))
    return "Predictive Policing";
  if (s.includes("manipulation") || s.includes("manipulate")) return "Manipulation";

  return null;
}

function parseNotesKV(notes?: string): Record<string, string> {
  if (!notes) return {};
  // Supports: "category=SOCIAL_SCORING matched_pattern=x review_id=..."; also tolerates commas/semicolons.
  const parts = notes.split(/[\s,;]+/g).filter(Boolean);
  const out: Record<string, string> = {};
  for (const p of parts) {
    const idx = p.indexOf("=");
    if (idx <= 0) continue;
    const k = p.slice(0, idx).trim();
    const v = p.slice(idx + 1).trim();
    if (!k || !v) continue;
    out[k] = v;
  }
  return out;
}

function decisionCategory(d: LensFinding): RadarAxis | null {
  const kv = parseNotesKV(d.evidenceMetadata?.notes);
  return normalizeCategory(kv.category || kv.cat || kv.practice || kv.type);
}

function clamp01(n: number): number {
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(1, n));
}

function formatPct(score?: number): string {
  if (score === undefined || score === null) return "—";
  return `${Math.round(clamp01(score) * 100)}%`;
}

async function postReviewAction(
  reviewId: string,
  action: "approve" | "deny"
): Promise<void> {
  // Best-effort call; UI is optimistic regardless.
  await complianceApi.post(`/art5/reviews/${encodeURIComponent(reviewId)}/${action}`, {
    reviewer_id: "admin-ui",
    comments: `Action from Prohibited Practices Lens: ${action}`,
  });

  // Log human override via API
  try {
    await complianceApi.post('/audit/events', {
      eventType: "AI.OVERRIDE.EXECUTED",
      sourceSystem: "ai-act-art5",
      correlationId: reviewId,
      severity: "MEDIUM",
      payload: {
        aiDecisionId: reviewId,
        overrideReason: `Review decision from Prohibited Practices Lens: ${action}`,
        originalDecision: "BLOCKED",
        newDecision: action.toUpperCase(),
      },
      regulatoryTags: ["AI_ACT"],
      articles: ["AI_ACT-14"],
    });
  } catch (error) {
    console.error("AI Act audit logging failed:", error);
  }
}

function l2SoftBlockCandidates(decisions: LensFinding[]): LensFinding[] {
  return decisions
    .filter((d) => d.lensId === "ai-act-art5")
    .filter((d) => d.level === "L2")
    .filter((d) => {
      const s = d.confidenceScore;
      return typeof s === "number" && s >= 0.5 && s <= 0.85;
    });
}

export function ProhibitedPracticesRadar() {
  const { user } = useCurrentUser();
  const [decisions, setDecisions] = React.useState<LensFinding[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [dismissed, setDismissed] = React.useState<Record<string, true>>({});
  const [actionBusy, setActionBusy] = React.useState<Record<string, true>>({});

  // Fetch audit events from API
  React.useEffect(() => {
    const fetchAuditEvents = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${getApiBase()}/audit/events`, {
          headers: getAuthHeaders(),
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch audit events: ${response.status}`);
        }

        const data = await response.json();

        // Transform API response to LensFinding format
        // Assuming the API returns events with similar structure to LensFinding
        const transformedDecisions: LensFinding[] = data.events?.map((event: any) => ({
          id: event.id || event.eventId,
          lensId: event.sourceSystem || 'ai-act-art5',
          level: event.severity === 'CRITICAL' ? 'L1' : event.severity === 'HIGH' ? 'L2' : 'L3',
          confidenceScore: event.confidence || event.riskScore || 0.5,
          timestamp: event.timestamp || event.occurredAt || new Date().toISOString(),
          moduleId: event.correlationId || event.eventId,
          evidenceMetadata: {
            notes: `category=${event.eventType || 'UNKNOWN'};matched_pattern=${event.payload?.pattern || ''};review_id=${event.correlationId || ''}`,
          },
        })) || [];

        setDecisions(transformedDecisions);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch audit events:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch audit events');
        setDecisions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAuditEvents();

    // Set up polling every 30 seconds to refresh data
    const interval = setInterval(fetchAuditEvents, 30000);

    return () => clearInterval(interval);
  }, []);

  const art5 = React.useMemo(
    () => decisions.filter((d) => d.lensId === "ai-act-art5"),
    [decisions]
  );

  const radarData = React.useMemo(() => {
    const best: Record<RadarAxis, number> = {
      "Social Scoring": 0,
      "Emotion Recognition": 0,
      "Biometric Categorization": 0,
      "Predictive Policing": 0,
      "Manipulation": 0,
    };

    for (const d of art5) {
      const cat = decisionCategory(d);
      if (!cat) continue;
      if (typeof d.confidenceScore !== "number") continue;
      best[cat] = Math.max(best[cat], clamp01(d.confidenceScore));
    }

    return RADAR_AXES.map((axis) => ({
      category: axis,
      risk: best[axis],
    }));
  }, [art5]);

  const queue = React.useMemo(() => {
    const items = l2SoftBlockCandidates(art5).filter((d) => {
      const kv = parseNotesKV(d.evidenceMetadata?.notes);
      const reviewId = kv.review_id || kv.reviewId || kv.review || "";
      const key = reviewId || `${d.timestamp}:${d.moduleId}:${d.confidenceScore ?? "na"}`;
      return !dismissed[key];
    });
    return items;
  }, [art5, dismissed]);

  const latest = art5[0];
  const latestCat = latest ? decisionCategory(latest) : null;
  const latestKV = latest ? parseNotesKV(latest.evidenceMetadata?.notes) : {};

  async function handleAction(d: LensFinding, action: "approve" | "deny") {
    const kv = parseNotesKV(d.evidenceMetadata?.notes);
    const reviewId = kv.review_id || kv.reviewId || kv.review;
    const key = reviewId || `${d.timestamp}:${d.moduleId}:${d.confidenceScore ?? "na"}`;

    // optimistic remove
    setDismissed((prev) => ({ ...prev, [key]: true }));

    if (!reviewId) return; // no server action possible

    try {
      setActionBusy((p) => ({ ...p, [key]: true }));
      await postReviewAction(String(reviewId), action);
    } catch (e) {
      // Best-effort: keep UI responsive; console for debugging.
       
      console.warn("Art5 review action failed (best-effort):", e);
    } finally {
      setActionBusy((p) => {
        const next = { ...p };
        delete next[key];
        return next;
      });
    }
  }

  if (loading && decisions.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-slate-400">Loading audit events...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-red-400">Error loading audit events: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white">Prohibited Practices • AI Act Art. 5</h2>
          <p className="text-sm text-slate-400">
            Live “Pattern Radar” driven by SSE confidence scores.
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur">
          <div className="text-xs text-slate-400">Latest signal</div>
          <div className="mt-1 flex items-center gap-3">
            <div className="text-sm text-slate-200">
              <span className="text-slate-400">Category:</span>{" "}
              <span className="font-semibold text-white">{latestCat ?? "—"}</span>
            </div>
            <div className="text-sm text-slate-200">
              <span className="text-slate-400">Confidence:</span>{" "}
              <span className="font-semibold text-white">
                {formatPct(latest?.confidenceScore)}
              </span>
            </div>
            {latestKV.matched_pattern ? (
              <div className="hidden md:block text-xs text-slate-400">
                pattern: <span className="text-slate-300">{latestKV.matched_pattern}</span>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-slate-200">Pattern Radar</div>
            <div className="text-xs text-slate-400">Max confidence (last 50 events)</div>
          </div>
          <div className="mt-3 h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.12)" />
                <PolarAngleAxis
                  dataKey="category"
                  tick={{ fill: "rgba(226,232,240,0.85)", fontSize: 12 }}
                />
                <PolarRadiusAxis
                  domain={[0, 1]}
                  tickFormatter={(v) => `${Math.round(Number(v) * 100)}%`}
                  tick={{ fill: "rgba(148,163,184,0.75)", fontSize: 11 }}
                  stroke="rgba(255,255,255,0.12)"
                />
                <Tooltip
                  formatter={(value) => formatPct(Number(value))}
                  contentStyle={{
                    background: "rgba(15, 23, 42, 0.92)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: 12,
                    color: "rgba(226,232,240,0.95)",
                  }}
                />
                <Radar
                  name="Risk"
                  dataKey="risk"
                  stroke="rgba(239, 68, 68, 0.9)"
                  fill="rgba(239, 68, 68, 0.25)"
                  strokeWidth={2}
                  dot={{ r: 3, strokeWidth: 2 }}
                  isAnimationActive
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-slate-200">Human‑in‑the‑Loop</div>
            <div className="inline-flex items-center gap-2">
              <span className="inline-flex h-6 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2.5 text-xs text-slate-200">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-orange-400" />
                L2 Review Queue
              </span>
            </div>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Items with confidence in <span className="text-slate-300">0.50–0.85</span>.
          </p>

          <div className="mt-4 space-y-3">
            {queue.length === 0 ? (
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-400">
                No L2 items yet. When Art. 5 emits soft blocks (0.50–0.85), they’ll appear here.
              </div>
            ) : null}

            {queue.slice(0, 12).map((d) => {
              const kv = parseNotesKV(d.evidenceMetadata?.notes);
              const reviewId = kv.review_id || kv.reviewId || kv.review || undefined;
              const cat = decisionCategory(d) ?? "—";
              const key = String(
                reviewId || `${d.timestamp}:${d.moduleId}:${d.confidenceScore ?? "na"}`
              );
              const busy = !!actionBusy[key];

              return (
                <div
                  key={key}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex h-6 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2.5 text-xs text-slate-200">
                          <span className="inline-block h-2.5 w-2.5 rounded-full bg-orange-400" />
                          L2
                        </span>
                        <div className="text-sm font-semibold text-white">{cat}</div>
                      </div>
                      <div className="mt-1 text-xs text-slate-400">
                        confidence:{" "}
                        <span className="text-slate-200">{formatPct(d.confidenceScore)}</span>
                        {" • "}
                        <span className="text-slate-500">
                          {new Date(d.timestamp).toLocaleString()}
                        </span>
                      </div>
                      {reviewId ? (
                        <div className="mt-1 text-[11px] text-slate-500">
                          review_id: <span className="text-slate-400">{reviewId}</span>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => handleAction(d, "approve")}
                      className="rounded-lg border border-white/10 bg-emerald-500/15 px-3 py-2 text-xs font-semibold text-emerald-200 hover:bg-emerald-500/25 disabled:opacity-60"
                      title="Approve (release)"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => handleAction(d, "deny")}
                      className="rounded-lg border border-white/10 bg-red-500/15 px-3 py-2 text-xs font-semibold text-red-200 hover:bg-red-500/25 disabled:opacity-60"
                      title="Block (confirm hard block)"
                    >
                      Block
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}


