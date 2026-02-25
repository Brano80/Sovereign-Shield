"use client";

import Link from "next/link";
import DashboardLayout from "@/app/components/DashboardLayout";
// import { useEnforcementStream } from "@/app/hooks/useEnforcementStream";
// import { useEnforcementStreamStore } from "@/app/store/enforcementStreamStore";
import { ArrowLeft } from "lucide-react";

export default function LensesLayout({ children }: { children: React.ReactNode }) {
  // Keep SSE alive while navigating deep-dives
  // useEnforcementStream({ enabled: true });
  // const connection = useEnforcementStreamStore((s) => s.connection);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 hover:bg-white/10 backdrop-blur transition-colors"
            >
              <ArrowLeft size={16} />
              Back
            </Link>
            <div className="text-sm text-slate-400">
              Deep-Dive
            </div>
          </div>
          {/* SSE Connection Indicator - Hidden until SSE endpoint is implemented */}
          {/* <div className="flex items-center gap-2">
            <div
              className={`h-2.5 w-2.5 rounded-full ${
                connection === "open"
                  ? "bg-emerald-400"
                  : connection === "connecting"
                  ? "bg-amber-400"
                  : "bg-red-400"
              }`}
            />
            <span className="text-xs text-slate-300/80">{connection.toUpperCase()}</span>
          </div> */}
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-xl shadow-black/30">
          <div className="p-6">{children}</div>
        </div>
      </div>
    </DashboardLayout>
  );
}


