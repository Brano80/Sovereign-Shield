"use client";

import { BarChart3 } from "lucide-react";

export function RootCauseAnalysis() {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900 p-12 text-center">
      <BarChart3 className="h-12 w-12 mx-auto text-slate-500 mb-4" />
      <h3 className="text-lg font-semibold text-white mb-2">Root Cause Analysis</h3>
      <p className="text-slate-400">
        Root cause analysis visualization and statistics coming soon.
      </p>
      <p className="text-sm text-slate-500 mt-2">
        DORA Art.13 - Automated root cause analysis with ML assistance
      </p>
    </div>
  );
}

