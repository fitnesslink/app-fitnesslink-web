import type { ReactNode } from "react";
import { Card } from "./Card";

type Accent = "primary" | "orange" | "purple" | "blue" | "neutral";

interface StatCardProps {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  accent?: Accent;
  icon?: ReactNode;
  className?: string;
}

const accentClass: Record<Accent, string> = {
  primary: "text-primary",
  orange: "text-accent-orange",
  purple: "text-accent-purple",
  blue: "text-accent-blue",
  neutral: "text-text-primary",
};

export function StatCard({
  label,
  value,
  hint,
  accent = "primary",
  icon,
  className = "",
}: StatCardProps) {
  return (
    <Card className={className}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-text-secondary uppercase tracking-wide">
            {label}
          </p>
          <p className={`mt-1 text-2xl font-bold ${accentClass[accent]}`}>{value}</p>
          {hint && <p className="text-xs text-text-secondary mt-1">{hint}</p>}
        </div>
        {icon && <div className={`shrink-0 ${accentClass[accent]}`}>{icon}</div>}
      </div>
    </Card>
  );
}
