"use client";

import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useLayoutMode } from "@/hooks/useLayoutMode";

type Variant = "center" | "side";

interface SheetProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  /**
   * Desktop behavior:
   *  - `"center"` — centered modal dialog (default).
   *  - `"side"`   — right-edge slide-in panel (master-detail pattern).
   *
   * On mobile both variants render as a bottom sheet for consistency.
   */
  variant?: Variant;
  /** Desktop width; for "center" it's max-width, for "side" it's fixed width */
  width?: number;
}

export function Sheet({
  open,
  onClose,
  children,
  title,
  variant = "center",
  width = 520,
}: SheetProps) {
  const mode = useLayoutMode();
  const isMobile = mode === "mobile";

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  const containerClass = isMobile
    ? "fixed inset-0 z-50"
    : variant === "side"
    ? "fixed inset-0 z-50 flex justify-end"
    : "fixed inset-0 z-50 flex items-center justify-center";

  const panelClass = isMobile
    ? "absolute inset-x-0 bottom-0 bg-surface rounded-t-2xl p-6 max-h-[85dvh] overflow-y-auto"
    : variant === "side"
    ? "relative bg-surface shadow-lg h-full overflow-y-auto p-6"
    : "relative bg-surface rounded-2xl p-6 max-h-[85dvh] overflow-y-auto w-full mx-4";

  const panelStyle = !isMobile
    ? variant === "side"
      ? { width }
      : { maxWidth: width }
    : undefined;

  return createPortal(
    <div className={containerClass} role="dialog" aria-modal="true" aria-label={title}>
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
        tabIndex={-1}
      />
      <div className={panelClass} style={panelStyle} onClick={(e) => e.stopPropagation()}>
        {title && (
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="w-8 h-8 rounded-full flex items-center justify-center text-text-secondary hover:bg-primary-soft hover:text-primary"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        )}
        {children}
      </div>
    </div>,
    document.body
  );
}
