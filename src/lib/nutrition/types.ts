export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export const MEAL_TYPES: MealType[] = ["breakfast", "lunch", "dinner", "snack"];

export const MEAL_LABELS: Record<MealType, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snack: "Snacks",
};

export interface FoodSummary {
  id: string;
  name: string;
  brand?: string;
  servingSize: number;
  servingUnit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface FoodEntry {
  id: string;
  foodId: string;
  foodName: string;
  mealType: MealType;
  servings: number;
  servingSize: number;
  servingUnit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  loggedAt: string; // ISO
}

export interface NutritionGoal {
  calorieGoal: number;
  proteinTarget: number;
  carbsTarget: number;
  fatTarget: number;
}

export interface MealSlot {
  day: number; // 0=Sun..6=Sat, current week
  mealType: MealType;
  items: Array<{ foodId: string; name: string; servings: number; calories: number }>;
}

export interface GroceryItem {
  id: string;
  name: string;
  category: string;
  quantity: string;
  checked: boolean;
}

export const DEFAULT_GOAL: NutritionGoal = {
  calorieGoal: 2200,
  proteinTarget: 160,
  carbsTarget: 250,
  fatTarget: 70,
};

export function sumMacros(entries: FoodEntry[]) {
  return entries.reduce(
    (acc, e) => ({
      calories: acc.calories + e.calories,
      protein: acc.protein + e.protein,
      carbs: acc.carbs + e.carbs,
      fat: acc.fat + e.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
}
