"use client";

import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { foodEntries } from "@/lib/api/nutrition";
import { Sheet } from "@/components/ui/Sheet";
import { Button } from "@/components/ui/Button";
import { Stepper } from "@/components/ui/Stepper";
import {
  MEAL_LABELS,
  MEAL_TYPES,
  type FoodEntry,
  type MealType,
} from "@/lib/nutrition/types";

interface FoodEntryDetailSheetProps {
  entry: FoodEntry | null;
  onClose: () => void;
}

export function FoodEntryDetailSheet({ entry, onClose }: FoodEntryDetailSheetProps) {
  const qc = useQueryClient();
  const [servings, setServings] = useState(entry?.servings ?? 1);
  const [mealType, setMealType] = useState<MealType>(entry?.mealType ?? "snack");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (entry) {
      setServings(entry.servings);
      setMealType(entry.mealType);
      setError(null);
    }
  }, [entry]);

  const save = useMutation({
    mutationFn: async () => {
      if (!entry) return;
      return foodEntries.updateFoodEntry(entry.id, { servings } as never);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: foodEntries.keys.all });
      onClose();
    },
    onError: (err) => setError(err instanceof Error ? err.message : "Save failed"),
  });

  const del = useMutation({
    mutationFn: async () => {
      if (!entry) return;
      return foodEntries.deleteFoodEntry(entry.id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: foodEntries.keys.all });
      onClose();
    },
    onError: (err) => setError(err instanceof Error ? err.message : "Delete failed"),
  });

  const perServing = entry
    ? {
        calories: entry.servings === 0 ? 0 : entry.calories / entry.servings,
        protein: entry.servings === 0 ? 0 : entry.protein / entry.servings,
        carbs: entry.servings === 0 ? 0 : entry.carbs / entry.servings,
        fat: entry.servings === 0 ? 0 : entry.fat / entry.servings,
      }
    : { calories: 0, protein: 0, carbs: 0, fat: 0 };

  return (
    <Sheet
      open={!!entry}
      onClose={onClose}
      title={entry?.foodName ?? "Food entry"}
      variant="side"
      width={420}
    >
      {entry && (
        <div className="space-y-5">
          <div className="grid grid-cols-4 gap-2 text-center rounded-xl border border-border-soft p-3">
            <Stat label="Kcal" value={Math.round(perServing.calories * servings)} />
            <Stat label="P" value={Math.round(perServing.protein * servings)} suffix="g" />
            <Stat label="C" value={Math.round(perServing.carbs * servings)} suffix="g" />
            <Stat label="F" value={Math.round(perServing.fat * servings)} suffix="g" />
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-text-secondary mb-2">
              Servings
            </p>
            <div className="flex items-center gap-4">
              <Stepper value={servings} onChange={setServings} min={0.25} max={20} step={0.25} />
              <span className="text-sm text-text-secondary">
                × {entry.servingSize} {entry.servingUnit}
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
              className="!h-11 text-sm !text-danger"
              isLoading={del.isPending}
              onClick={() => del.mutate()}
            >
              Delete
            </Button>
            <Button
              type="button"
              variant="primary"
              className="!h-11 text-sm"
              isLoading={save.isPending}
              onClick={() => save.mutate()}
            >
              Save
            </Button>
          </div>
        </div>
      )}
    </Sheet>
  );
}

function Stat({ label, value, suffix }: { label: string; value: number; suffix?: string }) {
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
