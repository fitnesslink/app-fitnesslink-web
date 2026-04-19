"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/state/auth";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { Tabs, TabList, Tab, TabPanel } from "@/components/ui/Tabs";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { AreaChart } from "@/components/ui/charts/AreaChart";
import { ProgressRing } from "@/components/ui/charts/ProgressRing";

// Placeholder activity — Phase 7 will replace with real API data.
const SAMPLE_ACTIVITY = [
  { day: "Mon", minutes: 30 },
  { day: "Tue", minutes: 45 },
  { day: "Wed", minutes: 0 },
  { day: "Thu", minutes: 60 },
  { day: "Fri", minutes: 35 },
  { day: "Sat", minutes: 75 },
  { day: "Sun", minutes: 20 },
];

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) router.replace("/login");
  }, [isLoading, user, router]);

  if (isLoading || !user) return null;

  return (
    <AppShell subtitle="Day 3 of your program">
      <div className="max-w-5xl mx-auto px-4 lg:px-0 py-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Streak" value="7 days" hint="Personal best: 12" />
          <StatCard label="Workouts" value="24" accent="orange" hint="This month" />
          <StatCard label="Calories" value="1,842" accent="purple" hint="Today" />
          <StatCard label="Sleep" value="7h 12m" accent="blue" hint="Last night" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          <Card>
            <CardHeader
              title="This week"
              subtitle="Minutes trained per day"
              action={<Badge tone="primary">+18% vs last week</Badge>}
            />
            <CardContent>
              <AreaChart
                data={SAMPLE_ACTIVITY}
                xKey="day"
                series={[{ key: "minutes", label: "Minutes" }]}
                height={220}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Today" subtitle="Your next target" />
            <CardContent>
              <div className="flex flex-col items-center gap-3 py-2">
                <ProgressRing progress={0.65} size={140} label="Today's goal progress">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-text-primary">65%</p>
                    <p className="text-xs text-text-secondary">of daily goal</p>
                  </div>
                </ProgressRing>
                <p className="text-sm text-text-secondary">
                  35 more active minutes to hit your goal
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <Tabs defaultValue="today" variant="underline">
            <TabList>
              <Tab value="today">Today</Tab>
              <Tab value="habits">Habits</Tab>
              <Tab value="nutrition">Nutrition</Tab>
            </TabList>
            <div className="pt-4">
              <TabPanel value="today">
                <EmptyState
                  title="No workout scheduled"
                  description="Browse the catalog to pick today's session."
                />
              </TabPanel>
              <TabPanel value="habits">
                <EmptyState title="Habit tracking lands in Phase 14" />
              </TabPanel>
              <TabPanel value="nutrition">
                <EmptyState title="Nutrition widgets land in Phase 12" />
              </TabPanel>
            </div>
          </Tabs>
        </Card>
      </div>
    </AppShell>
  );
}
