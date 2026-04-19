"use client";

import { useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/state/auth";
import { workouts } from "@/lib/api/core";
import { AppShell } from "@/components/layout/AppShell";
import { WorkoutEditor } from "@/components/catalog/WorkoutEditor";
import { Skeleton } from "@/components/ui/Skeleton";
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

export default function EditWorkoutPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

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
    <AppShell subtitle={data?.name ?? "Edit workout"}>
      <div className="max-w-6xl mx-auto px-4 lg:px-0 py-6 space-y-6">
        <Link
          href={`/catalog/workouts/${id}`}
          className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-primary"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back to workout
        </Link>
        {isLoading || !data ? <Skeleton className="h-96" /> : <WorkoutEditor id={id} initial={data} />}
      </div>
    </AppShell>
  );
}
