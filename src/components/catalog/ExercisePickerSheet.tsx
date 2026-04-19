"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { movements } from "@/lib/api/core";
import { Sheet } from "@/components/ui/Sheet";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import type { MovementSummary } from "@/lib/catalog/types";
import { PLACEHOLDER_MOVEMENTS } from "@/lib/catalog/placeholder";

interface ExercisePickerSheetProps {
  open: boolean;
  onClose: () => void;
  onPick: (movement: MovementSummary) => void;
}

async function fetchMovements(): Promise<MovementSummary[]> {
  try {
    const res = (await movements.listMovements()) as
      | { items?: MovementSummary[] }
      | MovementSummary[];
    const items = Array.isArray(res) ? res : res.items ?? [];
    return items.length > 0 ? items : PLACEHOLDER_MOVEMENTS;
  } catch {
    return PLACEHOLDER_MOVEMENTS;
  }
}

export function ExercisePickerSheet({ open, onClose, onPick }: ExercisePickerSheetProps) {
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: movements.keys.list(),
    queryFn: fetchMovements,
    enabled: open,
  });

  const visible = useMemo(() => {
    const items = data ?? [];
    if (!search) return items;
    const q = search.toLowerCase();
    return items.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        (m.muscleGroup?.toLowerCase().includes(q) ?? false)
    );
  }, [data, search]);

  return (
    <Sheet open={open} onClose={onClose} title="Add exercise" variant="side" width={420}>
      <div className="space-y-4">
        <div className="relative">
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
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search exercises"
            autoFocus
            className="h-11 w-full pl-10 pr-3 rounded-lg border border-border-soft bg-surface text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-14" />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <EmptyState title="No matches" />
        ) : (
          <ul className="space-y-1 -mx-2">
            {visible.map((m) => (
              <li key={m.id}>
                <button
                  type="button"
                  onClick={() => {
                    onPick(m);
                    onClose();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-primary-soft/60 text-left"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary-soft text-primary flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">{m.name}</p>
                    {m.muscleGroup && (
                      <p className="text-xs text-text-secondary truncate">{m.muscleGroup}</p>
                    )}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Sheet>
  );
}
