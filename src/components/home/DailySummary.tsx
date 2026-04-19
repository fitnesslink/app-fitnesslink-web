"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { habits, goals } from "@/lib/api/core";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";

interface HabitListItem {
  id: string;
  doneToday: boolean;
}

interface GoalCard {
  id: string;
  currentValue: number;
  targetValue: number;
}

// Read the same query keys as the individual widgets so React Query
// deduplicates. Values compute to 0 if the keys haven't been primed yet.
export function DailySummary() {
  const { data: habitList = [] } = useQuery<HabitListItem[]>({
    queryKey: habits.keys.list(),
    enabled: false, // don't initiate; piggyback on TodayHabits' fetch
    initialData: [],
  });
  const { data: goalList = [] } = useQuery<GoalCard[]>({
    queryKey: goals.keys.list(),
    enabled: false,
    initialData: [],
  });

  const habitTotal = habitList.length;
  const habitDone = habitList.filter((h) => h.doneToday).length;
  const habitPct = habitTotal === 0 ? 0 : Math.round((habitDone / habitTotal) * 100);

  const goalCurrent = goalList.reduce((s, g) => s + g.currentValue, 0);
  const goalTarget = goalList.reduce((s, g) => s + g.targetValue, 0);
  const goalPct = goalTarget === 0 ? 0 : Math.round((goalCurrent / goalTarget) * 100);

  const rows: Array<{ label: string; value: string; href: string; pct: number }> = [
    {
      label: "Habits",
      value: `${habitDone} / ${habitTotal} done`,
      href: "/profile/habits",
      pct: habitPct,
    },
    {
      label: "Goals",
      value: `${goalPct}% overall`,
      href: "/profile/goals",
      pct: goalPct,
    },
    { label: "Workout", value: "Pending", href: "/catalog/workouts", pct: 0 },
    { label: "Streak", value: "—", href: "/profile", pct: 0 },
  ];

  return (
    <Card>
      <CardHeader title="Today's summary" subtitle="At a glance" />
      <CardContent>
        <ul className="divide-y divide-border-soft">
          {rows.map((row) => (
            <li key={row.label}>
              <Link
                href={row.href}
                className="flex items-center justify-between py-2.5 hover:text-primary transition-colors"
              >
                <span className="text-sm font-medium text-text-primary">{row.label}</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-text-secondary tabular-nums">{row.value}</span>
                  <svg
                    className="w-4 h-4 text-text-secondary"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
