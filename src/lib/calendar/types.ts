export interface ScheduledWorkout {
  id: string;
  workoutId: string;
  workoutName: string;
  fromTime: string; // ISO
  toTime?: string | null;
  estimatedMinutes?: number;
  notes?: string;
}

// Placeholder calendar data — replaced by `calendar.getMyCalendar()` response
// once the platform emits typed responses. Keys are ISO yyyy-MM-dd.
export function placeholderEntries(): ScheduledWorkout[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const at = (dayOffset: number, hour: number, minute = 0): string => {
    const d = new Date(today);
    d.setDate(d.getDate() + dayOffset);
    d.setHours(hour, minute, 0, 0);
    return d.toISOString();
  };
  return [
    {
      id: "s1",
      workoutId: "w1",
      workoutName: "Full-body strength",
      fromTime: at(0, 7, 30),
      estimatedMinutes: 45,
    },
    {
      id: "s2",
      workoutId: "w3",
      workoutName: "HIIT 20",
      fromTime: at(2, 18, 0),
      estimatedMinutes: 20,
    },
    {
      id: "s3",
      workoutId: "w6",
      workoutName: "Pull day",
      fromTime: at(3, 7, 0),
      estimatedMinutes: 50,
    },
    {
      id: "s4",
      workoutId: "w4",
      workoutName: "Mobility + Core",
      fromTime: at(5, 8, 15),
      estimatedMinutes: 30,
    },
    {
      id: "s5",
      workoutId: "w5",
      workoutName: "Heavy lower",
      fromTime: at(7, 17, 30),
      estimatedMinutes: 60,
    },
  ];
}
