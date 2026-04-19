"use client";

import type { ReactNode } from "react";
import { Select } from "@/components/ui/Select";

export interface SortOption {
  value: string;
  label: string;
}

interface CatalogHeaderProps {
  title: string;
  subtitle?: string;
  search: string;
  onSearchChange: (next: string) => void;
  sort?: string;
  sortOptions?: SortOption[];
  onSortChange?: (next: string) => void;
  actions?: ReactNode;
  filters?: ReactNode;
}

export function CatalogHeader({
  title,
  subtitle,
  search,
  onSearchChange,
  sort,
  sortOptions,
  onSortChange,
  actions,
  filters,
}: CatalogHeaderProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl lg:text-3xl font-bold text-primary">{title}</h1>
          {subtitle && <p className="text-sm text-text-secondary mt-0.5">{subtitle}</p>}
        </div>
        {actions && <div className="shrink-0">{actions}</div>}
      </div>
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <circle cx="11" cy="11" r="7" />
            <line x1="16.65" y1="16.65" x2="21" y2="21" />
          </svg>
          <input
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search"
            className="h-11 w-full pl-10 pr-4 rounded-lg border border-border-soft bg-surface text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        {sortOptions && onSortChange && (
          <Select
            value={sort ?? ""}
            onChange={(e) => onSortChange(e.target.value)}
            options={sortOptions}
          />
        )}
        {filters}
      </div>
    </div>
  );
}
