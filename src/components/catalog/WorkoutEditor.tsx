"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { workouts } from "@/lib/api/core";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Stepper } from "@/components/ui/Stepper";
import { Badge } from "@/components/ui/Badge";
import { ExercisePickerSheet } from "./ExercisePickerSheet";
import { WorkoutDetailView } from "./WorkoutDetailView";
import {
  addExercise,
  addPhase,
  editorToWorkoutDetail,
  emptyWorkoutEditor,
  moveExercise,
  movePhase,
  removeExercise,
  removePhase,
  updateExercise,
  updatePhase,
  workoutDetailToEditor,
  type WorkoutEditorState,
} from "@/lib/catalog/editor";
import type { WorkoutDetail } from "@/lib/catalog/types";

interface WorkoutEditorProps {
  id: string | "new";
  initial?: WorkoutDetail;
}

const LEVEL_OPTIONS = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

export function WorkoutEditor({ id, initial }: WorkoutEditorProps) {
  const router = useRouter();
  const qc = useQueryClient();
  const [state, setState] = useState<WorkoutEditorState>(() =>
    initial ? workoutDetailToEditor(initial) : emptyWorkoutEditor()
  );
  const [picker, setPicker] = useState<{ phaseId: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const save = useMutation({
    mutationFn: async () => {
      if (id === "new") {
        return workouts.createWorkout({
          name: state.name,
          description: state.description,
          estimatedTime: state.estimatedMinutes,
        });
      }
      return workouts.updateWorkout(id, {
        name: state.name,
        description: state.description,
        estimatedTime: state.estimatedMinutes,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: workouts.keys.all });
      router.push(id === "new" ? "/catalog/workouts" : `/catalog/workouts/${id}`);
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : "Save failed");
    },
  });

  const previewWorkout = editorToWorkoutDetail(state, id === "new" ? "preview" : id);

  return (
    <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-6">
      {/* Form column */}
      <div className="space-y-4">
        <Card>
          <CardHeader
            title={id === "new" ? "New workout" : "Edit workout"}
            action={
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  fullWidth={false}
                  className="!h-10 px-4 text-sm"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  fullWidth={false}
                  className="!h-10 px-5 text-sm"
                  isLoading={save.isPending}
                  onClick={() => save.mutate()}
                >
                  Save
                </Button>
              </div>
            }
          />
          <CardContent>
            <div className="space-y-3">
              <Input
                placeholder="Workout name"
                value={state.name}
                onChange={(e) => setState({ ...state, name: e.target.value })}
              />
              <textarea
                placeholder="Description (optional)"
                value={state.description}
                onChange={(e) => setState({ ...state, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-border-soft bg-surface text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
              <div className="flex items-center gap-3">
                <label className="text-sm text-text-secondary">Duration</label>
                <Stepper
                  value={state.estimatedMinutes}
                  onChange={(v) => setState({ ...state, estimatedMinutes: v })}
                  min={5}
                  max={180}
                  step={5}
                />
                <span className="text-sm text-text-secondary">min</span>
                <div className="flex-1" />
                <Select
                  options={LEVEL_OPTIONS}
                  value={state.trainingLevel ?? "beginner"}
                  onChange={(e) =>
                    setState({
                      ...state,
                      trainingLevel: e.target.value as WorkoutEditorState["trainingLevel"],
                    })
                  }
                />
              </div>
              {error && (
                <p className="text-sm text-danger bg-danger/10 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {state.phases.map((phase, phaseIndex) => (
          <Card key={phase.id}>
            <CardHeader
              title={
                <input
                  type="text"
                  value={phase.name}
                  onChange={(e) => setState(updatePhase(state, phase.id, { name: e.target.value }))}
                  className="bg-transparent text-base font-semibold text-text-primary focus:outline-none border-b border-transparent focus:border-primary w-full"
                  aria-label="Phase name"
                />
              }
              action={
                <div className="flex gap-1">
                  <ReorderButtons
                    onUp={() => setState(movePhase(state, phase.id, -1))}
                    onDown={() => setState(movePhase(state, phase.id, 1))}
                    disableUp={phaseIndex === 0}
                    disableDown={phaseIndex === state.phases.length - 1}
                    label="Phase"
                  />
                  <IconButton
                    label="Remove phase"
                    tone="danger"
                    onClick={() => setState(removePhase(state, phase.id))}
                    icon={
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                      </svg>
                    }
                  />
                </div>
              }
            />
            <CardContent>
              <ul className="space-y-2">
                {phase.exercises.map((ex, exIndex) => (
                  <li
                    key={ex.id}
                    className="border border-border-soft rounded-lg p-3 flex flex-col sm:flex-row sm:items-center gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">{ex.name}</p>
                      <div className="mt-2 grid grid-cols-3 gap-2">
                        <NumberField
                          label="Sets"
                          value={ex.sets}
                          onChange={(v) =>
                            setState(updateExercise(state, phase.id, ex.id, { sets: v }))
                          }
                          min={1}
                          max={20}
                        />
                        <NumberField
                          label="Reps"
                          value={ex.reps ?? 0}
                          onChange={(v) =>
                            setState(updateExercise(state, phase.id, ex.id, { reps: v }))
                          }
                          min={1}
                          max={50}
                        />
                        <NumberField
                          label="Rest (s)"
                          value={ex.restSeconds ?? 0}
                          onChange={(v) =>
                            setState(updateExercise(state, phase.id, ex.id, { restSeconds: v }))
                          }
                          min={0}
                          max={300}
                          step={15}
                        />
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <ReorderButtons
                        onUp={() => setState(moveExercise(state, phase.id, ex.id, -1))}
                        onDown={() => setState(moveExercise(state, phase.id, ex.id, 1))}
                        disableUp={exIndex === 0}
                        disableDown={exIndex === phase.exercises.length - 1}
                        label="Exercise"
                      />
                      <IconButton
                        label="Remove exercise"
                        tone="danger"
                        onClick={() => setState(removeExercise(state, phase.id, ex.id))}
                        icon={
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        }
                      />
                    </div>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => setPicker({ phaseId: phase.id })}
                className="mt-3 w-full px-3 py-2 rounded-lg border border-dashed border-border-soft text-sm text-text-secondary hover:border-primary hover:text-primary transition-colors"
              >
                + Add exercise
              </button>
            </CardContent>
          </Card>
        ))}

        <button
          type="button"
          onClick={() => setState(addPhase(state))}
          className="w-full px-4 py-3 rounded-lg border border-dashed border-border-soft text-sm text-text-secondary hover:border-primary hover:text-primary transition-colors"
        >
          + Add phase
        </button>
      </div>

      {/* Live preview column — desktop only (FIT-58) */}
      <aside className="hidden md:block sticky top-6 self-start max-h-[calc(100dvh-3rem)] overflow-y-auto">
        <div className="mb-3 flex items-center gap-2">
          <Badge tone="default">Live preview</Badge>
          <p className="text-xs text-text-secondary">Updates as you type</p>
        </div>
        <WorkoutDetailView workout={previewWorkout} />
      </aside>

      <ExercisePickerSheet
        open={!!picker}
        onClose={() => setPicker(null)}
        onPick={(movement) => {
          if (picker) setState(addExercise(state, picker.phaseId, movement));
        }}
      />
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <label className="block">
      <span className="block text-[10px] font-semibold uppercase tracking-wide text-text-secondary mb-1">
        {label}
      </span>
      <input
        type="number"
        value={value}
        onChange={(e) => {
          const v = Number(e.target.value);
          if (Number.isNaN(v)) return;
          onChange(v);
        }}
        min={min}
        max={max}
        step={step}
        className="w-full h-9 px-2 rounded-md border border-border-soft bg-surface text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary tabular-nums"
      />
    </label>
  );
}

function ReorderButtons({
  onUp,
  onDown,
  disableUp,
  disableDown,
  label,
}: {
  onUp: () => void;
  onDown: () => void;
  disableUp?: boolean;
  disableDown?: boolean;
  label: string;
}) {
  return (
    <div className="inline-flex rounded-md border border-border-soft overflow-hidden">
      <button
        type="button"
        onClick={onUp}
        disabled={disableUp}
        aria-label={`Move ${label} up`}
        className="w-8 h-8 flex items-center justify-center text-text-secondary hover:bg-primary-soft hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="18 15 12 9 6 15" />
        </svg>
      </button>
      <button
        type="button"
        onClick={onDown}
        disabled={disableDown}
        aria-label={`Move ${label} down`}
        className="w-8 h-8 flex items-center justify-center text-text-secondary hover:bg-primary-soft hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed border-l border-border-soft"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
    </div>
  );
}

function IconButton({
  label,
  onClick,
  icon,
  tone = "default",
}: {
  label: string;
  onClick: () => void;
  icon: React.ReactNode;
  tone?: "default" | "danger";
}) {
  const toneClass =
    tone === "danger"
      ? "text-danger hover:bg-danger/10"
      : "text-text-secondary hover:bg-primary-soft hover:text-primary";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`w-8 h-8 rounded-md flex items-center justify-center ${toneClass}`}
    >
      {icon}
    </button>
  );
}
