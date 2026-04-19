"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

export interface CustomFood {
  id?: string;
  name: string;
  servingSize: number;
  servingUnit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
}

const SERVING_UNITS = [
  { value: "g", label: "grams" },
  { value: "ml", label: "milliliters" },
  { value: "oz", label: "ounces" },
  { value: "cup", label: "cups" },
  { value: "piece", label: "pieces" },
];

interface CustomFoodFormProps {
  initial?: CustomFood;
  onSaved?: (food: CustomFood) => void;
  returnTo?: string;
}

// Thin save wrapper — the platform's FoodsController doesn't accept POST today.
// Structured as a mutation so swapping in the real endpoint is a one-line change.
async function saveCustomFood(food: CustomFood): Promise<CustomFood> {
  // TODO: replace with `foods.createFood(food)` once the controller supports it.
  await new Promise((resolve) => setTimeout(resolve, 300));
  return { ...food, id: food.id ?? `local_${crypto.randomUUID()}` };
}

export function CustomFoodForm({ initial, onSaved, returnTo }: CustomFoodFormProps) {
  const router = useRouter();
  const [food, setFood] = useState<CustomFood>(
    initial ?? {
      name: "",
      servingSize: 100,
      servingUnit: "g",
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
    }
  );
  const [showMicros, setShowMicros] = useState(
    initial?.fiber != null || initial?.sugar != null || initial?.sodium != null
  );
  const [error, setError] = useState<string | null>(null);

  const save = useMutation({
    mutationFn: saveCustomFood,
    onSuccess: (saved) => {
      onSaved?.(saved);
      if (returnTo) router.push(returnTo);
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : "Save failed");
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!food.name.trim()) {
      setError("Name is required");
      return;
    }
    save.mutate(food);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Card>
        <CardHeader
          title={initial ? "Edit food" : "New custom food"}
          subtitle="Create a food to log in the nutrition tab."
          action={
            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                fullWidth={false}
                className="!h-10 px-4 text-sm"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                fullWidth={false}
                className="!h-10 px-5 text-sm"
                isLoading={save.isPending}
              >
                Save
              </Button>
            </div>
          }
        />
        <CardContent>
          <div className="space-y-3">
            <Input
              placeholder="Name (e.g. Greek yogurt)"
              value={food.name}
              onChange={(e) => setFood({ ...food, name: e.target.value })}
              required
            />
            <div className="grid grid-cols-2 gap-3">
              <LabeledNumber
                label="Serving size"
                value={food.servingSize}
                onChange={(v) => setFood({ ...food, servingSize: v })}
                min={0}
                step={1}
              />
              <LabeledField label="Unit">
                <Select
                  options={SERVING_UNITS}
                  value={food.servingUnit}
                  onChange={(e) => setFood({ ...food, servingUnit: e.target.value })}
                  className="w-full"
                />
              </LabeledField>
            </div>
            {error && (
              <p className="text-sm text-danger bg-danger/10 rounded-lg px-3 py-2">{error}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Macros" subtitle={`per ${food.servingSize} ${food.servingUnit}`} />
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <LabeledNumber
              label="Calories"
              value={food.calories}
              onChange={(v) => setFood({ ...food, calories: v })}
              min={0}
              suffix="kcal"
            />
            <LabeledNumber
              label="Protein"
              value={food.protein}
              onChange={(v) => setFood({ ...food, protein: v })}
              min={0}
              suffix="g"
              accent="orange"
            />
            <LabeledNumber
              label="Carbs"
              value={food.carbs}
              onChange={(v) => setFood({ ...food, carbs: v })}
              min={0}
              suffix="g"
              accent="blue"
            />
            <LabeledNumber
              label="Fat"
              value={food.fat}
              onChange={(v) => setFood({ ...food, fat: v })}
              min={0}
              suffix="g"
              accent="purple"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader
          title="Micronutrients"
          subtitle="Optional"
          action={
            <button
              type="button"
              onClick={() => setShowMicros((v) => !v)}
              className="text-sm text-primary hover:underline"
            >
              {showMicros ? "Hide" : "Show"}
            </button>
          }
        />
        {showMicros && (
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <LabeledNumber
                label="Fiber"
                value={food.fiber ?? 0}
                onChange={(v) => setFood({ ...food, fiber: v })}
                min={0}
                suffix="g"
              />
              <LabeledNumber
                label="Sugar"
                value={food.sugar ?? 0}
                onChange={(v) => setFood({ ...food, sugar: v })}
                min={0}
                suffix="g"
              />
              <LabeledNumber
                label="Sodium"
                value={food.sodium ?? 0}
                onChange={(v) => setFood({ ...food, sodium: v })}
                min={0}
                suffix="mg"
              />
            </div>
          </CardContent>
        )}
      </Card>
    </form>
  );
}

function LabeledField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[10px] font-semibold uppercase tracking-wide text-text-secondary mb-1">
        {label}
      </span>
      {children}
    </label>
  );
}

const accentText: Record<string, string> = {
  orange: "text-accent-orange",
  blue: "text-accent-blue",
  purple: "text-accent-purple",
};

function LabeledNumber({
  label,
  value,
  onChange,
  min,
  max,
  step = 0.1,
  suffix,
  accent,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  accent?: "orange" | "blue" | "purple";
}) {
  return (
    <LabeledField label={label}>
      <div className="relative">
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(e) => {
            const v = Number(e.target.value);
            if (Number.isNaN(v)) return;
            onChange(v);
          }}
          className={`h-11 w-full px-3 pr-12 rounded-lg border border-border-soft bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary tabular-nums ${
            accent ? accentText[accent] : "text-text-primary"
          }`}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-secondary">
            {suffix}
          </span>
        )}
      </div>
    </LabeledField>
  );
}
