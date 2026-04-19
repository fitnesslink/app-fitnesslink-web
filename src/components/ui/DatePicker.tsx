"use client";

import type { InputHTMLAttributes } from "react";

interface DatePickerProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {}

// Thin wrapper around <input type="date">. Replace with a calendar-popover
// implementation when designs call for one — the wrapper keeps call sites
// stable across that change.
export function DatePicker({ className = "", ...props }: DatePickerProps) {
  return (
    <input
      type="date"
      className={`h-11 px-3 rounded-lg border border-border-soft bg-surface text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary ${className}`}
      {...props}
    />
  );
}
