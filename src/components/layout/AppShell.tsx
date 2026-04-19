"use client";

import type { ReactNode } from "react";
import { MobileShell } from "./MobileShell";
import { DesktopShell } from "./DesktopShell";

interface AppShellProps {
  children: ReactNode;
  subtitle?: string;
  mobileHeader?: ReactNode;
  rightRail?: ReactNode;
}

// Renders both shells with Tailwind visibility classes so the browser swaps
// instantly at the `lg` breakpoint without a layout-mode re-render flash.
// Each shell mounts its own children — acceptable for read-only content; if
// a screen needs hydrated state across the swap, lift state up.
export function AppShell({ children, subtitle, mobileHeader, rightRail }: AppShellProps) {
  return (
    <>
      <div className="lg:hidden">
        <MobileShell header={mobileHeader}>{children}</MobileShell>
      </div>
      <div className="hidden lg:block">
        <DesktopShell subtitle={subtitle} rightRail={rightRail}>
          {children}
        </DesktopShell>
      </div>
    </>
  );
}
