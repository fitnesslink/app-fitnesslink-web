"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

interface RestTimerRingProps {
  /** Total countdown seconds */
  durationSeconds: number;
  /** When true, the ring animates; flip off to pause */
  running?: boolean;
  /** Called exactly once when the timer hits zero */
  onComplete?: () => void;
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  children?: (remainingSeconds: number) => ReactNode;
}

// rAF-driven ring — smoother than setInterval under tab throttling and keeps
// the stroke animation locked to actual elapsed time.
export function RestTimerRing({
  durationSeconds,
  running = true,
  onComplete,
  size = 160,
  strokeWidth = 10,
  color = "#23AF8D",
  trackColor = "#E5E7EB",
  children,
}: RestTimerRingProps) {
  const [remaining, setRemaining] = useState(durationSeconds);
  const startRef = useRef<number | null>(null);
  const frameRef = useRef<number | null>(null);
  const completedRef = useRef(false);

  useEffect(() => {
    setRemaining(durationSeconds);
    startRef.current = null;
    completedRef.current = false;
  }, [durationSeconds]);

  useEffect(() => {
    if (!running) {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
      startRef.current = null;
      return;
    }

    const step = (now: number) => {
      if (startRef.current === null) {
        startRef.current = now - (durationSeconds - remaining) * 1000;
      }
      const elapsed = (now - startRef.current) / 1000;
      const next = Math.max(0, durationSeconds - elapsed);
      setRemaining(next);
      if (next > 0) {
        frameRef.current = requestAnimationFrame(step);
      } else if (!completedRef.current) {
        completedRef.current = true;
        onComplete?.();
      }
    };
    frameRef.current = requestAnimationFrame(step);
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, durationSeconds, onComplete]);

  const progress = durationSeconds === 0 ? 1 : 1 - remaining / durationSeconds;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
      role="timer"
      aria-live="off"
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children ? children(remaining) : (
          <span className="text-2xl font-bold text-text-primary tabular-nums">
            {Math.ceil(remaining)}
          </span>
        )}
      </div>
    </div>
  );
}
