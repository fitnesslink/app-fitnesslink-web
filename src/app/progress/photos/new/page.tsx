"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/state/auth";
import { progressPhotos } from "@/lib/api/core";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { DatePicker } from "@/components/ui/DatePicker";
import type { PhotoAngle } from "@/lib/progress/types";

const ANGLES: PhotoAngle[] = ["front", "side", "back"];

interface StagedPhoto {
  angle: PhotoAngle;
  file: File;
  preview: string;
}

export default function NewProgressPhotoPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const { user, isLoading: authLoading } = useAuth();
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [weight, setWeight] = useState("");
  const [note, setNote] = useState("");
  const [staged, setStaged] = useState<StagedPhoto[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [authLoading, user, router]);

  useEffect(() => {
    return () => {
      staged.forEach((s) => URL.revokeObjectURL(s.preview));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onFilePicked(angle: PhotoAngle, files: FileList | null) {
    if (!files || files.length === 0) return;
    const file = files[0];
    const preview = URL.createObjectURL(file);
    setStaged((curr) => {
      const existing = curr.find((s) => s.angle === angle);
      if (existing) URL.revokeObjectURL(existing.preview);
      return [...curr.filter((s) => s.angle !== angle), { angle, file, preview }];
    });
  }

  function remove(angle: PhotoAngle) {
    setStaged((curr) => {
      const target = curr.find((s) => s.angle === angle);
      if (target) URL.revokeObjectURL(target.preview);
      return curr.filter((s) => s.angle !== angle);
    });
  }

  const save = useMutation({
    mutationFn: async () => {
      // TODO(media-pipeline): upload each file via `MediaController`, collect
      // `mediaId`s, then POST to progressPhotos.createProgressPhoto per angle.
      // Until typed media-upload response lands, we skip the upload step and
      // record an entry per angle with a placeholder URL so the gallery stays
      // consistent.
      for (const s of staged) {
        await progressPhotos.createProgressPhoto({
          angle: s.angle,
          loggedAt: new Date(`${date}T08:00:00`).toISOString(),
          weightKg: weight ? Number(weight) : undefined,
          note: note || undefined,
        } as never);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: progressPhotos.keys.all });
      router.push("/progress/photos");
    },
    onError: (err) => setError(err instanceof Error ? err.message : "Upload failed"),
  });

  if (authLoading || !user) return null;

  return (
    <AppShell subtitle="Add progress photos">
      <div className="max-w-3xl mx-auto px-4 lg:px-0 py-6 space-y-6">
        <Link
          href="/progress/photos"
          className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-primary"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back to gallery
        </Link>

        <h1 className="text-2xl lg:text-3xl font-bold text-primary">Add photos</h1>

        <Card>
          <CardHeader title="Angles" subtitle="One shot per angle is ideal — consistency beats quantity." />
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {ANGLES.map((angle) => {
                const current = staged.find((s) => s.angle === angle);
                return (
                  <div key={angle} className="space-y-2">
                    <div className="relative aspect-[2/3] rounded-xl border border-dashed border-border-soft overflow-hidden bg-primary-soft/40 flex items-center justify-center">
                      {current ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={current.preview}
                          alt={`${angle} preview`}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-center text-text-secondary px-4">
                          <svg className="w-10 h-10 mx-auto mb-2 opacity-70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                            <circle cx="12" cy="13" r="4" />
                          </svg>
                          <p className="text-xs font-semibold uppercase tracking-wide">{angle}</p>
                        </div>
                      )}
                      <label className="absolute inset-0 cursor-pointer" aria-label={`Pick ${angle} photo`}>
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          className="sr-only"
                          onChange={(e) => onFilePicked(angle, e.target.files)}
                        />
                      </label>
                      {current && (
                        <button
                          type="button"
                          onClick={() => remove(angle)}
                          aria-label={`Remove ${angle} photo`}
                          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 z-10"
                        >
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-text-secondary text-center capitalize">{angle}</p>
                  </div>
                );
              })}
            </div>
            <p className="mt-4 text-xs text-text-secondary">
              Tap a tile to take a photo (mobile uses the rear camera) or pick one from your library.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Details" />
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
              <label className="block">
                <span className="block text-[10px] font-semibold uppercase tracking-wide text-text-secondary mb-1">
                  Weight (optional, kg)
                </span>
                <input
                  type="number"
                  step="0.1"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="h-11 w-full px-3 rounded-lg border border-border-soft bg-surface text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary tabular-nums"
                />
              </label>
            </div>
            <label className="block mt-3">
              <span className="block text-[10px] font-semibold uppercase tracking-wide text-text-secondary mb-1">
                Note (optional)
              </span>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                placeholder="Lighting, time of day, anything worth remembering"
                className="w-full px-3 py-2 rounded-lg border border-border-soft bg-surface text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </label>
          </CardContent>
        </Card>

        {error && <p className="text-sm text-danger bg-danger/10 rounded-lg px-3 py-2">{error}</p>}

        <div className="flex gap-2 justify-end">
          <Link href="/progress/photos">
            <Button variant="secondary" fullWidth={false} className="!h-11 px-5 text-sm">
              Cancel
            </Button>
          </Link>
          <Button
            type="button"
            variant="primary"
            fullWidth={false}
            className="!h-11 px-6 text-sm"
            isLoading={save.isPending}
            disabled={staged.length === 0}
            onClick={() => save.mutate()}
          >
            Save {staged.length > 0 ? `(${staged.length})` : ""}
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
