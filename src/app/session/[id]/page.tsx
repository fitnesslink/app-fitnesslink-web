"use client";

import { use, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/state/auth";
import { workouts } from "@/lib/api/core";
import { InteractiveSession } from "@/components/session/InteractiveSession";
import { PlaylistSession } from "@/components/session/PlaylistSession";
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

export default function SessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") === "playlist" ? "playlist" : "interactive";

  const { user, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [authLoading, user, router]);

  const { data } = useQuery({
    queryKey: workouts.keys.detail(id),
    queryFn: () => fetchWorkoutDetail(id),
    enabled: !!id,
  });

  if (authLoading || !user) return null;
  if (!data) {
    return (
      <div className="h-dvh bg-black text-white flex items-center justify-center">
        Loading…
      </div>
    );
  }

  return mode === "playlist" ? (
    <PlaylistSession workout={data} />
  ) : (
    <InteractiveSession workout={data} />
  );
}
