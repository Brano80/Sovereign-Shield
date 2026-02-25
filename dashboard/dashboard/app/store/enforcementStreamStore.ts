import { create } from "zustand";
import type { LensFinding } from "../types/lensFinding";
import { playL1AlertPing, isL1Critical } from "../utils/audio-alerts";

type ConnectionState = "idle" | "connecting" | "open" | "closed" | "error";

export interface EnforcementStreamState {
  decisions: LensFinding[]; // newest-first
  connection: ConnectionState;
  lastError?: string;

  // UI signals
  sovereignShieldFlashNonce: number;
  
  // Audio settings
  audioEnabled: boolean;

  addDecision: (d: LensFinding) => void;
  setConnection: (s: ConnectionState) => void;
  setError: (msg?: string) => void;
  setAudioEnabled: (enabled: boolean) => void;
  clear: () => void;
}

function isSovereignShieldL1GeoBlock(d: LensFinding): boolean {
  return (
    d.lensId === "sovereign-shield" &&
    d.level === "L1" &&
    d.action === "BLOCK" &&
    !!d.geoData
  );
}

function isL1Incident(d: LensFinding): boolean {
  // Check level field (L1) or severity field (CRITICAL)
  return (
    d.level === "L1" || ("severity" in d && isL1Critical((d as any).severity || ""))
  );
}

export const useEnforcementStreamStore = create<EnforcementStreamState>((set, get) => ({
  decisions: [],
  connection: "idle",
  sovereignShieldFlashNonce: 0,
  audioEnabled: true, // Audio alerts enabled by default

  addDecision: (d) => {
    const prev = get().decisions;
    const next = [d, ...prev].slice(0, 50);
    
    // Play audio alert for L1 incidents if enabled
    if (get().audioEnabled && isL1Incident(d)) {
      playL1AlertPing();
    }

    set({
      decisions: next,
      sovereignShieldFlashNonce: isSovereignShieldL1GeoBlock(d)
        ? get().sovereignShieldFlashNonce + 1
        : get().sovereignShieldFlashNonce,
    });
  },

  setConnection: (s) => set({ connection: s }),
  setError: (msg) => set({ lastError: msg }),
  setAudioEnabled: (enabled) => set({ audioEnabled: enabled }),
  clear: () => set({ decisions: [], sovereignShieldFlashNonce: 0, lastError: undefined }),
}));


