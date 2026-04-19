import type { HTMLAttributes } from "react";

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "block" | "circle";
}

export function Skeleton({ variant = "block", className = "", ...props }: SkeletonProps) {
  const shape =
    variant === "text"
      ? "h-4 rounded"
      : variant === "circle"
      ? "rounded-full"
      : "rounded-md";
  return (
    <div
      className={`animate-pulse bg-border-soft ${shape} ${className}`}
      aria-hidden="true"
      {...props}
    />
  );
}
