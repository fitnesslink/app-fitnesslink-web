"use client";

import { useEffect, useState } from "react";

export type LayoutMode = "mobile" | "tablet" | "desktop";

// Breakpoints mirror Tailwind defaults — keep in sync with PLAN_MAIN_APP.md §3.
const TABLET_MIN = 768; // md
const DESKTOP_MIN = 1024; // lg

function currentMode(): LayoutMode {
  if (typeof window === "undefined") return "desktop"; // SSR-safe default
  const w = window.innerWidth;
  if (w >= DESKTOP_MIN) return "desktop";
  if (w >= TABLET_MIN) return "tablet";
  return "mobile";
}

/**
 * Returns the active layout mode based on viewport width.
 *
 * SSR-safe: returns `"desktop"` on the server and the first client render,
 * then updates after mount. Consumers that render differently per mode should
 * suppress hydration warnings or only read `mode` inside an effect if the
 * initial-paint shape matters.
 */
export function useLayoutMode(): LayoutMode {
  const [mode, setMode] = useState<LayoutMode>("desktop");

  useEffect(() => {
    const update = () => setMode(currentMode());
    update();

    const tabletMQ = window.matchMedia(`(min-width: ${TABLET_MIN}px)`);
    const desktopMQ = window.matchMedia(`(min-width: ${DESKTOP_MIN}px)`);
    tabletMQ.addEventListener("change", update);
    desktopMQ.addEventListener("change", update);
    return () => {
      tabletMQ.removeEventListener("change", update);
      desktopMQ.removeEventListener("change", update);
    };
  }, []);

  return mode;
}
