"use client";

import { useEffect } from "react";
import { useAtom } from "jotai";
import { useRouter } from "next/navigation";
import {
  completeSet,
  currentExercise,
  endRest,
  forceComplete,
  nextExercise,
  sessionProgress,
  sessionStateAtom,
  skipBackward,
  skipForward,
  togglePause,
} from "@/lib/state/session";
import { useWakeLock } from "@/hooks/useWakeLock";
import { useAudioCues, vibrate } from "@/hooks/useAudioCues";
import { RestTimerRing } from "@/components/ui/charts/RestTimerRing";
import { VideoPlayer } from "./VideoPlayer";
import { WorkoutOutline } from "./WorkoutOutline";
import { ExercisePreview } from "./ExercisePreview";
import { SessionControls } from "./SessionControls";
import { CompletionOverlay } from "./CompletionOverlay";
import type { WorkoutDetail } from "@/lib/catalog/types";

interface InteractiveSessionProps {
  workout: WorkoutDetail;
}

export function InteractiveSession({ workout }: InteractiveSessionProps) {
  const router = useRouter();
  const [state, setState] = useAtom(sessionStateAtom);
  const { play } = useAudioCues();

  // Reset session state when we mount for a new workout
  useEffect(() => {
    if (state.workout?.id !== workout.id) {
      setState((prev) => ({
        ...prev,
        workout,
        cursor: { phaseIdx: 0, exerciseIdx: 0, setIdx: 0 },
        status: "working",
        startedAt: Date.now(),
        restEndsAt: null,
        log: [],
        paused: false,
      }));
    }
  }, [workout, setState, state.workout?.id]);

  // Keep the screen on while the session is active (cleans up on unmount / complete)
  useWakeLock(state.status !== "completed");

  const ex = currentExercise(state);
  const nextEx = nextExercise(state);
  const progress = sessionProgress(state);

  const restSeconds = state.restEndsAt
    ? Math.max(0, (state.restEndsAt - Date.now()) / 1000)
    : 0;

  function handleCompleteSet() {
    play("restStart");
    setState((s) => completeSet(s));
  }

  function handleRestComplete() {
    play("restEnd");
    vibrate([100, 50, 100]);
    setState((s) => endRest(s));
  }

  function handleSkip() {
    setState((s) => skipForward(s));
  }

  function handlePrev() {
    setState((s) => skipBackward(s));
  }

  function handleTogglePause() {
    setState((s) => togglePause(s));
  }

  function handleExit() {
    setState((s) => forceComplete(s));
    router.push("/home");
  }

  if (state.status === "completed" && state.workout && state.startedAt) {
    return (
      <CompletionOverlay
        workout={state.workout}
        log={state.log}
        startedAt={state.startedAt}
      />
    );
  }

  if (!ex) {
    return (
      <div className="h-dvh bg-black text-white flex items-center justify-center">
        Loading session…
      </div>
    );
  }

  return (
    <div className="h-dvh bg-black text-white flex flex-col lg:grid lg:grid-cols-[280px_1fr_340px]">
      {/* Progress bar spans full width at the top */}
      <div className="lg:col-span-3 h-1 bg-white/10">
        <div
          className="h-full bg-primary transition-all"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      {/* Left pane — outline (desktop only) */}
      <div className="hidden lg:block border-r border-white/10 py-6 overflow-y-auto">
        <WorkoutOutline workout={workout} cursor={state.cursor} />
      </div>

      {/* Center pane — video + current exercise */}
      <div className="relative flex-1 min-h-0 flex flex-col">
        <button
          type="button"
          onClick={handleExit}
          aria-label="Exit session"
          className="absolute top-4 left-4 z-10 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 backdrop-blur"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="flex-1 min-h-0 relative">
          <VideoPlayer
            mediaId={null /* ex.movementId — real media id lands with typed response */}
            autoPlay
            loop
            muted
          />

          {/* Rest timer overlay */}
          {state.status === "resting" && state.restEndsAt && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
              <RestTimerRing
                durationSeconds={Math.ceil(restSeconds || (ex.restSeconds ?? 60))}
                running={!state.paused}
                onComplete={handleRestComplete}
                size={200}
                strokeWidth={12}
              >
                {(remaining) => (
                  <div className="text-center">
                    <p className="text-xs font-semibold uppercase tracking-wide text-white/70">Rest</p>
                    <p className="text-5xl font-bold text-white tabular-nums">
                      {Math.ceil(remaining)}
                    </p>
                    <p className="text-xs text-white/60 mt-1">
                      Up next: {nextEx?.name ?? "Finish"}
                    </p>
                  </div>
                )}
              </RestTimerRing>
            </div>
          )}
        </div>

        {/* Mobile preview + controls footer */}
        <div className="lg:hidden bg-black/80 backdrop-blur border-t border-white/10 px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] space-y-4">
          <ExercisePreview
            current={ex}
            next={nextEx}
            setNumber={state.cursor.setIdx + 1}
            totalSets={ex.sets}
          />
          <SessionControls
            onPrev={handlePrev}
            onNext={handleSkip}
            onTogglePause={handleTogglePause}
            onCompleteSet={handleCompleteSet}
            paused={state.paused}
            resting={state.status === "resting"}
          />
        </div>
      </div>

      {/* Right pane — preview + controls (desktop only) */}
      <div className="hidden lg:flex flex-col border-l border-white/10 p-6">
        <ExercisePreview
          current={ex}
          next={nextEx}
          setNumber={state.cursor.setIdx + 1}
          totalSets={ex.sets}
          className="flex-1"
        />
        <SessionControls
          onPrev={handlePrev}
          onNext={handleSkip}
          onTogglePause={handleTogglePause}
          onCompleteSet={handleCompleteSet}
          paused={state.paused}
          resting={state.status === "resting"}
          className="mt-6"
        />
      </div>
    </div>
  );
}
