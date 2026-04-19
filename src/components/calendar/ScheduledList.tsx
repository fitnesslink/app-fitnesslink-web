"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { calendar } from "@/lib/api/core";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Popover } from "@/components/ui/Popover";
import { EmptyState } from "@/components/ui/EmptyState";
import type { ScheduledWorkout } from "@/lib/calendar/types";

interface ScheduledListProps {
  date: Date;
  entries: ScheduledWorkout[];
  onEdit: (entry: ScheduledWorkout) => void;
  onAdd: () => void;
}

export function ScheduledList({ date, entries, onEdit, onAdd }: ScheduledListProps) {
  const [pendingDelete, setPendingDelete] = useState<ScheduledWorkout | null>(null);
  const qc = useQueryClient();

  const del = useMutation({
    mutationFn: (id: string) => calendar.deleteCalendar(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: calendar.keys.all });
      setPendingDelete(null);
    },
    onError: () => {
      setPendingDelete(null);
    },
  });

  const sorted = [...entries].sort((a, b) => a.fromTime.localeCompare(b.fromTime));
  const label = date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-text-secondary">
          {label}
        </h3>
        <Button
          variant="primary"
          fullWidth={false}
          className="!h-9 px-3 text-xs"
          onClick={onAdd}
        >
          + Add
        </Button>
      </div>

      {sorted.length === 0 ? (
        <Card>
          <EmptyState
            title="Nothing scheduled"
            description="Tap + Add to plan a workout for this day."
          />
        </Card>
      ) : (
        <ul className="space-y-2">
          {sorted.map((entry) => (
            <li key={entry.id}>
              <Card density="compact">
                <CardContent>
                  <div className="flex items-start gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-text-primary truncate">
                        {entry.workoutName}
                      </p>
                      <p className="text-xs text-text-secondary mt-0.5">
                        {formatTime(entry.fromTime)}
                        {entry.estimatedMinutes ? ` · ${entry.estimatedMinutes} min` : ""}
                      </p>
                      {entry.notes && (
                        <p className="text-xs text-text-secondary mt-1 italic">{entry.notes}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Link
                        href={`/session/${entry.workoutId}`}
                        aria-label={`Start ${entry.workoutName}`}
                        className="h-9 px-3 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary-hover flex items-center"
                      >
                        Start
                      </Link>
                      <Popover
                        align="end"
                        trigger={
                          <button
                            type="button"
                            aria-label="More"
                            className="w-9 h-9 rounded-lg text-text-secondary hover:bg-primary-soft hover:text-primary flex items-center justify-center"
                          >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                              <circle cx="5" cy="12" r="1.5" />
                              <circle cx="12" cy="12" r="1.5" />
                              <circle cx="19" cy="12" r="1.5" />
                            </svg>
                          </button>
                        }
                      >
                        <div className="min-w-[140px] p-1">
                          <button
                            type="button"
                            onClick={() => onEdit(entry)}
                            className="w-full text-left px-2 py-1.5 rounded hover:bg-primary-soft text-sm text-text-primary"
                          >
                            Edit time
                          </button>
                          <button
                            type="button"
                            onClick={() => setPendingDelete(entry)}
                            className="w-full text-left px-2 py-1.5 rounded hover:bg-danger/10 text-sm text-danger"
                          >
                            Delete
                          </button>
                        </div>
                      </Popover>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}

      {pendingDelete && (
        <ConfirmDelete
          title={`Delete "${pendingDelete.workoutName}"?`}
          pending={del.isPending}
          onCancel={() => setPendingDelete(null)}
          onConfirm={() => del.mutate(pendingDelete.id)}
        />
      )}
    </div>
  );
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

function ConfirmDelete({
  title,
  pending,
  onCancel,
  onConfirm,
}: {
  title: string;
  pending: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-surface rounded-2xl p-6 w-full max-w-sm">
        <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
        <p className="text-sm text-text-secondary mt-1">
          This only removes the scheduled entry. The workout itself stays in your catalog.
        </p>
        <div className="mt-5 flex gap-2">
          <Button
            type="button"
            variant="secondary"
            className="!h-11 text-sm"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            className="!h-11 text-sm"
            isLoading={pending}
            onClick={onConfirm}
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
