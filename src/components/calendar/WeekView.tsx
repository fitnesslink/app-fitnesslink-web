"use client";

import { useAtomValue } from "jotai";
import {
  addDays,
  calendarSelectedDateAtom,
  isSameDay,
  isoDateKey,
  startOfWeek,
} from "@/lib/state/calendar";
import type { ScheduledWorkout } from "@/lib/calendar/types";

const START_HOUR = 6;
const END_HOUR = 22;
const HOUR_HEIGHT = 48; // px
const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface WeekViewProps {
  entries: ScheduledWorkout[];
  onEntryClick?: (entry: ScheduledWorkout) => void;
}

export function WeekView({ entries, onEntryClick }: WeekViewProps) {
  const selected = useAtomValue(calendarSelectedDateAtom);
  const weekStart = startOfWeek(selected);
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const byDay = new Map<string, ScheduledWorkout[]>();
  for (const e of entries) {
    const key = isoDateKey(new Date(e.fromTime));
    byDay.set(key, [...(byDay.get(key) ?? []), e]);
  }

  const hours = END_HOUR - START_HOUR;
  const gridHeight = hours * HOUR_HEIGHT;

  return (
    <div className="h-full flex flex-col min-h-0">
      <div className="grid grid-cols-[56px_repeat(7,minmax(0,1fr))] text-center text-[11px] font-semibold uppercase tracking-wide text-text-secondary border-b border-border-soft">
        <div className="py-2" />
        {days.map((day) => {
          const isSelected = isSameDay(day, selected);
          const isToday = isSameDay(day, today);
          return (
            <div
              key={isoDateKey(day)}
              className={`py-2 ${isSelected ? "text-primary" : ""}`}
            >
              <p>{DOW[day.getDay()]}</p>
              <p
                className={`text-base tabular-nums ${
                  isSelected
                    ? "inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary text-white mt-0.5"
                    : isToday
                    ? "text-primary"
                    : "text-text-primary"
                }`}
              >
                {day.getDate()}
              </p>
            </div>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto">
        <div
          className="grid grid-cols-[56px_repeat(7,minmax(0,1fr))]"
          style={{ height: gridHeight }}
        >
          <div className="relative">
            {Array.from({ length: hours }, (_, i) => {
              const hour = START_HOUR + i;
              return (
                <div
                  key={hour}
                  style={{ height: HOUR_HEIGHT }}
                  className="text-[10px] text-text-secondary pr-2 text-right -translate-y-1.5"
                >
                  {hour}:00
                </div>
              );
            })}
          </div>

          {days.map((day) => {
            const dayEntries = byDay.get(isoDateKey(day)) ?? [];
            return (
              <div
                key={isoDateKey(day)}
                className="relative border-l border-border-soft"
                style={{ height: gridHeight }}
              >
                {Array.from({ length: hours }, (_, i) => (
                  <div
                    key={i}
                    style={{ height: HOUR_HEIGHT, top: i * HOUR_HEIGHT }}
                    className="absolute inset-x-0 border-t border-border-soft/60"
                  />
                ))}
                {dayEntries.map((entry) => {
                  const d = new Date(entry.fromTime);
                  const minutesFromStart =
                    (d.getHours() - START_HOUR) * 60 + d.getMinutes();
                  const top = Math.max(0, (minutesFromStart / 60) * HOUR_HEIGHT);
                  const durationMin = entry.estimatedMinutes ?? 45;
                  const height = Math.max(32, (durationMin / 60) * HOUR_HEIGHT);
                  return (
                    <button
                      key={entry.id}
                      type="button"
                      onClick={() => onEntryClick?.(entry)}
                      className="absolute inset-x-1 bg-primary-soft border border-primary rounded-md px-2 py-1 text-left hover:bg-primary hover:text-white group transition-colors"
                      style={{ top, height }}
                    >
                      <p className="text-[11px] font-semibold text-primary group-hover:text-white truncate">
                        {entry.workoutName}
                      </p>
                      <p className="text-[10px] text-text-secondary group-hover:text-white/90">
                        {d.toLocaleTimeString(undefined, {
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                        {entry.estimatedMinutes ? ` · ${entry.estimatedMinutes}m` : ""}
                      </p>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
