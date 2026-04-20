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
