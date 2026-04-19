"use client";

import { useState } from "react";
import { Sheet } from "@/components/ui/Sheet";
import { Button } from "@/components/ui/Button";
import { QuickAddFoodSheet } from "./QuickAddFoodSheet";
import { MEAL_LABELS, type MealSlot } from "@/lib/nutrition/types";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface MealSlotSheetProps {
  slot: MealSlot | null;
  onClose: () => void;
  onItemsChange?: (next: MealSlot) => void;
}

export function MealSlotSheet({ slot, onClose, onItemsChange }: MealSlotSheetProps) {
  const [quickAdd, setQuickAdd] = useState(false);

  if (!slot) {
    return <Sheet open={false} onClose={onClose} children={null} variant="side" />;
  }

  const totalKcal = slot.items.reduce((s, i) => s + i.calories, 0);

  return (
    <>
      <Sheet
        open={!!slot}
        onClose={onClose}
        title={`${DAY_NAMES[slot.day]} · ${MEAL_LABELS[slot.mealType]}`}
        variant="side"
        width={420}
      >
        <div className="space-y-4">
          <div className="rounded-xl border border-border-soft p-3 flex items-center justify-between">
            <p className="text-sm text-text-secondary">Total for this meal</p>
            <p className="text-lg font-bold text-primary tabular-nums">
              {Math.round(totalKcal)} kcal
            </p>
          </div>

          {slot.items.length === 0 ? (
            <p className="text-sm text-text-secondary text-center py-6">
              No items yet. Tap + to plan this meal.
            </p>
          ) : (
            <ul className="space-y-2">
              {slot.items.map((item) => (
                <li
                  key={item.foodId}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg border border-border-soft"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-text-primary truncate">{item.name}</p>
                    <p className="text-xs text-text-secondary">
                      {item.servings} serving{item.servings === 1 ? "" : "s"}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-text-primary tabular-nums">
                    {Math.round(item.calories)}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      onItemsChange?.({
                        ...slot,
                        items: slot.items.filter((i) => i.foodId !== item.foodId),
                      });
                    }}
                    aria-label="Remove item"
                    className="w-8 h-8 rounded-md text-text-secondary hover:bg-danger/10 hover:text-danger flex items-center justify-center"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          )}

          <Button
            type="button"
            variant="primary"
            className="!h-11 text-sm"
            onClick={() => setQuickAdd(true)}
          >
            + Add item
          </Button>
        </div>
      </Sheet>

      <QuickAddFoodSheet
        open={quickAdd}
        defaultMealType={slot.mealType}
        onClose={() => setQuickAdd(false)}
      />
    </>
  );
}
