"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { VideoPlayer } from "./VideoPlayer";
import { CompletionOverlay } from "./CompletionOverlay";
import type { WorkoutDetail } from "@/lib/catalog/types";

interface PlaylistSessionProps {
  workout: WorkoutDetail;
}

export function PlaylistSession({ workout }: PlaylistSessionProps) {
  const router = useRouter();
  const flat = workout.phases.flatMap((p) => p.exercises);
  const [index, setIndex] = useState(0);
  const [startedAt] = useState(() => Date.now());
  const [completed, setCompleted] = useState(false);

  const current = flat[index];
  const progress = flat.length === 0 ? 0 : (index + 1) / flat.length;

  function advance() {
    if (index + 1 >= flat.length) {
      setCompleted(true);
    } else {
      setIndex((i) => i + 1);
    }
  }

  function back() {
    setIndex((i) => Math.max(0, i - 1));
  }

  if (!current) {
    return (
      <div className="h-dvh bg-black text-white flex items-center justify-center">
        Playlist is empty.
      </div>
    );
  }

  if (completed) {
    return (
      <CompletionOverlay
        workout={workout}
        log={flat.map((ex, i) => ({
          exerciseId: ex.id,
          setNumber: 1,
          completedAt: new Date(startedAt + i * 1000).toISOString(),
        }))}
        startedAt={startedAt}
      />
    );
  }

  return (
    <div className="h-dvh bg-black text-white flex flex-col">
      <div className="h-1 bg-white/10">
        <div className="h-full bg-primary transition-all" style={{ width: `${progress * 100}%` }} />
      </div>

      <div className="relative flex-1 min-h-0">
        <button
          type="button"
          onClick={() => router.push("/home")}
          aria-label="Exit session"
          className="absolute top-4 left-4 z-10 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 backdrop-blur"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <VideoPlayer mediaId={null} autoPlay loop={false} muted onEnded={advance} />

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-6">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-white/60">
            Clip {index + 1} / {flat.length}
          </p>
          <h2 className="mt-1 text-2xl font-bold text-white">{current.name}</h2>
          <p className="text-sm text-white/80">
            {current.reps ? `${current.reps} reps` : `${current.durationSeconds}s`}
          </p>

          <div className="mt-4 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={back}
              disabled={index === 0}
              aria-label="Previous clip"
              className="w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 disabled:opacity-30"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="19 20 9 12 19 4 19 20" />
                <line x1="5" y1="19" x2="5" y2="5" />
              </svg>
            </button>
            <button
              type="button"
              onClick={advance}
              aria-label="Next clip"
              className="w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary-hover"
            >
              <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="5 4 15 12 5 20 5 4" />
                <line x1="19" y1="5" x2="19" y2="19" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
