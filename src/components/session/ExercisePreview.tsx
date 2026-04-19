"use client";

import type { WorkoutExercise } from "@/lib/catalog/types";

interface ExercisePreviewProps {
  current: WorkoutExercise;
  next: WorkoutExercise | null;
  setNumber: number;
  totalSets: number;
  className?: string;
}

export function ExercisePreview({
  current,
  next,
  setNumber,
  totalSets,
  className = "",
}: ExercisePreviewProps) {
  return (
    <div className={`text-white ${className}`}>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-white/60">
        Now
      </p>
      <h2 className="mt-1 text-2xl font-bold">{current.name}</h2>
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-white/80">
        <span className="tabular-nums">
          Set {setNumber} / {totalSets}
        </span>
        <span>•</span>
        <span>{current.reps ? `${current.reps} reps` : `${current.durationSeconds}s`}</span>
        {current.restSeconds !== undefined && (
          <>
            <span>•</span>
            <span>{current.restSeconds}s rest</span>
          </>
        )}
      </div>

      {next && (
        <div className="mt-6 border-t border-white/10 pt-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-white/60">
            Next up
          </p>
          <p className="mt-1 text-base font-medium text-white">{next.name}</p>
          <p className="text-xs text-white/60">
            {next.sets} × {next.reps ? `${next.reps}` : `${next.durationSeconds}s`}
          </p>
        </div>
      )}
    </div>
  );
}
