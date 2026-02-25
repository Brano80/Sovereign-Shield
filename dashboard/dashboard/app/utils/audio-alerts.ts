/**
 * Audio Alert System for L1 (CRITICAL) Incidents
 * 
 * Uses Web Audio API to generate a discrete ping sound when a new L1 incident arrives.
 * This avoids the need for external audio files.
 */

let audioContext: AudioContext | null = null;
let lastPlayTime = 0;
const MIN_INTERVAL_MS = 1000; // Minimum 1 second between alerts

/**
 * Initialize or get the AudioContext
 * Must be called after a user interaction (browser security requirement)
 */
function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  
  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
      console.warn("Audio alerts: Web Audio API not supported", e);
      return null;
    }
  }
  
  // Resume if suspended (happens on first user interaction)
  if (audioContext.state === "suspended") {
    audioContext.resume().catch(() => {});
  }
  
  return audioContext;
}

/**
 * Play a discrete ping sound for L1 (CRITICAL) incidents
 * 
 * Sound characteristics:
 * - Short duration (150ms)
 * - Two-tone alert (high + low frequency)
 * - Moderate volume to be noticeable but not jarring
 */
export function playL1AlertPing(): void {
  const now = Date.now();
  
  // Rate limit to prevent audio spam
  if (now - lastPlayTime < MIN_INTERVAL_MS) {
    return;
  }
  lastPlayTime = now;
  
  const ctx = getAudioContext();
  if (!ctx) return;
  
  try {
    const currentTime = ctx.currentTime;
    
    // Create gain node for volume control
    const gainNode = ctx.createGain();
    gainNode.connect(ctx.destination);
    gainNode.gain.setValueAtTime(0.15, currentTime); // 15% volume
    gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.15);
    
    // First tone - higher pitch (alert start)
    const osc1 = ctx.createOscillator();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(880, currentTime); // A5
    osc1.connect(gainNode);
    osc1.start(currentTime);
    osc1.stop(currentTime + 0.075);
    
    // Second tone - lower pitch (alert end)
    const osc2 = ctx.createOscillator();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(660, currentTime + 0.075); // E5
    osc2.connect(gainNode);
    osc2.start(currentTime + 0.075);
    osc2.stop(currentTime + 0.15);
    
    console.info("🔊 L1 Alert: Audio ping played");
  } catch (e) {
    console.warn("Audio alerts: Failed to play ping", e);
  }
}

/**
 * Check if a finding is an L1 (CRITICAL) severity that should trigger audio
 */
export function isL1Critical(severity: string): boolean {
  const normalized = severity.toUpperCase();
  return normalized === "CRITICAL" || normalized === "L1";
}

/**
 * Initialize audio context on first user interaction
 * This is required by browsers for audio playback
 */
export function initAudioOnInteraction(): void {
  const init = () => {
    getAudioContext();
    // Remove listeners after first interaction
    document.removeEventListener("click", init);
    document.removeEventListener("keydown", init);
  };
  
  if (typeof window !== "undefined") {
    document.addEventListener("click", init, { once: true });
    document.addEventListener("keydown", init, { once: true });
  }
}

