"use client";

import { useEffect, useState } from "react";

export function OfflineBanner() {
  // Render nothing on SSR + first client render; the effect below flips to
  // the real online state after mount. This avoids a hydration mismatch if
  // SSR ("typeof navigator === 'undefined' ? true : …") disagrees with the
  // client's actual `navigator.onLine` value.
  const [online, setOnline] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setOnline(navigator.onLine);
    const up = () => setOnline(true);
    const down = () => setOnline(false);
    window.addEventListener("online", up);
    window.addEventListener("offline", down);
    return () => {
      window.removeEventListener("online", up);
      window.removeEventListener("offline", down);
    };
  }, []);

  if (!mounted || online) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-0 inset-x-0 z-[90] bg-warning text-white text-xs font-semibold text-center py-2 px-4 shadow-md"
    >
      <span className="inline-flex items-center gap-2">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="1" y1="1" x2="23" y2="23" />
          <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55M5 12.55a10.94 10.94 0 0 1 5.17-2.39M10.71 5.05A16 16 0 0 1 22.58 9M1.42 9a15.91 15.91 0 0 1 4.7-2.88M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01" />
        </svg>
        You&apos;re offline — some data may be stale.
      </span>
    </div>
  );
}
