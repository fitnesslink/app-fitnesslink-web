import type {
  MovementDetail,
  MovementSummary,
  ProgramDetail,
  ProgramSummary,
  WorkoutDetail,
  WorkoutSummary,
} from "./types";

export const PLACEHOLDER_WORKOUTS: WorkoutSummary[] = [
  { id: "w1", name: "Full-body strength", description: "Classic push/pull/legs", estimatedMinutes: 45, exerciseCount: 8, trainingLevel: "intermediate", contributor: "FitnessLink" },
  { id: "w2", name: "Upper-body push", description: "Chest, shoulders, triceps", estimatedMinutes: 40, exerciseCount: 7, trainingLevel: "intermediate", contributor: "FitnessLink" },
  { id: "w3", name: "HIIT 20", description: "Quick conditioning", estimatedMinutes: 20, exerciseCount: 6, trainingLevel: "beginner" },
  { id: "w4", name: "Mobility + Core", description: "Active recovery", estimatedMinutes: 30, exerciseCount: 10, trainingLevel: "beginner" },
  { id: "w5", name: "Heavy lower", description: "Squat + deadlift focus", estimatedMinutes: 60, exerciseCount: 5, trainingLevel: "advanced", contributor: "FitnessLink" },
  { id: "w6", name: "Pull day", description: "Back + biceps", estimatedMinutes: 50, exerciseCount: 8, trainingLevel: "intermediate" },
];

export function placeholderWorkoutDetail(id: string): WorkoutDetail {
  const base = PLACEHOLDER_WORKOUTS.find((w) => w.id === id) ?? PLACEHOLDER_WORKOUTS[0];
  return {
    ...base,
    phases: [
      {
        id: "p1",
        name: "Warm-up",
        exercises: [
          { id: "e1", movementId: "m1", name: "Air squat", sets: 2, reps: 12, restSeconds: 30 },
          { id: "e2", movementId: "m2", name: "Push-up", sets: 2, reps: 10, restSeconds: 30 },
        ],
      },
      {
        id: "p2",
        name: "Main set",
        exercises: [
          { id: "e3", movementId: "m3", name: "Barbell squat", sets: 4, reps: 8, restSeconds: 90 },
          { id: "e4", movementId: "m4", name: "Bench press", sets: 4, reps: 8, restSeconds: 90 },
          { id: "e5", movementId: "m5", name: "Barbell row", sets: 4, reps: 10, restSeconds: 75 },
        ],
      },
      {
        id: "p3",
        name: "Finisher",
        exercises: [
          { id: "e6", movementId: "m6", name: "Plank", sets: 3, durationSeconds: 45, restSeconds: 30 },
        ],
      },
    ],
  };
}

export const PLACEHOLDER_PROGRAMS: ProgramSummary[] = [
  { id: "pr1", name: "Beginner's 4-week", description: "Foundation strength", weeks: 4, trainingLevel: "beginner" },
  { id: "pr2", name: "Hypertrophy 8-week", description: "Bodybuilding split", weeks: 8, trainingLevel: "intermediate" },
  { id: "pr3", name: "Push/Pull/Legs", description: "6-day advanced split", weeks: 6, trainingLevel: "advanced" },
];

export function placeholderProgramDetail(id: string): ProgramDetail {
  const base = PLACEHOLDER_PROGRAMS.find((p) => p.id === id) ?? PLACEHOLDER_PROGRAMS[0];
  const workouts = PLACEHOLDER_WORKOUTS.slice(0, 5);
  const schedule = Array.from({ length: base.weeks }, (_, wk) => ({
    weekNumber: wk + 1,
    days: Array.from({ length: 7 }, (_, di) => {
      // Rest days on 0 and 4 for flavor
      if (di === 0 || di === 4) return { dayNumber: di + 1, workout: null };
      const w = workouts[(wk + di) % workouts.length];
      return {
        dayNumber: di + 1,
        workout: { id: w.id, name: w.name, estimatedMinutes: w.estimatedMinutes },
      };
    }),
  }));
  return { ...base, schedule };
}

export const PLACEHOLDER_MOVEMENTS: MovementSummary[] = [
  { id: "m1", name: "Air squat", category: "Lower body", muscleGroup: "Quads", equipment: "Bodyweight" },
  { id: "m2", name: "Push-up", category: "Upper body", muscleGroup: "Chest", equipment: "Bodyweight" },
  { id: "m3", name: "Barbell squat", category: "Lower body", muscleGroup: "Quads", equipment: "Barbell" },
  { id: "m4", name: "Bench press", category: "Upper body", muscleGroup: "Chest", equipment: "Barbell" },
  { id: "m5", name: "Barbell row", category: "Upper body", muscleGroup: "Back", equipment: "Barbell" },
  { id: "m6", name: "Plank", category: "Core", muscleGroup: "Abs", equipment: "Bodyweight" },
  { id: "m7", name: "Overhead press", category: "Upper body", muscleGroup: "Shoulders", equipment: "Barbell" },
  { id: "m8", name: "Deadlift", category: "Lower body", muscleGroup: "Hamstrings", equipment: "Barbell" },
  { id: "m9", name: "Pull-up", category: "Upper body", muscleGroup: "Back", equipment: "Pull-up bar" },
  { id: "m10", name: "Dumbbell lunge", category: "Lower body", muscleGroup: "Quads", equipment: "Dumbbell" },
  { id: "m11", name: "Russian twist", category: "Core", muscleGroup: "Obliques", equipment: "Bodyweight" },
  { id: "m12", name: "Kettlebell swing", category: "Full body", muscleGroup: "Posterior chain", equipment: "Kettlebell" },
];

export function placeholderMovementDetail(id: string): MovementDetail {
  const base = PLACEHOLDER_MOVEMENTS.find((m) => m.id === id) ?? PLACEHOLDER_MOVEMENTS[0];
  return {
    ...base,
    description:
      "A foundational movement. Keep the core braced, drive through the heels, and control the eccentric.",
    anatomyTags: [base.muscleGroup ?? "Full body", "Hip hinge", "Compound"],
    equipmentTags: [base.equipment ?? "Bodyweight"],
  };
}
