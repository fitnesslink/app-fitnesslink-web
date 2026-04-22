// Local catalog types — the platform's Swagger output doesn't emit response
// schemas yet, so we describe the subset of each DTO we actually read and
// cast the unknown API response. Swap for generated types when the backend
// adds `[ProducesResponseType]` annotations to the relevant controllers.

export type TrainingLevel = "beginner" | "intermediate" | "advanced";

export interface WorkoutSummary {
  id: string;
  name: string;
  description?: string;
  estimatedMinutes: number;
  exerciseCount: number;
  trainingLevel?: TrainingLevel;
  thumbnailUrl?: string;
  imageId?: string;
  contributor?: string;
}

export interface WorkoutDetail extends WorkoutSummary {
  phases: WorkoutPhase[];
}

export interface WorkoutPhase {
  id: string;
  name: string;
  exercises: WorkoutExercise[];
}

export interface WorkoutExercise {
  id: string;
  movementId: string;
  name: string;
  sets: number;
  reps?: number;
  durationSeconds?: number;
  restSeconds?: number;
  thumbnailUrl?: string;
}

export interface ProgramSummary {
  id: string;
  name: string;
  description?: string;
  weeks: number;
  trainingLevel?: TrainingLevel;
  thumbnailUrl?: string;
  imageId?: string;
}

export interface ProgramDetail extends ProgramSummary {
  schedule: ProgramWeek[];
}

export interface ProgramWeek {
  weekNumber: number;
  days: Array<{
    dayNumber: number;
    workout: { id: string; name: string; estimatedMinutes: number } | null;
  }>;
}

export interface MovementSummary {
  id: string;
  name: string;
  category?: string;
  muscleGroup?: string;
  equipment?: string;
  thumbnailUrl?: string;
  imageId?: string;
}

export interface MovementDetail extends MovementSummary {
  description?: string;
  anatomyTags: string[];
  equipmentTags: string[];
  videoMediaId?: string;
}
