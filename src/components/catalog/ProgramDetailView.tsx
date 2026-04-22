"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { ProgramDetail } from "@/lib/catalog/types";
import { formatDuration } from "@/lib/format";

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface ProgramDetailViewProps {
  program: ProgramDetail;
  /** If provided, day cells become buttons; otherwise they render as links to /catalog/workouts/[id] */
  onDayClick?: (week: number, day: number) => void;
  actions?: React.ReactNode;
}

export function ProgramDetailView({ program, onDayClick, actions }: ProgramDetailViewProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="aspect-[4/3] lg:w-64 shrink-0 rounded-xl bg-gradient-to-br from-primary to-primary-hover text-white flex items-center justify-center">
              <div className="text-center">
                <p className="text-5xl font-bold tabular-nums">{program.weeks}</p>
                <p className="text-sm uppercase tracking-wide opacity-90">weeks</p>
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl lg:text-3xl font-bold text-text-primary break-words">
                {program.name || "Untitled program"}
              </h1>
              {program.description && (
                <p className="text-sm text-text-secondary mt-2">{program.description}</p>
              )}
              <div className="flex flex-wrap gap-2 mt-3 text-xs">
                {program.trainingLevel && (
                  <Badge tone={program.trainingLevel === "advanced" ? "warning" : "primary"}>
                    {program.trainingLevel}
                  </Badge>
                )}
              </div>
              {actions && <div className="mt-5 flex flex-wrap gap-3">{actions}</div>}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {program.schedule.map((week) => (
          <Card key={week.weekNumber}>
            <CardContent>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-text-secondary mb-3">
                Week {week.weekNumber}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                {week.days.map((day) => {
                  const content = day.workout ? (
                    <>
                      {day.workout.name}
                      <span className="block text-[10px] text-text-secondary font-normal mt-0.5">
                        {formatDuration(day.workout.estimatedMinutes)}
                      </span>
                    </>
                  ) : (
                    "Rest"
                  );
                  const cellClass = `rounded-lg p-3 min-h-[96px] flex flex-col ${
                    day.workout
                      ? "bg-primary-soft"
                      : "bg-background border border-dashed border-border-soft"
                  }`;
                  const labelClass = day.workout
                    ? "mt-1 flex-1 text-sm font-medium text-primary text-left"
                    : "mt-1 flex-1 text-sm text-text-secondary";

                  if (onDayClick) {
                    return (
                      <button
                        key={day.dayNumber}
                        type="button"
                        className={`${cellClass} text-left hover:border-primary transition-colors`}
                        onClick={() => onDayClick(week.weekNumber, day.dayNumber)}
                      >
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-text-secondary">
                          {DAY_NAMES[day.dayNumber - 1]}
                        </p>
                        <span className={labelClass}>{content}</span>
                      </button>
                    );
                  }

                  return (
                    <div key={day.dayNumber} className={cellClass}>
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-text-secondary">
                        {DAY_NAMES[day.dayNumber - 1]}
                      </p>
                      {day.workout ? (
                        <Link
                          href={`/catalog/workouts/${day.workout.id}`}
                          className={labelClass + " hover:underline"}
                        >
                          {content}
                        </Link>
                      ) : (
                        <span className={labelClass}>{content}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
