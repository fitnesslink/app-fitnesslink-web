"use client";

import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { calendar } from "@/lib/api/core";
import { Sheet } from "@/components/ui/Sheet";
import { Button } from "@/components/ui/Button";
import { DatePicker } from "@/components/ui/DatePicker";
import { WorkoutPickerSheet } from "@/components/catalog/WorkoutPickerSheet";
import type { WorkoutSummary } from "@/lib/catalog/types";
import type { ScheduledWorkout } from "@/lib/calendar/types";
import { isoDateKey } from "@/lib/state/calendar";

interface ScheduledWorkoutSheetProps {
  open: boolean;
  onClose: () => void;
  defaultDate: Date;
  initial?: ScheduledWorkout | null;
}

export function ScheduledWorkoutSheet({
  open,
  onClose,
  defaultDate,
  initial,
}: ScheduledWorkoutSheetProps) {
  const qc = useQueryClient();
  const isEdit = !!initial;

  const [picker, setPicker] = useState(false);
  const [workout, setWorkout] = useState<{ id: string; name: string; estimatedMinutes: number } | null>(
    initial ? { id: initial.workoutId, name: initial.workoutName, estimatedMinutes: initial.estimatedMinutes ?? 0 } : null
  );
  const [date, setDate] = useState<string>(
    initial ? isoDateKey(new Date(initial.fromTime)) : isoDateKey(defaultDate)
  );
  const [time, setTime] = useState<string>(() => {
    const d = initial ? new Date(initial.fromTime) : defaultDate;
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  });
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    if (initial) {
      setWorkout({
        id: initial.workoutId,
        name: initial.workoutName,
        estimatedMinutes: initial.estimatedMinutes ?? 0,
      });
      setDate(isoDateKey(new Date(initial.fromTime)));
      const d = new Date(initial.fromTime);
      setTime(`${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`);
      setNotes(initial.notes ?? "");
    } else {
      setWorkout(null);
      setDate(isoDateKey(defaultDate));
      setTime("08:00");
      setNotes("");
    }
  }, [open, initial, defaultDate]);

  const save = useMutation({
    mutationFn: async () => {
      const fromTime = new Date(`${date}T${time}:00`).toISOString();
      if (isEdit && initial) {
        return calendar.updateCalendar(initial.id, { fromTime });
      }
      if (!workout) throw new Error("Pick a workout first");
      return calendar.createCalendar({
        workoutId: workout.id,
        fromTime,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: calendar.keys.all });
      onClose();
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : "Save failed");
    },
  });

  return (
    <>
      <Sheet
        open={open}
        onClose={onClose}
        title={isEdit ? "Edit scheduled workout" : "Add workout"}
        variant="side"
        width={420}
      >
        <div className="space-y-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-text-secondary mb-1">
              Workout
            </p>
            {workout ? (
              <button
                type="button"
                disabled={isEdit}
                onClick={() => setPicker(true)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border border-border-soft bg-surface text-left ${
                  isEdit ? "opacity-60 cursor-default" : "hover:border-primary"
                }`}
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">{workout.name}</p>
                  {workout.estimatedMinutes > 0 && (
                    <p className="text-xs text-text-secondary">{workout.estimatedMinutes} min</p>
                  )}
                </div>
                {!isEdit && (
                  <span className="text-xs text-primary font-semibold">Change</span>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setPicker(true)}
                className="w-full px-3 py-2 rounded-lg border border-dashed border-border-soft text-sm text-text-secondary hover:border-primary hover:text-primary"
              >
                + Pick a workout
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <LabeledField label="Date">
              <DatePicker
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full"
              />
            </LabeledField>
            <LabeledField label="Time">
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="h-11 w-full px-3 rounded-lg border border-border-soft bg-surface text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </LabeledField>
          </div>

          <LabeledField label="Notes (optional)">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Anything to remember"
              className="w-full px-3 py-2 rounded-lg border border-border-soft bg-surface text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </LabeledField>

          {error && (
            <p className="text-sm text-danger bg-danger/10 rounded-lg px-3 py-2">{error}</p>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              className="!h-11 text-sm"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              className="!h-11 text-sm"
              isLoading={save.isPending}
              onClick={() => save.mutate()}
            >
              {isEdit ? "Save" : "Schedule"}
            </Button>
          </div>
        </div>
      </Sheet>

      <WorkoutPickerSheet
        open={picker}
        onClose={() => setPicker(false)}
        onPick={(w) =>
          setWorkout({
            id: w.id,
            name: w.name,
            estimatedMinutes: w.estimatedMinutes,
          })
        }
      />
    </>
  );
}

function LabeledField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[10px] font-semibold uppercase tracking-wide text-text-secondary mb-1">
        {label}
      </span>
      {children}
    </label>
  );
}
