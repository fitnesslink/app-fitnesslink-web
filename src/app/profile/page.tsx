"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/state/auth";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { placeholderProfile } from "@/lib/profile/types";

const MENU = [
  { href: "/profile/personal", title: "Personal info", desc: "Name, email, avatar, height" },
  { href: "/profile/preferences", title: "Preferences", desc: "Units, language, theme" },
  { href: "/profile/goals", title: "Goals", desc: "Targets + milestones" },
  { href: "/profile/achievements", title: "Achievements", desc: "Badges you've unlocked" },
  { href: "/profile/reports", title: "Workout report", desc: "Trends + PRs + volume" },
  { href: "/profile/notifications/preferences", title: "Notifications", desc: "What pings, when" },
  { href: "/profile/billing", title: "Billing", desc: "Plan + payment method" },
];

export default function ProfileHubPage() {
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) router.replace("/login");
  }, [isLoading, user, router]);

  if (isLoading || !user) return null;

  const profile = placeholderProfile();
  const displayName =
    user.firstName || user.lastName
      ? `${user.firstName} ${user.lastName}`.trim()
      : `${profile.firstName} ${profile.lastName}`.trim();

  return (
    <AppShell subtitle="Profile">
      <div className="max-w-3xl mx-auto px-4 lg:px-0 py-6 space-y-6">
        <Card>
          <CardContent>
            <div className="flex items-center gap-4">
              <Avatar name={displayName} size="xl" />
              <div className="min-w-0 flex-1">
                <h1 className="text-xl lg:text-2xl font-bold text-text-primary truncate">
                  {displayName}
                </h1>
                <p className="text-sm text-text-secondary truncate">{user.email}</p>
                {profile.bio && (
                  <p className="text-sm text-text-secondary mt-1">{profile.bio}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <ul className="space-y-2">
          {MENU.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="flex items-center justify-between px-4 py-3 bg-surface border border-border-soft rounded-xl hover:border-primary transition-colors"
              >
                <div>
                  <p className="text-sm font-semibold text-text-primary">{item.title}</p>
                  <p className="text-xs text-text-secondary">{item.desc}</p>
                </div>
                <svg className="w-5 h-5 text-text-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </Link>
            </li>
          ))}
        </ul>

        <Button
          type="button"
          variant="secondary"
          className="!h-11 text-sm !text-danger"
          onClick={async () => {
            await logout();
            router.push("/");
          }}
        >
          Sign out
        </Button>
      </div>
    </AppShell>
  );
}
