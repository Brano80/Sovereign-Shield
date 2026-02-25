"use client";

import { useIsFetching } from "@tanstack/react-query";
import { useEnforcementStreamStore } from "../store/enforcementStreamStore";
import { RefreshCw, Radio } from "lucide-react";

interface SyncingIndicatorProps {
  className?: string;
}

/**
 * Syncing with Reality Indicator
 * Shows when:
 * - React Query is fetching data (refetch/initial load)
 * - SSE connection is connecting or receiving updates
 */
export default function SyncingIndicator({ className = "" }: SyncingIndicatorProps) {
  // Track React Query fetching state
  const isFetching = useIsFetching();
  
  // Track SSE connection state
  const sseConnection = useEnforcementStreamStore((s) => s.connection);
  
  // Determine if we're actively syncing
  const isQuerySyncing = isFetching > 0;
  const isSseSyncing = sseConnection === "connecting";
  const isSseConnected = sseConnection === "open";
  
  const isSyncing = isQuerySyncing || isSseSyncing;
  
  // Don't show anything if not syncing and SSE is stable
  if (!isSyncing && isSseConnected) {
    return null;
  }

  return (
    <div 
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${className} ${
        isSyncing 
          ? "bg-blue-900/30 border border-blue-700/50 text-blue-400" 
          : isSseConnected 
            ? "bg-emerald-900/30 border border-emerald-700/50 text-emerald-400"
            : "bg-amber-900/30 border border-amber-700/50 text-amber-400"
      }`}
    >
      {isSyncing ? (
        <>
          <RefreshCw size={12} className="animate-spin" />
          <span className="animate-pulse">Syncing</span>
        </>
      ) : isSseConnected ? (
        <>
          <Radio size={12} />
          <span>Live</span>
        </>
      ) : (
        <>
          <Radio size={12} className="animate-pulse" />
          <span>Reconnecting...</span>
        </>
      )}
    </div>
  );
}

