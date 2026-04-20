"use client";

import { useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/state/auth";
import { programs } from "@/lib/api/core";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { ProgramDetailView } from "@/components/catalog/ProgramDetailView";
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

export default function ProgramDetailPage({ params }: { params: Promise<{ id: string }> }) {
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
    <AppShell subtitle={data?.name ?? "Program"}>
      <div className="max-w-5xl mx-auto px-4 lg:px-0 py-6 space-y-6">
        <Link
          href="/catalog/programs"
          className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-primary"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Programs
        </Link>

        {isLoading ? (
          <>
            <Skeleton className="h-48" />
            <Skeleton className="h-72" />
          </>
        ) : !data ? (
          <p className="text-sm text-text-secondary">Program not found.</p>
        ) : (
          <ProgramDetailView
            program={data}
            actions={
              <>
                <Button variant="primary" fullWidth={false} className="!h-11 px-6 text-sm">
                  Start program
                </Button>
                <Link href={`/catalog/programs/${id}/edit`}>
                  <Button variant="secondary" fullWidth={false} className="!h-11 px-6 text-sm">
                    Edit
                  </Button>
                </Link>
              </>
            }
          />
        )}
      </div>
    </AppShell>
  );
}
