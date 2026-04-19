"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/state/auth";
import { progressPhotos } from "@/lib/api/core";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Sheet } from "@/components/ui/Sheet";
import { DatePicker } from "@/components/ui/DatePicker";
import { PhotosEmpty } from "@/components/ui/empty-states";
import {
  placeholderPhotos,
  type PhotoAngle,
  type ProgressPhoto,
} from "@/lib/progress/types";

const ANGLES: PhotoAngle[] = ["front", "side", "back"];

async function fetchPhotos(): Promise<ProgressPhoto[]> {
  try {
    const res = (await progressPhotos.getMyProgressPhoto()) as
      | { items?: ProgressPhoto[] }
      | ProgressPhoto[];
    const items = Array.isArray(res) ? res : res.items ?? [];
    return items.length > 0 ? items : placeholderPhotos();
  } catch {
    return placeholderPhotos();
  }
}

export default function ProgressPhotosGalleryPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const { user, isLoading: authLoading } = useAuth();
  const [angleFilter, setAngleFilter] = useState<PhotoAngle | "all">("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [detail, setDetail] = useState<ProgressPhoto | null>(null);

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [authLoading, user, router]);

  const { data: photos = [] } = useQuery({
    queryKey: progressPhotos.keys.list(),
    queryFn: fetchPhotos,
  });

  const del = useMutation({
    mutationFn: (id: string) => progressPhotos.deleteProgressPhoto(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: progressPhotos.keys.all });
      setDetail(null);
    },
  });

  const filtered = useMemo(() => {
    return photos.filter((p) => {
      if (angleFilter !== "all" && p.angle !== angleFilter) return false;
      if (from && p.loggedAt < from) return false;
      if (to && p.loggedAt > to + "T23:59:59") return false;
      return true;
    });
  }, [photos, angleFilter, from, to]);

  const grouped = useMemo(() => {
    const map = new Map<string, ProgressPhoto[]>();
    for (const p of filtered) {
      const key = p.loggedAt.slice(0, 10);
      const list = map.get(key) ?? [];
      list.push(p);
      map.set(key, list);
    }
    return Array.from(map.entries()).sort(([a], [b]) => b.localeCompare(a));
  }, [filtered]);

  if (authLoading || !user) return null;

  return (
    <AppShell subtitle="Progress photos">
      <div className="max-w-5xl mx-auto px-4 lg:px-0 py-6 space-y-6">
        <Link
          href="/progress"
          className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-primary"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Progress
        </Link>

        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="text-2xl lg:text-3xl font-bold text-primary">Photos</h1>
          <div className="flex gap-2">
            <Link href="/progress/photos/compare">
              <Button variant="secondary" fullWidth={false} className="!h-10 px-4 text-sm">
                Compare
              </Button>
            </Link>
            <Link href="/progress/photos/new">
              <Button variant="primary" fullWidth={false} className="!h-10 px-4 text-sm">
                + Add
              </Button>
            </Link>
          </div>
        </div>

        <Card>
          <CardContent>
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
                Angle
              </span>
              <div className="flex flex-wrap gap-2">
                <Chip tone="soft" selected={angleFilter === "all"} onClick={() => setAngleFilter("all")}>
                  All
                </Chip>
                {ANGLES.map((a) => (
                  <Chip
                    key={a}
                    tone="soft"
                    selected={angleFilter === a}
                    onClick={() => setAngleFilter(a)}
                  >
                    {a.charAt(0).toUpperCase() + a.slice(1)}
                  </Chip>
                ))}
              </div>
              <span className="text-xs font-semibold uppercase tracking-wide text-text-secondary ml-auto">
                Range
              </span>
              <DatePicker value={from} onChange={(e) => setFrom(e.target.value)} />
              <DatePicker value={to} onChange={(e) => setTo(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        {filtered.length === 0 ? (
          <Card>
            <PhotosEmpty
              action={
                <Link href="/progress/photos/new">
                  <Button variant="primary" fullWidth={false} className="!h-11 px-5 text-sm">
                    Add photo
                  </Button>
                </Link>
              }
            />
          </Card>
        ) : (
          grouped.map(([date, entries]) => (
            <section key={date}>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-text-secondary mb-3">
                {new Date(date).toLocaleDateString(undefined, {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {entries.map((photo) => (
                  <button
                    key={photo.id}
                    type="button"
                    onClick={() => setDetail(photo)}
                    className="relative block rounded-xl overflow-hidden border border-border-soft hover:border-primary transition-colors"
                  >
                    <div className="aspect-[2/3] relative bg-primary-soft">
                      <Image
                        src={photo.imageUrl}
                        alt={`${photo.angle} photo`}
                        fill
                        unoptimized
                        sizes="(max-width: 768px) 50vw, 25vw"
                        className="object-cover"
                      />
                    </div>
                    <span className="absolute top-2 left-2 bg-black/60 text-white text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full">
                      {photo.angle}
                    </span>
                  </button>
                ))}
              </div>
            </section>
          ))
        )}
      </div>

      <Sheet
        open={!!detail}
        onClose={() => setDetail(null)}
        title={detail ? `${detail.angle.toUpperCase()} · ${new Date(detail.loggedAt).toLocaleDateString()}` : ""}
        variant="side"
        width={460}
      >
        {detail && (
          <div className="space-y-4">
            <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-primary-soft">
              <Image
                src={detail.imageUrl}
                alt={`${detail.angle} photo`}
                fill
                unoptimized
                sizes="460px"
                className="object-cover"
              />
            </div>
            <div className="text-sm text-text-secondary space-y-1">
              <p>
                <span className="font-semibold text-text-primary">Angle:</span>{" "}
                {detail.angle.charAt(0).toUpperCase() + detail.angle.slice(1)}
              </p>
              {detail.weightKg !== undefined && (
                <p>
                  <span className="font-semibold text-text-primary">Weight:</span>{" "}
                  {Math.round(detail.weightKg * 10) / 10} kg
                </p>
              )}
              {detail.note && (
                <p>
                  <span className="font-semibold text-text-primary">Note:</span> {detail.note}
                </p>
              )}
            </div>
            <Button
              type="button"
              variant="secondary"
              className="!h-11 text-sm !text-danger"
              isLoading={del.isPending}
              onClick={() => del.mutate(detail.id)}
            >
              Delete photo
            </Button>
          </div>
        )}
      </Sheet>
    </AppShell>
  );
}
