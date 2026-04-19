"use client";

interface MacroBarsProps {
  protein: { current: number; target: number };
  carbs: { current: number; target: number };
  fat: { current: number; target: number };
}

const ACCENTS = {
  protein: { color: "var(--color-accent-orange, #F69833)", label: "Protein" },
  carbs: { color: "var(--color-accent-blue, #3B82F6)", label: "Carbs" },
  fat: { color: "var(--color-accent-purple, #8B5CF6)", label: "Fat" },
} as const;

export function MacroBars({ protein, carbs, fat }: MacroBarsProps) {
  const rows: Array<{ key: keyof typeof ACCENTS; current: number; target: number }> = [
    { key: "protein", ...protein },
    { key: "carbs", ...carbs },
    { key: "fat", ...fat },
  ];
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {rows.map((row) => {
        const pct = row.target === 0 ? 0 : Math.min(1, row.current / row.target);
        const accent = ACCENTS[row.key];
        return (
          <div key={row.key}>
            <div className="flex items-baseline justify-between mb-1">
              <p className="text-sm font-medium text-text-primary">{accent.label}</p>
              <p className="text-xs text-text-secondary tabular-nums">
                {Math.round(row.current)} / {row.target}g
              </p>
            </div>
            <div className="h-2 bg-border-soft rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${pct * 100}%`,
                  background: accent.color,
                  transition: "width 300ms ease-out",
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
