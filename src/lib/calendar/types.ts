export interface ScheduledWorkout {
  id: string;
  workoutId: string;
  workoutName: string;
  fromTime: string; // ISO
  toTime?: string | null;
  estimatedMinutes?: number;
  notes?: string;
}
