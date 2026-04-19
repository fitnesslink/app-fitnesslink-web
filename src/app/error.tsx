"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

// Next.js route-level error boundary for any segment under /app that doesn't
// have its own error.tsx. Kept intentionally generic — screen-specific
// boundaries can layer their own error.tsx per segment.
export default function GlobalRouteError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Surface to any attached monitoring once that lands in P15.
    // eslint-disable-next-line no-console
    console.error("[route-error]", error);
  }, [error]);

  return (
    <div className="min-h-dvh bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-surface rounded-2xl p-8 text-center shadow-md">
        <div className="w-16 h-16 mx-auto rounded-full bg-danger/10 text-danger flex items-center justify-center">
          <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>
        <h1 className="mt-4 text-xl font-bold text-text-primary">Something broke here</h1>
        <p className="mt-1 text-sm text-text-secondary">
          We couldn&apos;t render this page. Try again, or head back home.
        </p>
        {error.digest && (
          <p className="mt-3 text-[10px] text-text-secondary font-mono">ref: {error.digest}</p>
        )}
        <div className="mt-5 flex flex-col sm:flex-row gap-2">
          <Button type="button" variant="primary" onClick={() => reset()}>
            Try again
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              if (typeof window !== "undefined") window.location.href = "/home";
            }}
          >
            Go home
          </Button>
        </div>
      </div>
    </div>
  );
}
