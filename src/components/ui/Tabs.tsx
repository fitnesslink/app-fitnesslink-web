"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type Variant = "pill" | "underline";

interface TabsContextValue {
  value: string;
  setValue: (v: string) => void;
  variant: Variant;
}

const TabsContext = createContext<TabsContextValue | null>(null);

interface TabsProps {
  defaultValue: string;
  value?: string;
  onValueChange?: (value: string) => void;
  variant?: Variant;
  children: ReactNode;
  className?: string;
}

export function Tabs({
  defaultValue,
  value,
  onValueChange,
  variant = "underline",
  children,
  className = "",
}: TabsProps) {
  const [internal, setInternal] = useState(defaultValue);
  const current = value ?? internal;
  const setValue = (v: string) => {
    if (value === undefined) setInternal(v);
    onValueChange?.(v);
  };

  return (
    <TabsContext.Provider value={{ value: current, setValue, variant }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

interface TabListProps {
  children: ReactNode;
  className?: string;
}

export function TabList({ children, className = "" }: TabListProps) {
  const ctx = useTabsContext();
  const base = ctx.variant === "pill"
    ? "inline-flex gap-1 p-1 bg-primary-soft rounded-full"
    : "flex gap-6 border-b border-border-soft";
  return (
    <div role="tablist" className={`${base} ${className}`}>
      {children}
    </div>
  );
}

interface TabProps {
  value: string;
  children: ReactNode;
  className?: string;
}

export function Tab({ value, children, className = "" }: TabProps) {
  const ctx = useTabsContext();
  const active = ctx.value === value;

  const base = ctx.variant === "pill"
    ? `px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
        active ? "bg-primary text-white" : "text-text-secondary hover:text-text-primary"
      }`
    : `pb-2 text-sm font-medium border-b-2 transition-colors ${
        active
          ? "text-text-primary border-primary"
          : "text-text-secondary border-transparent hover:text-text-primary"
      }`;

  return (
    <button
      role="tab"
      aria-selected={active}
      type="button"
      onClick={() => ctx.setValue(value)}
      className={`${base} ${className}`}
    >
      {children}
    </button>
  );
}

interface TabPanelProps {
  value: string;
  children: ReactNode;
  className?: string;
}

export function TabPanel({ value, children, className = "" }: TabPanelProps) {
  const ctx = useTabsContext();
  if (ctx.value !== value) return null;
  return (
    <div role="tabpanel" className={className}>
      {children}
    </div>
  );
}

function useTabsContext(): TabsContextValue {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error("Tabs.* must be rendered within <Tabs>");
  return ctx;
}
