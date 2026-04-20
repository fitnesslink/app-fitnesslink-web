"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/state/auth";
import { goals as goalsApi } from "@/lib/api/core";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { GoalsEmpty } from "@/components/ui/empty-states";
import type { Goal } from "@/lib/profile/types";

async function fetchGoals(): Promise<Goal[]> {
  try {
    const res = (await goalsApi.listGoals()) as
      | { data?: Goal[]; items?: Goal[] }
      | Goal[];
    return Array.isArray(res) ? res : res.data ?? res.items ?? [];
  } catch {
    return [];
  }
}

export default function GoalsListPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [authLoading, user, router]);

  const { data: goals = [] } = useQuery({
    queryKey: goalsApi.keys.list(),
    queryFn: fetchGoals,
  });

  if (authLoading || !user) return null;

  return (
    <AppShell subtitle="Goals">
      <div className="max-w-3xl mx-auto px-4 lg:px-0 py-6 space-y-6">
        <Link
          href="/profile"
          className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-primary"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Profile
        </Link>

        <div className="flex items-center justify-between">
          <h1 className="text-2xl lg:text-3xl font-bold text-primary">Goals</h1>
          <Link href="/profile/goals/new">
            <Button variant="primary" fullWidth={false} className="!h-10 px-4 text-sm">
              + New goal
            </Button>
          </Link>
        </div>

        {goals.length === 0 ? (
          <Card>
            <GoalsEmpty
              action={
                <Link href="/profile/goals/new">
                  <Button variant="primary" fullWidth={false} className="!h-11 px-5 text-sm">
                    Create goal
                  </Button>
                </Link>
              }
            />
          </Card>
        ) : (
          <ul className="space-y-3">
            {goals.map((goal) => {
              const pct = progressPercent(goal);
              return (
                <li key={goal.id}>
                  <Link href={`/profile/goals/${goal.id}`} className="block">
                    <Card className="hover:border-primary transition-colors">
                      <CardContent>
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <p className="text-base font-semibold text-text-primary truncate">
                              {goal.title}
                            </p>
                            <p className="text-xs text-text-secondary mt-0.5 tabular-nums">
                              {goal.currentValue} / {goal.targetValue} {goal.targetUnit}
                            </p>
                          </div>
                          <Badge tone={goal.direction === "increase" ? "primary" : "warning"}>
                            {goal.direction}
                          </Badge>
                        </div>
                        <div className="mt-3 h-2 bg-border-soft rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <p className="text-[10px] text-text-secondary mt-1 tabular-nums">
                          {pct}% complete
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </AppShell>
  );
}

function progressPercent(goal: Goal): number {
  if (goal.direction === "increase") {
    if (goal.targetValue === 0) return 0;
    return Math.min(100, Math.max(0, Math.round((goal.currentValue / goal.targetValue) * 100)));
  }
  // For "decrease" goals, the current starts higher than target. Compute how far
  // we've dropped from the starting value vs the required drop.
  const start = Math.max(goal.currentValue, goal.targetValue * 1.2);
  const dropped = start - goal.currentValue;
  const needed = start - goal.targetValue;
  if (needed <= 0) return 100;
  return Math.min(100, Math.max(0, Math.round((dropped / needed) * 100)));
}
