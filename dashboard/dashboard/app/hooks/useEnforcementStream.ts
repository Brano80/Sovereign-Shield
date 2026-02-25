"use client";

import { useEffect, useRef } from "react";
import { useEnforcementStreamStore } from "../store/enforcementStreamStore";
import { getAuthToken } from "../utils/auth";
import { API_BASE } from "../utils/api-config";
import type { LensFinding } from "../types/lensFinding";

type Options = {
  enabled?: boolean;
};

function parseSseBlock(block: string): { event?: string; data?: string } | null {
  // SSE block is lines separated by \n, terminated by \n\n at the stream level.
  const lines = block.split(/\r?\n/g).map((l) => l.trimEnd());
  let event: string | undefined;
  const dataLines: string[] = [];

  for (const line of lines) {
    if (!line) continue;
    if (line.startsWith("event:")) event = line.slice("event:".length).trim();
    if (line.startsWith("data:")) dataLines.push(line.slice("data:".length).trim());
  }

  if (!event && dataLines.length === 0) return null;
  return { event, data: dataLines.join("\n") };
}

export function useEnforcementStream(options: Options = {}) {
  const enabled = options.enabled ?? true;
  const addDecision = useEnforcementStreamStore((s) => s.addDecision);
  const setConnection = useEnforcementStreamStore((s) => s.setConnection);
  const setError = useEnforcementStreamStore((s) => s.setError);

  const evtSourceRef = useRef<EventSource | null>(null);
  const reconnectTimerRef = useRef<number | null>(null);
  const reconnectAttemptRef = useRef<number>(0);
  const maxReconnectAttempts = 5; // Limit reconnection attempts to prevent infinite loops

  useEffect(() => {
    if (!enabled) return;

    const connect = async () => {
      const token = getAuthToken();
      if (!token) {
        setConnection("idle");
        setError("SSE stream: missing auth token");
         
        console.warn("SSE: missing auth token; not connecting");
        return;
      }

      // Cleanup any prior connection
      if (evtSourceRef.current) {
        evtSourceRef.current.close();
        evtSourceRef.current = null;
      }
      setConnection("connecting");
      setError(undefined);

      try {
        // IMPORTANT: This stream is served by the backend API (not Next.js).
        // Use EventSource API for proper SSE support (includes automatic reconnection).
        const url = `${API_BASE}/lenses/stream?token=${encodeURIComponent(token)}`;
         
        console.info("SSE: connecting via EventSource", url);

        // EventSource doesn't support custom headers, so we pass token as query param.
        // Backend must extract it from query string and validate it.
        const evtSource = new EventSource(url);
        evtSourceRef.current = evtSource;

        evtSource.onopen = () => {
          setConnection("open");
          reconnectAttemptRef.current = 0;
           
          console.info("SSE: EventSource opened");
        };

        evtSource.onerror = (e) => {
           
          console.error("SSE: EventSource error", e);
          if (evtSource.readyState === EventSource.CLOSED) {
            setConnection("closed");
            scheduleReconnect();
          } else {
            setConnection("error");
            setError("SSE connection error");
          }
        };

        evtSource.addEventListener("lens_finding", (e: MessageEvent) => {
          try {
            const obj = JSON.parse(e.data) as LensFinding;
             
            console.warn("SSE: event", obj.lensId, obj.level, obj.evidenceMetadata?.txId);
            addDecision(obj);
          } catch (err) {
             
            console.warn("SSE: failed to parse event data", String(err), e.data.slice(0, 200));
          }
        });

        // Listen for module configuration changes
        evtSource.addEventListener("module_config_changed", (e: MessageEvent) => {
          try {
            const moduleConfig = JSON.parse(e.data);
            console.info("SSE: module_config_changed", moduleConfig);
            
            // Trigger React Query cache invalidation for enabled modules
            // This will cause useEnabledModules to refetch immediately
            if (typeof window !== 'undefined' && (window as any).reactQueryClient) {
              (window as any).reactQueryClient.invalidateQueries({ queryKey: ["enabled-modules"] });
            } else {
              // Fallback: dispatch custom event that useEnabledModules can listen to
              window.dispatchEvent(new CustomEvent('module-config-changed', { detail: moduleConfig }));
            }
          } catch (err) {
            console.warn("SSE: failed to parse module_config_changed event", String(err), e.data.slice(0, 200));
          }
        });
      } catch (e: any) {
        setConnection("error");
        setError(e?.message ?? "SSE stream error");
        scheduleReconnect();
      }
    };

    const scheduleReconnect = () => {
      if (reconnectTimerRef.current) window.clearTimeout(reconnectTimerRef.current);
      const attempt = reconnectAttemptRef.current + 1;
      reconnectAttemptRef.current = attempt;

      // Stop reconnecting after max attempts to prevent infinite loops
      if (attempt > maxReconnectAttempts) {
        console.warn(`SSE: Maximum reconnection attempts (${maxReconnectAttempts}) reached. Stopping reconnection.`);
        setConnection("closed");
        setError("SSE: Backend not responding - stopped reconnection attempts");
        return;
      }

      const delayMs = Math.min(10_000, 500 * Math.pow(2, attempt)); // 0.5s, 1s, 2s... max 10s
      reconnectTimerRef.current = window.setTimeout(() => {
        connect().catch(() => scheduleReconnect());
      }, delayMs);
    };

    connect().catch(() => scheduleReconnect());

    return () => {
      if (evtSourceRef.current) {
        evtSourceRef.current.close();
        evtSourceRef.current = null;
      }
      if (reconnectTimerRef.current) window.clearTimeout(reconnectTimerRef.current);
      setConnection("closed");
    };
  }, [enabled, addDecision, setConnection, setError]);
}


