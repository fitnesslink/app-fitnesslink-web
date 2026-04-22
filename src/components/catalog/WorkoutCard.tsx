"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { WorkoutSummary } from "@/lib/catalog/types";
import { formatDuration } from "@/lib/format";

const levelTone: Record<string, "default" | "primary" | "warning" | "danger"> = {
  beginner: "default",
  intermediate: "primary",
  advanced: "warning",
};

export function WorkoutCard({ workout }: { workout: WorkoutSummary }) {
  const [imageFailed, setImageFailed] = useState(false);
  const imageUrl = !imageFailed ? workout.thumbnailUrl ?? null : null;

  return (
    <Link
      href={`/catalog/workouts/${workout.id}`}
      className="block"
      aria-label={`Open workout ${workout.name}`}
    >
      <Card className="h-full hover:border-primary transition-colors flex flex-col gap-3">
        <div className="aspect-[4/3] rounded-lg bg-primary-soft flex items-center justify-center text-primary overflow-hidden">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt=""
              className="w-full h-full object-cover"
              loading="lazy"
              onError={() => setImageFailed(true)}
            />
          ) : (
            <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M4 10h16M8 6v12M16 6v12" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-text-primary truncate">{workout.name}</h3>
          {workout.description && (
            <p className="text-xs text-text-secondary mt-0.5 line-clamp-2">{workout.description}</p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-secondary">
          <span>{formatDuration(workout.estimatedMinutes)}</span>
          <span>•</span>
          <span>{workout.exerciseCount} exercises</span>
          {workout.trainingLevel && (
            <Badge tone={levelTone[workout.trainingLevel] ?? "default"}>
              {workout.trainingLevel}
            </Badge>
          )}
        </div>
      </Card>
    </Link>
  );
}
