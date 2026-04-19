"use client";

import type { WorkoutDetail } from "@/lib/catalog/types";
import type { SessionCursor } from "@/lib/state/session";

interface WorkoutOutlineProps {
  workout: WorkoutDetail;
  cursor: SessionCursor;
  onJump?: (phaseIdx: number, exerciseIdx: number) => void;
  className?: string;
}

export function WorkoutOutline({ workout, cursor, onJump, className = "" }: WorkoutOutlineProps) {
  return (
    <aside className={`text-sm ${className}`}>
      <h2 className="text-[11px] font-semibold uppercase tracking-wider text-white/60 mb-4 px-3">
        Outline
      </h2>
      <ul className="space-y-5">
        {workout.phases.map((phase, phaseIdx) => (
          <li key={phase.id}>
            <p className="px-3 text-xs font-semibold text-white/80 uppercase tracking-wide mb-2">
              {phase.name}
            </p>
            <ul className="space-y-1">
              {phase.exercises.map((ex, exerciseIdx) => {
                const isActive = cursor.phaseIdx === phaseIdx && cursor.exerciseIdx === exerciseIdx;
                const isDone =
                  phaseIdx < cursor.phaseIdx ||
                  (phaseIdx === cursor.phaseIdx && exerciseIdx < cursor.exerciseIdx);
                const rowClass = isActive
                  ? "bg-primary/20 text-white border-l-2 border-primary"
                  : isDone
                  ? "text-white/50"
                  : "text-white/80 hover:bg-white/5";
                return (
                  <li key={ex.id}>
                    <button
                      type="button"
                      onClick={() => onJump?.(phaseIdx, exerciseIdx)}
                      className={`w-full text-left px-3 py-2 rounded-r-lg flex items-center gap-3 ${rowClass}`}
                    >
                      <span
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          isDone
                            ? "bg-primary border-primary text-white"
                            : isActive
                            ? "border-primary"
                            : "border-white/30"
                        }`}
                      >
                        {isDone && (
                          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-medium truncate">{ex.name}</span>
                        <span className="block text-xs text-white/50">
                          {ex.sets} × {ex.reps ? `${ex.reps}` : `${ex.durationSeconds}s`}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ul>
    </aside>
  );
}
