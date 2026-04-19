export type TrainingLevel = "beginner" | "intermediate" | "advanced";

export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  bio?: string;
  avatarUrl?: string;
  birthDate?: string;
  heightCm?: number;
  baselineWeightKg?: number;
  trainingLevel?: TrainingLevel;
}

export type UnitSystem = "imperial" | "metric";
export type ThemePref = "light" | "dark" | "system";

export interface Preferences {
  unitSystem: UnitSystem;
  weightUnit: "lbs" | "kg";
  lengthUnit: "in" | "cm";
  language: string; // ISO code
  theme: ThemePref;
}

export const DEFAULT_PREFS: Preferences = {
  unitSystem: "imperial",
  weightUnit: "lbs",
  lengthUnit: "in",
  language: "en",
  theme: "system",
};

// Goals ───────────────────────────────────────────────────────────────────

export type GoalDirection = "increase" | "decrease";

export interface Milestone {
  id: string;
  title: string;
  targetValue: number;
  achievedDate?: string;
}

export interface Goal {
  id: string;
  title: string;
  identityStatement?: string;
  targetValue: number;
  currentValue: number;
  targetUnit: string;
  direction: GoalDirection;
  targetDate?: string;
  linkedHabitIds: string[];
  milestones: Milestone[];
}

export interface HabitDetail {
  id: string;
  title: string;
  goalId?: string;
  streakDays: number;
  /** ISO date → 0 or 1 (completion); used by 365-day heatmap */
  completionByDate: Record<string, number>;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  unlockedAt?: string;
  tone: "primary" | "orange" | "purple" | "blue";
}

export type NotificationCategory = "system" | "workout" | "nutrition" | "goals";

export interface AppNotification {
  id: string;
  category: NotificationCategory;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  deepLink?: string;
}

export interface NotificationPrefs {
  workoutReminders: boolean;
  goalMilestones: boolean;
  nutritionReminders: boolean;
  achievementUnlocks: boolean;
  weeklyDigest: boolean;
}

export const DEFAULT_NOTIF_PREFS: NotificationPrefs = {
  workoutReminders: true,
  goalMilestones: true,
  nutritionReminders: false,
  achievementUnlocks: true,
  weeklyDigest: true,
};

// Billing ─────────────────────────────────────────────────────────────────

export interface Subscription {
  planId: string;
  planName: string;
  status: "active" | "canceled" | "past_due" | "trialing";
  renewsAt?: string;
  priceCents: number;
  interval: "month" | "year";
  paymentMethodLast4?: string;
  paymentMethodBrand?: string;
}

// Reports ─────────────────────────────────────────────────────────────────

export type ReportRange = "7d" | "30d" | "3m" | "all";

export interface SessionSummary {
  id: string;
  workoutId: string;
  workoutName: string;
  completedAt: string;
  durationMinutes: number;
  totalVolumeKg: number;
  rpe?: number;
}

export interface SessionDetail extends SessionSummary {
  exercises: Array<{
    id: string;
    name: string;
    sets: Array<{ setNumber: number; reps: number; weightKg: number }>;
  }>;
}

// ─── Placeholders ─────────────────────────────────────────────────────────

export function placeholderGoals(): Goal[] {
  return [
    {
      id: "g1",
      title: "Bench press 225 lbs",
      identityStatement: "I am the kind of person who trains consistently.",
      targetValue: 102,
      currentValue: 82,
      targetUnit: "kg",
      direction: "increase",
      targetDate: addMonthsIso(3),
      linkedHabitIds: ["h1", "h3"],
      milestones: [
        { id: "ms1", title: "Hit 180 lbs", targetValue: 82, achievedDate: addDaysIso(-40) },
        { id: "ms2", title: "Hit 200 lbs", targetValue: 91 },
        { id: "ms3", title: "Hit 225 lbs", targetValue: 102 },
      ],
    },
    {
      id: "g2",
      title: "Drop to 80 kg",
      identityStatement: "I make decisions that compound over time.",
      targetValue: 80,
      currentValue: 88,
      targetUnit: "kg",
      direction: "decrease",
      targetDate: addMonthsIso(6),
      linkedHabitIds: ["h2"],
      milestones: [
        { id: "ms4", title: "Reach 85 kg", targetValue: 85 },
        { id: "ms5", title: "Reach 80 kg", targetValue: 80 },
      ],
    },
    {
      id: "g3",
      title: "Run 5k under 25:00",
      targetValue: 25,
      currentValue: 28,
      targetUnit: "min",
      direction: "decrease",
      targetDate: addMonthsIso(4),
      linkedHabitIds: ["h4"],
      milestones: [],
    },
  ];
}

export function placeholderHabit(id: string): HabitDetail {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const map: Record<string, number> = {};
  // Fill the last 365 days with ~70% completion probability, clustering hits so
  // the heatmap shows streaks visually.
  let momentum = 0.7;
  for (let i = 365; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const hit = Math.random() < momentum ? 1 : 0;
    momentum = hit ? Math.min(0.92, momentum + 0.04) : Math.max(0.35, momentum - 0.1);
    map[key] = hit;
  }
  let streak = 0;
  for (let i = 0; i >= -365; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    if (map[key]) streak++;
    else break;
  }
  return {
    id,
    title: titleForHabit(id),
    goalId: "g1",
    streakDays: streak,
    completionByDate: map,
  };
}

