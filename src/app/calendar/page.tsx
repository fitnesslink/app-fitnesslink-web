"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAtomValue } from "jotai";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/state/auth";
import { calendar } from "@/lib/api/core";
import {
  calendarSelectedDateAtom,
  isSameDay,
  isoDateKey,
} from "@/lib/state/calendar";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent } from "@/components/ui/Card";
import { MonthGrid } from "@/components/calendar/MonthGrid";
import { ScheduledList } from "@/components/calendar/ScheduledList";
import { ScheduledWorkoutSheet } from "@/components/calendar/ScheduledWorkoutSheet";
import { WeekView } from "@/components/calendar/WeekView";
import { placeholderEntries, type ScheduledWorkout } from "@/lib/calendar/types";

async function fetchEntries(): Promise<ScheduledWorkout[]> {
  try {
    const res = (await calendar.getMyCalendar()) as
      | { items?: ScheduledWorkout[] }
      | ScheduledWorkout[];
    const items = Array.isArray(res) ? res : res.items ?? [];
    return items.length > 0 ? items : placeholderEntries();
  } catch {
    return placeholderEntries();
  }
}

export default function CalendarPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const selected = useAtomValue(calendarSelectedDateAtom);
  const [sheetMode, setSheetMode] = useState<{ editing: ScheduledWorkout | null } | null>(null);

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [authLoading, user, router]);

  const { data: entries = [] } = useQuery({
    queryKey: calendar.keys.list(),
    queryFn: fetchEntries,
  });

  const entriesForSelectedDay = useMemo(
    () => entries.filter((e) => isSameDay(new Date(e.fromTime), selected)),
    [entries, selected]
  );

  if (authLoading || !user) return null;

  const subtitle = selected.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <AppShell subtitle={subtitle}>
      <div className="max-w-7xl mx-auto px-4 lg:px-0 py-6">
        {/* Mobile + tablet layout: stacked */}
        <div className="lg:hidden space-y-6">
          <Card>
            <CardContent>
              <MonthGrid entries={entries} />
            </CardContent>
          </Card>
          <ScheduledList
            date={selected}
            entries={entriesForSelectedDay}
            onAdd={() => setSheetMode({ editing: null })}
            onEdit={(entry) => setSheetMode({ editing: entry })}
          />
        </div>

        {/* Desktop 3-pane: month | week | scheduled list */}
        <div className="hidden lg:grid lg:grid-cols-[360px_1fr_320px] gap-6 h-[calc(100dvh-8rem)]">
          <Card className="overflow-y-auto">
            <CardContent>
              <MonthGrid entries={entries} />
            </CardContent>
          </Card>
          <Card className="!p-0 overflow-hidden flex flex-col">
            <div className="px-6 pt-4 pb-2 border-b border-border-soft">
              <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
                Week of
              </p>
              <p className="text-sm font-semibold text-text-primary">{subtitle}</p>
            </div>
            <div className="flex-1 min-h-0">
              <WeekView
                entries={entries}
                onEntryClick={(entry) => setSheetMode({ editing: entry })}
              />
            </div>
          </Card>
          <div className="overflow-y-auto">
            <ScheduledList
              date={selected}
              entries={entriesForSelectedDay}
              onAdd={() => setSheetMode({ editing: null })}
              onEdit={(entry) => setSheetMode({ editing: entry })}
            />
          </div>
        </div>

        {/* Mobile floating action button */}
        <button
          type="button"
          onClick={() => setSheetMode({ editing: null })}
          aria-label="Add scheduled workout"
          className="lg:hidden fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] right-4 w-14 h-14 rounded-full bg-primary text-white shadow-lg flex items-center justify-center hover:bg-primary-hover z-30"
        >
          <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </div>

      <ScheduledWorkoutSheet
        open={sheetMode !== null}
        onClose={() => setSheetMode(null)}
        defaultDate={selected}
        initial={sheetMode?.editing ?? null}
      />
    </AppShell>
  );
}
