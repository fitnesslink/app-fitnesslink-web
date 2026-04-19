import type { HTMLAttributes, ReactNode } from "react";

type Tone = "default" | "primary" | "success" | "warning" | "danger" | "info" | "draft";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
  children: ReactNode;
}

const toneClass: Record<Tone, string> = {
  default: "bg-border-soft text-text-primary",
  primary: "bg-primary text-white",
  success: "bg-success text-white",
  warning: "bg-warning text-white",
  danger: "bg-danger text-white",
  info: "bg-info text-white",
  draft: "bg-status-draft text-white",
};

export function Badge({ tone = "default", className = "", children, ...props }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${toneClass[tone]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
