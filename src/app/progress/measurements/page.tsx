"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/state/auth";
import { measurements as measurementsApi } from "@/lib/api/core";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Sheet";
import { DatePicker } from "@/components/ui/DatePicker";
import { LineChart } from "@/components/ui/charts/LineChart";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  BODY_PARTS,
  BODY_PART_LABELS,
  cmToUnit,
  unitToCm,
  type BodyPart,
  type LengthUnit,
  type MeasurementEntry,
} from "@/lib/progress/types";

async function fetchMeasurements(): Promise<MeasurementEntry[]> {
  try {
    const res = (await measurementsApi.getMyMeasurement()) as
      | { data?: MeasurementEntry[]; items?: MeasurementEntry[] }
      | MeasurementEntry[];
    return Array.isArray(res) ? res : res.data ?? res.items ?? [];
  } catch {
    return [];
  }
}

export default function MeasurementsPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const { user, isLoading: authLoading } = useAuth();
  const [unit, setUnit] = useState<LengthUnit>("in");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [authLoading, user, router]);

  const { data: entries = [] } = useQuery({
    queryKey: measurementsApi.keys.list(),
    queryFn: fetchMeasurements,
  });

  const sorted = useMemo(
    () => [...entries].sort((a, b) => a.loggedAt.localeCompare(b.loggedAt)),
    [entries]
  );

  if (authLoading || !user) return null;

  return (
    <AppShell subtitle="Measurements">
      <div className="max-w-4xl mx-auto px-4 lg:px-0 py-6 space-y-6">
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
          <h1 className="text-2xl lg:text-3xl font-bold text-primary">Measurements</h1>
          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-lg border border-border-soft overflow-hidden">
              {(["in", "cm"] as const).map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => setUnit(u)}
                  className={`px-3 py-1.5 text-xs font-medium uppercase transition-colors ${
                    unit === u
                      ? "bg-primary text-white"
                      : "text-text-secondary hover:bg-primary-soft hover:text-primary"
                  }`}
                >
                  {u}
                </button>
              ))}
            </div>
            <Button
              variant="primary"
              fullWidth={false}
              className="!h-10 px-4 text-sm"
              onClick={() => setOpen(true)}
            >
              + Log
            </Button>
          </div>
        </div>

        {sorted.length === 0 ? (
          <Card>
            <EmptyState
              title="No measurements yet"
              description="Log one to start tracking change over time."
              action={
                <Button variant="primary" fullWidth={false} className="!h-11 px-5 text-sm" onClick={() => setOpen(true)}>
                  Log first measurement
                </Button>
              }
            />
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {BODY_PARTS.map((part) => {
              const series = sorted
                .filter((e) => e.values[part] !== undefined)
                .map((e) => ({
                  date: new Date(e.loggedAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  }),
                  value: Math.round(cmToUnit(e.values[part]!, unit) * 10) / 10,
                }));
              if (series.length === 0) return null;
              const first = series[0].value;
              const last = series[series.length - 1].value;
              const delta = Math.round((last - first) * 10) / 10;
              return (
                <Card key={part}>
                  <CardHeader
                    title={BODY_PART_LABELS[part]}
                    subtitle={`${last} ${unit} · ${delta > 0 ? "+" : ""}${delta} ${unit}`}
                  />
                  <CardContent>
                    <LineChart
                      data={series}
                      xKey="date"
                      series={[{ key: "value", label: BODY_PART_LABELS[part] }]}
                      height={120}
                      showGrid={false}
                    />
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <Card>
          <CardHeader title="History" />
          <CardContent>
            {sorted.length === 0 ? (
              <p className="text-sm text-text-secondary">Logged sessions will appear here.</p>
            ) : (
              <ul className="divide-y divide-border-soft">
                {[...sorted].reverse().map((entry) => (
                  <li key={entry.id} className="py-3">
                    <p className="text-sm font-semibold text-text-primary">
                      {new Date(entry.loggedAt).toLocaleDateString(undefined, {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                    <div className="mt-1 grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1 text-xs text-text-secondary">
                      {BODY_PARTS.map((part) =>
                        entry.values[part] !== undefined ? (
                          <div key={part} className="flex justify-between">
                            <span>{BODY_PART_LABELS[part]}</span>
                            <span className="tabular-nums text-text-primary">
                              {Math.round(cmToUnit(entry.values[part]!, unit) * 10) / 10} {unit}
                            </span>
                          </div>
                        ) : null
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <LogMeasurementSheet
        open={open}
        onClose={() => setOpen(false)}
        unit={unit}
        onSaved={() => qc.invalidateQueries({ queryKey: measurementsApi.keys.all })}
      />
    </AppShell>
  );
}

function LogMeasurementSheet({
  open,
  onClose,
  unit,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  unit: LengthUnit;
  onSaved: () => void;
}) {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [values, setValues] = useState<Partial<Record<BodyPart, string>>>({});
  const [error, setError] = useState<string | null>(null);

  const save = useMutation({
    mutationFn: () => {
      const body: Record<string, unknown> = {
        loggedAt: new Date(`${date}T08:00:00`).toISOString(),
      };
      for (const part of BODY_PARTS) {
        const raw = values[part];
        if (raw && raw.trim() !== "") {
          body[part] = unitToCm(Number(raw), unit);
        }
      }
      return measurementsApi.createMeasurement(body as never);
    },
    onSuccess: () => {
      onSaved();
      setValues({});
      onClose();
    },
    onError: (err) => setError(err instanceof Error ? err.message : "Save failed"),
  });

  return (
    <Sheet open={open} onClose={onClose} title="Log measurements" variant="side" width={420}>
      <div className="space-y-4">
        <label className="block">
          <span className="block text-[10px] font-semibold uppercase tracking-wide text-text-secondary mb-1">
            Date
          </span>
          <DatePicker
            value={date}
            onChange={(e) => setDate(e.target.value)}
            max={new Date().toISOString().slice(0, 10)}
            className="w-full"
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          {BODY_PARTS.map((part) => (
            <label key={part} className="block">
              <span className="block text-[10px] font-semibold uppercase tracking-wide text-text-secondary mb-1">
                {BODY_PART_LABELS[part]}
              </span>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  value={values[part] ?? ""}
                  onChange={(e) =>
                    setValues((v) => ({ ...v, [part]: e.target.value }))
                  }
                  className="h-11 w-full px-3 pr-10 rounded-lg border border-border-soft bg-surface text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary tabular-nums"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-secondary">
                  {unit}
                </span>
              </div>
            </label>
          ))}
        </div>

        {error && <p className="text-sm text-danger bg-danger/10 rounded-lg px-3 py-2">{error}</p>}

        <div className="flex gap-2 pt-2">
          <Button type="button" variant="secondary" className="!h-11 text-sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            className="!h-11 text-sm"
            isLoading={save.isPending}
            onClick={() => save.mutate()}
          >
            Save
          </Button>
        </div>
      </div>
    </Sheet>
  );
}
