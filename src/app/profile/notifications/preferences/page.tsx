"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/state/auth";
import { notificationPreferences } from "@/lib/api/notifications";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { DEFAULT_NOTIF_PREFS, type NotificationPrefs } from "@/lib/profile/types";

async function fetchPrefs(): Promise<NotificationPrefs> {
  try {
    const res = (await notificationPreferences.getMyNotificationPreference()) as NotificationPrefs | null;
    if (!res) return DEFAULT_NOTIF_PREFS;
    return { ...DEFAULT_NOTIF_PREFS, ...res };
  } catch {
    return DEFAULT_NOTIF_PREFS;
  }
}

const ROWS: Array<{ key: keyof NotificationPrefs; title: string; desc: string }> = [
  { key: "workoutReminders", title: "Workout reminders", desc: "Ping me before scheduled sessions." },
  { key: "goalMilestones", title: "Goal milestones", desc: "Celebrate when I hit a milestone." },
  { key: "nutritionReminders", title: "Nutrition reminders", desc: "Nudge me if I forget to log." },
  { key: "achievementUnlocks", title: "Achievement unlocks", desc: "Surface new badges as they unlock." },
  { key: "weeklyDigest", title: "Weekly digest", desc: "A Sunday summary of the past week." },
];

export default function NotificationPrefsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [prefs, setPrefs] = useState<NotificationPrefs>(DEFAULT_NOTIF_PREFS);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [authLoading, user, router]);

  const { data } = useQuery({
    queryKey: notificationPreferences.keys.all,
    queryFn: fetchPrefs,
  });

  useEffect(() => {
    if (data) setPrefs(data);
  }, [data]);

  const save = useMutation({
    mutationFn: () =>
      notificationPreferences.updateNotificationPreferencesMe(prefs as never),
    onSuccess: () => router.push("/profile"),
    onError: (err) => setError(err instanceof Error ? err.message : "Save failed"),
  });

  if (authLoading || !user) return null;

  return (
    <AppShell subtitle="Notifications">
      <div className="max-w-2xl mx-auto px-4 lg:px-0 py-6 space-y-6">
        <Link
          href="/profile"
          className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-primary"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Profile
        </Link>

        <Card>
          <CardHeader
            title="Notification preferences"
            subtitle="Web is in-app only — no push today. Your phone handles true push."
          />
          <CardContent>
            <ul className="divide-y divide-border-soft">
              {ROWS.map((row) => (
                <li key={row.key} className="flex items-start justify-between gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-text-primary">{row.title}</p>
                    <p className="text-xs text-text-secondary">{row.desc}</p>
                  </div>
                  <Toggle
                    on={prefs[row.key]}
                    onChange={(v) => setPrefs((p) => ({ ...p, [row.key]: v }))}
                  />
                </li>
              ))}
            </ul>
            {error && (
              <p className="mt-3 text-sm text-danger bg-danger/10 rounded-lg px-3 py-2">{error}</p>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-2 justify-end">
          <Link href="/profile">
            <Button variant="secondary" fullWidth={false} className="!h-11 px-5 text-sm">
              Cancel
            </Button>
          </Link>
          <Button
            type="button"
            variant="primary"
            fullWidth={false}
            className="!h-11 px-6 text-sm"
            isLoading={save.isPending}
            onClick={() => save.mutate()}
          >
            Save
          </Button>
        </div>
      </div>
    </AppShell>
  );
}

function Toggle({ on, onChange }: { on: boolean; onChange: (next: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
        on ? "bg-primary" : "bg-border-soft"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
          on ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}
