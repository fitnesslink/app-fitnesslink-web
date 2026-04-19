"use client";

import { useEffect, useMemo, useRef } from "react";
import { useAtom } from "jotai";
import { isSameDay, isToday, selectedDateAtom } from "@/lib/state/home";

const DAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

function startOfWeekCenteredOnToday(): Date[] {
  // 7-day window: today - 3 ... today + 3
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days: Date[] = [];
  for (let offset = -3; offset <= 3; offset++) {
    const d = new Date(today);
    d.setDate(today.getDate() + offset);
    days.push(d);
  }
  return days;
}

export function DateScrubber() {
  const [selected, setSelected] = useAtom(selectedDateAtom);
  const days = useMemo(startOfWeekCenteredOnToday, []);
  const selectedTodayRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    selectedTodayRef.current?.scrollIntoView({ inline: "center", block: "nearest" });
  }, []);

  function onKey(e: React.KeyboardEvent) {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    const idx = days.findIndex((d) => isSameDay(d, selected));
    if (idx === -1) return;
    const next = e.key === "ArrowLeft" ? Math.max(0, idx - 1) : Math.min(days.length - 1, idx + 1);
    setSelected(days[next]);
  }

  return (
    <div className="flex items-center gap-2" onKeyDown={onKey}>
      <div
        role="listbox"
        aria-label="Select a day"
        className="flex-1 flex gap-2 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-1"
      >
        {days.map((day) => {
          const active = isSameDay(day, selected);
          const today = isToday(day);
          return (
            <button
              key={day.toISOString()}
              ref={today ? selectedTodayRef : null}
              type="button"
              role="option"
              aria-selected={active}
              onClick={() => setSelected(day)}
              className={`snap-center shrink-0 w-12 py-2 rounded-xl flex flex-col items-center gap-0.5 transition-colors ${
                active
                  ? "bg-primary text-white"
                  : today
                  ? "bg-primary-soft text-primary"
                  : "bg-surface text-text-primary hover:bg-primary-soft/60"
              }`}
            >
              <span className="text-[11px] font-medium uppercase">
                {DAY_SHORT[day.getDay()]}
              </span>
              <span className="text-lg font-bold tabular-nums">{day.getDate()}</span>
            </button>
          );
        })}
      </div>
      {!isToday(selected) && (
        <button
          type="button"
          onClick={() => {
            const t = new Date();
            t.setHours(0, 0, 0, 0);
            setSelected(t);
          }}
          className="shrink-0 px-3 py-1.5 rounded-full bg-primary text-white text-xs font-semibold hover:bg-primary-hover"
        >
          Today
        </button>
      )}
    </div>
  );
}
