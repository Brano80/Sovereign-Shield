"use client";

import React, { useState, useEffect } from "react";
import { Lock, FileDown, Clock, Shield } from "lucide-react";
import { useEnforcementStreamStore } from "@/app/store/enforcementStreamStore";
import type { LensFinding } from "@/app/types/lensFinding";
import { API_BASE } from "@/utils/api-config";
import { getAuthHeaders } from "@/utils/auth";

function parseNotesKV(notes?: string): Record<string, string> {
  if (!notes) return {};
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

function filterEvidenceItems(decisions: LensFinding[]): LensFinding[] {
  // Prefer explicit Audit & Evidence lens; fall back to any L4 evidence events.
  const auditEvidence = decisions.filter((d) => d.lensId === "audit-evidence");
  const l4 = decisions.filter((d) => d.level === "L4");
  const combined = [...auditEvidence, ...l4];

  // De-dupe by (timestamp,moduleId,sealId,txId)
  const seen = new Set<string>();
  const out: LensFinding[] = [];
  for (const d of combined) {
    const key = [
      d.timestamp,
      d.moduleId,
      d.evidenceMetadata?.sealId ?? "",
      d.evidenceMetadata?.txId ?? "",
    ].join("|");
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(d);
  }
  return out.sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));
}

function isVerified(d: LensFinding): boolean {
  return !!(d.evidenceMetadata?.integrityReportId || d.evidenceMetadata?.sealId);
}

function regulationContext(d: LensFinding): string {
  const kv = parseNotesKV(d.evidenceMetadata?.notes);
  return (
    kv.article ||
    kv.regulation ||
    kv.context ||
    (d.lensId === "audit-evidence" ? "Audit / Annex IV" : "Evidence")
  );
}

function exportUrl(format: "pdf" | "json" | "xml", sealId?: string): string {
  const params = new URLSearchParams();
  params.set("format", format);
  params.set("report_type", "annex_iv");
  params.set("include_integrity", "true");
  if (sealId) params.set("seal_id", sealId);
  return `${API_BASE}/download_report?${params.toString()}`;
}

interface EvidenceEvent {
  id: string;
  eventId: string;
  eventType: string;
  severity: 'L1' | 'L2' | 'L3' | 'L4';
  occurredAt: string;
  sourceSystem: string;
  nexusSeal?: string;
  regulatoryFramework?: string;
}

interface SealedEvidencePanelProps {
  events?: EvidenceEvent[];
  isLoading?: boolean;
}

