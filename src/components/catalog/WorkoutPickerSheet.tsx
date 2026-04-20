"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { workouts } from "@/lib/api/core";
import { Sheet } from "@/components/ui/Sheet";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import type { WorkoutSummary } from "@/lib/catalog/types";

interface WorkoutPickerSheetProps {
  open: boolean;
  onClose: () => void;
  onPick: (workout: WorkoutSummary) => void;
  title?: string;
  includeRestOption?: boolean;
  onPickRest?: () => void;
}

async function fetchWorkouts(): Promise<WorkoutSummary[]> {
  try {
    const res = (await workouts.listWorkouts()) as
      | { data?: WorkoutSummary[]; items?: WorkoutSummary[] }
      | WorkoutSummary[];
    return Array.isArray(res) ? res : res.data ?? res.items ?? [];
  } catch {
    return [];
  }
}

export function WorkoutPickerSheet({
  open,
  onClose,
  onPick,
  title = "Pick a workout",
  includeRestOption = false,
  onPickRest,
}: WorkoutPickerSheetProps) {
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: workouts.keys.list(),
    queryFn: fetchWorkouts,
    enabled: open,
  });

  const visible = useMemo(() => {
    const items = data ?? [];
    if (!search) return items;
    const q = search.toLowerCase();
    return items.filter((w) => w.name.toLowerCase().includes(q));
  }, [data, search]);

  return (
    <Sheet open={open} onClose={onClose} title={title} variant="side" width={420}>
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
            placeholder="Search workouts"
            autoFocus
            className="h-11 w-full pl-10 pr-3 rounded-lg border border-border-soft bg-surface text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {includeRestOption && onPickRest && (
          <button
            type="button"
            onClick={() => {
              onPickRest();
              onClose();
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border border-dashed border-border-soft hover:border-primary text-left"
          >
            <div className="w-10 h-10 rounded-lg bg-background text-text-secondary flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-text-primary">Rest day</p>
              <p className="text-xs text-text-secondary">No workout assigned</p>
            </div>
          </button>
        )}

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14" />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <EmptyState title="No workouts found" />
        ) : (
          <ul className="space-y-1 -mx-2">
            {visible.map((w) => (
              <li key={w.id}>
                <button
                  type="button"
                  onClick={() => {
                    onPick(w);
                    onClose();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-primary-soft/60 text-left"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary-soft text-primary flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M4 10h16M8 6v12M16 6v12" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">{w.name}</p>
                    <p className="text-xs text-text-secondary">
                      {w.estimatedMinutes} min · {w.exerciseCount} exercises
                    </p>
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
