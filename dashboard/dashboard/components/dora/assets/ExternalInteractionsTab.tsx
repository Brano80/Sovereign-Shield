"use client";

import { Globe } from "lucide-react";

export function ExternalInteractionsTab() {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900 p-12 text-center">
      <Globe className="h-12 w-12 mx-auto text-slate-500 mb-4" />
      <h3 className="text-lg font-semibold text-white mb-2">External Interactions</h3>
      <p className="text-slate-400">
        External party interaction tracking coming soon.
      </p>
      <p className="text-sm text-slate-500 mt-2">
        DORA Art.7(8) - ICT systems interacting with external parties
      </p>
    </div>
  );
}