export function SealedEvidencePanel({ events = [], isLoading = false }: SealedEvidencePanelProps) {
  const decisions = useEnforcementStreamStore((s) => s.decisions);
  const [evidenceEvents, setEvidenceEvents] = useState<EvidenceEvent[]>([]);
  const [loading, setLoading] = useState(isLoading);

  // Use provided events or fetch if none provided
  useEffect(() => {
    if (events.length > 0) {
      // Convert events to the format expected by the component
      const formattedEvents: EvidenceEvent[] = events.map(event => ({
        id: event.id,
        eventId: event.eventId,
        eventType: event.eventType,
        severity: event.severity,
        occurredAt: event.occurredAt,
        sourceSystem: event.sourceSystem,
        nexusSeal: event.nexusSeal,
        regulatoryFramework: event.regulatoryFramework,
      }));
      setEvidenceEvents(formattedEvents);
      setLoading(false);
    } else if (!isLoading) {
      // Fallback to API fetch if no events provided and not loading
      const fetchEvidenceEvents = async () => {
        try {
          setLoading(true);
          const response = await fetch(`${API_BASE}/evidence/events?limit=50`, {
            headers: getAuthHeaders(),
          });

          if (response.ok) {
            const data = await response.json();
            setEvidenceEvents(data.events || []);
          }
        } catch (error) {
          console.error('Failed to fetch evidence events:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchEvidenceEvents();
    }
  }, [events, isLoading]);

  // Combine enforcement decisions and evidence events
  const combinedItems = React.useMemo(() => {
    const lensItems = filterEvidenceItems(decisions);

    // Convert evidence events to display format
    const evidenceItems = evidenceEvents.map(event => ({
      id: event.id,
      eventType: event.eventType,
      occurredAt: event.occurredAt,
      sourceSystem: event.sourceSystem,
      severity: event.severity,
      nexusSeal: event.nexusSeal,
      regulatoryFramework: event.regulatoryFramework,
      isEvidenceEvent: true
    }));

    return [...lensItems, ...evidenceItems].sort((a, b) => {
      const aTime = 'timestamp' in a ? a.timestamp : ('occurredAt' in a ? a.occurredAt : '');
      const bTime = 'timestamp' in b ? b.timestamp : ('occurredAt' in b ? b.occurredAt : '');
      return new Date(bTime).getTime() - new Date(aTime).getTime();
    });
  }, [decisions, evidenceEvents]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white">Sealed Evidence Vault</h2>
          <p className="text-sm text-slate-400">
            Cryptographically sealed evidence events and regulatory exports.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={async () => {
              try {
                const token = localStorage.getItem('auth_token');
                const response = await fetch(`${API_BASE}/evidence/integrity/check`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
                  },
                });

                if (response.ok) {
                  console.log('Full integrity check completed');
                  // Could show a success toast or refresh data
                } else {
                  console.error('Failed to run integrity check');
                }
              } catch (error) {
                console.error('Error running integrity check:', error);
              }
            }}
            className="inline-flex items-center gap-2 rounded-lg border border-emerald-400/20 bg-emerald-500/10 px-3 py-2 text-sm font-semibold text-emerald-200 hover:bg-emerald-500/20 transition-colors"
            title="Run full cryptographic integrity check"
          >
            <Shield size={16} />
            Run full integrity check
          </button>

          <button
            onClick={async () => {
              try {
                const token = localStorage.getItem('auth_token');
                const response = await fetch(`${API_BASE}/evidence/integrity/report`, {
                  method: 'GET',
                  headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
                  },
                });

                if (response.ok) {
                  const data = await response.json();
                  console.log('Integrity report:', data);
                  // Could open report in new window or show modal
                } else {
                  console.error('Failed to generate integrity report');
                }
              } catch (error) {
                console.error('Error generating integrity report:', error);
              }
            }}
            className="inline-flex items-center gap-2 rounded-lg border border-blue-400/20 bg-blue-500/10 px-3 py-2 text-sm font-semibold text-blue-200 hover:bg-blue-500/20 transition-colors"
            title="Generate detailed integrity report"
          >
            <FileDown size={16} />
            Integrity report
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-slate-400 backdrop-blur-xl">
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Loading evidence events...
            </div>
          </div>
        ) : combinedItems.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-slate-400 backdrop-blur-xl">
            No sealed evidence events yet. Once compliance modules create evidence entries,
            they'll appear here with cryptographic seals.
          </div>
        ) : combinedItems.length === 0 && !loading ? (
          <div className="text-center py-8 space-y-4">
            <div className="text-slate-400">
              <p className="mb-4">No evidence events found. Generate some test events to see the Evidence Vault in action.</p>
              <button
                onClick={async () => {
                  try {
                    const token = localStorage.getItem('auth_token');
                    const response = await fetch(`${API_BASE}/evidence/debug/generate-test-events`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
                      },
                    });

                    if (response.ok) {
                      // Refresh the page or refetch events
                      window.location.reload();
                    } else {
                      console.error('Failed to generate test events');
                    }
                  } catch (error) {
                    console.error('Error generating test events:', error);
                  }
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Generate Test Evidence
              </button>
            </div>
          </div>
        ) : null}

        {combinedItems.slice(0, 25).map((item) => {
          // Handle both LensFinding and EvidenceEvent formats
          const isEvidenceEvent = 'isEvidenceEvent' in item;
          const verified = isEvidenceEvent ? !!(item as any).nexusSeal : isVerified(item as LensFinding);
          const sealId = isEvidenceEvent ? (item as any).nexusSeal : (item as LensFinding).evidenceMetadata?.sealId;
          const ctx = isEvidenceEvent
            ? (item as any).eventType?.replace('_', ' ') || 'Evidence Event'
            : regulationContext(item as LensFinding);
          const timestamp = isEvidenceEvent ? (item as any).occurredAt : (item as LensFinding).timestamp;
          const moduleId = isEvidenceEvent ? (item as any).sourceSystem : (item as LensFinding).moduleId;
          const level = isEvidenceEvent ? (item as any).severity : (item as LensFinding).level;

          return (
            <div
              key={`${timestamp}|${moduleId}|${sealId ?? ""}`}
              className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl shadow-xl shadow-black/20 ring-1 ring-blue-400/10"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex h-7 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 text-xs text-slate-200`}>
                      <span className={`inline-block h-2.5 w-2.5 rounded-full ${
                        level === 'L4' || level === 'CRITICAL' ? 'bg-red-400' :
                        level === 'L3' || level === 'HIGH' ? 'bg-orange-400' :
                        level === 'L2' || level === 'MEDIUM' ? 'bg-blue-400' : 'bg-green-400'
                      }`} />
                      {isEvidenceEvent ? `${level} Evidence` : `${level} Evidence`}
                    </span>
                    <div className="text-sm font-semibold text-white">{ctx}</div>
                  </div>

                  <div className="text-xs text-slate-400">
                    module: <span className="text-slate-300">{moduleId}</span>
                    {" • "}
                    <span className="text-slate-500">{new Date(timestamp).toLocaleString()}</span>
                  </div>

                  <div className="mt-2 flex flex-wrap gap-2">
                    {verified ? (
                      <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                        <Lock size={14} />
                        Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-200">
                        <Lock size={14} />
                        Unverified
                      </span>
                    )}

                    {sealId ? (
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                        seal_id: <span className="text-slate-200">{sealId.slice(0, 16)}...</span>
                      </span>
                    ) : null}

                    {isEvidenceEvent && (item as any).regulatoryFramework ? (
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                        framework: <span className="text-slate-200">{(item as any).regulatoryFramework}</span>
                      </span>
                    ) : null}
                  </div>

                  {!isEvidenceEvent && (item as LensFinding).evidenceMetadata?.notes ? (
                    <div className="mt-2 text-xs text-slate-400">{(item as LensFinding).evidenceMetadata.notes}</div>
                  ) : null}
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      // Trigger package generation for this evidence
                      console.log('Generate package for evidence:', item);
                    }}
                    className="inline-flex items-center gap-2 rounded-lg border border-emerald-400/20 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-200 hover:bg-emerald-500/20 transition-colors"
                    title="Generate Evidence Package"
                  >
                    <FileDown size={14} />
                    Generate Package
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


