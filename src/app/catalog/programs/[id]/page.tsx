"use client";

import { useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/state/auth";
import { programs } from "@/lib/api/core";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import type { ProgramDetail } from "@/lib/catalog/types";
import { placeholderProgramDetail } from "@/lib/catalog/placeholder";

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

async function fetchProgramDetail(id: string): Promise<ProgramDetail> {
  try {
    const res = (await programs.getProgram(id)) as ProgramDetail | null;
    if (!res) return placeholderProgramDetail(id);
    return {
      ...placeholderProgramDetail(id),
      ...res,
      schedule: res.schedule ?? placeholderProgramDetail(id).schedule,
    };
  } catch {
    return placeholderProgramDetail(id);
  }
}

export default function ProgramDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [authLoading, user, router]);

  const { data, isLoading } = useQuery({
    queryKey: programs.keys.detail(id),
    queryFn: () => fetchProgramDetail(id),
    enabled: !!id,
  });

  if (authLoading || !user) return null;

  return (
    <AppShell subtitle={data?.name ?? "Program"}>
      <div className="max-w-5xl mx-auto px-4 lg:px-0 py-6 space-y-6">
        <Link
          href="/catalog/programs"
          className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-primary"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Programs
        </Link>

        {isLoading || !data ? (
          <>
            <Skeleton className="h-48" />
            <Skeleton className="h-72" />
          </>
        ) : (
          <>
            <Card>
              <CardContent>
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="aspect-[4/3] lg:w-64 shrink-0 rounded-xl bg-gradient-to-br from-primary to-primary-hover text-white flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-5xl font-bold tabular-nums">{data.weeks}</p>
                      <p className="text-sm uppercase tracking-wide opacity-90">weeks</p>
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h1 className="text-2xl lg:text-3xl font-bold text-text-primary">{data.name}</h1>
                    {data.description && (
                      <p className="text-sm text-text-secondary mt-2">{data.description}</p>
                    )}
                    <div className="flex flex-wrap gap-2 mt-3 text-xs">
                      {data.trainingLevel && (
                        <Badge tone={data.trainingLevel === "advanced" ? "warning" : "primary"}>
                          {data.trainingLevel}
                        </Badge>
                      )}
                    </div>
                    <div className="mt-5 flex flex-wrap gap-3">
                      <Button variant="primary" fullWidth={false} className="!h-11 px-6 text-sm">
                        Start program
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              {data.schedule.map((week) => (
                <Card key={week.weekNumber}>
                  <CardContent>
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-text-secondary mb-3">
                      Week {week.weekNumber}
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                      {week.days.map((day) => (
                        <div
                          key={day.dayNumber}
                          className={`rounded-lg p-3 min-h-[96px] flex flex-col ${
                            day.workout
                              ? "bg-primary-soft"
                              : "bg-background border border-dashed border-border-soft"
                          }`}
                        >
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-text-secondary">
                            {DAY_NAMES[day.dayNumber - 1]}
                          </p>
                          {day.workout ? (
                            <Link
                              href={`/catalog/workouts/${day.workout.id}`}
                              className="mt-1 flex-1 text-sm font-medium text-primary hover:underline"
                            >
                              {day.workout.name}
                              <span className="block text-[10px] text-text-secondary font-normal mt-0.5">
                                {day.workout.estimatedMinutes} min
                              </span>
                            </Link>
                          ) : (
                            <p className="mt-1 flex-1 text-sm text-text-secondary">Rest</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
