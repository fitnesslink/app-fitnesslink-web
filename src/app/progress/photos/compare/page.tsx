"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/state/auth";
import { progressPhotos } from "@/lib/api/core";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Slider } from "@/components/ui/Slider";
import { EmptyState } from "@/components/ui/EmptyState";
import type { ProgressPhoto } from "@/lib/progress/types";

async function fetchPhotos(): Promise<ProgressPhoto[]> {
  try {
    const res = (await progressPhotos.getMyProgressPhoto()) as
      | { data?: ProgressPhoto[]; items?: ProgressPhoto[] }
      | ProgressPhoto[];
    return Array.isArray(res) ? res : res.data ?? res.items ?? [];
  } catch {
    return [];
  }
}

type Mode = "side-by-side" | "overlay";

export default function PhotoComparePage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [leftId, setLeftId] = useState<string | null>(null);
  const [rightId, setRightId] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>("side-by-side");
  const [opacity, setOpacity] = useState(50);

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [authLoading, user, router]);

  const { data: photos = [] } = useQuery({
    queryKey: progressPhotos.keys.list(),
    queryFn: fetchPhotos,
  });

  const sorted = useMemo(
    () => [...photos].sort((a, b) => a.loggedAt.localeCompare(b.loggedAt)),
    [photos]
  );

  useEffect(() => {
    if (sorted.length >= 2 && (!leftId || !rightId)) {
      setLeftId((prev) => prev ?? sorted[0].id);
      setRightId((prev) => prev ?? sorted[sorted.length - 1].id);
    }
  }, [sorted, leftId, rightId]);

  const left = sorted.find((p) => p.id === leftId) ?? null;
  const right = sorted.find((p) => p.id === rightId) ?? null;

  if (authLoading || !user) return null;

  return (
    <AppShell subtitle="Compare photos">
      <div className="max-w-5xl mx-auto px-4 lg:px-0 py-6 space-y-6">
        <Link
          href="/progress/photos"
          className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-primary"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Gallery
        </Link>

        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="text-2xl lg:text-3xl font-bold text-primary">Compare</h1>
          <div className="inline-flex rounded-lg border border-border-soft overflow-hidden">
            {(["side-by-side", "overlay"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                  mode === m
                    ? "bg-primary text-white"
                    : "text-text-secondary hover:bg-primary-soft hover:text-primary"
                }`}
              >
                {m === "side-by-side" ? "Side-by-side" : "Overlay"}
              </button>
            ))}
          </div>
        </div>

        {sorted.length < 2 ? (
          <Card>
            <EmptyState
              title="Need at least two photos"
              description="Add a second photo to start comparing."
            />
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <PickerCard
                label="A"
                photos={sorted}
                selectedId={leftId}
                onSelect={setLeftId}
              />
              <PickerCard
                label="B"
                photos={sorted}
                selectedId={rightId}
                onSelect={setRightId}
              />
            </div>

            {left && right && (
              <Card>
                <CardContent>
                  {mode === "side-by-side" ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <PhotoPane label={`A · ${dateLabel(left.loggedAt)}`} photo={left} />
                      <PhotoPane label={`B · ${dateLabel(right.loggedAt)}`} photo={right} />
                    </div>
                  ) : (
                    <div>
                      <div className="relative aspect-[2/3] max-w-md mx-auto rounded-xl overflow-hidden bg-primary-soft">
                        <Image
                          src={left.imageUrl}
                          alt="A"
                          fill
                          unoptimized
                          sizes="400px"
                          className="object-cover"
                        />
                        <Image
                          src={right.imageUrl}
                          alt="B"
                          fill
                          unoptimized
                          sizes="400px"
                          className="object-cover transition-opacity"
                          style={{ opacity: opacity / 100 }}
                        />
                        <div className="absolute inset-x-0 bottom-0 flex justify-between px-3 py-2 text-[11px] font-semibold uppercase tracking-wide bg-gradient-to-t from-black/70 to-transparent text-white">
                          <span>A · {dateLabel(left.loggedAt)}</span>
                          <span>B · {dateLabel(right.loggedAt)}</span>
                        </div>
                      </div>
                      <div className="mt-4 max-w-md mx-auto">
                        <div className="flex items-center justify-between text-xs text-text-secondary mb-1">
                          <span>A</span>
                          <span className="tabular-nums">{opacity}% B</span>
                          <span>B</span>
                        </div>
                        <Slider
                          min={0}
                          max={100}
                          step={1}
                          value={opacity}
                          onChange={(e) => setOpacity(Number(e.target.value))}
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}

function dateLabel(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function PickerCard({
  label,
  photos,
  selectedId,
  onSelect,
}: {
  label: string;
  photos: ProgressPhoto[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <Card density="compact">
      <CardHeader title={`Photo ${label}`} />
      <CardContent>
        <select
          value={selectedId ?? ""}
          onChange={(e) => onSelect(e.target.value)}
          className="w-full h-11 px-3 rounded-lg border border-border-soft bg-surface text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
        >
          {photos.map((p) => (
            <option key={p.id} value={p.id}>
              {dateLabel(p.loggedAt)} · {p.angle}
            </option>
          ))}
        </select>
      </CardContent>
    </Card>
  );
}

function PhotoPane({ label, photo }: { label: string; photo: ProgressPhoto }) {
  return (
    <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-primary-soft">
      <Image
        src={photo.imageUrl}
        alt={label}
        fill
        unoptimized
        sizes="(max-width: 640px) 100vw, 400px"
        className="object-cover"
      />
      <span className="absolute inset-x-0 bottom-0 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide bg-gradient-to-t from-black/70 to-transparent text-white">
        {label}
      </span>
    </div>
  );
}
