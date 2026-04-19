"use client";

import { atom } from "jotai";

function todayAtLocalMidnight(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

// Home screen's active date. Date scrubber writes here; every home widget
// reads here. Default: today at local midnight so equality checks don't
// fight with time-of-day drift.
export const selectedDateAtom = atom<Date>(todayAtLocalMidnight());

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isToday(date: Date): boolean {
  return isSameDay(date, todayAtLocalMidnight());
}
