"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { goals } from "@/lib/api/core";
import { Card } from "@/components/ui/Card";
import { ProgressRing } from "@/components/ui/charts/ProgressRing";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";

// Local type — the platform spec doesn't emit response schemas yet, so we
// describe the subset we rely on and cast the unknown response. When the
// backend adds `[ProducesResponseType]` this becomes a generated type.
interface GoalCard {
  id: string;
  title: string;
  targetValue: number;
  currentValue: number;
  targetUnit: string;
  accent?: "primary" | "orange" | "purple" | "blue";
}

const accentColor: Record<NonNullable<GoalCard["accent"]>, string> = {
  primary: "#23AF8D",
  orange: "#F69833",
  purple: "#8B5CF6",
  blue: "#3B82F6",
};

async function fetchGoals(): Promise<GoalCard[]> {
  try {
    const res = (await goals.listGoals()) as
      | { data?: GoalCard[]; items?: GoalCard[] }
      | GoalCard[];
    return Array.isArray(res) ? res : res.data ?? res.items ?? [];
  } catch {
    return [];
  }
}

export function GoalProgressRow() {
  const { data, isLoading } = useQuery({
    queryKey: goals.keys.list(),
    queryFn: fetchGoals,
  });

  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-x-auto lg:overflow-visible">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="shrink-0 w-56 h-36" />
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <EmptyState title="No active goals" description="Create a goal to track progress here." />
      </Card>
    );
  }

  return (
    <div className="flex gap-4 overflow-x-auto lg:overflow-visible -mx-4 px-4 lg:mx-0 lg:px-0 pb-2 lg:grid lg:grid-cols-3">
      {data.map((g) => {
        const accent = g.accent ?? "primary";
        const pct = g.targetValue === 0 ? 0 : Math.min(1, g.currentValue / g.targetValue);
        return (
          <Link
            key={g.id}
            href={`/profile/goals/${g.id}`}
            className="shrink-0 w-56 lg:w-auto"
            aria-label={`Open ${g.title}`}
          >
            <Card className="hover:border-primary transition-colors h-full">
              <div className="flex items-center gap-4">
                <ProgressRing
                  progress={pct}
                  size={72}
                  strokeWidth={8}
                  color={accentColor[accent]}
                  label={`${g.title} progress`}
                >
                  <span className="text-sm font-bold text-text-primary tabular-nums">
                    {Math.round(pct * 100)}%
                  </span>
                </ProgressRing>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-text-primary truncate">{g.title}</p>
                  <p className="text-xs text-text-secondary mt-0.5 tabular-nums">
                    {g.currentValue.toLocaleString()} / {g.targetValue.toLocaleString()} {g.targetUnit}
                  </p>
                </div>
              </div>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
