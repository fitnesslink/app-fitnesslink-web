"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/state/auth";
import { workouts } from "@/lib/api/core";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { MovementPreviewSheet } from "@/components/catalog/MovementPreviewSheet";
import type { WorkoutDetail } from "@/lib/catalog/types";
import { placeholderWorkoutDetail } from "@/lib/catalog/placeholder";

async function fetchWorkoutDetail(id: string): Promise<WorkoutDetail> {
  try {
    const res = (await workouts.getWorkout(id)) as WorkoutDetail | null;
    if (!res) return placeholderWorkoutDetail(id);
    return {
      ...placeholderWorkoutDetail(id),
      ...res,
      phases: res.phases ?? placeholderWorkoutDetail(id).phases,
    };
  } catch {
    return placeholderWorkoutDetail(id);
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

        {isLoading || !data ? (
          <>
            <Skeleton className="h-48" />
            <Skeleton className="h-64" />
          </>
        ) : (
          <>
            <Card>
              <CardContent>
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="aspect-[4/3] lg:w-64 shrink-0 rounded-xl bg-primary-soft text-primary flex items-center justify-center">
                    <svg className="w-16 h-16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M4 10h16M8 6v12M16 6v12" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h1 className="text-2xl lg:text-3xl font-bold text-text-primary">{data.name}</h1>
                    {data.description && (
                      <p className="text-sm text-text-secondary mt-2">{data.description}</p>
                    )}
                    <div className="flex flex-wrap gap-2 mt-3 text-xs text-text-secondary">
                      <Badge tone="default">{data.estimatedMinutes} min</Badge>
                      <Badge tone="default">
                        {data.phases.reduce((s, p) => s + p.exercises.length, 0)} exercises
                      </Badge>
                      {data.trainingLevel && (
                        <Badge tone={data.trainingLevel === "advanced" ? "warning" : "primary"}>
                          {data.trainingLevel}
                        </Badge>
                      )}
                    </div>
                    <div className="mt-5 flex flex-wrap gap-3">
                      <Button variant="primary" fullWidth={false} className="!h-11 px-6 text-sm">
                        Start session
                      </Button>
                      <Button variant="secondary" fullWidth={false} className="!h-11 px-6 text-sm">
                        Schedule
                      </Button>
                      <Button variant="secondary" fullWidth={false} className="!h-11 px-6 text-sm">
                        Edit
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {data.phases.map((phase) => (
              <Card key={phase.id}>
                <CardContent>
                  <h2 className="text-lg font-semibold text-text-primary mb-3">{phase.name}</h2>
                  <ul className="divide-y divide-border-soft">
                    {phase.exercises.map((ex) => (
                      <li key={ex.id}>
                        <button
                          type="button"
                          onClick={() => setPreviewMovementId(ex.movementId)}
                          className="w-full text-left flex items-center gap-4 py-3 hover:bg-primary-soft/40 -mx-3 px-3 rounded-lg transition-colors"
                        >
                          <div className="w-12 h-12 rounded-lg bg-primary-soft text-primary flex items-center justify-center shrink-0">
                            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polygon points="5 3 19 12 5 21 5 3" />
                            </svg>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-text-primary">{ex.name}</p>
                            <p className="text-xs text-text-secondary mt-0.5">
                              {ex.sets} × {ex.reps ? `${ex.reps} reps` : `${ex.durationSeconds}s`}
                              {ex.restSeconds ? ` · ${ex.restSeconds}s rest` : ""}
                            </p>
                          </div>
                          <svg className="w-5 h-5 text-text-secondary shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="9 18 15 12 9 6" />
                          </svg>
                        </button>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </>
        )}
      </div>

      <MovementPreviewSheet
        movementId={previewMovementId}
        onClose={() => setPreviewMovementId(null)}
      />
    </AppShell>
  );
}
