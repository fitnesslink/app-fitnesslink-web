"use client";

import type { ReactNode } from "react";
import { TabBar } from "./nav/TabBar";

interface MobileShellProps {
  children: ReactNode;
  header?: ReactNode;
}

export function MobileShell({ children, header }: MobileShellProps) {
  return (
    <div className="min-h-dvh bg-background flex flex-col">
      {header}
      <main className="flex-1 pb-[calc(5rem+env(safe-area-inset-bottom))]">{children}</main>
      <TabBar />
    </div>
  );
}
