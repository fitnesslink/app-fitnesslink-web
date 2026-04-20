"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/state/auth";
import { programs } from "@/lib/api/core";
import { AppShell } from "@/components/layout/AppShell";
import { CatalogHeader } from "@/components/catalog/CatalogHeader";
import { ProgramCard } from "@/components/catalog/ProgramCard";
import { Paginator } from "@/components/catalog/Paginator";
import { Skeleton } from "@/components/ui/Skeleton";
import { ProgramsEmpty } from "@/components/ui/empty-states";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import type { ProgramSummary } from "@/lib/catalog/types";

const PAGE_SIZE = 12;

const SORT_OPTIONS = [
  { value: "name-asc", label: "Name (A–Z)" },
  { value: "weeks-asc", label: "Shortest first" },
  { value: "weeks-desc", label: "Longest first" },
];

async function fetchPrograms(): Promise<ProgramSummary[]> {
  try {
    const res = (await programs.listPrograms()) as
      | { data?: ProgramSummary[]; items?: ProgramSummary[] }
      | ProgramSummary[];
    return Array.isArray(res) ? res : res.data ?? res.items ?? [];
  } catch {
    return [];
  }
}

export default function ProgramsListPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState(SORT_OPTIONS[0].value);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [authLoading, user, router]);

  const { data, isLoading } = useQuery({
    queryKey: programs.keys.list(),
    queryFn: fetchPrograms,
  });

  const visible = useMemo(() => {
    let items = data ?? [];
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(
        (p) =>
          p.name.toLowerCase().includes(q) || (p.description?.toLowerCase().includes(q) ?? false)
      );
    }
    const copy = [...items];
    copy.sort((a, b) => {
      switch (sort) {
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "weeks-asc":
          return a.weeks - b.weeks;
        case "weeks-desc":
          return b.weeks - a.weeks;
      }
      return 0;
    });
    return copy;
  }, [data, search, sort]);

  const paged = visible.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [search, sort]);

  if (authLoading || !user) return null;

  return (
    <AppShell subtitle="Multi-week plans">
      <div className="max-w-6xl mx-auto px-4 lg:px-0 py-6 space-y-6">
        <CatalogHeader
          title="Programs"
          subtitle={`${visible.length} result${visible.length === 1 ? "" : "s"}`}
          search={search}
          onSearchChange={setSearch}
          sort={sort}
          sortOptions={SORT_OPTIONS}
          onSortChange={setSort}
        />

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        ) : paged.length === 0 ? (
          <ProgramsEmpty
            action={
              <Link href="/catalog/programs/new">
                <Button variant="primary" fullWidth={false} className="!h-11 px-5 text-sm">
                  Create program
                </Button>
              </Link>
            }
          />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {paged.map((p) => (
                <ProgramCard key={p.id} program={p} />
              ))}
            </div>
            <Paginator
              page={page}
              pageSize={PAGE_SIZE}
              total={visible.length}
              onPageChange={setPage}
            />
          </>
        )}
      </div>
    </AppShell>
  );
}
