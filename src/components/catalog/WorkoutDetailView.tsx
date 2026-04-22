"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { WorkoutDetail } from "@/lib/catalog/types";
import { formatDuration } from "@/lib/format";

interface WorkoutDetailViewProps {
  workout: WorkoutDetail;
  onExerciseClick?: (movementId: string) => void;
  actions?: React.ReactNode;
}

// Presentational detail view for a workout. Used by:
//  - /catalog/workouts/[id]/page.tsx (read mode, opens movement preview)
//  - /catalog/workouts/[id]/edit/page.tsx (live preview pane, FIT-58)
//  - /catalog/workouts/new/page.tsx (live preview pane, FIT-58)
export function WorkoutDetailView({
  workout,
  onExerciseClick,
  actions,
}: WorkoutDetailViewProps) {
  const totalExercises = workout.phases.reduce((s, p) => s + p.exercises.length, 0);
  const [imageFailed, setImageFailed] = useState(false);
  const imageUrl = !imageFailed ? workout.thumbnailUrl ?? null : null;

  return (
    <div className="space-y-6">
      <Card>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="aspect-[4/3] lg:w-64 shrink-0 rounded-xl bg-primary-soft text-primary flex items-center justify-center overflow-hidden">
              {imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imageUrl}
                  alt=""
                  className="w-full h-full object-cover"
                  onError={() => setImageFailed(true)}
                />
              ) : (
                <svg className="w-16 h-16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M4 10h16M8 6v12M16 6v12" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl lg:text-3xl font-bold text-text-primary break-words">
                {workout.name || "Untitled workout"}
              </h1>
              {workout.description && (
                <p className="text-sm text-text-secondary mt-2">{workout.description}</p>
              )}
              <div className="flex flex-wrap gap-2 mt-3 text-xs text-text-secondary">
                <Badge tone="default">{formatDuration(workout.estimatedMinutes)}</Badge>
                <Badge tone="default">{totalExercises} exercises</Badge>
                {workout.trainingLevel && (
                  <Badge tone={workout.trainingLevel === "advanced" ? "warning" : "primary"}>
                    {workout.trainingLevel}
                  </Badge>
                )}
              </div>
              {actions && <div className="mt-5 flex flex-wrap gap-3">{actions}</div>}
            </div>
          </div>
        </CardContent>
      </Card>

      {workout.phases.map((phase) => (
        <Card key={phase.id}>
          <CardContent>
            <h2 className="text-lg font-semibold text-text-primary mb-3">
              {phase.name || "Untitled phase"}
            </h2>
            {phase.exercises.length === 0 ? (
              <p className="text-sm text-text-secondary">No exercises yet.</p>
            ) : (
              <ul className="divide-y divide-border-soft">
                {phase.exercises.map((ex) => (
                  <li key={ex.id}>
                    <button
                      type="button"
                      disabled={!onExerciseClick}
                      onClick={() => onExerciseClick?.(ex.movementId)}
                      className={`w-full text-left flex items-center gap-4 py-3 -mx-3 px-3 rounded-lg ${
                        onExerciseClick
                          ? "hover:bg-primary-soft/40 transition-colors"
                          : "cursor-default"
                      }`}
                    >
                      <div className="w-10 h-10 rounded-lg bg-primary-soft text-primary flex items-center justify-center shrink-0">
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polygon points="5 3 19 12 5 21 5 3" />
                        </svg>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-text-primary truncate">{ex.name}</p>
                        <p className="text-xs text-text-secondary mt-0.5">
                          {ex.sets} × {ex.reps ? `${ex.reps} reps` : `${ex.durationSeconds}s`}
                          {ex.restSeconds ? ` · ${ex.restSeconds}s rest` : ""}
                        </p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
