"use client";

import { use, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/state/auth";
import { workouts } from "@/lib/api/core";
import { InteractiveSession } from "@/components/session/InteractiveSession";
import { PlaylistSession } from "@/components/session/PlaylistSession";
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

export default function SessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") === "playlist" ? "playlist" : "interactive";

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
  if (isLoading) {
    return (
      <div className="h-dvh bg-black text-white flex items-center justify-center">
        Loading…
      </div>
    );
  }
  if (!data) {
    return (
      <div className="h-dvh bg-black text-white flex items-center justify-center">
        Workout not found.
      </div>
    );
  }

  return mode === "playlist" ? (
    <PlaylistSession workout={data} />
  ) : (
    <InteractiveSession workout={data} />
  );
}
