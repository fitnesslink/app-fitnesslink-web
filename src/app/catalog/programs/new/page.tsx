"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/state/auth";
import { AppShell } from "@/components/layout/AppShell";
import { ProgramEditor } from "@/components/catalog/ProgramEditor";

export default function NewProgramPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) router.replace("/login");
  }, [isLoading, user, router]);

  if (isLoading || !user) return null;

  return (
    <AppShell subtitle="New program">
      <div className="max-w-6xl mx-auto px-4 lg:px-0 py-6 space-y-6">
        <Link
          href="/catalog/programs"
          className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-primary"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Programs
        </Link>
        <ProgramEditor id="new" />
      </div>
    </AppShell>
  );
}
