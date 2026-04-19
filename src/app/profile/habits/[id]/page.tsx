"use client";

import { use, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/state/auth";
import { habits as habitsApi } from "@/lib/api/core";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { HabitHeatmap } from "@/components/profile/HabitHeatmap";
import { placeholderHabit, type HabitDetail } from "@/lib/profile/types";

async function fetchHabit(id: string): Promise<HabitDetail> {
  try {
    const res = (await habitsApi.getHabit(id)) as HabitDetail | null;
    if (!res) return placeholderHabit(id);
    return {
      ...placeholderHabit(id),
      ...res,
      completionByDate: res.completionByDate ?? placeholderHabit(id).completionByDate,
    };
  } catch {
    return placeholderHabit(id);
  }
}

export default function HabitDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const qc = useQueryClient();
  const { user, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [authLoading, user, router]);

  const { data } = useQuery({
    queryKey: habitsApi.keys.detail(id),
    queryFn: () => fetchHabit(id),
    enabled: !!id,
  });

  const logToday = useMutation({
    mutationFn: () =>
      habitsApi.logHabit(id, {
        completedAt: new Date().toISOString(),
        completionType: "full",
        idempotencyKey: crypto.randomUUID(),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: habitsApi.keys.detail(id) }),
  });

  if (authLoading || !user || !data) return null;

  const todayKey = new Date().toISOString().slice(0, 10);
  const doneToday = (data.completionByDate[todayKey] ?? 0) > 0;

  return (
    <AppShell subtitle={data.title}>
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

        <Card>
          <CardContent>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-text-primary">{data.title}</h1>
                {data.goalId && (
                  <p className="mt-1 text-sm text-text-secondary">
                    Feeding{" "}
                    <Link
                      href={`/profile/goals/${data.goalId}`}
                      className="text-primary font-medium hover:underline"
                    >
                      goal {data.goalId}
                    </Link>
                  </p>
                )}
              </div>
              <Badge tone="primary">🔥 {data.streakDays}d streak</Badge>
            </div>
            <div className="mt-4">
              <Button
                type="button"
                variant={doneToday ? "secondary" : "primary"}
                fullWidth={false}
                className="!h-11 px-6 text-sm"
                isLoading={logToday.isPending}
                disabled={doneToday}
                onClick={() => logToday.mutate()}
              >
                {doneToday ? "Done for today ✓" : "Mark done today"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Last 12 months" subtitle="Hover a cell for the date" />
          <CardContent>
            <HabitHeatmap completionByDate={data.completionByDate} />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
