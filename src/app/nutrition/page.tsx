"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/state/auth";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";

const TILES = [
  {
    href: "/nutrition/tracking",
    title: "Calorie tracking",
    description: "Log foods + track macros",
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 3a9 9 0 0 1 9 9h-9z" fill="currentColor" opacity="0.3" />
      </svg>
    ),
  },
  {
    href: "/nutrition/meal-plan",
    title: "Meal plan",
    description: "Week at a glance",
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M3 9h18M9 5v16" />
      </svg>
    ),
  },
  {
    href: "/nutrition/grocery",
    title: "Grocery list",
    description: "Shopping list from your plan",
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2l-4 5v13a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7l-4-5z" />
        <path d="M2 7h20M16 11a4 4 0 0 1-8 0" />
      </svg>
    ),
  },
  {
    href: "/nutrition/reports",
    title: "Reports",
    description: "Trends over time",
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
      </svg>
    ),
  },
];

export default function NutritionHubPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) router.replace("/login");
  }, [isLoading, user, router]);

  if (isLoading || !user) return null;

  return (
    <AppShell subtitle="Fuel the work">
      <div className="max-w-5xl mx-auto px-4 lg:px-0 py-6 space-y-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-primary mb-1">Nutrition</h1>
          <p className="text-sm text-text-secondary">Today at a glance</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="Avg calories" value="2,040" hint="7-day average" accent="primary" />
          <StatCard label="Meals planned" value="14" hint="This week" accent="orange" />
          <StatCard label="Grocery items" value="12" hint="Unchecked" accent="blue" />
          <StatCard label="Streak" value="5d" hint="Logging streak" accent="purple" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {TILES.map((tile) => (
            <Link key={tile.href} href={tile.href} className="block">
              <Card className="h-full hover:border-primary transition-colors">
                <CardContent>
                  <div className="w-12 h-12 rounded-full bg-primary-soft text-primary flex items-center justify-center mb-3">
                    {tile.icon}
                  </div>
                  <h2 className="text-lg font-semibold text-text-primary">{tile.title}</h2>
                  <p className="text-sm text-text-secondary mt-1">{tile.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/nutrition/tracking"
            className="inline-flex items-center h-11 px-5 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary-hover"
          >
            + Log food
          </Link>
          <Link
            href="/nutrition/foods/new"
            className="inline-flex items-center h-11 px-5 rounded-full border border-border-soft text-sm font-medium text-text-primary hover:bg-primary-soft"
          >
            Add custom food
          </Link>
          <Link
            href="/nutrition/goals"
            className="inline-flex items-center h-11 px-5 rounded-full border border-border-soft text-sm font-medium text-text-primary hover:bg-primary-soft"
          >
            Goal settings
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