function titleForHabit(id: string): string {
  switch (id) {
    case "h1":
      return "Morning stretch";
    case "h2":
      return "Drink 3L water";
    case "h3":
      return "Strength session";
    case "h4":
      return "Easy run";
    default:
      return "Habit";
  }
}

export function placeholderAchievements(): Achievement[] {
  return [
    { id: "a1", title: "First workout", description: "Complete your first session", unlocked: true, unlockedAt: addDaysIso(-85), tone: "primary" },
    { id: "a2", title: "7-day streak", description: "Log something 7 days in a row", unlocked: true, unlockedAt: addDaysIso(-60), tone: "orange" },
    { id: "a3", title: "30-day streak", description: "Log something 30 days in a row", unlocked: false, tone: "orange" },
    { id: "a4", title: "First PR", description: "Set a personal record on any lift", unlocked: true, unlockedAt: addDaysIso(-22), tone: "purple" },
    { id: "a5", title: "10 workouts", description: "Complete 10 sessions", unlocked: true, unlockedAt: addDaysIso(-18), tone: "primary" },
    { id: "a6", title: "50 workouts", description: "Complete 50 sessions", unlocked: false, tone: "primary" },
    { id: "a7", title: "Nutrition logger", description: "Log food 14 days in a row", unlocked: false, tone: "blue" },
    { id: "a8", title: "Goal crushed", description: "Achieve a goal", unlocked: false, tone: "purple" },
  ];
}

export function placeholderNotifications(): AppNotification[] {
  return [
    { id: "n1", category: "workout", title: "Workout scheduled", body: "Full-body strength at 7:30 tomorrow.", createdAt: hoursAgoIso(2), read: false, deepLink: "/calendar" },
    { id: "n2", category: "goals", title: "Milestone hit!", body: "You hit 180 lb bench press.", createdAt: hoursAgoIso(26), read: false, deepLink: "/profile/goals/g1" },
    { id: "n3", category: "nutrition", title: "Log your dinner", body: "You haven't logged since 2 pm.", createdAt: hoursAgoIso(29), read: true, deepLink: "/nutrition/tracking" },
    { id: "n4", category: "system", title: "New feature", body: "Program editor just shipped.", createdAt: hoursAgoIso(72), read: true, deepLink: "/catalog/programs/new" },
    { id: "n5", category: "goals", title: "Weekly check-in", body: "You're 18% toward 225 lb bench.", createdAt: hoursAgoIso(96), read: true, deepLink: "/profile/goals" },
  ];
}

export function placeholderSubscription(): Subscription {
  return {
    planId: "annual",
    planName: "Annual",
    status: "active",
    renewsAt: addDaysIso(180),
    priceCents: 11988,
    interval: "year",
    paymentMethodBrand: "Visa",
    paymentMethodLast4: "4242",
  };
}

export function placeholderProfile(): UserProfile {
  return {
    firstName: "Quincy",
    lastName: "Williams",
    email: "quincy@example.com",
    bio: "Lifter, runner, habit nerd.",
    trainingLevel: "intermediate",
    heightCm: 180,
    baselineWeightKg: 90,
  };
}

export function placeholderSessions(): SessionSummary[] {
  const out: SessionSummary[] = [];
  const names = ["Full-body strength", "Upper-body push", "Pull day", "HIIT 20", "Heavy lower"];
  for (let i = 0; i < 28; i++) {
    const day = new Date();
    day.setHours(18, 0, 0, 0);
    day.setDate(day.getDate() - i * 1.3);
    const name = names[i % names.length];
    out.push({
      id: `s${i}`,
      workoutId: `w${(i % 5) + 1}`,
      workoutName: name,
      completedAt: day.toISOString(),
      durationMinutes: 30 + Math.round(Math.random() * 45),
      totalVolumeKg: Math.round(800 + Math.random() * 4000),
      rpe: 5 + Math.round(Math.random() * 4),
    });
  }
  return out;
}

export function placeholderSessionDetail(id: string): SessionDetail {
  const summary = placeholderSessions().find((s) => s.id === id) ?? placeholderSessions()[0];
  return {
    ...summary,
    exercises: [
      {
        id: "e1",
        name: "Back squat",
        sets: [
          { setNumber: 1, reps: 8, weightKg: 80 },
          { setNumber: 2, reps: 8, weightKg: 85 },
          { setNumber: 3, reps: 8, weightKg: 85 },
          { setNumber: 4, reps: 6, weightKg: 90 },
        ],
      },
      {
        id: "e2",
        name: "Bench press",
        sets: [
          { setNumber: 1, reps: 8, weightKg: 70 },
          { setNumber: 2, reps: 8, weightKg: 75 },
          { setNumber: 3, reps: 6, weightKg: 80 },
        ],
      },
      {
        id: "e3",
        name: "Barbell row",
        sets: [
          { setNumber: 1, reps: 10, weightKg: 60 },
          { setNumber: 2, reps: 10, weightKg: 65 },
          { setNumber: 3, reps: 10, weightKg: 65 },
        ],
      },
    ],
  };
}

function addDaysIso(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}
function addMonthsIso(months: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() + months);
  return d.toISOString();
}
function hoursAgoIso(hours: number): string {
  const d = new Date();
  d.setHours(d.getHours() - hours);
  return d.toISOString();
}
