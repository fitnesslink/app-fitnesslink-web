"use client";

import { useMemo, useState } from "react";

interface HabitHeatmapProps {
  /** ISO yyyy-MM-dd → intensity (0–1) */
  completionByDate: Record<string, number>;
  /** Number of weeks to show. Default 53 (≈ 1 year). */
  weeks?: number;
}

const CELL = 12;
const GAP = 3;

export function HabitHeatmap({ completionByDate, weeks = 53 }: HabitHeatmapProps) {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  // Align to Sunday so columns = weeks cleanly
  const end = new Date(today);
  const start = new Date(today);
  start.setDate(start.getDate() - weeks * 7 - today.getDay());

  const days: Array<{ date: Date; key: string; value: number }> = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    const key = cursor.toISOString().slice(0, 10);
    days.push({ date: new Date(cursor), key, value: completionByDate[key] ?? 0 });
    cursor.setDate(cursor.getDate() + 1);
  }

  const cols = Math.ceil(days.length / 7);
  const width = cols * (CELL + GAP);
  const height = 7 * (CELL + GAP);

  const [hover, setHover] = useState<{ x: number; y: number; text: string } | null>(null);

  return (
    <div className="relative overflow-x-auto">
      <svg width={width} height={height + 20} className="block">
        {days.map((d, idx) => {
          const col = Math.floor(idx / 7);
          const row = idx % 7;
          const x = col * (CELL + GAP);
          const y = row * (CELL + GAP);
          const intensity = d.value;
          const fill =
            intensity === 0
              ? "#E5E7EB"
              : intensity < 0.5
              ? "#B8E6D7"
              : intensity < 0.9
              ? "#4DC3A1"
              : "#23AF8D";
          return (
            <rect
              key={d.key}
              x={x}
              y={y}
              width={CELL}
              height={CELL}
              rx={2}
              fill={fill}
              onMouseEnter={() =>
                setHover({
                  x: x + CELL / 2,
                  y,
                  text: `${d.date.toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })} · ${intensity > 0 ? "done" : "missed"}`,
                })
              }
              onMouseLeave={() => setHover(null)}
            />
          );
        })}
      </svg>
      {hover && (
        <div
          className="absolute z-10 px-2 py-1 bg-black text-white text-[10px] rounded pointer-events-none whitespace-nowrap"
          style={{ left: hover.x, top: hover.y - 24, transform: "translateX(-50%)" }}
        >
          {hover.text}
        </div>
      )}
      <div className="mt-2 flex items-center gap-2 text-[10px] text-text-secondary">
        <span>Less</span>
        {["#E5E7EB", "#B8E6D7", "#4DC3A1", "#23AF8D"].map((c) => (
          <span key={c} className="inline-block w-3 h-3 rounded-sm" style={{ background: c }} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
