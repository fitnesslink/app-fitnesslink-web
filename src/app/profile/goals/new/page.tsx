"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/lib/state/auth";
import { goals as goalsApi } from "@/lib/api/core";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { DatePicker } from "@/components/ui/DatePicker";
import { Chip } from "@/components/ui/Chip";
import type { GoalDirection } from "@/lib/profile/types";

const STEPS = ["Name", "Target", "Direction", "Habits", "Date"] as const;
type Step = (typeof STEPS)[number];

const SUGGESTED_HABITS = [
  { id: "h1", title: "Morning stretch" },
  { id: "h2", title: "Drink 3L water" },
  { id: "h3", title: "Strength session" },
  { id: "h4", title: "Easy run" },
  { id: "h5", title: "No-snooze wake-up" },
];

export default function NewGoalPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const [step, setStep] = useState<Step>("Name");
  const [title, setTitle] = useState("");
  const [identity, setIdentity] = useState("");
  const [targetValue, setTargetValue] = useState("");
  const [targetUnit, setTargetUnit] = useState("kg");
  const [direction, setDirection] = useState<GoalDirection>("increase");
  const [habitIds, setHabitIds] = useState<string[]>([]);
  const [targetDate, setTargetDate] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [authLoading, user, router]);

  const stepIndex = STEPS.indexOf(step);
  const canAdvance = useMemo(() => {
    switch (step) {
      case "Name":
        return title.trim().length > 0;
      case "Target":
        return !!targetValue && targetUnit.length > 0;
      case "Direction":
        return true;
      case "Habits":
        return true;
      case "Date":
        return true;
    }
  }, [step, title, targetValue, targetUnit]);

  const save = useMutation({
    mutationFn: () =>
      goalsApi.createGoal({
        title,
        identityStatement: identity || undefined,
        targetValue: Number(targetValue),
        targetUnit,
        direction,
        targetDate: targetDate || undefined,
        linkedHabitIds: habitIds,
      } as never),
    onSuccess: () => router.push("/profile/goals"),
    onError: (err) => setError(err instanceof Error ? err.message : "Save failed"),
  });

  function next() {
    if (stepIndex < STEPS.length - 1) setStep(STEPS[stepIndex + 1]);
    else save.mutate();
  }
  function back() {
    if (stepIndex === 0) router.push("/profile/goals");
    else setStep(STEPS[stepIndex - 1]);
  }

  if (authLoading || !user) return null;

  return (
    <AppShell subtitle="New goal">
      <div className="max-w-xl mx-auto px-4 lg:px-0 py-6 space-y-6">
        <Link
          href="/profile/goals"
          className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-primary"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Goals
        </Link>

        {/* Step indicator */}
        <div className="flex items-center gap-2">
          {STEPS.map((label, i) => (
            <div key={label} className="flex-1 flex items-center gap-2">
              <div
                className={`h-1.5 flex-1 rounded-full ${
                  i <= stepIndex ? "bg-primary" : "bg-border-soft"
                }`}
              />
            </div>
          ))}
        </div>
        <p className="text-xs text-text-secondary tabular-nums">
          Step {stepIndex + 1} of {STEPS.length} · {step}
        </p>

        <Card>
          <CardHeader title={questionFor(step)} subtitle={hintFor(step)} />
          <CardContent>
            {step === "Name" && (
              <div className="space-y-3">
                <Input
                  placeholder="e.g. Bench press 225 lbs"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  autoFocus
                />
                <textarea
                  placeholder="Identity statement (optional) — 'I am the kind of person who…'"
                  value={identity}
                  onChange={(e) => setIdentity(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-border-soft bg-surface text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>
            )}
            {step === "Target" && (
              <div className="grid grid-cols-[1fr_auto] gap-3">
                <Input
                  type="number"
                  step="0.1"
                  placeholder="Target value"
                  value={targetValue}
                  onChange={(e) => setTargetValue(e.target.value)}
                  autoFocus
                />
                <Input
                  placeholder="unit"
                  value={targetUnit}
                  onChange={(e) => setTargetUnit(e.target.value)}
                  className="!w-28"
                />
              </div>
            )}
            {step === "Direction" && (
              <div className="grid grid-cols-2 gap-3">
                <DirectionOption
                  selected={direction === "increase"}
                  onClick={() => setDirection("increase")}
                  title="Increase"
                  desc="Push the number up"
                />
                <DirectionOption
                  selected={direction === "decrease"}
                  onClick={() => setDirection("decrease")}
                  title="Decrease"
                  desc="Bring the number down"
                />
              </div>
            )}
            {step === "Habits" && (
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_HABITS.map((h) => (
                  <Chip
                    key={h.id}
                    tone="soft"
                    selected={habitIds.includes(h.id)}
                    onClick={() =>
                      setHabitIds((curr) =>
                        curr.includes(h.id) ? curr.filter((id) => id !== h.id) : [...curr, h.id]
                      )
                    }
                  >
                    {h.title}
                  </Chip>
                ))}
              </div>
            )}
            {step === "Date" && (
              <DatePicker
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                min={new Date().toISOString().slice(0, 10)}
                className="w-full"
              />
            )}
            {error && <p className="mt-3 text-sm text-danger bg-danger/10 rounded-lg px-3 py-2">{error}</p>}
          </CardContent>
        </Card>

        <div className="flex gap-2 justify-end">
          <Button variant="secondary" fullWidth={false} className="!h-11 px-5 text-sm" onClick={back}>
            {stepIndex === 0 ? "Cancel" : "Back"}
          </Button>
          <Button
            type="button"
            variant="primary"
            fullWidth={false}
            className="!h-11 px-6 text-sm"
            disabled={!canAdvance}
            isLoading={save.isPending}
            onClick={next}
          >
            {stepIndex === STEPS.length - 1 ? "Create" : "Continue"}
          </Button>
        </div>
      </div>
    </AppShell>
  );
}

function questionFor(step: Step): string {
  return {
    Name: "What's the goal?",
    Target: "What number are you aiming for?",
    Direction: "Are you pushing it up or pulling it down?",
    Habits: "Which habits feed this goal?",
    Date: "By when?",
  }[step];
}
function hintFor(step: Step): string | undefined {
  return {
    Name: "Keep it concrete — something you can point at and say 'done'.",
    Target: "The metric that says you made it.",
    Direction: undefined,
    Habits: "Pick the habits that compound toward it.",
    Date: "Optional, but deadlines beat intent.",
  }[step];
}

function DirectionOption({
  selected,
  onClick,
  title,
  desc,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  desc: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left rounded-xl border-2 p-4 transition-colors ${
        selected
          ? "border-primary bg-primary-soft"
          : "border-border-soft hover:border-primary"
      }`}
    >
      <p className="text-base font-semibold text-text-primary">{title}</p>
      <p className="text-xs text-text-secondary mt-0.5">{desc}</p>
    </button>
  );
}
