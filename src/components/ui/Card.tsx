import type { HTMLAttributes, ReactNode } from "react";

type Density = "comfortable" | "compact";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  density?: Density;
}

export function Card({ density = "comfortable", className = "", ...props }: CardProps) {
  const pad = density === "compact" ? "p-4" : "p-5 lg:p-6";
  return (
    <div
      className={`bg-surface rounded-xl border border-border-soft ${pad} ${className}`}
      {...props}
    />
  );
}

interface CardHeaderProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  title?: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
}

export function CardHeader({
  title,
  subtitle,
  action,
  className = "",
  children,
  ...props
}: CardHeaderProps) {
  return (
    <div className={`flex items-start justify-between gap-3 mb-4 ${className}`} {...props}>
      <div className="min-w-0 flex-1">
        {title && <h3 className="text-base font-semibold text-text-primary truncate">{title}</h3>}
        {subtitle && <p className="text-sm text-text-secondary mt-0.5">{subtitle}</p>}
        {children}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function CardContent({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={className} {...props} />;
}
