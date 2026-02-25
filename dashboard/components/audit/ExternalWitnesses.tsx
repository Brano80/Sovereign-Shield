"use client";
import React from "react";

type Witness = {
  name: string;
  type: string;
  status: "READY" | "INACTIVE" | "ACTIVE";
  tier: "T1" | "T2" | "T3";
};

const WITNESSES: Witness[] = [
  { name: "Signicat", type: "TSA", status: "READY", tier: "T3" },
  { name: "Distributed Ledger Node", type: "BLOCKCHAIN", status: "INACTIVE", tier: "T3" },
  { name: "Distributed Ledger Node", type: "BLOCKCHAIN", status: "INACTIVE", tier: "T3" },
  { name: "Distributed Ledger Node", type: "BLOCKCHAIN", status: "INACTIVE", tier: "T3" },
  { name: "Distributed Ledger Node", type: "BLOCKCHAIN", status: "INACTIVE", tier: "T3" },
  { name: "Distributed Ledger Node", type: "BLOCKCHAIN", status: "INACTIVE", tier: "T3" },
  { name: "Distributed Ledger Node", type: "BLOCKCHAIN", status: "INACTIVE", tier: "T3" },
  { name: "Distributed Ledger Node", type: "BLOCKCHAIN", status: "INACTIVE", tier: "T3" },
  { name: "Distributed Ledger Node", type: "BLOCKCHAIN", status: "INACTIVE", tier: "T3" },
  { name: "Distributed Ledger Node", type: "BLOCKCHAIN", status: "INACTIVE", tier: "T3" },
  { name: "Distributed Ledger Node", type: "BLOCKCHAIN", status: "INACTIVE", tier: "T3" },
  { name: "Distributed Ledger Node", type: "BLOCKCHAIN", status: "INACTIVE", tier: "T3" },
];

const getStatusColor = (status: Witness["status"]) => {
  switch (status) {
    case "READY":
      return "text-slate-400"; // Gray for ready
    case "INACTIVE":
      return "text-slate-600"; // Darker gray for inactive
    case "ACTIVE":
      return "text-emerald-400"; // Green for active
    default:
      return "text-slate-400";
  }
};

const getStatusIcon = (status: Witness["status"]) => {
  switch (status) {
    case "READY":
      return "⚪"; // White circle
    case "INACTIVE":
      return "⚫"; // Black circle
    case "ACTIVE":
      return "🟢"; // Green circle
    default:
      return "⚪";
  }
};

export function ExternalWitnesses() {
  const activeCount = WITNESSES.filter(w => w.status === "ACTIVE").length;
  const totalCapacity = 12;

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
      <h3 className="mb-4 font-semibold text-white">External Witnesses</h3>

      {/* Main Status Display */}
      <div className="text-center mb-6">
        <div className="text-4xl font-bold text-white mb-1">{activeCount}</div>
        <div className="text-slate-400 text-sm">/ {totalCapacity} Active Anchors</div>
      </div>

      {/* Tier Information */}
      <div className="mb-4 text-center">
        <div className="text-xs text-slate-400 mb-2">Verification Tiers</div>
        <div className="flex justify-center gap-2">
          <span className="px-2 py-1 bg-slate-700 text-slate-300 text-xs rounded">T1</span>
          <span className="px-2 py-1 bg-slate-700 text-slate-300 text-xs rounded">T2</span>
          <span className="px-2 py-1 bg-emerald-500/20 text-emerald-300 text-xs rounded font-semibold">T3</span>
        </div>
      </div>

      {/* Witnesses List */}
      <div className="space-y-2 mb-4">
        {WITNESSES.map((witness, index) => (
          <div key={index} className="flex items-center justify-between p-2 rounded bg-slate-800/50">
            <div className="flex items-center gap-2">
              <span className="text-sm">{getStatusIcon(witness.status)}</span>
              <div>
                <div className="text-sm font-medium text-white">{witness.name}</div>
                <div className="text-xs text-slate-400">{witness.type}</div>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-xs font-medium ${getStatusColor(witness.status)}`}>
                {witness.status}
              </div>
              <div className="text-xs text-slate-500">{witness.tier}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Description */}
      <div className="text-center">
        <p className="text-xs text-slate-400">
          Verification tiers set to T3. Signicat witness active. Ready for first anchor.
        </p>
      </div>
    </div>
  );
}