"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/state/auth";
import { nutritionGoals } from "@/lib/api/nutrition";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { DEFAULT_GOAL, type NutritionGoal } from "@/lib/nutrition/types";

async function fetchGoal(): Promise<NutritionGoal> {
  try {
    const res = (await nutritionGoals.getMyNutritionGoal()) as NutritionGoal | null;
    if (!res) return DEFAULT_GOAL;
    return { ...DEFAULT_GOAL, ...res };
  } catch {
    return DEFAULT_GOAL;
  }
}

// Kcal per gram — used to keep the calorie total in sync with macro grams.
const KCAL_PER_GRAM = { protein: 4, carbs: 4, fat: 9 };

export default function NutritionGoalsPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const { user, isLoading: authLoading } = useAuth();

  const { data } = useQuery({ queryKey: nutritionGoals.keys.all, queryFn: fetchGoal });
  const [goal, setGoal] = useState<NutritionGoal>(DEFAULT_GOAL);
  const [mode, setMode] = useState<"grams" | "percent">("grams");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (data) setGoal(data);
  }, [data]);

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [authLoading, user, router]);

  const macroKcal = useMemo(
    () =>
      goal.proteinTarget * KCAL_PER_GRAM.protein +
      goal.carbsTarget * KCAL_PER_GRAM.carbs +
      goal.fatTarget * KCAL_PER_GRAM.fat,
    [goal]
  );
  const drift = goal.calorieGoal - macroKcal;

  const save = useMutation({
    mutationFn: () => nutritionGoals.createNutritionGoal(goal),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: nutritionGoals.keys.all });
      router.push("/nutrition");
    },
    onError: (err) => setError(err instanceof Error ? err.message : "Save failed"),
  });

  function updateMacroGrams(key: "proteinTarget" | "carbsTarget" | "fatTarget", value: number) {
    setGoal((g) => ({ ...g, [key]: Math.max(0, value) }));
  }

  function updateMacroPercent(key: "protein" | "carbs" | "fat", pctString: string) {
    const pct = Math.max(0, Math.min(100, Number(pctString)));
    const kcalForMacro = (pct / 100) * goal.calorieGoal;
    const grams = Math.round(kcalForMacro / KCAL_PER_GRAM[key]);
    const mapping = { protein: "proteinTarget", carbs: "carbsTarget", fat: "fatTarget" } as const;
    setGoal((g) => ({ ...g, [mapping[key]]: grams }));
  }

  function percentOf(grams: number, kcalPerGram: number): number {
    if (goal.calorieGoal === 0) return 0;
    return Math.round((grams * kcalPerGram * 100) / goal.calorieGoal);
  }

  if (authLoading || !user) return null;

  return (
    <AppShell subtitle="Goal settings">
      <div className="max-w-2xl mx-auto px-4 lg:px-0 py-6 space-y-6">
        <Link
          href="/nutrition"
          className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-primary"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Nutrition
        </Link>

        <Card>
          <CardHeader title="Daily calorie target" />
          <CardContent>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={0}
                step={50}
                value={goal.calorieGoal}
                onChange={(e) =>
                  setGoal((g) => ({ ...g, calorieGoal: Math.max(0, Number(e.target.value)) }))
                }
                className="h-12 w-32 px-3 rounded-lg border border-border-soft bg-surface text-xl font-semibold text-text-primary focus:outline-none focus:ring-2 focus:ring-primary tabular-nums"
              />
              <span className="text-sm text-text-secondary">kcal / day</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader
            title="Macro split"
            action={
              <div className="inline-flex rounded-lg border border-border-soft overflow-hidden">
                {(["grams", "percent"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMode(m)}
                    className={`px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                      mode === m
                        ? "bg-primary text-white"
                        : "text-text-secondary hover:bg-primary-soft hover:text-primary"
                    }`}
                  >
                    {m === "grams" ? "Grams" : "Percent"}
                  </button>
                ))}
              </div>
            }
          />
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <MacroInput
                label="Protein"
                accent="orange"
                mode={mode}
                grams={goal.proteinTarget}
                percent={percentOf(goal.proteinTarget, KCAL_PER_GRAM.protein)}
                onGrams={(v) => updateMacroGrams("proteinTarget", v)}
                onPercent={(v) => updateMacroPercent("protein", v)}
              />
              <MacroInput
                label="Carbs"
                accent="blue"
                mode={mode}
                grams={goal.carbsTarget}
                percent={percentOf(goal.carbsTarget, KCAL_PER_GRAM.carbs)}
                onGrams={(v) => updateMacroGrams("carbsTarget", v)}
                onPercent={(v) => updateMacroPercent("carbs", v)}
              />
              <MacroInput
                label="Fat"
                accent="purple"
                mode={mode}
                grams={goal.fatTarget}
                percent={percentOf(goal.fatTarget, KCAL_PER_GRAM.fat)}
                onGrams={(v) => updateMacroGrams("fatTarget", v)}
                onPercent={(v) => updateMacroPercent("fat", v)}
              />
            </div>

            <div className="mt-4 rounded-lg bg-primary-soft/60 px-3 py-2 text-xs text-text-secondary">
              Macro total: <span className="font-semibold text-text-primary">{macroKcal} kcal</span>
              {" · "}
              {drift === 0 ? (
                <span className="text-primary">matches calorie target</span>
              ) : drift > 0 ? (
                <span>
                  {drift} kcal <em>under</em> target
                </span>
              ) : (
                <span>{Math.abs(drift)} kcal over target</span>
              )}
            </div>
          </CardContent>
        </Card>

        {error && (
          <p className="text-sm text-danger bg-danger/10 rounded-lg px-3 py-2">{error}</p>
        )}

        <div className="flex gap-2 justify-end">
          <Link href="/nutrition">
            <Button variant="secondary" fullWidth={false} className="!h-11 px-5 text-sm">
              Cancel
            </Button>
          </Link>
          <Button
            type="button"
            variant="primary"
            fullWidth={false}
            className="!h-11 px-6 text-sm"
            isLoading={save.isPending}
            onClick={() => save.mutate()}
          >
            Save
          </Button>
        </div>
      </div>
    </AppShell>
  );
}

const accentText: Record<string, string> = {
  orange: "text-accent-orange",
  blue: "text-accent-blue",
  purple: "text-accent-purple",
};

function MacroInput({
  label,
  accent,
  mode,
  grams,
  percent,
  onGrams,
  onPercent,
}: {
  label: string;
  accent: "orange" | "blue" | "purple";
  mode: "grams" | "percent";
  grams: number;
  percent: number;
  onGrams: (v: number) => void;
  onPercent: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className={`block text-[10px] font-semibold uppercase tracking-wide mb-1 ${accentText[accent]}`}>
        {label}
      </span>
      <div className="relative">
        <input
          type="number"
          min={0}
          max={mode === "percent" ? 100 : 500}
          step={mode === "percent" ? 5 : 5}
          value={mode === "grams" ? grams : percent}
          onChange={(e) =>
            mode === "grams" ? onGrams(Math.max(0, Number(e.target.value))) : onPercent(e.target.value)
          }
          className="h-11 w-full px-3 pr-10 rounded-lg border border-border-soft bg-surface text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary tabular-nums"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-secondary">
          {mode === "grams" ? "g" : "%"}
        </span>
      </div>
    </label>
  );
}
