"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/state/auth";
import { movements } from "@/lib/api/core";
import { AppShell } from "@/components/layout/AppShell";
import { CatalogHeader } from "@/components/catalog/CatalogHeader";
import { MovementPreviewSheet } from "@/components/catalog/MovementPreviewSheet";
import { Paginator } from "@/components/catalog/Paginator";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import type { MovementSummary } from "@/lib/catalog/types";

const PAGE_SIZE = 24;

async function fetchMovements(): Promise<MovementSummary[]> {
  try {
    const res = (await movements.listMovements()) as
      | { data?: MovementSummary[]; items?: MovementSummary[] }
      | MovementSummary[];
    return Array.isArray(res) ? res : res.data ?? res.items ?? [];
  } catch {
    return [];
  }
}

function uniqueValues<K extends keyof MovementSummary>(
  items: MovementSummary[],
  key: K
): string[] {
  const set = new Set<string>();
  for (const item of items) {
    const v = item[key];
    if (typeof v === "string" && v) set.add(v);
  }
  return Array.from(set).sort();
}

export default function ExercisesBrowserPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [muscleFilter, setMuscleFilter] = useState<string | null>(null);
  const [equipmentFilter, setEquipmentFilter] = useState<string | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [authLoading, user, router]);

  const { data, isLoading } = useQuery({
    queryKey: movements.keys.list(),
    queryFn: fetchMovements,
  });

  const items = data ?? [];
  const categories = useMemo(() => uniqueValues(items, "category"), [items]);
  const muscles = useMemo(() => uniqueValues(items, "muscleGroup"), [items]);
  const equipment = useMemo(() => uniqueValues(items, "equipment"), [items]);

  const visible = useMemo(() => {
    let result = items;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((m) => m.name.toLowerCase().includes(q));
    }
    if (categoryFilter) result = result.filter((m) => m.category === categoryFilter);
    if (muscleFilter) result = result.filter((m) => m.muscleGroup === muscleFilter);
    if (equipmentFilter) result = result.filter((m) => m.equipment === equipmentFilter);
    return result;
  }, [items, search, categoryFilter, muscleFilter, equipmentFilter]);

  const paged = visible.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [search, categoryFilter, muscleFilter, equipmentFilter]);

  if (authLoading || !user) return null;

  return (
    <AppShell subtitle="Movement library">
      <div className="max-w-6xl mx-auto px-4 lg:px-0 py-6 space-y-6">
        <CatalogHeader
          title="Exercises"
          subtitle={`${visible.length} result${visible.length === 1 ? "" : "s"}`}
          search={search}
          onSearchChange={setSearch}
        />

        <div className="lg:grid lg:grid-cols-[220px_1fr] lg:gap-6">
          <aside className="space-y-5 mb-6 lg:mb-0">
            <FilterGroup
              label="Category"
              options={categories}
              value={categoryFilter}
              onChange={setCategoryFilter}
            />
            <FilterGroup
              label="Muscle group"
              options={muscles}
              value={muscleFilter}
              onChange={setMuscleFilter}
            />
            <FilterGroup
              label="Equipment"
              options={equipment}
              value={equipmentFilter}
              onChange={setEquipmentFilter}
            />
          </aside>

          <div>
            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {Array.from({ length: 12 }).map((_, i) => (
                  <Skeleton key={i} className="h-32" />
                ))}
              </div>
            ) : paged.length === 0 ? (
              <EmptyState
                title="No exercises match"
                description="Clear a filter or try a different search."
              />
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {paged.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPreviewId(m.id)}
                      className="text-left"
                    >
                      <Card density="compact" className="h-full hover:border-primary transition-colors">
                        <div className="aspect-square rounded-lg bg-primary-soft text-primary flex items-center justify-center mb-2">
                          <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <polygon points="5 3 19 12 5 21 5 3" />
                          </svg>
                        </div>
                        <p className="text-sm font-medium text-text-primary truncate">{m.name}</p>
                        {m.muscleGroup && (
                          <p className="text-xs text-text-secondary mt-0.5 truncate">
                            {m.muscleGroup}
                          </p>
                        )}
                      </Card>
                    </button>
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
        </div>
      </div>

      <MovementPreviewSheet movementId={previewId} onClose={() => setPreviewId(null)} />
    </AppShell>
  );
}

function FilterGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string | null;
  onChange: (next: string | null) => void;
}) {
  if (options.length === 0) return null;
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary mb-2">
        {label}
      </p>
      <div className="flex flex-wrap gap-2">
        <Chip
          tone="soft"
          selected={value === null}
          onClick={() => onChange(null)}
        >
          All
        </Chip>
        {options.map((opt) => (
          <Chip
            key={opt}
            tone="soft"
            selected={value === opt}
            onClick={() => onChange(value === opt ? null : opt)}
          >
            {opt}
          </Chip>
        ))}
      </div>
    </div>
  );
}
