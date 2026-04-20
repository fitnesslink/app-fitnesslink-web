"use client";

import { use, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/state/auth";
import { sessions as sessionsApi } from "@/lib/api/core";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { Skeleton } from "@/components/ui/Skeleton";
import type { SessionDetail } from "@/lib/profile/types";

async function fetchSession(id: string): Promise<SessionDetail | null> {
  try {
    const res = (await sessionsApi.getSession(id)) as SessionDetail | null;
    if (!res) return null;
    return { ...res, exercises: res.exercises ?? [] };
  } catch {
    return null;
  }
}

export default function SessionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [authLoading, user, router]);

  const { data, isLoading } = useQuery({
    queryKey: sessionsApi.keys.detail(id),
    queryFn: () => fetchSession(id),
    enabled: !!id,
  });

  if (authLoading || !user) return null;

  return (
    <AppShell subtitle={data?.workoutName ?? "Session"}>
      <div className="max-w-3xl mx-auto px-4 lg:px-0 py-6 space-y-6">
        <Link
          href="/profile/reports"
          className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-primary"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Workout report
        </Link>

        {isLoading ? (
          <>
            <Skeleton className="h-40" />
            <Skeleton className="h-60" />
          </>
        ) : !data ? (
          <p className="text-sm text-text-secondary">Session not found.</p>
        ) : (
          <>
            <Card>
              <CardContent>
                <h1 className="text-2xl lg:text-3xl font-bold text-text-primary">
                  {data.workoutName}
                </h1>
                <p className="text-sm text-text-secondary mt-1">
                  {new Date(data.completedAt).toLocaleDateString(undefined, {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <StatCard label="Duration" value={`${data.durationMinutes}m`} />
              <StatCard label="RPE" value={data.rpe ?? "—"} accent="purple" />
              <StatCard label="Volume" value={`${Math.round(data.totalVolumeKg)} kg`} accent="blue" />
              <StatCard label="Exercises" value={data.exercises.length} accent="orange" />
            </div>

            {data.exercises.map((ex) => (
              <Card key={ex.id}>
                <CardHeader title={ex.name} subtitle={`${ex.sets.length} sets`} />
                <CardContent>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-text-secondary text-xs uppercase tracking-wide">
                        <th className="text-left py-2 font-medium">Set</th>
                        <th className="text-right py-2 font-medium">Reps</th>
                        <th className="text-right py-2 font-medium">Weight</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-soft">
                      {ex.sets.map((s) => (
                        <tr key={s.setNumber}>
                          <td className="py-2 text-text-primary tabular-nums">{s.setNumber}</td>
                          <td className="py-2 text-right text-text-primary tabular-nums">{s.reps}</td>
                          <td className="py-2 text-right text-text-primary tabular-nums">
                            {s.weightKg} kg
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            ))}
          </>
        )}
      </div>
    </AppShell>
  );
}
