"use client";

import { TrendingUp } from "lucide-react";

export function TrendsChart() {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900 p-12 text-center">
      <TrendingUp className="h-12 w-12 mx-auto text-slate-500 mb-4" />
      <h3 className="text-lg font-semibold text-white mb-2">Trends & Insights</h3>
      <p className="text-slate-400">
        Trend analysis and insights visualization coming soon.
      </p>
      <p className="text-sm text-slate-500 mt-2">
        DORA Art.13 - Incident reduction trends and improvement metrics
      </p>
    </div>
  );
}

