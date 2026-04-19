"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";

export interface ComboboxOption<T = string> {
  value: T;
  label: string;
  description?: ReactNode;
}

interface ComboboxProps<T = string> {
  options: ComboboxOption<T>[];
  value: T | null;
  onChange: (value: T | null) => void;
  placeholder?: string;
  className?: string;
}

export function Combobox<T extends string | number = string>({
  options,
  value,
  onChange,
  placeholder = "Search…",
  className = "",
}: ComboboxProps<T>) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const selected = useMemo(
    () => options.find((o) => o.value === value) ?? null,
    [options, value]
  );

  const filtered = useMemo(() => {
    if (!query) return options;
    const q = query.toLowerCase();
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <input
        type="text"
        value={open ? query : selected?.label ?? ""}
        placeholder={placeholder}
        onFocus={() => {
          setOpen(true);
          setQuery("");
        }}
        onChange={(e) => {
          setOpen(true);
          setQuery(e.target.value);
        }}
        className="h-11 w-full px-3 rounded-lg border border-border-soft bg-surface text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
      />
      {open && (
        <ul
          role="listbox"
          className="absolute z-30 w-full mt-1 bg-surface border border-border-soft rounded-lg shadow-md max-h-60 overflow-y-auto"
        >
          {filtered.length === 0 && (
            <li className="px-3 py-2 text-sm text-text-secondary">No matches.</li>
          )}
          {filtered.map((o) => {
            const active = o.value === value;
            return (
              <li key={String(o.value)}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(o.value);
                    setQuery("");
                    setOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-primary-soft ${
                    active ? "bg-primary-soft text-primary font-medium" : "text-text-primary"
                  }`}
                >
                  <div>{o.label}</div>
                  {o.description && (
                    <div className="text-xs text-text-secondary">{o.description}</div>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
