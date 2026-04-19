"use client";

import type {
  MovementSummary,
  WorkoutDetail,
  WorkoutExercise,
  WorkoutPhase,
  ProgramDetail,
  ProgramWeek,
  TrainingLevel,
} from "./types";

// Unique-ish id generator for client-only editor state.
// Real ids come back from the API on save.
export function genId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

// ─── Workout editor ──────────────────────────────────────────────────────────

export interface WorkoutEditorState {
  name: string;
  description: string;
  estimatedMinutes: number;
  trainingLevel?: TrainingLevel;
  phases: WorkoutPhase[];
}

export function emptyWorkoutEditor(): WorkoutEditorState {
  return {
    name: "",
    description: "",
    estimatedMinutes: 30,
    trainingLevel: "beginner",
    phases: [{ id: genId("p"), name: "Main set", exercises: [] }],
  };
}

export function workoutDetailToEditor(detail: WorkoutDetail): WorkoutEditorState {
  return {
    name: detail.name,
    description: detail.description ?? "",
    estimatedMinutes: detail.estimatedMinutes,
    trainingLevel: detail.trainingLevel,
    phases: detail.phases,
  };
}

export function editorToWorkoutDetail(state: WorkoutEditorState, id: string): WorkoutDetail {
  return {
    id,
    name: state.name,
    description: state.description,
    estimatedMinutes: state.estimatedMinutes,
    trainingLevel: state.trainingLevel,
    exerciseCount: state.phases.reduce((s, p) => s + p.exercises.length, 0),
    phases: state.phases,
  };
}

export function addPhase(state: WorkoutEditorState): WorkoutEditorState {
  return {
    ...state,
    phases: [...state.phases, { id: genId("p"), name: "New phase", exercises: [] }],
  };
}

export function removePhase(state: WorkoutEditorState, phaseId: string): WorkoutEditorState {
  return { ...state, phases: state.phases.filter((p) => p.id !== phaseId) };
}

export function updatePhase(
  state: WorkoutEditorState,
  phaseId: string,
  patch: Partial<WorkoutPhase>
): WorkoutEditorState {
  return {
    ...state,
    phases: state.phases.map((p) => (p.id === phaseId ? { ...p, ...patch } : p)),
  };
}

export function movePhase(
  state: WorkoutEditorState,
  phaseId: string,
  direction: -1 | 1
): WorkoutEditorState {
  const idx = state.phases.findIndex((p) => p.id === phaseId);
  if (idx === -1) return state;
  const next = idx + direction;
  if (next < 0 || next >= state.phases.length) return state;
  const copy = [...state.phases];
  [copy[idx], copy[next]] = [copy[next], copy[idx]];
  return { ...state, phases: copy };
}

export function addExercise(
  state: WorkoutEditorState,
  phaseId: string,
  movement: MovementSummary
): WorkoutEditorState {
  const exercise: WorkoutExercise = {
    id: genId("e"),
    movementId: movement.id,
    name: movement.name,
    sets: 3,
    reps: 10,
    restSeconds: 60,
    thumbnailUrl: movement.thumbnailUrl,
  };
  return updatePhase(state, phaseId, {
    exercises: [
      ...(state.phases.find((p) => p.id === phaseId)?.exercises ?? []),
      exercise,
    ],
  });
}

export function removeExercise(
  state: WorkoutEditorState,
  phaseId: string,
  exerciseId: string
): WorkoutEditorState {
  const phase = state.phases.find((p) => p.id === phaseId);
  if (!phase) return state;
  return updatePhase(state, phaseId, {
    exercises: phase.exercises.filter((e) => e.id !== exerciseId),
  });
}

export function updateExercise(
  state: WorkoutEditorState,
  phaseId: string,
  exerciseId: string,
  patch: Partial<WorkoutExercise>
): WorkoutEditorState {
  const phase = state.phases.find((p) => p.id === phaseId);
  if (!phase) return state;
  return updatePhase(state, phaseId, {
    exercises: phase.exercises.map((e) => (e.id === exerciseId ? { ...e, ...patch } : e)),
  });
}

export function moveExercise(
  state: WorkoutEditorState,
  phaseId: string,
  exerciseId: string,
  direction: -1 | 1
): WorkoutEditorState {
  const phase = state.phases.find((p) => p.id === phaseId);
  if (!phase) return state;
  const idx = phase.exercises.findIndex((e) => e.id === exerciseId);
  const next = idx + direction;
  if (idx === -1 || next < 0 || next >= phase.exercises.length) return state;
  const copy = [...phase.exercises];
  [copy[idx], copy[next]] = [copy[next], copy[idx]];
  return updatePhase(state, phaseId, { exercises: copy });
}

// ─── Program editor ──────────────────────────────────────────────────────────

export interface ProgramEditorState {
  name: string;
  description: string;
  trainingLevel?: TrainingLevel;
  schedule: ProgramWeek[];
}

export function emptyProgramEditor(): ProgramEditorState {
  return {
    name: "",
    description: "",
    trainingLevel: "beginner",
    schedule: [newEmptyWeek(1)],
  };
}

export function newEmptyWeek(weekNumber: number): ProgramWeek {
  return {
    weekNumber,
    days: Array.from({ length: 7 }, (_, i) => ({ dayNumber: i + 1, workout: null })),
  };
}

export function programDetailToEditor(detail: ProgramDetail): ProgramEditorState {
  return {
    name: detail.name,
    description: detail.description ?? "",
    trainingLevel: detail.trainingLevel,
    schedule: detail.schedule,
  };
}

export function editorToProgramDetail(state: ProgramEditorState, id: string): ProgramDetail {
  return {
    id,
    name: state.name,
    description: state.description,
    trainingLevel: state.trainingLevel,
    weeks: state.schedule.length,
    schedule: state.schedule,
  };
}

export function addWeek(state: ProgramEditorState): ProgramEditorState {
  const next = state.schedule.length + 1;
  return { ...state, schedule: [...state.schedule, newEmptyWeek(next)] };
}

export function removeWeek(state: ProgramEditorState, weekNumber: number): ProgramEditorState {
  const pruned = state.schedule.filter((w) => w.weekNumber !== weekNumber);
  // Re-number weeks so gaps don't linger
  const renumbered = pruned.map((w, i) => ({ ...w, weekNumber: i + 1 }));
  return { ...state, schedule: renumbered };
}

export function setDay(
  state: ProgramEditorState,
  weekNumber: number,
  dayNumber: number,
  workout: ProgramWeek["days"][number]["workout"]
): ProgramEditorState {
  return {
    ...state,
    schedule: state.schedule.map((week) =>
      week.weekNumber === weekNumber
        ? {
            ...week,
            days: week.days.map((d) =>
              d.dayNumber === dayNumber ? { ...d, workout } : d
            ),
          }
        : week
    ),
  };
}
