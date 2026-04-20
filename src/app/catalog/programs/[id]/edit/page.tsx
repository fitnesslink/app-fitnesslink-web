"use client";

import { useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/state/auth";
import { programs } from "@/lib/api/core";
import { AppShell } from "@/components/layout/AppShell";
import { ProgramEditor } from "@/components/catalog/ProgramEditor";
import { Skeleton } from "@/components/ui/Skeleton";
import type { ProgramDetail } from "@/lib/catalog/types";

async function fetchProgramDetail(id: string): Promise<ProgramDetail | null> {
  try {
    const res = (await programs.getProgram(id)) as ProgramDetail | null;
    if (!res) return null;
    return { ...res, schedule: res.schedule ?? [] };
  } catch {
    return null;
  }
}

export default function EditProgramPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [authLoading, user, router]);

  const { data, isLoading } = useQuery({
    queryKey: programs.keys.detail(id),
    queryFn: () => fetchProgramDetail(id),
    enabled: !!id,
  });

  if (authLoading || !user) return null;

  return (
    <AppShell subtitle={data?.name ?? "Edit program"}>
      <div className="max-w-6xl mx-auto px-4 lg:px-0 py-6 space-y-6">
        <Link
          href={`/catalog/programs/${id}`}
          className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-primary"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back to program
        </Link>
        {isLoading ? (
          <Skeleton className="h-96" />
        ) : !data ? (
          <p className="text-sm text-text-secondary">Program not found.</p>
        ) : (
          <ProgramEditor id={id} initial={data} />
        )}
      </div>
    </AppShell>
  );
}
