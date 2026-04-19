"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/state/auth";
import { weight as weightApi } from "@/lib/api/core";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { DatePicker } from "@/components/ui/DatePicker";
import { StatCard } from "@/components/ui/StatCard";
import { LineChart } from "@/components/ui/charts/LineChart";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  kgToUnit,
  placeholderWeight,
  unitToKg,
  type WeightEntry,
  type WeightUnit,
} from "@/lib/progress/types";

async function fetchWeight(): Promise<WeightEntry[]> {
  try {
    const res = (await weightApi.getMyWeight()) as { items?: WeightEntry[] } | WeightEntry[];
    const items = Array.isArray(res) ? res : res.items ?? [];
    return items.length > 0 ? items : placeholderWeight();
  } catch {
    return placeholderWeight();
  }
}

export default function WeightLogPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const { user, isLoading: authLoading } = useAuth();
  const [unit, setUnit] = useState<WeightUnit>("lbs");
  const [newWeight, setNewWeight] = useState("");
  const [newDate, setNewDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [authLoading, user, router]);

  const { data: entries = [] } = useQuery({
    queryKey: weightApi.keys.list(),
    queryFn: fetchWeight,
  });

  const add = useMutation({
    mutationFn: () => {
      const kg = unitToKg(Number(newWeight), unit);
      return weightApi.createWeight({
        weight: kg,
        loggedAt: new Date(`${newDate}T08:00:00`).toISOString(),
      } as never);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: weightApi.keys.all });
      setNewWeight("");
    },
    onError: (err) => setError(err instanceof Error ? err.message : "Couldn't save"),
  });

  const del = useMutation({
    mutationFn: (id: string) => weightApi.deleteWeight(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: weightApi.keys.all }),
  });

  const sorted = useMemo(
    () => [...entries].sort((a, b) => a.loggedAt.localeCompare(b.loggedAt)),
    [entries]
  );

  const chartData = sorted.map((e) => ({
    date: new Date(e.loggedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    weight: Math.round(kgToUnit(e.weight, unit) * 10) / 10,
  }));

  const latest = sorted[sorted.length - 1];
  const previous = sorted[sorted.length - 2];
  const start = sorted[0];
  const deltaSession = latest && previous ? latest.weight - previous.weight : 0;
  const deltaAll = latest && start ? latest.weight - start.weight : 0;

  if (authLoading || !user) return null;

  return (
    <AppShell subtitle="Weight log">
      <div className="max-w-3xl mx-auto px-4 lg:px-0 py-6 space-y-6">
        <Link
          href="/progress"
          className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-primary"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Progress
        </Link>

        <div className="flex items-center justify-between">
          <h1 className="text-2xl lg:text-3xl font-bold text-primary">Weight</h1>
          <UnitToggle unit={unit} onChange={setUnit} />
        </div>

        {latest && (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            <StatCard
              label="Current"
              value={`${Math.round(kgToUnit(latest.weight, unit) * 10) / 10} ${unit}`}
            />
            <StatCard
              label="Vs previous"
              value={`${deltaSession > 0 ? "+" : ""}${Math.round(kgToUnit(Math.abs(deltaSession), unit) * 10) / 10} ${unit}`}
              accent={deltaSession <= 0 ? "primary" : "orange"}
            />
            <StatCard
              label="Since start"
              value={`${deltaAll > 0 ? "+" : ""}${Math.round(kgToUnit(Math.abs(deltaAll), unit) * 10) / 10} ${unit}`}
              accent={deltaAll <= 0 ? "primary" : "orange"}
            />
          </div>
        )}

        <Card>
          <CardHeader title="Trend" subtitle={`Last ${sorted.length} entries`} />
          <CardContent>
            {chartData.length === 0 ? (
              <EmptyState title="No entries yet" />
            ) : (
              <LineChart
                data={chartData}
                xKey="date"
                series={[{ key: "weight", label: `Weight (${unit})` }]}
                height={240}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Add entry" />
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Input
                  type="number"
                  step="0.1"
                  placeholder={`Weight (${unit})`}
                  value={newWeight}
                  onChange={(e) => setNewWeight(e.target.value)}
                />
              </div>
              <DatePicker
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                max={new Date().toISOString().slice(0, 10)}
              />
              <Button
                type="button"
                variant="primary"
                fullWidth={false}
                className="!h-11 px-5 text-sm"
                isLoading={add.isPending}
                disabled={!newWeight}
                onClick={() => add.mutate()}
              >
                Log
              </Button>
            </div>
            {error && (
              <p className="mt-3 text-sm text-danger bg-danger/10 rounded-lg px-3 py-2">{error}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="History" />
          <CardContent>
            {sorted.length === 0 ? (
              <EmptyState title="Nothing logged yet" />
            ) : (
              <ul className="divide-y divide-border-soft">
                {[...sorted].reverse().map((entry) => (
                  <li key={entry.id} className="flex items-center gap-3 py-2.5">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-text-primary">
                        {Math.round(kgToUnit(entry.weight, unit) * 10) / 10} {unit}
                      </p>
                      <p className="text-xs text-text-secondary">
                        {new Date(entry.loggedAt).toLocaleDateString(undefined, {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => del.mutate(entry.id)}
                      aria-label="Delete entry"
                      className="w-8 h-8 rounded-md text-text-secondary hover:bg-danger/10 hover:text-danger flex items-center justify-center"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

function UnitToggle<T extends string>({
  unit,
  onChange,
  options = ["lbs", "kg"] as unknown as readonly T[],
}: {
  unit: T;
  onChange: (next: T) => void;
  options?: readonly T[];
}) {
  return (
    <div className="inline-flex rounded-lg border border-border-soft overflow-hidden">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`px-3 py-1.5 text-xs font-medium uppercase transition-colors ${
            unit === opt
              ? "bg-primary text-white"
              : "text-text-secondary hover:bg-primary-soft hover:text-primary"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}
