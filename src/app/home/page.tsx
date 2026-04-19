"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAtomValue } from "jotai";
import { useAuth } from "@/lib/state/auth";
import { selectedDateAtom, isToday } from "@/lib/state/home";
import { AppShell } from "@/components/layout/AppShell";
import { DateScrubber } from "@/components/home/DateScrubber";
import { GoalProgressRow } from "@/components/home/GoalProgressRow";
import { TodayHabits } from "@/components/home/TodayHabits";
import { TodayWorkout } from "@/components/home/TodayWorkout";
import { DailySummary } from "@/components/home/DailySummary";

export default function HomePage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const subtitle = useHomeSubtitle();

  useEffect(() => {
    if (!isLoading && !user) router.replace("/login");
  }, [isLoading, user, router]);

  if (isLoading || !user) return null;

  return (
    <AppShell subtitle={subtitle} rightRail={<DailySummary />}>
      <div className="max-w-5xl mx-auto px-4 lg:px-0 py-6 space-y-6">
        <DateScrubber />

        <section aria-labelledby="goals-heading">
          <h2 id="goals-heading" className="sr-only">
            Goal progress
          </h2>
          <GoalProgressRow />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section aria-labelledby="workout-heading">
            <h2 id="workout-heading" className="sr-only">
              Today&apos;s workout
            </h2>
            <TodayWorkout />
          </section>
          <section aria-labelledby="habits-heading">
            <h2 id="habits-heading" className="sr-only">
              Today&apos;s habits
            </h2>
            <TodayHabits />
          </section>
        </div>

        {/* Mobile + tablet surface the summary inline; xl+ renders it in the right rail */}
        <div className="xl:hidden">
          <DailySummary />
        </div>
      </div>
    </AppShell>
  );
}

function useHomeSubtitle(): string {
  const date = useAtomValue(selectedDateAtom);
  if (isToday(date)) return "Have a nice day";
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}
