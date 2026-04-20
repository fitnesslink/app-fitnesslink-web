"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/state/auth";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { MealSlotSheet } from "@/components/nutrition/MealSlotSheet";
import {
  MEAL_LABELS,
  MEAL_TYPES,
  type MealSlot,
} from "@/lib/nutrition/types";

const DAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function MealPlanPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [slots, setSlots] = useState<MealSlot[]>([]);
  const [open, setOpen] = useState<MealSlot | null>(null);
  const [weekOffset, setWeekOffset] = useState(0);

  useEffect(() => {
    if (!isLoading && !user) router.replace("/login");
  }, [isLoading, user, router]);

  const key = (day: number, meal: string) => `${day}-${meal}`;
  const byKey = new Map(slots.map((s) => [key(s.day, s.mealType), s]));

  if (isLoading || !user) return null;

  return (
    <AppShell subtitle="Meal plan">
      <div className="max-w-6xl mx-auto px-4 lg:px-0 py-6 space-y-6">
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
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setWeekOffset((w) => w - 1)}
              aria-label="Previous week"
              className="w-9 h-9 rounded-lg border border-border-soft text-text-secondary hover:bg-primary-soft hover:text-primary flex items-center justify-center"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <span className="text-sm font-medium text-text-primary px-3 tabular-nums">
              {weekOffset === 0 ? "This week" : weekOffset === 1 ? "Next week" : weekOffset === -1 ? "Last week" : `Week ${weekOffset >= 0 ? "+" : ""}${weekOffset}`}
            </span>
            <button
              type="button"
              onClick={() => setWeekOffset((w) => w + 1)}
              aria-label="Next week"
              className="w-9 h-9 rounded-lg border border-border-soft text-text-secondary hover:bg-primary-soft hover:text-primary flex items-center justify-center"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </div>

        <Card className="!p-0">
          <div className="overflow-x-auto">
            <div className="grid grid-cols-[80px_repeat(7,minmax(120px,1fr))] text-xs">
              <div className="px-3 py-2 border-b border-border-soft" />
              {DAY_SHORT.map((d) => (
                <div
                  key={d}
                  className="px-3 py-2 border-b border-border-soft font-semibold uppercase tracking-wide text-text-secondary text-center"
                >
                  {d}
                </div>
              ))}
              {MEAL_TYPES.map((meal) => (
                <div key={meal} className="contents">
                  <div className="px-3 py-3 border-b border-border-soft font-semibold text-text-secondary uppercase tracking-wide text-[10px] flex items-center">
                    {MEAL_LABELS[meal]}
                  </div>
                  {DAY_SHORT.map((_, dayIdx) => {
                    const slot = byKey.get(key(dayIdx, meal));
                    const kcal = slot?.items.reduce((s, i) => s + i.calories, 0) ?? 0;
                    return (
                      <button
                        key={dayIdx}
                        type="button"
                        onClick={() =>
                          setOpen(slot ?? { day: dayIdx, mealType: meal, items: [] })
                        }
                        className={`min-h-[72px] border-b border-l border-border-soft px-2 py-2 text-left transition-colors ${
                          slot && slot.items.length > 0
                            ? "bg-primary-soft/60 hover:bg-primary-soft"
                            : "hover:bg-primary-soft/40"
                        }`}
                      >
                        {slot && slot.items.length > 0 ? (
                          <>
                            {slot.items.slice(0, 2).map((item) => (
                              <p
                                key={item.foodId}
                                className="text-xs font-medium text-text-primary truncate"
                              >
                                {item.name}
                              </p>
                            ))}
                            <p className="text-[10px] text-text-secondary mt-1 tabular-nums">
                              {Math.round(kcal)} kcal
                            </p>
                          </>
                        ) : (
                          <span className="text-xs text-text-secondary">+ Add</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <MealSlotSheet
        slot={open}
        onClose={() => setOpen(null)}
        onItemsChange={(next) => {
          setSlots((all) => {
            const idx = all.findIndex(
              (s) => s.day === next.day && s.mealType === next.mealType
            );
            if (idx === -1) return [...all, next];
            const copy = [...all];
            copy[idx] = next;
            return copy;
          });
          setOpen(next);
        }}
      />
    </AppShell>
  );
}
