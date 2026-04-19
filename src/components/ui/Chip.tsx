import type { ButtonHTMLAttributes, ReactNode } from "react";

type Tone = "primary" | "soft" | "neutral";

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: Tone;
  selected?: boolean;
  children: ReactNode;
}

const toneClass: Record<Tone, { base: string; selected: string }> = {
  primary: {
    base: "bg-primary text-white hover:bg-primary-hover",
    selected: "bg-primary text-white ring-2 ring-primary-hover",
  },
  soft: {
    base: "bg-primary-soft text-primary hover:bg-primary-soft/80",
    selected: "bg-primary text-white",
  },
  neutral: {
    base: "bg-border-soft text-text-primary hover:bg-border-soft/80",
    selected: "bg-text-primary text-white",
  },
};

export function Chip({
  tone = "primary",
  selected = false,
  children,
  className = "",
  ...props
}: ChipProps) {
  const state = selected ? toneClass[tone].selected : toneClass[tone].base;
  return (
    <button
      type="button"
      className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${state} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
