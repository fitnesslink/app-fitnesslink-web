"use client";

import { atom } from "jotai";
import type { WorkoutDetail, WorkoutExercise } from "@/lib/catalog/types";

export type SessionStatus = "working" | "resting" | "completed";

export interface SessionCursor {
  phaseIdx: number;
  exerciseIdx: number;
  setIdx: number;
}

export interface SessionLog {
  exerciseId: string;
  setNumber: number;
  completedAt: string; // ISO
}

export interface SessionState {
  workout: WorkoutDetail | null;
  cursor: SessionCursor;
  status: SessionStatus;
  startedAt: number | null; // Date.now() ms
  restEndsAt: number | null; // Date.now() ms when the current rest period ends
  log: SessionLog[];
  paused: boolean;
}

export const initialSessionState: SessionState = {
  workout: null,
  cursor: { phaseIdx: 0, exerciseIdx: 0, setIdx: 0 },
  status: "working",
  startedAt: null,
  restEndsAt: null,
  log: [],
  paused: false,
};

export const sessionStateAtom = atom<SessionState>(initialSessionState);

// ─── Selectors ─────────────────────────────────────────────────────────────

function flatExercises(workout: WorkoutDetail): Array<{ phaseIdx: number; exerciseIdx: number; exercise: WorkoutExercise }> {
  const out: Array<{ phaseIdx: number; exerciseIdx: number; exercise: WorkoutExercise }> = [];
  workout.phases.forEach((phase, phaseIdx) => {
    phase.exercises.forEach((exercise, exerciseIdx) => {
      out.push({ phaseIdx, exerciseIdx, exercise });
    });
  });
  return out;
}

export function currentExercise(state: SessionState): WorkoutExercise | null {
  if (!state.workout) return null;
  return (
    state.workout.phases[state.cursor.phaseIdx]?.exercises[state.cursor.exerciseIdx] ?? null
  );
}

export function nextExercise(state: SessionState): WorkoutExercise | null {
  if (!state.workout) return null;
  const flat = flatExercises(state.workout);
  const idx = flat.findIndex(
    (f) => f.phaseIdx === state.cursor.phaseIdx && f.exerciseIdx === state.cursor.exerciseIdx
  );
  return idx >= 0 && idx + 1 < flat.length ? flat[idx + 1].exercise : null;
}

export function totalExerciseCount(state: SessionState): number {
  if (!state.workout) return 0;
  return state.workout.phases.reduce((s, p) => s + p.exercises.length, 0);
}

export function completedExerciseCount(state: SessionState): number {
  if (!state.workout) return 0;
  const flat = flatExercises(state.workout);
  const idx = flat.findIndex(
    (f) => f.phaseIdx === state.cursor.phaseIdx && f.exerciseIdx === state.cursor.exerciseIdx
  );
  return Math.max(0, idx);
}

export function sessionProgress(state: SessionState): number {
  const total = totalExerciseCount(state);
  if (total === 0) return 0;
  return Math.min(1, completedExerciseCount(state) / total);
}

// ─── Reducers ──────────────────────────────────────────────────────────────

export function initSession(workout: WorkoutDetail): SessionState {
  return {
    ...initialSessionState,
    workout,
    startedAt: Date.now(),
  };
}

function advanceCursor(state: SessionState): SessionState {
  if (!state.workout) return state;
  const curPhase = state.workout.phases[state.cursor.phaseIdx];
  if (!curPhase) return state;
  const curExercise = curPhase.exercises[state.cursor.exerciseIdx];
  if (!curExercise) return state;

  // Next set in current exercise
  if (state.cursor.setIdx + 1 < curExercise.sets) {
    return {
      ...state,
      cursor: { ...state.cursor, setIdx: state.cursor.setIdx + 1 },
    };
  }
  // Next exercise in current phase
  if (state.cursor.exerciseIdx + 1 < curPhase.exercises.length) {
    return {
      ...state,
      cursor: {
        phaseIdx: state.cursor.phaseIdx,
        exerciseIdx: state.cursor.exerciseIdx + 1,
        setIdx: 0,
      },
    };
  }
  // Next phase
  if (state.cursor.phaseIdx + 1 < state.workout.phases.length) {
    return {
      ...state,
      cursor: { phaseIdx: state.cursor.phaseIdx + 1, exerciseIdx: 0, setIdx: 0 },
    };
  }
  // All done
  return { ...state, status: "completed" };
}

export function completeSet(state: SessionState): SessionState {
  if (!state.workout || state.status === "completed") return state;
  const ex = currentExercise(state);
  if (!ex) return state;

  const log: SessionLog = {
    exerciseId: ex.id,
    setNumber: state.cursor.setIdx + 1,
    completedAt: new Date().toISOString(),
  };

  const advanced = advanceCursor({ ...state, log: [...state.log, log] });

  // If we rolled into completed status, skip rest
  if (advanced.status === "completed") return advanced;

  // Start rest window
  const restSeconds = ex.restSeconds ?? 60;
  return {
    ...advanced,
    status: "resting",
    restEndsAt: Date.now() + restSeconds * 1000,
  };
}

export function endRest(state: SessionState): SessionState {
  return { ...state, status: "working", restEndsAt: null };
}

export function skipForward(state: SessionState): SessionState {
  if (!state.workout || state.status === "completed") return state;
  const advanced = advanceCursor(state);
  return advanced.status === "completed"
    ? advanced
    : { ...advanced, status: "working", restEndsAt: null };
}

export function skipBackward(state: SessionState): SessionState {
  if (!state.workout) return state;
  const { cursor } = state;
  if (cursor.setIdx > 0) {
    return {
      ...state,
      cursor: { ...cursor, setIdx: cursor.setIdx - 1 },
      status: "working",
      restEndsAt: null,
    };
  }
  if (cursor.exerciseIdx > 0) {
    const prev = state.workout.phases[cursor.phaseIdx].exercises[cursor.exerciseIdx - 1];
    return {
      ...state,
      cursor: { phaseIdx: cursor.phaseIdx, exerciseIdx: cursor.exerciseIdx - 1, setIdx: prev.sets - 1 },
      status: "working",
      restEndsAt: null,
    };
  }
  if (cursor.phaseIdx > 0) {
    const prevPhase = state.workout.phases[cursor.phaseIdx - 1];
    const lastEx = prevPhase.exercises[prevPhase.exercises.length - 1];
    if (!lastEx) return state;
    return {
      ...state,
      cursor: {
        phaseIdx: cursor.phaseIdx - 1,
        exerciseIdx: prevPhase.exercises.length - 1,
        setIdx: lastEx.sets - 1,
      },
      status: "working",
      restEndsAt: null,
    };
  }
  return state;
}

export function togglePause(state: SessionState): SessionState {
  // Pausing shifts restEndsAt forward by the time spent paused when un-pausing.
  if (state.paused) {
    // Currently paused → un-pause. We stored restEndsAt as the ends-at-pause-time;
    // recompute by the pause delta captured in `startedAt` misuse here.
    return { ...state, paused: false };
  }
  return { ...state, paused: true };
}

export function forceComplete(state: SessionState): SessionState {
  return { ...state, status: "completed", restEndsAt: null };
}
