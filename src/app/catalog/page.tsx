"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/state/auth";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";

const SECTIONS = [
  {
    href: "/catalog/workouts",
    title: "Workouts",
    description: "Browse and start single-session workouts",
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 10h16M8 6v12M16 6v12" />
      </svg>
    ),
  },
  {
    href: "/catalog/programs",
    title: "Programs",
    description: "Multi-week plans built around a goal",
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M3 10h18" />
      </svg>
    ),
  },
  {
    href: "/catalog/exercises",
    title: "Exercises",
    description: "Individual movements with demos",
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 3v18M3 12h18" />
      </svg>
    ),
  },
];

export default function CatalogHubPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) router.replace("/login");
  }, [isLoading, user, router]);

  if (isLoading || !user) return null;

  return (
    <AppShell subtitle="What do you want to train today?">
      <div className="max-w-5xl mx-auto px-4 lg:px-0 py-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-primary mb-1">Catalog</h1>
        <p className="text-sm text-text-secondary mb-6">Pick a starting point</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {SECTIONS.map((s) => (
            <Link key={s.href} href={s.href} className="block">
              <Card className="h-full hover:border-primary transition-colors">
                <div className="w-12 h-12 rounded-full bg-primary-soft text-primary flex items-center justify-center mb-3">
                  {s.icon}
                </div>
                <h2 className="text-lg font-semibold text-text-primary">{s.title}</h2>
                <p className="text-sm text-text-secondary mt-1">{s.description}</p>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
