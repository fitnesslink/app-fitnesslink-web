"use client";

import { useCallback, useEffect, useRef } from "react";

type Cue = "restStart" | "restEnd";

// Short tones synthesized via Web Audio so we don't ship binary assets.
// Feature-detected; silent no-op when AudioContext isn't available.
export function useAudioCues(): { play: (cue: Cue) => void } {
  const ctxRef = useRef<AudioContext | null>(null);

  // Lazy-create on first interaction — browsers block AudioContext construction
  // before a user gesture.
  const ensureCtx = useCallback(() => {
    if (ctxRef.current) return ctxRef.current;
    if (typeof window === "undefined") return null;
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctxRef.current = new Ctor();
    return ctxRef.current;
  }, []);

  const play = useCallback(
    (cue: Cue) => {
      const ctx = ensureCtx();
      if (!ctx) return;
      const { freq, duration } = TONES[cue];
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = freq;
      osc.type = "sine";
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    },
    [ensureCtx]
  );

  useEffect(() => {
    return () => {
      ctxRef.current?.close().catch(() => void 0);
      ctxRef.current = null;
    };
  }, []);

  return { play };
}

const TONES: Record<Cue, { freq: number; duration: number }> = {
  restStart: { freq: 440, duration: 0.15 },
  restEnd: { freq: 660, duration: 0.35 },
};

export function vibrate(pattern: number | number[]): void {
  if (typeof navigator === "undefined" || !("vibrate" in navigator)) return;
  try {
    navigator.vibrate(pattern);
  } catch {
    // Some browsers throw despite feature detection — silent no-op.
  }
}
