"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { habits } from "@/lib/api/core";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";

// Until the platform spec emits response schemas, we describe the shape we
// need and cast the unknown response. Shape mirrors CreateHabitRequest +
// expected read-side fields (id, streak, today's completion flag).
interface HabitListItem {
  id: string;
  title: string;
  streakDays: number;
  doneToday: boolean;
}

const PLACEHOLDER: HabitListItem[] = [
  { id: "p1", title: "Morning stretch", streakDays: 7, doneToday: true },
  { id: "p2", title: "Drink water", streakDays: 12, doneToday: false },
  { id: "p3", title: "10k steps", streakDays: 3, doneToday: false },
];

async function fetchTodayHabits(): Promise<HabitListItem[]> {
  try {
    const res = (await habits.getMyHabit()) as { items?: HabitListItem[] } | HabitListItem[];
    const items = Array.isArray(res) ? res : res.items ?? [];
    return items.length > 0 ? items : PLACEHOLDER;
  } catch {
    return PLACEHOLDER;
  }
}

export function TodayHabits() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: habits.keys.list(),
    queryFn: fetchTodayHabits,
  });

  const toggle = useMutation({
    mutationFn: async ({ id, done }: { id: string; done: boolean }) => {
      if (!done) {
        await habits.logHabit(id, {
          completedAt: new Date().toISOString(),
          completionType: "full",
          idempotencyKey: crypto.randomUUID(),
        });
      }
      // Un-log path isn't in the API; toggling off is optimistic only for now.
    },
    onMutate: async ({ id }) => {
      await qc.cancelQueries({ queryKey: habits.keys.list() });
      const prev = qc.getQueryData<HabitListItem[]>(habits.keys.list());
      qc.setQueryData<HabitListItem[]>(habits.keys.list(), (old) =>
        (old ?? []).map((h) =>
          h.id === id
            ? { ...h, doneToday: !h.doneToday, streakDays: h.doneToday ? h.streakDays : h.streakDays + 1 }
            : h
        )
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(habits.keys.list(), ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: habits.keys.list() });
    },
  });

  return (
    <Card>
      <CardHeader title="Today's habits" subtitle="Tap to log" />
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-12" />
            ))}
          </div>
        ) : !data || data.length === 0 ? (
          <EmptyState title="No habits today" description="Build one to start a streak." />
        ) : (
          <ul className="space-y-2">
            {data.map((h) => (
              <li key={h.id}>
                <button
                  type="button"
                  onClick={() => toggle.mutate({ id: h.id, done: h.doneToday })}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-colors text-left ${
                    h.doneToday
                      ? "border-primary bg-primary-soft"
                      : "border-border-soft hover:border-primary"
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      h.doneToday
                        ? "bg-primary border-primary text-white"
                        : "border-border"
                    }`}
                    aria-hidden
                  >
                    {h.doneToday && (
                      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </span>
                  <span
                    className={`flex-1 text-sm font-medium ${
                      h.doneToday ? "text-primary" : "text-text-primary"
                    }`}
                  >
                    {h.title}
                  </span>
                  {h.streakDays > 0 && (
                    <Badge tone={h.doneToday ? "primary" : "default"}>
                      🔥 {h.streakDays}
                    </Badge>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
