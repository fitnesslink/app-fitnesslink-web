"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { programs } from "@/lib/api/core";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { WorkoutPickerSheet } from "./WorkoutPickerSheet";
import { ProgramDetailView } from "./ProgramDetailView";
import {
  addWeek,
  editorToProgramDetail,
  emptyProgramEditor,
  programDetailToEditor,
  removeWeek,
  setDay,
  type ProgramEditorState,
} from "@/lib/catalog/editor";
import type { ProgramDetail } from "@/lib/catalog/types";

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const LEVEL_OPTIONS = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

interface ProgramEditorProps {
  id: string | "new";
  initial?: ProgramDetail;
}

export function ProgramEditor({ id, initial }: ProgramEditorProps) {
  const router = useRouter();
  const qc = useQueryClient();
  const [state, setState] = useState<ProgramEditorState>(() =>
    initial ? programDetailToEditor(initial) : emptyProgramEditor()
  );
  const [picker, setPicker] = useState<{ week: number; day: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const save = useMutation({
    mutationFn: async () => {
      if (id === "new") {
        return programs.createProgram({
          name: state.name,
          description: state.description,
        });
      }
      return programs.updateProgram(id, {
        name: state.name,
        description: state.description,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: programs.keys.all });
      router.push(id === "new" ? "/catalog/programs" : `/catalog/programs/${id}`);
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : "Save failed");
    },
  });

  const previewProgram = editorToProgramDetail(state, id === "new" ? "preview" : id);

  return (
    <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-6">
      <div className="space-y-4">
        <Card>
          <CardHeader
            title={id === "new" ? "New program" : "Edit program"}
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
                placeholder="Program name"
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
                <Select
                  options={LEVEL_OPTIONS}
                  value={state.trainingLevel ?? "beginner"}
                  onChange={(e) =>
                    setState({
                      ...state,
                      trainingLevel: e.target.value as ProgramEditorState["trainingLevel"],
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

        {state.schedule.map((week) => (
          <Card key={week.weekNumber}>
            <CardHeader
              title={`Week ${week.weekNumber}`}
              action={
                state.schedule.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => setState(removeWeek(state, week.weekNumber))}
                    className="text-sm text-danger hover:underline"
                  >
                    Remove week
                  </button>
                ) : null
              }
            />
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                {week.days.map((day) => (
                  <button
                    key={day.dayNumber}
                    type="button"
                    onClick={() => setPicker({ week: week.weekNumber, day: day.dayNumber })}
                    className={`rounded-lg p-3 min-h-[96px] flex flex-col text-left transition-colors ${
                      day.workout
                        ? "bg-primary-soft hover:ring-2 hover:ring-primary"
                        : "bg-background border border-dashed border-border-soft hover:border-primary"
                    }`}
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-text-secondary">
                      {DAY_NAMES[day.dayNumber - 1]}
                    </p>
                    {day.workout ? (
                      <span className="mt-1 flex-1 text-sm font-medium text-primary">
                        {day.workout.name}
                        <span className="block text-[10px] text-text-secondary font-normal mt-0.5">
                          {day.workout.estimatedMinutes} min
                        </span>
                      </span>
                    ) : (
                      <span className="mt-1 flex-1 text-sm text-text-secondary">Rest / tap to assign</span>
                    )}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}

        <button
          type="button"
          onClick={() => setState(addWeek(state))}
          className="w-full px-4 py-3 rounded-lg border border-dashed border-border-soft text-sm text-text-secondary hover:border-primary hover:text-primary transition-colors"
        >
          + Add week
        </button>
      </div>

      {/* Live preview column — desktop only (FIT-58) */}
      <aside className="hidden md:block sticky top-6 self-start max-h-[calc(100dvh-3rem)] overflow-y-auto">
        <div className="mb-3 flex items-center gap-2">
          <Badge tone="default">Live preview</Badge>
          <p className="text-xs text-text-secondary">Updates as you edit</p>
        </div>
        <ProgramDetailView program={previewProgram} />
      </aside>

      <WorkoutPickerSheet
        open={!!picker}
        onClose={() => setPicker(null)}
        includeRestOption
        onPickRest={() => {
          if (picker) setState(setDay(state, picker.week, picker.day, null));
        }}
        onPick={(workout) => {
          if (picker)
            setState(
              setDay(state, picker.week, picker.day, {
                id: workout.id,
                name: workout.name,
                estimatedMinutes: workout.estimatedMinutes,
              })
            );
        }}
      />
    </div>
  );
}
