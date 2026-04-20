"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/state/auth";
import { foodEntries, nutritionGoals } from "@/lib/api/nutrition";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CalorieRing } from "@/components/nutrition/CalorieRing";
import { MacroBars } from "@/components/nutrition/MacroBars";
import { QuickAddFoodSheet } from "@/components/nutrition/QuickAddFoodSheet";
import { BarcodeScanner } from "@/components/nutrition/BarcodeScanner";
import { FoodEntryDetailSheet } from "@/components/nutrition/FoodEntryDetailSheet";
import {
  DEFAULT_GOAL,
  MEAL_LABELS,
  MEAL_TYPES,
  sumMacros,
  type FoodEntry,
  type MealType,
  type NutritionGoal,
} from "@/lib/nutrition/types";

interface RawFoodEntry {
  id?: string;
  name?: string | null;
  mealType?: string | null;
  servingSize?: number | null;
  servingUnit?: string | null;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  loggedAt?: string;
}

async function fetchEntries(): Promise<FoodEntry[]> {
  try {
    const res = (await foodEntries.getMyFoodEntry()) as
      | { data?: RawFoodEntry[]; items?: RawFoodEntry[] }
      | RawFoodEntry[];
    const raw = Array.isArray(res) ? res : res.data ?? res.items ?? [];
    return raw.map((r) => ({
      id: r.id ?? "",
      foodId: r.id ?? "",
      foodName: r.name ?? "",
      mealType: (["breakfast", "lunch", "dinner", "snack"].includes(r.mealType ?? "")
        ? r.mealType
        : "snack") as MealType,
      servings: 1,
      servingSize: r.servingSize ?? 0,
      servingUnit: r.servingUnit ?? "",
      calories: r.calories ?? 0,
      protein: r.protein ?? 0,
      carbs: r.carbs ?? 0,
      fat: r.fat ?? 0,
      loggedAt: r.loggedAt ?? new Date().toISOString(),
    }));
  } catch {
    return [];
  }
}

async function fetchGoal(): Promise<NutritionGoal> {
  try {
    const res = (await nutritionGoals.getMyNutritionGoal()) as NutritionGoal | null;
    if (!res) return DEFAULT_GOAL;
    return { ...DEFAULT_GOAL, ...res };
  } catch {
    return DEFAULT_GOAL;
  }
}

export default function NutritionTrackingPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [quickAdd, setQuickAdd] = useState<{ meal: MealType } | null>(null);
  const [scanner, setScanner] = useState(false);
  const [detailEntry, setDetailEntry] = useState<FoodEntry | null>(null);

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [authLoading, user, router]);

  const { data: entries = [] } = useQuery({
    queryKey: foodEntries.keys.list(),
    queryFn: fetchEntries,
  });
  const { data: goal = DEFAULT_GOAL } = useQuery({
    queryKey: nutritionGoals.keys.all,
    queryFn: fetchGoal,
  });

  const totals = useMemo(() => sumMacros(entries), [entries]);
  const byMeal = useMemo(() => {
    const map = new Map<MealType, FoodEntry[]>();
    for (const m of MEAL_TYPES) map.set(m, []);
    for (const e of entries) map.get(e.mealType)?.push(e);
    return map;
  }, [entries]);

  if (authLoading || !user) return null;

  return (
    <AppShell subtitle="Today's log">
      <div className="max-w-4xl mx-auto px-4 lg:px-0 py-6 space-y-6">
        <Card>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-6 items-center">
              <div className="flex justify-center">
                <CalorieRing consumed={totals.calories} goal={goal.calorieGoal} />
              </div>
              <div className="space-y-4">
                <MacroBars
                  protein={{ current: totals.protein, target: goal.proteinTarget }}
                  carbs={{ current: totals.carbs, target: goal.carbsTarget }}
                  fat={{ current: totals.fat, target: goal.fatTarget }}
                />
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="primary"
                    fullWidth={false}
                    className="!h-10 px-4 text-sm"
                    onClick={() => setQuickAdd({ meal: "snack" })}
                  >
                    + Log food
                  </Button>
                  <Button
                    variant="secondary"
                    fullWidth={false}
                    className="!h-10 px-4 text-sm"
                    onClick={() => setScanner(true)}
                  >
                    Scan barcode
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {MEAL_TYPES.map((meal) => {
          const mealEntries = byMeal.get(meal) ?? [];
          const mealKcal = mealEntries.reduce((s, e) => s + e.calories, 0);
          return (
            <Card key={meal}>
              <CardHeader
                title={MEAL_LABELS[meal]}
                subtitle={mealEntries.length === 0 ? "Nothing yet" : `${Math.round(mealKcal)} kcal`}
                action={
                  <Button
                    variant="secondary"
                    fullWidth={false}
                    className="!h-9 px-3 text-xs"
                    onClick={() => setQuickAdd({ meal })}
                  >
                    + Add
                  </Button>
                }
              />
              <CardContent>
                {mealEntries.length === 0 ? (
                  <p className="text-sm text-text-secondary">
                    Tap + Add to log your {MEAL_LABELS[meal].toLowerCase()}.
                  </p>
                ) : (
                  <ul className="divide-y divide-border-soft">
                    {mealEntries.map((entry) => (
                      <li key={entry.id}>
                        <button
                          type="button"
                          onClick={() => setDetailEntry(entry)}
                          className="w-full py-3 -mx-3 px-3 rounded-lg hover:bg-primary-soft/40 flex items-center gap-3 text-left"
                        >
                          <div className="w-10 h-10 rounded-lg bg-primary-soft text-primary flex items-center justify-center shrink-0">
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M12 2v20M2 12h20" />
                            </svg>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-text-primary truncate">
                              {entry.foodName}
                            </p>
                            <p className="text-xs text-text-secondary">
                              {entry.servings} × {entry.servingSize}
                              {entry.servingUnit} · P{Math.round(entry.protein)} C
                              {Math.round(entry.carbs)} F{Math.round(entry.fat)}
                            </p>
                          </div>
                          <span className="text-sm font-semibold text-text-primary tabular-nums">
                            {Math.round(entry.calories)}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <QuickAddFoodSheet
        open={!!quickAdd}
        defaultMealType={quickAdd?.meal}
        onClose={() => setQuickAdd(null)}
      />
      <BarcodeScanner open={scanner} onClose={() => setScanner(false)} />
      <FoodEntryDetailSheet entry={detailEntry} onClose={() => setDetailEntry(null)} />
    </AppShell>
  );
}
