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

export const PLACEHOLDER_FOODS: FoodSummary[] = [
  { id: "f1", name: "Greek yogurt", brand: "Chobani", servingSize: 170, servingUnit: "g", calories: 100, protein: 17, carbs: 6, fat: 0 },
  { id: "f2", name: "Chicken breast", servingSize: 100, servingUnit: "g", calories: 165, protein: 31, carbs: 0, fat: 3.6 },
  { id: "f3", name: "Brown rice", servingSize: 195, servingUnit: "g", calories: 216, protein: 5, carbs: 45, fat: 1.8 },
  { id: "f4", name: "Banana", servingSize: 118, servingUnit: "g", calories: 105, protein: 1.3, carbs: 27, fat: 0.4 },
  { id: "f5", name: "Almonds", servingSize: 28, servingUnit: "g", calories: 164, protein: 6, carbs: 6, fat: 14 },
  { id: "f6", name: "Oatmeal", servingSize: 40, servingUnit: "g", calories: 150, protein: 5, carbs: 27, fat: 3 },
  { id: "f7", name: "Salmon", servingSize: 100, servingUnit: "g", calories: 208, protein: 20, carbs: 0, fat: 13 },
  { id: "f8", name: "Avocado", servingSize: 100, servingUnit: "g", calories: 160, protein: 2, carbs: 9, fat: 15 },
  { id: "f9", name: "Eggs (large)", servingSize: 50, servingUnit: "g", calories: 72, protein: 6, carbs: 0.4, fat: 5 },
  { id: "f10", name: "Protein shake", brand: "Whey", servingSize: 30, servingUnit: "g", calories: 120, protein: 24, carbs: 3, fat: 1.5 },
];

export function placeholderEntriesForToday(): FoodEntry[] {
  const iso = (hh: number, mm = 0) => {
    const d = new Date();
    d.setHours(hh, mm, 0, 0);
    return d.toISOString();
  };
  return [
    {
      id: "e1", foodId: "f1", foodName: "Greek yogurt", mealType: "breakfast",
      servings: 1, servingSize: 170, servingUnit: "g",
      calories: 100, protein: 17, carbs: 6, fat: 0, loggedAt: iso(8, 15),
    },
    {
      id: "e2", foodId: "f6", foodName: "Oatmeal", mealType: "breakfast",
      servings: 1, servingSize: 40, servingUnit: "g",
      calories: 150, protein: 5, carbs: 27, fat: 3, loggedAt: iso(8, 20),
    },
    {
      id: "e3", foodId: "f2", foodName: "Chicken breast", mealType: "lunch",
      servings: 1.5, servingSize: 100, servingUnit: "g",
      calories: 247, protein: 46, carbs: 0, fat: 5.4, loggedAt: iso(13, 0),
    },
    {
      id: "e4", foodId: "f3", foodName: "Brown rice", mealType: "lunch",
      servings: 1, servingSize: 195, servingUnit: "g",
      calories: 216, protein: 5, carbs: 45, fat: 1.8, loggedAt: iso(13, 0),
    },
    {
      id: "e5", foodId: "f4", foodName: "Banana", mealType: "snack",
      servings: 1, servingSize: 118, servingUnit: "g",
      calories: 105, protein: 1.3, carbs: 27, fat: 0.4, loggedAt: iso(16, 0),
    },
  ];
}

export function placeholderGrocery(): GroceryItem[] {
  return [
    { id: "g1", name: "Chicken breast", category: "Meat", quantity: "1.5 lb", checked: false },
    { id: "g2", name: "Salmon fillet", category: "Meat", quantity: "1 lb", checked: false },
    { id: "g3", name: "Eggs", category: "Dairy", quantity: "1 dozen", checked: true },
    { id: "g4", name: "Greek yogurt", category: "Dairy", quantity: "2 tubs", checked: false },
    { id: "g5", name: "Banana", category: "Produce", quantity: "6", checked: false },
    { id: "g6", name: "Avocado", category: "Produce", quantity: "3", checked: true },
    { id: "g7", name: "Spinach", category: "Produce", quantity: "1 bag", checked: false },
    { id: "g8", name: "Brown rice", category: "Pantry", quantity: "2 lb", checked: false },
    { id: "g9", name: "Olive oil", category: "Pantry", quantity: "1 bottle", checked: true },
    { id: "g10", name: "Almonds", category: "Pantry", quantity: "1 bag", checked: false },
  ];
}

export function placeholderMealSlots(): MealSlot[] {
  const slots: MealSlot[] = [];
  const sampleByMeal: Record<MealType, Array<{ foodId: string; name: string; servings: number; calories: number }>> = {
    breakfast: [{ foodId: "f6", name: "Oatmeal + banana", servings: 1, calories: 255 }],
    lunch: [{ foodId: "f2", name: "Chicken + rice bowl", servings: 1, calories: 460 }],
    dinner: [{ foodId: "f7", name: "Salmon + veggies", servings: 1, calories: 390 }],
    snack: [{ foodId: "f5", name: "Almonds", servings: 1, calories: 164 }],
  };
  for (let day = 0; day < 7; day++) {
    for (const meal of MEAL_TYPES) {
      slots.push({
        day,
        mealType: meal,
        items: Math.random() > 0.25 ? sampleByMeal[meal] : [],
      });
    }
  }
  return slots;
}

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
