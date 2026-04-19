"use client";

interface StepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export function Stepper({
  value,
  onChange,
  min,
  max,
  step = 1,
  label,
  disabled = false,
  className = "",
}: StepperProps) {
  const canDecrement = !disabled && (min === undefined || value - step >= min);
  const canIncrement = !disabled && (max === undefined || value + step <= max);

  return (
    <div className={`inline-flex items-center gap-2 ${className}`} aria-label={label}>
      <button
        type="button"
        aria-label="Decrease"
        disabled={!canDecrement}
        onClick={() => canDecrement && onChange(value - step)}
        className="w-9 h-9 rounded-full bg-primary-soft text-primary font-semibold disabled:opacity-40 hover:bg-primary hover:text-white transition-colors"
      >
        −
      </button>
      <span className="min-w-[2ch] text-center font-semibold text-text-primary tabular-nums">
        {value}
      </span>
      <button
        type="button"
        aria-label="Increase"
        disabled={!canIncrement}
        onClick={() => canIncrement && onChange(value + step)}
        className="w-9 h-9 rounded-full bg-primary-soft text-primary font-semibold disabled:opacity-40 hover:bg-primary hover:text-white transition-colors"
      >
        +
      </button>
    </div>
  );
}
