"use client";

import { useState } from "react";
import { AlertCircle, X } from "lucide-react";
import { API_BASE } from "@/utils/api-config";
import { getAuthHeaders } from "@/utils/auth";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit?: (payload: {
    title: string;
    description: string;
    breachType: string;
    affectedRecords: number;
    dataCategories: string;
    risk_score: number;
    risk_level: string;
  }) => void;
  onSuccess?: () => void;
};

export function ReportBreachModal({ open, onClose, onSubmit, onSuccess }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [breachType, setBreachType] = useState("Confidentiality");
  const [affectedRecords, setAffectedRecords] = useState<number | "">("");
  const [dataCategories, setDataCategories] = useState("");
  const [specialCategories, setSpecialCategories] = useState(false);
  const [sensitiveCategories, setSensitiveCategories] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!open) return null;

  const getRiskData = () => {
    let score = 0.05;
    const records = typeof affectedRecords === "number" ? affectedRecords : 0;
    if (records > 100_000) {
      score += 0.30;
    } else if (records > 10_000) {
      score += 0.20;
    }
    if (specialCategories) {
      score += 0.35;
    }
    const breachTypeUpper = breachType.toUpperCase();
    if (breachTypeUpper === "CONFIDENTIALITY") {
      score += 0.15;
    } else if (breachTypeUpper === "COMBINED") {
      score += 0.20;
    }
    const sensAdd = Math.min(0.25, sensitiveCategories.length * 0.08);
    score += sensAdd;
    const finalScore = Math.min(1, Math.max(0, parseFloat(score.toFixed(2))));
    const level =
      finalScore >= 0.75
        ? "CRITICAL"
        : finalScore >= 0.5
        ? "HIGH"
        : finalScore >= 0.25
        ? "MEDIUM"
        : "LOW";
    return { score: finalScore, level };
  };

  const { score: riskScore, level: riskLevel } = getRiskData();

  const riskBadgeClasses = () => {
    switch (riskLevel) {
      case "CRITICAL":
        return "bg-rose-900/60 border-rose-700 text-rose-200 animate-pulse";
      case "HIGH":
        return "bg-orange-900/60 border-orange-700 text-orange-200";
      case "MEDIUM":
        return "bg-amber-900/60 border-amber-700 text-amber-200";
      default:
        return "bg-emerald-900/50 border-emerald-700 text-emerald-200";
    }
  };

  const toggleSensitive = (value: string) => {
    setSensitiveCategories((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const handleSubmit = () => {
    if (!title.trim() || !description.trim() || !dataCategories.trim() || affectedRecords === "") {
      setError("All fields are required.");
      return;
    }
    setSubmitting(true);
    setError(null);
    const { score, level } = getRiskData();
    const payload = {
      title: title.trim(),
      description: description.trim(),
      breachType,
      affectedRecords: Number(affectedRecords),
      dataCategories: dataCategories.trim(),
      risk_score: score,
      risk_level: level,
    };
    const apiPayload = {
      title: title.trim(),
      description: description.trim(),
      breach_type: breachType.toUpperCase(),
      affected_records_count: Number(affectedRecords),
      data_categories: dataCategories.trim(),
      special_categories_affected: specialCategories,
      risk_score: score,
      risk_level: level,
    };
    const submitFlow = async () => {
      try {
        onSubmit?.(payload);
        const res = await fetch(`${API_BASE}/api/v1/breaches`, {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify(apiPayload),
        });
        if (!res.ok) {
          const text = await res.text().catch(() => "Unknown error");
          throw new Error(text || `Failed: ${res.status}`);
        }
        setSuccessMsg("Breach reported successfully.");
        onSuccess?.();
        onClose();
      } catch (e: any) {
        setError("Failed to initialize 72h Breach Protocol.");
      } finally {
        setSubmitting(false);
      }
    };
    void submitFlow();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-700 rounded-xl shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <AlertCircle className="text-rose-300" size={18} />
            <h3 className="text-sm font-semibold text-white">Report New Breach (Art. 33)</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={18} />
          </button>
        </div>
        <div className="p-5 space-y-4">
          {error && <div className="text-xs text-rose-300">{error}</div>}
          {successMsg && <div className="text-xs text-emerald-300">{successMsg}</div>}
          <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-2">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <span>Risk Indicator</span>
              <span className={`px-2 py-1 rounded-md border text-[11px] font-semibold ${riskBadgeClasses()}`}>
                {riskLevel} • {riskScore.toFixed(2)}
              </span>
              {(riskLevel === "HIGH" || riskLevel === "CRITICAL") && (
                <span className="text-amber-300 text-[11px]">Art. 34 Notification Required</span>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs text-slate-300 font-semibold">Title *</label>
            <input
              className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white focus:outline-none focus:border-rose-400"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Short breach title"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs text-slate-300 font-semibold">Description *</label>
            <textarea
              className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white focus:outline-none focus:border-rose-400"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What happened and when?"
              required
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs text-slate-300 font-semibold">Breach Type *</label>
              <select
                className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white focus:outline-none focus:border-rose-400"
                value={breachType}
                onChange={(e) => setBreachType(e.target.value)}
              >
                {["Confidentiality", "Integrity", "Availability", "Combined"].map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs text-slate-300 font-semibold">Affected Records *</label>
              <input
                type="number"
                min={0}
                className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white focus:outline-none focus:border-rose-400"
                value={affectedRecords}
                onChange={(e) => setAffectedRecords(e.target.value === "" ? "" : Number(e.target.value))}
                placeholder="e.g., 1200"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs text-slate-300 font-semibold">Data Categories *</label>
            <input
              className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white focus:outline-none focus:border-rose-400"
              value={dataCategories}
              onChange={(e) => setDataCategories(e.target.value)}
              placeholder="e.g., PII, financial data"
              required
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs text-slate-300 font-semibold flex items-center gap-2">
                <input
                  type="checkbox"
                  className="form-checkbox rounded border-slate-600 bg-slate-800 text-rose-400"
                  checked={specialCategories}
                  onChange={(e) => setSpecialCategories(e.target.checked)}
                />
                Special Categories (health, biometric) *
              </label>
            </div>
            <div className="space-y-2">
              <label className="text-xs text-slate-300 font-semibold">Sensitive Categories</label>
              <div className="flex flex-wrap gap-2 text-[11px]">
                {["financial", "location", "credentials", "children"].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleSensitive(cat)}
                    className={`px-2 py-1 rounded-md border ${
                      sensitiveCategories.includes(cat)
                        ? "border-emerald-500 bg-emerald-900/40 text-emerald-200"
                        : "border-slate-700 bg-slate-800 text-slate-300"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg border border-slate-700 text-slate-200 hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-4 py-2 text-sm rounded-lg bg-rose-600 hover:bg-rose-500 text-white shadow disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Submitting..." : "Submit Breach"}
          </button>
        </div>
      </div>
    </div>
  );
}

