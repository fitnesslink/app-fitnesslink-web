"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useAtomValue } from "jotai";
import { calendar } from "@/lib/api/core";
import { selectedDateAtom, isToday } from "@/lib/state/home";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";

interface ScheduledWorkout {
  id: string;
  workoutId: string;
  name: string;
  estimatedMinutes: number;
  exerciseCount: number;
  thumbnailUrl?: string;
}

async function fetchScheduled(date: Date): Promise<ScheduledWorkout | null> {
  try {
    const res = (await calendar.getMyCalendar()) as
      | { data?: ScheduledWorkout[]; items?: ScheduledWorkout[] }
      | ScheduledWorkout[];
    const items = Array.isArray(res) ? res : res.data ?? res.items ?? [];
    void date;
    return items[0] ?? null;
  } catch {
    return null;
  }
}

export function TodayWorkout() {
  const date = useAtomValue(selectedDateAtom);
  const label = isToday(date) ? "Today's workout" : "Scheduled workout";

  const { data, isLoading } = useQuery({
    queryKey: ["home", "scheduled-workout", date.toISOString().slice(0, 10)],
    queryFn: () => fetchScheduled(date),
  });

  if (isLoading) {
    return <Skeleton className="h-40" />;
  }

  if (!data) {
    return (
      <Card>
        <EmptyState
          title="Nothing scheduled"
          description="Browse the catalog to pick a workout for this day."
          action={
            <Link href="/catalog/workouts">
              <Button variant="primary" fullWidth={false} className="!h-11 px-5 text-sm">
                Browse catalog
              </Button>
            </Link>
          }
        />
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">
          {label}
        </p>
        <h3 className="mt-1 text-xl font-bold text-text-primary">{data.name}</h3>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-text-secondary">
          <span>{data.estimatedMinutes} min</span>
          <span>•</span>
          <span>{data.exerciseCount} exercises</span>
        </div>
        <div className="mt-4">
          <Link href={`/session/${data.workoutId}`}>
            <Button variant="primary" fullWidth={false} className="!h-11 px-6 text-sm">
              Start
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
