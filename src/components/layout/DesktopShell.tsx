"use client";

import type { ReactNode } from "react";
import { Sidebar } from "./nav/Sidebar";
import { TopBar } from "./nav/TopBar";

interface DesktopShellProps {
  children: ReactNode;
  subtitle?: string;
  /** Optional right-rail slot — e.g., session controls, today's summary */
  rightRail?: ReactNode;
}

export function DesktopShell({ children, subtitle, rightRail }: DesktopShellProps) {
  return (
    <div className="h-dvh bg-background flex overflow-hidden">
      <Sidebar />
      <div className="flex-1 min-w-0 min-h-0 flex flex-col">
        <TopBar subtitle={subtitle} />
        <div className="flex-1 flex min-h-0">
          <main className="flex-1 min-w-0 overflow-y-auto p-6">{children}</main>
          {rightRail && (
            <aside className="hidden xl:block w-[320px] shrink-0 border-l border-border-soft overflow-y-auto p-6 bg-surface">
              {rightRail}
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
