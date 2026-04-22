export function formatDuration(totalMinutes: number | null | undefined): string {
  const mins = Math.max(0, Math.round(totalMinutes ?? 0));
  if (mins < 60) return `${mins} min`;
  const hours = Math.floor(mins / 60);
  const remainder = mins % 60;
  if (remainder === 0) return `${hours} hr`;
  return `${hours} hr ${remainder} min`;
}
