"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/state/auth";
import { workouts } from "@/lib/api/core";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { WorkoutDetailView } from "@/components/catalog/WorkoutDetailView";
import { MovementPreviewSheet } from "@/components/catalog/MovementPreviewSheet";
import type { WorkoutDetail } from "@/lib/catalog/types";

async function fetchWorkoutDetail(id: string): Promise<WorkoutDetail | null> {
  try {
    const res = (await workouts.getWorkout(id)) as WorkoutDetail | null;
    if (!res) return null;
    return { ...res, phases: res.phases ?? [] };
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
        ) : !data ? (
          <p className="text-sm text-text-secondary">Workout not found.</p>
        ) : (
          <WorkoutDetailView
            workout={data}
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
