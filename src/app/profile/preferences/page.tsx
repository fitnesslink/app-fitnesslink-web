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
import { Select } from "@/components/ui/Select";
import { DEFAULT_PREFS, type Preferences, type ThemePref, type UnitSystem } from "@/lib/profile/types";

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "es", label: "Español" },
  { value: "fr", label: "Français" },
  { value: "de", label: "Deutsch" },
  { value: "pt", label: "Português" },
];

export default function PreferencesPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [prefs, setPrefs] = useState<Preferences>(DEFAULT_PREFS);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [authLoading, user, router]);

  const save = useMutation({
    mutationFn: async () => {
      if (!user) return;
      return users.preferencesUser(user.id, prefs as never);
    },
    onSuccess: () => router.push("/profile"),
    onError: (err) => setError(err instanceof Error ? err.message : "Save failed"),
  });

  function setUnitSystem(system: UnitSystem) {
    setPrefs((p) => ({
      ...p,
      unitSystem: system,
      weightUnit: system === "metric" ? "kg" : "lbs",
      lengthUnit: system === "metric" ? "cm" : "in",
    }));
  }

  if (authLoading || !user) return null;

  return (
    <AppShell subtitle="Preferences">
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
          <CardHeader title="Units" subtitle="Apply across weight + measurements" />
          <CardContent>
            <Segmented
              value={prefs.unitSystem}
              options={[
                { value: "imperial", label: "Imperial (lbs / in)" },
                { value: "metric", label: "Metric (kg / cm)" },
              ]}
              onChange={(v) => setUnitSystem(v as UnitSystem)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Language" />
          <CardContent>
            <Select
              options={LANGUAGES}
              value={prefs.language}
              onChange={(e) => setPrefs((p) => ({ ...p, language: e.target.value }))}
              className="w-full"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Theme" />
          <CardContent>
            <Segmented
              value={prefs.theme}
              options={[
                { value: "light", label: "Light" },
                { value: "dark", label: "Dark" },
                { value: "system", label: "System" },
              ]}
              onChange={(v) => setPrefs((p) => ({ ...p, theme: v as ThemePref }))}
            />
            <p className="mt-2 text-xs text-text-secondary">
              Dark mode styling lands in P15 polish; the preference persists now so it's applied
              automatically when the theme swap ships.
            </p>
          </CardContent>
        </Card>

        {error && <p className="text-sm text-danger bg-danger/10 rounded-lg px-3 py-2">{error}</p>}

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

function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: Array<{ value: T; label: string }>;
  onChange: (next: T) => void;
}) {
  return (
    <div className="inline-flex rounded-lg border border-border-soft overflow-hidden w-full">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${
            opt.value === value
              ? "bg-primary text-white"
              : "text-text-secondary hover:bg-primary-soft hover:text-primary"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
