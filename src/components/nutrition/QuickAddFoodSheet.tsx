"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { foods, foodEntries } from "@/lib/api/nutrition";
import { Sheet } from "@/components/ui/Sheet";
import { Button } from "@/components/ui/Button";
import { Stepper } from "@/components/ui/Stepper";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  MEAL_LABELS,
  MEAL_TYPES,
  PLACEHOLDER_FOODS,
  type FoodSummary,
  type MealType,
} from "@/lib/nutrition/types";

interface QuickAddFoodSheetProps {
  open: boolean;
  onClose: () => void;
  defaultMealType?: MealType;
}

async function searchFoods(query: string): Promise<FoodSummary[]> {
  try {
    const res = (await foods.listFoodsSearch({ query })) as
      | { items?: FoodSummary[] }
      | FoodSummary[];
    const items = Array.isArray(res) ? res : res.items ?? [];
    if (items.length === 0) return filterPlaceholders(query);
    return items;
  } catch {
    return filterPlaceholders(query);
  }
}

function filterPlaceholders(query: string): FoodSummary[] {
  if (!query) return PLACEHOLDER_FOODS;
  const q = query.toLowerCase();
  return PLACEHOLDER_FOODS.filter((f) => f.name.toLowerCase().includes(q));
}

export function QuickAddFoodSheet({
  open,
  onClose,
  defaultMealType = "snack",
}: QuickAddFoodSheetProps) {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<FoodSummary | null>(null);
  const [servings, setServings] = useState(1);
  const [mealType, setMealType] = useState<MealType>(defaultMealType);
  const [error, setError] = useState<string | null>(null);

  const { data = [], isLoading } = useQuery({
    queryKey: ["nutrition", "foods", "search", search],
    queryFn: () => searchFoods(search),
    enabled: open,
  });

  const recents = useMemo(() => PLACEHOLDER_FOODS.slice(0, 5), []);

  const log = useMutation({
    mutationFn: async () => {
      if (!selected) throw new Error("Pick a food first");
      return foodEntries.createFoodEntry({
        foodId: selected.id,
        servings,
      } as never);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: foodEntries.keys.all });
      setSelected(null);
      setSearch("");
      setServings(1);
      onClose();
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : "Couldn't log");
    },
  });

  function reset() {
    setSelected(null);
    setSearch("");
    setServings(1);
    setError(null);
  }

  return (
    <Sheet
      open={open}
      onClose={() => {
        reset();
        onClose();
      }}
      title={selected ? `Log ${selected.name}` : "Add food"}
      variant="side"
      width={420}
    >
      {selected ? (
        <div className="space-y-5">
          <div className="rounded-xl border border-border-soft p-4">
            <p className="text-sm font-semibold text-text-primary">{selected.name}</p>
            {selected.brand && <p className="text-xs text-text-secondary">{selected.brand}</p>}
            <div className="mt-3 grid grid-cols-4 gap-2 text-center">
              <Macro label="Kcal" value={Math.round(selected.calories * servings)} />
              <Macro label="P" value={Math.round(selected.protein * servings)} suffix="g" />
              <Macro label="C" value={Math.round(selected.carbs * servings)} suffix="g" />
              <Macro label="F" value={Math.round(selected.fat * servings)} suffix="g" />
            </div>
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-text-secondary mb-2">
              Servings
            </p>
            <div className="flex items-center gap-4">
              <Stepper value={servings} onChange={setServings} min={0.25} max={20} step={0.25} />
              <span className="text-sm text-text-secondary">
                × {selected.servingSize} {selected.servingUnit}
              </span>
            </div>
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-text-secondary mb-2">
              Meal
            </p>
            <div className="grid grid-cols-4 gap-2">
              {MEAL_TYPES.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMealType(m)}
                  className={`px-2 py-2 rounded-lg text-xs font-medium transition-colors ${
                    m === mealType
                      ? "bg-primary text-white"
                      : "bg-primary-soft text-primary hover:bg-primary-soft/70"
                  }`}
                >
                  {MEAL_LABELS[m]}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-sm text-danger bg-danger/10 rounded-lg px-3 py-2">{error}</p>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              className="!h-11 text-sm"
              onClick={reset}
            >
              Back
            </Button>
            <Button
              type="button"
              variant="primary"
              className="!h-11 text-sm"
              isLoading={log.isPending}
              onClick={() => log.mutate()}
            >
              Log
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <circle cx="11" cy="11" r="7" />
              <line x1="16.65" y1="16.65" x2="21" y2="21" />
            </svg>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search foods"
              autoFocus
              className="h-11 w-full pl-10 pr-3 rounded-lg border border-border-soft bg-surface text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {!search && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-text-secondary mb-2">
                Recents
              </p>
              <FoodList foods={recents} onPick={setSelected} />
            </div>
          )}

          {search && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-text-secondary mb-2">
                Results
              </p>
              {isLoading ? (
                <div className="space-y-2">
                  {[0, 1, 2].map((i) => (
                    <Skeleton key={i} className="h-14" />
                  ))}
                </div>
              ) : data.length === 0 ? (
                <EmptyState title="No matches" />
              ) : (
                <FoodList foods={data} onPick={setSelected} />
              )}
            </div>
          )}

          <div className="pt-2 border-t border-border-soft">
            <Link
              href="/nutrition/foods/new"
              className="text-sm text-primary font-medium hover:underline"
              onClick={onClose}
            >
              + Add a custom food
            </Link>
          </div>
        </div>
      )}
    </Sheet>
  );
}

function FoodList({ foods: list, onPick }: { foods: FoodSummary[]; onPick: (f: FoodSummary) => void }) {
  return (
    <ul className="space-y-1 -mx-2">
      {list.map((food) => (
        <li key={food.id}>
          <button
            type="button"
            onClick={() => onPick(food)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-primary-soft/60 text-left"
          >
            <div className="w-10 h-10 rounded-lg bg-primary-soft text-primary flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v20M2 12h20" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-text-primary truncate">{food.name}</p>
              <p className="text-xs text-text-secondary truncate">
                {Math.round(food.calories)} kcal · P{food.protein} C{food.carbs} F{food.fat}
              </p>
            </div>
          </button>
        </li>
      ))}
    </ul>
  );
}

function Macro({ label, value, suffix }: { label: string; value: number; suffix?: string }) {
  return (
    <div>
      <p className="text-lg font-bold text-text-primary tabular-nums">
        {value}
        {suffix && <span className="text-xs text-text-secondary ml-0.5">{suffix}</span>}
      </p>
      <p className="text-[10px] text-text-secondary uppercase tracking-wide">{label}</p>
    </div>
  );
}
