"use client";

import { useState } from "react";
import { ShieldCheck, X } from "lucide-react";
import { API_BASE } from "@/utils/api-config";
import { getAuthHeaders } from "@/utils/auth";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit?: (payload: {
    systemName: string;
    purpose: string;
    legalBasis: string;
    dataSubjects: string;
  }) => void;
  onSuccess?: () => void;
};

export function NewDpiaModal({ open, onClose, onSubmit, onSuccess }: Props) {
  const [systemName, setSystemName] = useState("");
  const [purpose, setPurpose] = useState("");
  const [legalBasis, setLegalBasis] = useState("");
  const [dataSubjects, setDataSubjects] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!open) return null;

  const handleSubmit = () => {
    if (!systemName.trim() || !purpose.trim() || !legalBasis.trim() || !dataSubjects.trim()) {
      setError("All fields are required.");
      return;
    }
    setSubmitting(true);
    setError(null);
    const payload = {
      systemName: systemName.trim(),
      purpose: purpose.trim(),
      legalBasis: legalBasis.trim(),
      dataSubjects: dataSubjects.trim(),
    };
    const apiPayload = {
      system_name: systemName.trim(),
      purpose: purpose.trim(),
      legal_basis: legalBasis.trim(),
      data_subjects: dataSubjects.trim(),
    };
    const submitFlow = async () => {
      try {
        onSubmit?.(payload);
        const res = await fetch(`${API_BASE}/api/v1/compliance/risk-incidents/dpia`, {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify(apiPayload),
        });
        if (!res.ok) {
          const text = await res.text().catch(() => "Unknown error");
          throw new Error(text || `Failed: ${res.status}`);
        }
        setSuccessMsg("DPIA created successfully.");
        onSuccess?.();
        onClose();
      } catch (e: any) {
        setError("Failed to start DPIA");
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
            <ShieldCheck className="text-emerald-300" size={18} />
            <h3 className="text-sm font-semibold text-white">Start New DPIA (Art. 35)</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={18} />
          </button>
        </div>
        <div className="p-5 space-y-4">
          {error && <div className="text-xs text-rose-300">{error}</div>}
          {successMsg && <div className="text-xs text-emerald-300">{successMsg}</div>}
          <div className="space-y-2">
            <label className="text-xs text-slate-300 font-semibold">System Name *</label>
            <input
              className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-400"
              value={systemName}
              onChange={(e) => setSystemName(e.target.value)}
              placeholder="AI Scoring Engine"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs text-slate-300 font-semibold">Purpose *</label>
            <textarea
              className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-400"
              rows={3}
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="Describe processing purpose"
              required
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs text-slate-300 font-semibold">Legal Basis *</label>
              <input
                className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-400"
                value={legalBasis}
                onChange={(e) => setLegalBasis(e.target.value)}
                placeholder="e.g., Legitimate interest"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-slate-300 font-semibold">Data Subjects *</label>
              <input
                className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-400"
                value={dataSubjects}
                onChange={(e) => setDataSubjects(e.target.value)}
                placeholder="Customers, employees, minors..."
                required
              />
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
            className="px-4 py-2 text-sm rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Submitting..." : "Start DPIA"}
          </button>
        </div>
      </div>
    </div>
  );
}

