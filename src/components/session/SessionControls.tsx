"use client";

import { useEffect } from "react";

interface SessionControlsProps {
  onPrev: () => void;
  onNext: () => void;
  onTogglePause: () => void;
  onCompleteSet: () => void;
  paused: boolean;
  resting: boolean;
  className?: string;
}

// Keyboard shortcuts on desktop: space = pause, ← = prev, → = skip, enter = complete set
export function SessionControls({
  onPrev,
  onNext,
  onTogglePause,
  onCompleteSet,
  paused,
  resting,
  className = "",
}: SessionControlsProps) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === "Space") {
        e.preventDefault();
        onTogglePause();
      } else if (e.code === "ArrowLeft") {
        e.preventDefault();
        onPrev();
      } else if (e.code === "ArrowRight") {
        e.preventDefault();
        onNext();
      } else if (e.code === "Enter") {
        e.preventDefault();
        onCompleteSet();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onPrev, onNext, onTogglePause, onCompleteSet]);

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <CircleButton label="Previous" onClick={onPrev} size="md">
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="19 20 9 12 19 4 19 20" />
          <line x1="5" y1="19" x2="5" y2="5" />
        </svg>
      </CircleButton>

      <CircleButton
        label={paused ? "Resume" : "Pause"}
        onClick={onTogglePause}
        size="lg"
        tone="primary"
      >
        {paused ? (
          <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="6 3 20 12 6 21 6 3" />
          </svg>
        ) : (
          <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="4" width="4" height="16" />
            <rect x="14" y="4" width="4" height="16" />
          </svg>
        )}
      </CircleButton>

      <CircleButton label="Skip" onClick={onNext} size="md">
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="5 4 15 12 5 20 5 4" />
          <line x1="19" y1="5" x2="19" y2="19" />
        </svg>
      </CircleButton>

      <div className="flex-1" />

      {!resting && (
        <button
          type="button"
          onClick={onCompleteSet}
          className="h-12 px-6 rounded-full bg-primary text-white font-semibold text-sm hover:bg-primary-hover transition-colors"
        >
          Done set
        </button>
      )}
    </div>
  );
}

function CircleButton({
  label,
  onClick,
  children,
  size = "md",
  tone = "default",
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
  size?: "md" | "lg";
  tone?: "default" | "primary";
}) {
  const sizeClass = size === "lg" ? "w-16 h-16" : "w-12 h-12";
  const toneClass =
    tone === "primary"
      ? "bg-primary text-white hover:bg-primary-hover"
      : "bg-white/10 text-white hover:bg-white/20";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`${sizeClass} ${toneClass} rounded-full flex items-center justify-center transition-colors`}
    >
      {children}
    </button>
  );
}
