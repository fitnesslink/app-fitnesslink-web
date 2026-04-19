"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/state/auth";
import { grocery } from "@/lib/api/nutrition";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { placeholderGrocery, type GroceryItem } from "@/lib/nutrition/types";

async function fetchGrocery(): Promise<GroceryItem[]> {
  try {
    const res = (await grocery.getMyGrocery()) as
      | { items?: GroceryItem[] }
      | GroceryItem[];
    const items = Array.isArray(res) ? res : res.items ?? [];
    return items.length > 0 ? items : placeholderGrocery();
  } catch {
    return placeholderGrocery();
  }
}

export default function GroceryListPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const { user, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [authLoading, user, router]);

  const { data: items = [] } = useQuery({
    queryKey: grocery.keys.list(),
    queryFn: fetchGrocery,
  });

  // Optimistic client-side copy so checkbox toggles feel instant even when
  // the backend mutation is slow or unauthenticated.
  const [localChecked, setLocalChecked] = useState<Record<string, boolean>>({});

  const toggle = useMutation({
    mutationFn: (id: string) => grocery.toggleGrocery(id, {} as never),
    onSuccess: () => qc.invalidateQueries({ queryKey: grocery.keys.all }),
  });

  const del = useMutation({
    mutationFn: (id: string) => grocery.deleteGrocery(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: grocery.keys.all }),
  });

  const regenerate = useMutation({
    mutationFn: () => grocery.generateGrocery({} as never),
    onSuccess: () => qc.invalidateQueries({ queryKey: grocery.keys.all }),
  });

  const byCategory = useMemo(() => {
    const map = new Map<string, GroceryItem[]>();
    for (const item of items) {
      const list = map.get(item.category) ?? [];
      list.push(item);
      map.set(item.category, list);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [items]);

  const uncheckedCount = items.filter(
    (i) => localChecked[i.id] ?? !i.checked
  ).length;

  if (authLoading || !user) return null;

  return (
    <AppShell subtitle="Grocery list">
      <div className="max-w-3xl mx-auto px-4 lg:px-0 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/nutrition"
            className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-primary"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Nutrition
          </Link>
          <Button
            type="button"
            variant="secondary"
            fullWidth={false}
            className="!h-10 px-4 text-sm"
            isLoading={regenerate.isPending}
            onClick={() => regenerate.mutate()}
          >
            Regenerate
          </Button>
        </div>

        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-primary mb-1">Grocery list</h1>
          <p className="text-sm text-text-secondary">
            {uncheckedCount} item{uncheckedCount === 1 ? "" : "s"} remaining
          </p>
        </div>

        {items.length === 0 ? (
          <Card>
            <EmptyState
              title="List is empty"
              description="Generate a list from your meal plan, or add items by hand."
              action={
                <Button
                  variant="primary"
                  fullWidth={false}
                  className="!h-11 px-5 text-sm"
                  onClick={() => regenerate.mutate()}
                  isLoading={regenerate.isPending}
                >
                  Generate from meal plan
                </Button>
              }
            />
          </Card>
        ) : (
          byCategory.map(([cat, list]) => (
            <Card key={cat}>
              <CardContent>
                <h2 className="text-xs font-semibold uppercase tracking-wide text-text-secondary mb-3">
                  {cat}
                </h2>
                <ul className="divide-y divide-border-soft">
                  {list.map((item) => {
                    const checked = localChecked[item.id] ?? item.checked;
                    return (
                      <li key={item.id}>
                        <div className="flex items-center gap-3 py-2">
                          <button
                            type="button"
                            onClick={() => {
                              setLocalChecked((s) => ({ ...s, [item.id]: !checked }));
                              toggle.mutate(item.id);
                            }}
                            aria-pressed={checked}
                            aria-label={`Toggle ${item.name}`}
                            className={`w-6 h-6 rounded border-2 shrink-0 flex items-center justify-center transition-colors ${
                              checked
                                ? "bg-primary border-primary text-white"
                                : "border-border hover:border-primary"
                            }`}
                          >
                            {checked && (
                              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            )}
                          </button>
                          <div className="min-w-0 flex-1">
                            <p
                              className={`text-sm font-medium truncate ${
                                checked ? "text-text-secondary line-through" : "text-text-primary"
                              }`}
                            >
                              {item.name}
                            </p>
                            <p className="text-xs text-text-secondary">{item.quantity}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => del.mutate(item.id)}
                            aria-label={`Delete ${item.name}`}
                            className="w-8 h-8 rounded-md text-text-secondary hover:bg-danger/10 hover:text-danger flex items-center justify-center"
                          >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                            </svg>
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </AppShell>
  );
}
