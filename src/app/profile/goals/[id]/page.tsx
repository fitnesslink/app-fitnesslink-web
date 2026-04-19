"use client";

import { use, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/state/auth";
import { goals as goalsApi } from "@/lib/api/core";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { placeholderGoals, type Goal } from "@/lib/profile/types";

async function fetchGoal(id: string): Promise<Goal> {
  try {
    const res = (await goalsApi.getGoal(id)) as Goal | null;
    if (!res) return placeholderGoals().find((g) => g.id === id) ?? placeholderGoals()[0];
    return res;
  } catch {
    return placeholderGoals().find((g) => g.id === id) ?? placeholderGoals()[0];
  }
}

export default function GoalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [authLoading, user, router]);

  const { data, isLoading } = useQuery({
    queryKey: goalsApi.keys.detail(id),
    queryFn: () => fetchGoal(id),
    enabled: !!id,
  });

  if (authLoading || !user) return null;

  return (
    <AppShell subtitle={data?.title ?? "Goal"}>
      <div className="max-w-3xl mx-auto px-4 lg:px-0 py-6 space-y-6">
        <Link
          href="/profile/goals"
          className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-primary"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Goals
        </Link>

        {isLoading || !data ? (
          <>
            <Skeleton className="h-40" />
            <Skeleton className="h-60" />
          </>
        ) : (
          <>
            <Card>
              <CardContent>
                {data.identityStatement && (
                  <p className="text-sm italic text-primary mb-2">
                    &ldquo;{data.identityStatement}&rdquo;
                  </p>
                )}
                <h1 className="text-2xl lg:text-3xl font-bold text-text-primary">
                  {data.title}
                </h1>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-text-secondary">
                  <Badge tone={data.direction === "increase" ? "primary" : "warning"}>
                    {data.direction}
                  </Badge>
                  <span>•</span>
                  <span className="tabular-nums font-medium text-text-primary">
                    {data.currentValue} → {data.targetValue} {data.targetUnit}
                  </span>
                  {data.targetDate && (
                    <>
                      <span>•</span>
                      <span>
                        Target{" "}
                        {new Date(data.targetDate).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader title="Milestones" />
              <CardContent>
                {data.milestones.length === 0 ? (
                  <p className="text-sm text-text-secondary">
                    No milestones yet — add them by editing the goal.
                  </p>
                ) : (
                  <ol className="relative border-l-2 border-border-soft pl-5 space-y-4">
                    {data.milestones.map((m) => (
                      <li key={m.id} className="relative">
                        <span
                          className={`absolute -left-[27px] top-1 w-4 h-4 rounded-full border-2 ${
                            m.achievedDate
                              ? "bg-primary border-primary"
                              : "bg-surface border-border"
                          }`}
                        />
                        <p className="text-sm font-medium text-text-primary">{m.title}</p>
                        <p className="text-xs text-text-secondary tabular-nums">
                          Target {m.targetValue} {data.targetUnit}
                          {m.achievedDate &&
                            ` · hit ${new Date(m.achievedDate).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                            })}`}
                        </p>
                      </li>
                    ))}
                  </ol>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader title="Linked habits" />
              <CardContent>
                {data.linkedHabitIds.length === 0 ? (
                  <p className="text-sm text-text-secondary">None linked yet.</p>
                ) : (
                  <ul className="space-y-2">
                    {data.linkedHabitIds.map((habitId) => (
                      <li key={habitId}>
                        <Link
                          href={`/profile/habits/${habitId}`}
                          className="flex items-center justify-between px-3 py-2 rounded-lg border border-border-soft hover:border-primary"
                        >
                          <span className="text-sm font-medium text-text-primary">
                            Habit {habitId}
                          </span>
                          <svg className="w-4 h-4 text-text-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="9 18 15 12 9 6" />
                          </svg>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </AppShell>
  );
}
