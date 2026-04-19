"use client";

import { useAtomValue } from "jotai";
import { dismissToast, toastsAtom, type Toast } from "@/lib/state/toasts";

const TONE_CLASS: Record<Toast["tone"], string> = {
  info: "bg-surface border-border-soft text-text-primary",
  success: "bg-primary text-white border-primary",
  warning: "bg-warning text-white border-warning",
  danger: "bg-danger text-white border-danger",
};

const TONE_ICON: Record<Toast["tone"], React.ReactNode> = {
  info: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  ),
  success: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  warning: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  danger: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  ),
};

export function Toaster() {
  const toasts = useAtomValue(toastsAtom);
  if (toasts.length === 0) return null;
  return (
    <div
      className="fixed z-[100] bottom-4 right-4 left-4 sm:left-auto sm:max-w-sm flex flex-col gap-2 pointer-events-none"
      role="region"
      aria-label="Notifications"
      aria-live="polite"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          role={t.tone === "danger" || t.tone === "warning" ? "alert" : "status"}
          className={`pointer-events-auto rounded-xl border shadow-lg px-4 py-3 flex items-start gap-3 ${TONE_CLASS[t.tone]}`}
        >
          <div className="shrink-0 mt-0.5">{TONE_ICON[t.tone]}</div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">{t.title}</p>
            {t.description && <p className="text-xs opacity-90 mt-0.5">{t.description}</p>}
            {t.actionLabel && (
              <button
                type="button"
                onClick={() => {
                  t.onAction?.();
                  dismissToast(t.id);
                }}
                className="mt-2 text-xs font-semibold underline hover:opacity-80"
              >
                {t.actionLabel}
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={() => dismissToast(t.id)}
            aria-label="Dismiss"
            className="shrink-0 opacity-70 hover:opacity-100 transition-opacity"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}
