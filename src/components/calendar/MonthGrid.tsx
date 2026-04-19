"use client";

import { useAtom } from "jotai";
import {
  addMonths,
  calendarSelectedDateAtom,
  calendarViewMonthAtom,
  isSameDay,
  isSameMonth,
  isoDateKey,
  monthGridDays,
} from "@/lib/state/calendar";
import type { ScheduledWorkout } from "@/lib/calendar/types";

const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface MonthGridProps {
  entries: ScheduledWorkout[];
}

export function MonthGrid({ entries }: MonthGridProps) {
  const [viewMonth, setViewMonth] = useAtom(calendarViewMonthAtom);
  const [selected, setSelected] = useAtom(calendarSelectedDateAtom);

  const countsByDay = new Map<string, number>();
  for (const e of entries) {
    const key = isoDateKey(new Date(e.fromTime));
    countsByDay.set(key, (countsByDay.get(key) ?? 0) + 1);
  }

  const days = monthGridDays(viewMonth);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const monthLabel = viewMonth.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-text-primary">{monthLabel}</h2>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setViewMonth(addMonths(viewMonth, -1))}
            aria-label="Previous month"
            className="w-9 h-9 rounded-lg border border-border-soft text-text-secondary hover:bg-primary-soft hover:text-primary flex items-center justify-center"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => {
              const t = new Date();
              t.setHours(0, 0, 0, 0);
              setViewMonth(new Date(t.getFullYear(), t.getMonth(), 1));
              setSelected(t);
            }}
            className="px-3 h-9 rounded-lg border border-border-soft text-sm font-medium text-text-primary hover:bg-primary-soft hover:text-primary"
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => setViewMonth(addMonths(viewMonth, 1))}
            aria-label="Next month"
            className="w-9 h-9 rounded-lg border border-border-soft text-text-secondary hover:bg-primary-soft hover:text-primary flex items-center justify-center"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {DOW.map((d) => (
          <p
            key={d}
            className="text-[10px] font-semibold uppercase tracking-wide text-text-secondary"
          >
            {d}
          </p>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const inMonth = isSameMonth(day, viewMonth);
          const isToday = isSameDay(day, today);
          const isSelected = isSameDay(day, selected);
          const count = countsByDay.get(isoDateKey(day)) ?? 0;
          const base =
            "aspect-square rounded-lg flex flex-col items-center justify-center text-sm transition-colors relative";
          const tone = isSelected
            ? "bg-primary text-white"
            : isToday
            ? "bg-primary-soft text-primary font-semibold"
            : inMonth
            ? "text-text-primary hover:bg-primary-soft/50"
            : "text-text-secondary/50 hover:bg-primary-soft/20";
          return (
            <button
              key={isoDateKey(day)}
              type="button"
              onClick={() => setSelected(day)}
              className={`${base} ${tone}`}
              aria-label={day.toLocaleDateString(undefined, {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
              aria-pressed={isSelected}
            >
              <span className="tabular-nums">{day.getDate()}</span>
              {count > 0 && (
                <span
                  className={`absolute bottom-1 text-[10px] font-medium tabular-nums px-1.5 rounded-full ${
                    isSelected ? "bg-white/30 text-white" : "bg-primary text-white"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
