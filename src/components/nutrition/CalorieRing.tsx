"use client";

interface CalorieRingProps {
  consumed: number;
  goal: number;
  size?: number;
  strokeWidth?: number;
}

export function CalorieRing({ consumed, goal, size = 200, strokeWidth = 16 }: CalorieRingProps) {
  const pct = goal === 0 ? 0 : Math.min(1.2, consumed / goal);
  const remaining = Math.max(0, goal - consumed);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - Math.min(1, pct));
  const over = pct > 1;

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${Math.round(consumed)} of ${goal} calories consumed`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="#E5E7EB" strokeWidth={strokeWidth} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={over ? "#DC2626" : "#23AF8D"}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{ transition: "stroke-dashoffset 400ms ease-out" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">
          {over ? "Over by" : "Remaining"}
        </p>
        <p className="text-4xl font-bold text-text-primary tabular-nums">
          {over ? Math.round(consumed - goal) : Math.round(remaining)}
        </p>
        <p className="text-xs text-text-secondary">
          {Math.round(consumed)} / {goal} kcal
        </p>
      </div>
    </div>
  );
}
