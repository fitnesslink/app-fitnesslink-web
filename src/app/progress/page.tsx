"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/state/auth";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent } from "@/components/ui/Card";

const TILES = [
  {
    href: "/progress/weight",
    title: "Weight",
    description: "Daily scale + trend",
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 6h18l-2 12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L3 6z" />
        <path d="M12 9v7M9 12l3-3 3 3" />
      </svg>
    ),
  },
  {
    href: "/progress/measurements",
    title: "Measurements",
    description: "Chest, waist, arms, thighs",
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12h18M6 9v6M10 9v6M14 9v6M18 9v6" />
      </svg>
    ),
  },
  {
    href: "/progress/photos",
    title: "Progress photos",
    description: "Before / after timeline",
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <circle cx="12" cy="12" r="4" />
      </svg>
    ),
  },
];

export default function ProgressHubPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) router.replace("/login");
  }, [isLoading, user, router]);

  if (isLoading || !user) return null;

  return (
    <AppShell subtitle="Track the change">
      <div className="max-w-4xl mx-auto px-4 lg:px-0 py-6 space-y-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-primary mb-1">Progress</h1>
          <p className="text-sm text-text-secondary">Log it regularly — momentum compounds.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
      </div>
    </AppShell>
  );
}
