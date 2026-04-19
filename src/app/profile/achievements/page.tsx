"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/state/auth";
import { achievements as achievementsApi } from "@/lib/api/core";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent } from "@/components/ui/Card";
import { placeholderAchievements, type Achievement } from "@/lib/profile/types";

async function fetchAchievements(): Promise<Achievement[]> {
  try {
    const res = (await achievementsApi.getMyAchievement()) as
      | { items?: Achievement[] }
      | Achievement[];
    const items = Array.isArray(res) ? res : res.items ?? [];
    return items.length > 0 ? items : placeholderAchievements();
  } catch {
    return placeholderAchievements();
  }
}

const TONE_RING: Record<Achievement["tone"], string> = {
  primary: "ring-primary",
  orange: "ring-accent-orange",
  purple: "ring-accent-purple",
  blue: "ring-accent-blue",
};
const TONE_BG: Record<Achievement["tone"], string> = {
  primary: "bg-primary-soft text-primary",
  orange: "bg-accent-orange/15 text-accent-orange",
  purple: "bg-accent-purple/15 text-accent-purple",
  blue: "bg-accent-blue/15 text-accent-blue",
};

export default function AchievementsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [authLoading, user, router]);

  const { data: list = [] } = useQuery({
    queryKey: achievementsApi.keys.all,
    queryFn: fetchAchievements,
  });

  if (authLoading || !user) return null;

  const unlockedCount = list.filter((a) => a.unlocked).length;

  return (
    <AppShell subtitle="Achievements">
      <div className="max-w-4xl mx-auto px-4 lg:px-0 py-6 space-y-6">
        <Link
          href="/profile"
          className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-primary"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Profile
        </Link>

        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-primary">Achievements</h1>
          <p className="text-sm text-text-secondary mt-1">
            {unlockedCount} / {list.length} unlocked
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {list.map((a) => (
            <Card
              key={a.id}
              density="compact"
              className={a.unlocked ? "" : "opacity-60"}
            >
              <CardContent>
                <div
                  className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${
                    a.unlocked ? `${TONE_BG[a.tone]} ring-4 ring-offset-2 ring-offset-surface ${TONE_RING[a.tone]}/30` : "bg-border-soft text-text-secondary"
                  }`}
                >
                  {a.unlocked ? (
                    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ) : (
                    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="5" y="11" width="14" height="10" rx="2" />
                      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                    </svg>
                  )}
                </div>
                <p className="mt-3 text-sm font-semibold text-text-primary text-center">
                  {a.title}
                </p>
                <p className="text-xs text-text-secondary text-center mt-0.5">{a.description}</p>
                {a.unlocked && a.unlockedAt && (
                  <p className="text-[10px] text-text-secondary text-center mt-2">
                    {new Date(a.unlockedAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
