"use client";

import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useLayoutMode } from "@/hooks/useLayoutMode";

interface SheetProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  /** Desktop max-width; defaults to 520px */
  maxWidth?: number;
}

// Bottom sheet on mobile, centered dialog on desktop — same API for both.
export function Sheet({ open, onClose, children, title, maxWidth = 520 }: SheetProps) {
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

  const panelClass = isMobile
    ? "absolute inset-x-0 bottom-0 bg-surface rounded-t-2xl p-6 max-h-[85dvh] overflow-y-auto"
    : "relative bg-surface rounded-2xl p-6 max-h-[85dvh] overflow-y-auto w-full mx-4";

  const containerClass = isMobile
    ? "fixed inset-0 z-50"
    : "fixed inset-0 z-50 flex items-center justify-center";

  return createPortal(
    <div className={containerClass} role="dialog" aria-modal="true" aria-label={title}>
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
        tabIndex={-1}
      />
      <div
        className={panelClass}
        style={!isMobile ? { maxWidth } : undefined}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <h2 className="text-lg font-semibold text-text-primary mb-4">{title}</h2>
        )}
        {children}
      </div>
    </div>,
    document.body
  );
}
