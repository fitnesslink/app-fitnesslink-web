"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useLayoutMode } from "@/hooks/useLayoutMode";

export interface TableColumn<T> {
  key: string;
  header: ReactNode;
  render: (row: T) => ReactNode;
  sortKey?: (row: T) => string | number;
  /** Mobile card layout: rows use `render` by default; override to style a row on mobile */
  mobileLabel?: string;
}

interface TableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  emptyMessage?: ReactNode;
  className?: string;
}

export function Table<T>({
  data,
  columns,
  rowKey,
  onRowClick,
  emptyMessage = "Nothing here yet.",
  className = "",
}: TableProps<T>) {
  const mode = useLayoutMode();
  const [sort, setSort] = useState<{ key: string; dir: "asc" | "desc" } | null>(null);

  const sorted = useMemo(() => {
    if (!sort) return data;
    const col = columns.find((c) => c.key === sort.key);
    if (!col?.sortKey) return data;
    const sortKey = col.sortKey;
    const copy = [...data];
    copy.sort((a, b) => {
      const av = sortKey(a);
      const bv = sortKey(b);
      if (av < bv) return sort.dir === "asc" ? -1 : 1;
      if (av > bv) return sort.dir === "asc" ? 1 : -1;
      return 0;
    });
    return copy;
  }, [data, columns, sort]);

  if (data.length === 0) {
    return <p className="text-text-secondary text-sm text-center py-8">{emptyMessage}</p>;
  }

  if (mode === "mobile") {
    return (
      <ul className={`space-y-3 ${className}`}>
        {sorted.map((row) => (
          <li
            key={rowKey(row)}
            className={`bg-surface rounded-xl border border-border-soft p-4 ${
              onRowClick ? "cursor-pointer hover:border-primary" : ""
            }`}
            onClick={() => onRowClick?.(row)}
          >
            {columns.map((col) => (
              <div key={col.key} className="flex justify-between text-sm py-0.5">
                <span className="text-text-secondary">{col.mobileLabel ?? col.header}</span>
                <span className="text-text-primary font-medium text-right">{col.render(row)}</span>
              </div>
            ))}
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border-soft bg-background">
            {columns.map((col) => {
              const sortable = col.sortKey !== undefined;
              const active = sort?.key === col.key;
              return (
                <th
                  key={col.key}
                  className={`text-left px-4 py-3 font-medium text-text-secondary ${
                    sortable ? "cursor-pointer select-none" : ""
                  }`}
                  onClick={() => {
                    if (!sortable) return;
                    setSort((prev) =>
                      prev?.key === col.key
                        ? { key: col.key, dir: prev.dir === "asc" ? "desc" : "asc" }
                        : { key: col.key, dir: "asc" }
                    );
                  }}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.header}
                    {active && (
                      <span className="text-primary">{sort!.dir === "asc" ? "▲" : "▼"}</span>
                    )}
                  </span>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row) => (
            <tr
              key={rowKey(row)}
              className={`border-b border-border-soft last:border-b-0 ${
                onRowClick ? "cursor-pointer hover:bg-primary-soft/40" : ""
              }`}
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3 text-text-primary">
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
