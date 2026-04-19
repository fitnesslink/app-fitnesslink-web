"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { sessions } from "@/lib/api/core";
import { Slider } from "@/components/ui/Slider";
import { Button } from "@/components/ui/Button";
import type { WorkoutDetail } from "@/lib/catalog/types";
import type { SessionLog } from "@/lib/state/session";

interface CompletionOverlayProps {
  workout: WorkoutDetail;
  log: SessionLog[];
  startedAt: number;
}

export function CompletionOverlay({ workout, log, startedAt }: CompletionOverlayProps) {
  const router = useRouter();
  const [rpe, setRpe] = useState(7);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  const durationMinutes = Math.max(1, Math.round((Date.now() - startedAt) / 60_000));
  const totalExercises = workout.phases.reduce((s, p) => s + p.exercises.length, 0);
  const totalSets = log.length;

  const save = useMutation({
    mutationFn: async () => {
      // Minimal create-and-complete flow. Platform expects workoutId +
      // (optionally programId, userId); response is ignored for the skeleton.
      const created = (await sessions.createSession({
        workoutId: workout.id,
      })) as { id?: string } | null;
      const sessionId = created?.id;
      if (sessionId) {
        await sessions.completeSession(sessionId, { rpeId: String(rpe) });
      }
    },
    onSuccess: () => {
      // TODO: global toast system lands in P15; for now, route back silently.
      router.push("/home");
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : "Couldn't save session");
    },
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-md bg-surface rounded-2xl p-6 space-y-5">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-primary/15 text-primary flex items-center justify-center mx-auto mb-3">
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-text-primary">Session complete</h2>
          <p className="text-sm text-text-secondary mt-1">{workout.name}</p>
        </div>

        <div className="grid grid-cols-3 gap-3 text-center">
          <Stat label="Exercises" value={totalExercises} />
          <Stat label="Sets" value={totalSets} />
          <Stat label="Duration" value={`${durationMinutes}m`} />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-text-primary">How hard was it? (RPE)</label>
            <span className="text-sm text-primary font-semibold tabular-nums">{rpe}</span>
          </div>
          <Slider
            min={1}
            max={10}
            step={1}
            value={rpe}
            onChange={(e) => setRpe(Number(e.target.value))}
          />
          <div className="flex justify-between text-[10px] text-text-secondary mt-1">
            <span>Easy</span>
            <span>All out</span>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-text-primary block mb-1">Notes (optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="How did it feel?"
            className="w-full px-3 py-2 rounded-lg border border-border-soft bg-surface text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
        </div>

        {error && (
          <p className="text-sm text-danger bg-danger/10 rounded-lg px-3 py-2">{error}</p>
        )}

        <div className="flex gap-2">
          <Button
            type="button"
            variant="secondary"
            className="!h-11 text-sm"
            onClick={() => router.push("/home")}
          >
            Skip
          </Button>
          <Button
            type="button"
            variant="primary"
            className="!h-11 text-sm"
            isLoading={save.isPending}
            onClick={() => save.mutate()}
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-primary-soft px-3 py-3">
      <p className="text-xl font-bold text-primary tabular-nums">{value}</p>
      <p className="text-[10px] uppercase tracking-wide text-text-secondary mt-0.5">{label}</p>
    </div>
  );
}
