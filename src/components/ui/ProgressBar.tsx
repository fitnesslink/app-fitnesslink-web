"use client";

interface ProgressBarProps {
  totalSteps: number;
  currentStep: number;
}

export function ProgressBar({ totalSteps, currentStep }: ProgressBarProps) {
  return (
    <div className="flex gap-2 w-full">
      {Array.from({ length: totalSteps }, (_, i) => (
        <div
          key={i}
          className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
            i < currentStep ? "bg-primary" : "bg-border/30"
          }`}
        />
      ))}
    </div>
  );
}
