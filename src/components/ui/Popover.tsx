"use client";

import {
  cloneElement,
  isValidElement,
  useEffect,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";

interface PopoverProps {
  trigger: ReactElement<{ onClick?: (e: React.MouseEvent) => void }>;
  children: ReactNode;
  align?: "start" | "end";
  /** Offset in px below the trigger */
  offset?: number;
}

export function Popover({ trigger, children, align = "start", offset = 8 }: PopoverProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!isValidElement(trigger)) {
    throw new Error("Popover trigger must be a single React element");
  }

  const triggerWithHandler = cloneElement(trigger, {
    onClick: (e: React.MouseEvent) => {
      trigger.props.onClick?.(e);
      setOpen((v) => !v);
    },
  });

  return (
    <div ref={ref} className="relative inline-block">
      {triggerWithHandler}
      {open && (
        <div
          role="dialog"
          className={`absolute z-40 bg-surface rounded-xl shadow-lg border border-border-soft p-2 min-w-[200px] ${
            align === "end" ? "right-0" : "left-0"
          }`}
          style={{ top: `calc(100% + ${offset}px)` }}
        >
          {children}
        </div>
      )}
    </div>
  );
}
