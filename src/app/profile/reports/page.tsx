"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/state/auth";
import { sessions as sessionsApi } from "@/lib/api/core";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { Tabs, TabList, Tab, TabPanel } from "@/components/ui/Tabs";
import { BarChart } from "@/components/ui/charts/BarChart";
import { LineChart } from "@/components/ui/charts/LineChart";
import type { ReportRange, SessionSummary } from "@/lib/profile/types";

async function fetchSessions(): Promise<SessionSummary[]> {
  try {
    const res = (await sessionsApi.getMySession()) as
      | { data?: SessionSummary[]; items?: SessionSummary[] }
      | SessionSummary[];
    return Array.isArray(res) ? res : res.data ?? res.items ?? [];
  } catch {
    return [];
  }
}

const RANGES: Array<{ value: ReportRange; label: string; days: number | null }> = [
  { value: "7d", label: "7 days", days: 7 },
  { value: "30d", label: "30 days", days: 30 },
  { value: "3m", label: "3 months", days: 90 },
  { value: "all", label: "All time", days: null },
];

export default function WorkoutReportPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [range, setRange] = useState<ReportRange>("30d");

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [authLoading, user, router]);

  const { data: allSessions = [] } = useQuery({
    queryKey: sessionsApi.keys.list(),
    queryFn: fetchSessions,
  });
  const sessions = useMemo(() => {
    const days = RANGES.find((r) => r.value === range)?.days;
    if (!days) return allSessions;
    const cutoff = Date.now() - days * 86_400_000;
    return allSessions.filter((s) => new Date(s.completedAt).getTime() >= cutoff);
  }, [allSessions, range]);

  if (authLoading || !user) return null;

  const totalWorkouts = sessions.length;
  const totalMinutes = sessions.reduce((s, x) => s + x.durationMinutes, 0);
  const avgRpe =
    sessions.length === 0
      ? 0
      : sessions.reduce((s, x) => s + (x.rpe ?? 0), 0) / sessions.length;
  const totalVolume = sessions.reduce((s, x) => s + x.totalVolumeKg, 0);

  const minutesPerDay = buildDailyBuckets(sessions, "durationMinutes");
  const volumePerDay = buildDailyBuckets(sessions, "totalVolumeKg");
  const byWorkout = groupByWorkout(sessions);

  return (
    <AppShell subtitle="Workout report">
      <div className="max-w-5xl mx-auto px-4 lg:px-0 py-6 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <Link
            href="/profile"
            className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-primary"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Profile
          </Link>
          <div className="inline-flex rounded-lg border border-border-soft overflow-hidden">
            {RANGES.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setRange(r.value)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  range === r.value
                    ? "bg-primary text-white"
                    : "text-text-secondary hover:bg-primary-soft hover:text-primary"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <h1 className="text-2xl lg:text-3xl font-bold text-primary">Workout report</h1>

        <Tabs defaultValue="overview" variant="underline">
          <TabList>
            <Tab value="overview">Overview</Tab>
            <Tab value="workout">By workout</Tab>
            <Tab value="movement">By movement</Tab>
          </TabList>

          <div className="pt-4 space-y-6">
            <TabPanel value="overview">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <StatCard label="Workouts" value={totalWorkouts} />
                <StatCard label="Total time" value={`${Math.round(totalMinutes / 60)}h`} accent="orange" />
                <StatCard label="Avg RPE" value={avgRpe ? avgRpe.toFixed(1) : "—"} accent="purple" />
                <StatCard label="Volume" value={`${Math.round(totalVolume / 1000)}k kg`} accent="blue" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                <Card>
                  <CardHeader title="Minutes per day" />
                  <CardContent>
                    <BarChart
                      data={minutesPerDay}
                      xKey="date"
                      series={[{ key: "value", label: "Minutes" }]}
                      height={220}
                    />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader title="Volume per day" />
                  <CardContent>
                    <LineChart
                      data={volumePerDay}
                      xKey="date"
                      series={[{ key: "value", label: "Volume (kg)" }]}
                      height={220}
                    />
                  </CardContent>
                </Card>
              </div>
            </TabPanel>

            <TabPanel value="workout">
              <Card>
                <CardHeader title="Sessions" subtitle="Tap for full detail" />
                <CardContent>
                  <ul className="divide-y divide-border-soft">
                    {sessions.map((s) => (
                      <li key={s.id}>
                        <Link
                          href={`/profile/sessions/${s.id}`}
                          className="flex items-center justify-between py-3 hover:text-primary transition-colors"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-text-primary truncate">
                              {s.workoutName}
                            </p>
                            <p className="text-xs text-text-secondary">
                              {new Date(s.completedAt).toLocaleDateString(undefined, {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                              {" · "}
                              {s.durationMinutes} min · RPE {s.rpe ?? "—"}
                            </p>
                          </div>
                          <svg className="w-4 h-4 text-text-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="9 18 15 12 9 6" />
                          </svg>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabPanel>

            <TabPanel value="movement">
              <Card>
                <CardHeader title="By workout template" />
                <CardContent>
                  <BarChart
                    data={byWorkout}
                    xKey="name"
                    series={[{ key: "count", label: "Sessions" }]}
                    height={240}
                  />
                </CardContent>
              </Card>
              <p className="mt-3 text-xs text-text-secondary">
                Per-movement PRs + volume detail are a P14.10 follow-up — the aggregation endpoint
                returns it once the platform types the response.
              </p>
            </TabPanel>
          </div>
        </Tabs>
      </div>
    </AppShell>
  );
}

function buildDailyBuckets(
  sessions: SessionSummary[],
  key: "durationMinutes" | "totalVolumeKg"
): Array<{ date: string; value: number }> {
  const map = new Map<string, number>();
  for (const s of sessions) {
    const d = new Date(s.completedAt);
    d.setHours(0, 0, 0, 0);
    const label = d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    map.set(label, (map.get(label) ?? 0) + s[key]);
  }
  return Array.from(map.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, value]) => ({ date, value: Math.round(value) }));
}

function groupByWorkout(sessions: SessionSummary[]): Array<{ name: string; count: number }> {
  const map = new Map<string, number>();
  for (const s of sessions) {
    map.set(s.workoutName, (map.get(s.workoutName) ?? 0) + 1);
  }
  return Array.from(map.entries()).map(([name, count]) => ({ name, count }));
}
