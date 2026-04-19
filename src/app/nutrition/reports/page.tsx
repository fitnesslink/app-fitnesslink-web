"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/state/auth";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { Tabs, TabList, Tab, TabPanel } from "@/components/ui/Tabs";
import { LineChart } from "@/components/ui/charts/LineChart";
import { BarChart } from "@/components/ui/charts/BarChart";
import { RingChart } from "@/components/ui/charts/RingChart";
import { DEFAULT_GOAL } from "@/lib/nutrition/types";

// Placeholder weekly data — swap for `/nutrition/api/v1/food-entries/me/all` + aggregation
// once the backend response is typed.
function buildSampleDaily(days: number) {
  const out: Array<{ date: string; calories: number; protein: number; carbs: number; fat: number }> = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const label = d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    const base = 1800 + Math.sin(i / 2) * 300 + (Math.random() - 0.5) * 120;
    out.push({
      date: label,
      calories: Math.round(base),
      protein: Math.round(120 + (Math.random() - 0.5) * 30),
      carbs: Math.round(220 + (Math.random() - 0.5) * 60),
      fat: Math.round(65 + (Math.random() - 0.5) * 12),
    });
  }
  return out;
}

type Metric = "calories" | "protein" | "carbs" | "fat";

const METRIC_ACCENT: Record<Metric, string> = {
  calories: "#23AF8D",
  protein: "#F69833",
  carbs: "#3B82F6",
  fat: "#8B5CF6",
};

const METRIC_LABEL: Record<Metric, string> = {
  calories: "Calories",
  protein: "Protein",
  carbs: "Carbs",
  fat: "Fat",
};

export default function NutritionReportsPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [range, setRange] = useState<"week" | "month">("week");
  const [metric, setMetric] = useState<Metric>("calories");

  useEffect(() => {
    if (!isLoading && !user) router.replace("/login");
  }, [isLoading, user, router]);

  const data = useMemo(() => buildSampleDaily(range === "week" ? 7 : 30), [range]);
  const avgCalories = Math.round(data.reduce((s, d) => s + d.calories, 0) / data.length);
  const daysOnTarget = data.filter(
    (d) => Math.abs(d.calories - DEFAULT_GOAL.calorieGoal) <= 200
  ).length;

  const macroRing = [
    {
      key: "protein",
      label: "Protein",
      value: data.reduce((s, d) => s + d.protein * 4, 0),
      color: METRIC_ACCENT.protein,
    },
    {
      key: "carbs",
      label: "Carbs",
      value: data.reduce((s, d) => s + d.carbs * 4, 0),
      color: METRIC_ACCENT.carbs,
    },
    {
      key: "fat",
      label: "Fat",
      value: data.reduce((s, d) => s + d.fat * 9, 0),
      color: METRIC_ACCENT.fat,
    },
  ];

  const surplusDeficit = data.map((d) => ({
    date: d.date,
    delta: d.calories - DEFAULT_GOAL.calorieGoal,
  }));

  if (isLoading || !user) return null;

  return (
    <AppShell subtitle="Nutrition reports">
      <div className="max-w-5xl mx-auto px-4 lg:px-0 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/nutrition"
            className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-primary"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Nutrition
          </Link>
          <div className="inline-flex rounded-lg border border-border-soft overflow-hidden">
            {(["week", "month"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRange(r)}
                className={`px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                  range === r
                    ? "bg-primary text-white"
                    : "text-text-secondary hover:bg-primary-soft hover:text-primary"
                }`}
              >
                {r === "week" ? "Week" : "Month"}
              </button>
            ))}
          </div>
        </div>

        <Tabs defaultValue="overview" variant="underline">
          <TabList>
            <Tab value="overview">Overview</Tab>
            <Tab value="metric">By metric</Tab>
          </TabList>

          <div className="pt-4 space-y-6">
            <TabPanel value="overview">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <StatCard label="Avg calories" value={avgCalories.toLocaleString()} hint={`vs ${DEFAULT_GOAL.calorieGoal} goal`} />
                <StatCard label="Days on target" value={`${daysOnTarget}/${data.length}`} accent="orange" />
                <StatCard label="Logging streak" value="5d" accent="purple" />
                <StatCard label="Total logged" value={`${data.length}d`} accent="blue" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 mt-6">
                <Card>
                  <CardHeader title="Calories vs goal" subtitle={`Last ${data.length} days`} />
                  <CardContent>
                    <LineChart
                      data={data}
                      xKey="date"
                      series={[{ key: "calories", label: "Calories" }]}
                      height={260}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader title="Macro split" subtitle="Total kcal from each" />
                  <CardContent>
                    <RingChart
                      data={macroRing}
                      height={240}
                      centerLabel={
                        <div className="text-center">
                          <p className="text-xs text-text-secondary">Total kcal</p>
                          <p className="text-xl font-bold text-text-primary tabular-nums">
                            {Math.round(macroRing.reduce((s, r) => s + r.value, 0)).toLocaleString()}
                          </p>
                        </div>
                      }
                    />
                  </CardContent>
                </Card>
              </div>

              <Card className="mt-6">
                <CardHeader title="Surplus / deficit" subtitle="Difference from daily calorie goal" />
                <CardContent>
                  <BarChart
                    data={surplusDeficit}
                    xKey="date"
                    series={[{ key: "delta", label: "Delta (kcal)" }]}
                    height={220}
                  />
                </CardContent>
              </Card>
            </TabPanel>

            <TabPanel value="metric">
              <div className="flex flex-wrap gap-2 mb-4">
                {(Object.keys(METRIC_LABEL) as Metric[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMetric(m)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      m === metric
                        ? "bg-primary text-white"
                        : "bg-primary-soft text-primary hover:bg-primary-soft/70"
                    }`}
                  >
                    {METRIC_LABEL[m]}
                  </button>
                ))}
              </div>

              <Card>
                <CardHeader
                  title={METRIC_LABEL[metric]}
                  subtitle={`Daily trend (last ${data.length} days)`}
                />
                <CardContent>
                  <LineChart
                    data={data}
                    xKey="date"
                    series={[{ key: metric, label: METRIC_LABEL[metric], color: METRIC_ACCENT[metric] }]}
                    height={280}
                  />
                </CardContent>
              </Card>
            </TabPanel>
          </div>
        </Tabs>
      </div>
    </AppShell>
  );
}
