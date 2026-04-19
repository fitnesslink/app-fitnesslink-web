"use client";

import { atom } from "jotai";
import { jotaiStore } from "./store";

export type ToastTone = "info" | "success" | "warning" | "danger";

export interface Toast {
  id: string;
  tone: ToastTone;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  /** Auto-dismiss after this many ms; default 5000. Set 0 to make it sticky. */
  duration?: number;
}

export const toastsAtom = atom<Toast[]>([]);

/** Fire-and-forget enqueue from anywhere — inside or outside React. */
export function pushToast(toast: Omit<Toast, "id">): string {
  const id = Math.random().toString(36).slice(2, 10);
  const next: Toast = { id, ...toast };
  jotaiStore.set(toastsAtom, (curr) => [...curr, next]);
  const ttl = toast.duration ?? 5000;
  if (ttl > 0) {
    setTimeout(() => dismissToast(id), ttl);
  }
  return id;
}

export function dismissToast(id: string): void {
  jotaiStore.set(toastsAtom, (curr) => curr.filter((t) => t.id !== id));
}

export function clearToasts(): void {
  jotaiStore.set(toastsAtom, () => []);
}
