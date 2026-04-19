"use client";

import { useEffect, useRef } from "react";

// Minimal WakeLockSentinel typing — TS lib.dom lags browser support slightly.
type WakeLockSentinel = { release: () => Promise<void> } | null;

/**
 * Acquires a screen wake lock while `active` is true. No-op on browsers that
 * don't implement the API. Re-acquires when the tab becomes visible again
 * because the browser releases the lock on blur.
 */
export function useWakeLock(active: boolean): void {
  const sentinelRef = useRef<WakeLockSentinel>(null);

  useEffect(() => {
    if (!active) return;
    if (typeof navigator === "undefined" || !("wakeLock" in navigator)) return;

    let cancelled = false;

    async function acquire() {
      try {
        const wakeLock = (navigator as Navigator & {
          wakeLock?: { request: (type: "screen") => Promise<WakeLockSentinel> };
        }).wakeLock;
        if (!wakeLock) return;
        const s = await wakeLock.request("screen");
        if (cancelled) {
          await s?.release();
          return;
        }
        sentinelRef.current = s;
      } catch {
        // Permission denied or transient failure — silently continue.
      }
    }

    acquire();

    const onVisibility = () => {
      if (document.visibilityState === "visible" && active && !sentinelRef.current) {
        acquire();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisibility);
      sentinelRef.current?.release().catch(() => void 0);
      sentinelRef.current = null;
    };
  }, [active]);
}
