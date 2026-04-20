"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/lib/state/auth";
import { users } from "@/lib/api/core";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Avatar } from "@/components/ui/Avatar";
import { DatePicker } from "@/components/ui/DatePicker";
import type { TrainingLevel } from "@/lib/profile/types";

const LEVELS: TrainingLevel[] = ["beginner", "intermediate", "advanced"];

export default function PersonalInfoPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [bio, setBio] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [level, setLevel] = useState<TrainingLevel>("beginner");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [authLoading, user, router]);

  useEffect(() => {
    setFirstName(user?.firstName ?? "");
    setLastName(user?.lastName ?? "");
  }, [user]);

  const save = useMutation({
    mutationFn: async () => {
      if (!user) return;
      return users.updateUser(user.id, {
        firstName,
        lastName,
        bio,
        birthDate: birthDate || undefined,
        heightCm: heightCm ? Number(heightCm) : undefined,
        weightKg: weightKg ? Number(weightKg) : undefined,
        trainingLevel: level,
      } as never);
    },
    onSuccess: () => router.push("/profile"),
    onError: (err) => setError(err instanceof Error ? err.message : "Save failed"),
  });

  if (authLoading || !user) return null;

  return (
    <AppShell subtitle="Personal info">
      <div className="max-w-2xl mx-auto px-4 lg:px-0 py-6 space-y-6">
        <Link
          href="/profile"
          className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-primary"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Profile
        </Link>

        <Card>
          <CardHeader title="Avatar" />
          <CardContent>
            <div className="flex items-center gap-4">
              {avatarPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarPreview}
                  alt="Avatar preview"
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <Avatar name={`${firstName} ${lastName}`} size="xl" />
              )}
              <label className="cursor-pointer">
                <span className="inline-flex items-center h-10 px-4 rounded-full border border-border-soft text-sm font-medium text-text-primary hover:bg-primary-soft">
                  Change photo
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
                      setAvatarPreview(URL.createObjectURL(file));
                    }
                  }}
                />
              </label>
            </div>
            <p className="mt-2 text-xs text-text-secondary">
              Image will upload via `MediaController` when the typed media endpoint lands.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Details" />
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input placeholder="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              <Input placeholder="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
              <Input type="email" placeholder="Email" value={user.email} readOnly className="opacity-60" />
              <DatePicker value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
              <label className="block">
                <span className="block text-[10px] font-semibold uppercase tracking-wide text-text-secondary mb-1">Height (cm)</span>
                <Input type="number" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} />
              </label>
              <label className="block">
                <span className="block text-[10px] font-semibold uppercase tracking-wide text-text-secondary mb-1">Baseline weight (kg)</span>
                <Input type="number" step="0.1" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} />
              </label>
              <label className="block sm:col-span-2">
                <span className="block text-[10px] font-semibold uppercase tracking-wide text-text-secondary mb-1">Training level</span>
                <Select
                  options={LEVELS.map((l) => ({ value: l, label: l[0].toUpperCase() + l.slice(1) }))}
                  value={level}
                  onChange={(e) => setLevel(e.target.value as TrainingLevel)}
                  className="w-full"
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="block text-[10px] font-semibold uppercase tracking-wide text-text-secondary mb-1">Bio</span>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border-soft bg-surface text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </label>
            </div>
            {error && <p className="mt-3 text-sm text-danger bg-danger/10 rounded-lg px-3 py-2">{error}</p>}
          </CardContent>
        </Card>

        <div className="flex gap-2 justify-end">
          <Link href="/profile">
            <Button variant="secondary" fullWidth={false} className="!h-11 px-5 text-sm">Cancel</Button>
          </Link>
          <Button
            type="button"
            variant="primary"
            fullWidth={false}
            className="!h-11 px-6 text-sm"
            isLoading={save.isPending}
            onClick={() => save.mutate()}
          >
            Save
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
