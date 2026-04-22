"use client";

import { useEffect, useMemo, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/state/auth";
import { workouts } from "@/lib/api/core";
import { useResolvedMedia } from "@/hooks/useResolvedMedia";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { WorkoutDetailView } from "@/components/catalog/WorkoutDetailView";
import { MovementPreviewSheet } from "@/components/catalog/MovementPreviewSheet";
import type { TrainingLevel, WorkoutDetail, WorkoutPhase } from "@/lib/catalog/types";

interface RawTask {
  id?: string;
  movementId?: string | null;
  sets?: number | null;
  reps?: number | null;
  restSeconds?: number | null;
  intervalSeconds?: number | null;
}

interface RawTaskRow {
  task?: RawTask;
  advancedTasks?: RawTask[] | null;
}

interface RawPhase {
  id?: string;
  name?: string | null;
  taskRows?: RawTaskRow[] | null;
}

interface RawWorkoutDetail {
  id?: string;
  name?: string | null;
  description?: string | null;
  estimatedTime?: number | null;
  trainingLevel?: string | null;
  imageId?: string | null;
  thumbnailId?: string | null;
  phases?: RawPhase[] | null;
}

function mapPhases(phases: RawPhase[] | null | undefined): WorkoutPhase[] {
  return (phases ?? []).map((p, phaseIdx) => ({
    id: p.id ?? `phase-${phaseIdx}`,
    name: p.name ?? "",
    exercises: (p.taskRows ?? []).flatMap((row, rowIdx) => {
      const tasks: RawTask[] = [];
      if (row.task) tasks.push(row.task);
      for (const t of row.advancedTasks ?? []) tasks.push(t);
      return tasks.map((t, taskIdx) => ({
        id: t.id ?? `${phaseIdx}-${rowIdx}-${taskIdx}`,
        movementId: t.movementId ?? "",
        name: "",
        sets: t.sets ?? 0,
        reps: t.reps ?? undefined,
        durationSeconds: t.intervalSeconds ?? undefined,
        restSeconds: t.restSeconds ?? undefined,
      }));
    }),
  }));
}

async function fetchWorkoutDetail(id: string): Promise<WorkoutDetail | null> {
  try {
    const res = (await workouts.getWorkout(id)) as RawWorkoutDetail | null;
    if (!res) return null;
    const phases = mapPhases(res.phases);
    const exerciseCount = phases.reduce((s, p) => s + p.exercises.length, 0);
    return {
      id: res.id ?? id,
      name: res.name ?? "",
      description: res.description ?? undefined,
      estimatedMinutes: res.estimatedTime ?? 0,
      exerciseCount,
      trainingLevel: (res.trainingLevel as TrainingLevel | null) ?? undefined,
      imageId: res.imageId ?? res.thumbnailId ?? undefined,
      phases,
    };
  } catch {
    return null;
  }
}

export default function WorkoutDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [previewMovementId, setPreviewMovementId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [authLoading, user, router]);

  const { data, isLoading } = useQuery({
    queryKey: workouts.keys.detail(id),
    queryFn: () => fetchWorkoutDetail(id),
    enabled: !!id,
  });

  const imageIds = useMemo(() => [data?.imageId], [data?.imageId]);
  const imageMap = useResolvedMedia(imageIds, "workoutimage");
  const workoutWithThumb = useMemo<WorkoutDetail | null>(() => {
    if (!data) return null;
    return {
      ...data,
      thumbnailUrl: data.thumbnailUrl ?? (data.imageId ? imageMap.get(data.imageId) : undefined),
    };
  }, [data, imageMap]);

  if (authLoading || !user) return null;

  return (
    <AppShell subtitle={data?.name ?? "Workout"}>
      <div className="max-w-3xl mx-auto px-4 lg:px-0 py-6 space-y-6">
        <Link
          href="/catalog/workouts"
          className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-primary"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Workouts
        </Link>

        {isLoading ? (
          <>
            <Skeleton className="h-48" />
            <Skeleton className="h-64" />
          </>
        ) : !workoutWithThumb ? (
          <p className="text-sm text-text-secondary">Workout not found.</p>
        ) : (
          <WorkoutDetailView
            workout={workoutWithThumb}
            onExerciseClick={setPreviewMovementId}
            actions={
              <>
                <Link href={`/session/${id}`}>
                  <Button variant="primary" fullWidth={false} className="!h-11 px-6 text-sm">
                    Start session
                  </Button>
                </Link>
                <Link href={`/session/${id}?mode=playlist`}>
                  <Button variant="secondary" fullWidth={false} className="!h-11 px-6 text-sm">
                    Play video mode
                  </Button>
                </Link>
                <Link href={`/catalog/workouts/${id}/edit`}>
                  <Button variant="secondary" fullWidth={false} className="!h-11 px-6 text-sm">
                    Edit
                  </Button>
                </Link>
              </>
            }
          />
        )}
      </div>

      <MovementPreviewSheet
        movementId={previewMovementId}
        onClose={() => setPreviewMovementId(null)}
      />
    </AppShell>
  );
}
