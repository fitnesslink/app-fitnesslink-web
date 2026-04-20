"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/state/auth";
import { personalization } from "@/lib/api/core";
import { platformJson } from "@/lib/api/client";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { BackButton } from "@/components/layout/BackButton";
import type { Question, Answer } from "@/types";

interface RawPersonalization {
  id?: string;
  name?: string | null;
  singleSelection?: boolean;
  order?: number | null;
  options?: Array<{ id?: string; text?: string | null; order?: number | null }> | null;
}

function mapQuestions(raw: RawPersonalization[]): Question[] {
  return raw
    .slice()
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((p) => ({
      id: p.id ?? "",
      question: p.name ?? "",
      singleSelection: p.singleSelection ?? true,
      options: (p.options ?? [])
        .slice()
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map((o) => ({ id: o.id ?? "", label: o.text ?? "" })),
    }));
}

export default function OnboardingPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, setOnboarded } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
      return;
    }
    if (!user) return;
    personalization
      .listPersonalization()
      .then((res) => {
        const raw = Array.isArray(res) ? (res as RawPersonalization[]) : [];
        setQuestions(mapQuestions(raw));
      })
      .catch(() => setError("Couldn't load questions."))
      .finally(() => setIsLoading(false));
  }, [authLoading, user, router]);

  const question = questions[currentStep];
  const totalSteps = questions.length;
  const isLastStep = currentStep === totalSteps - 1;
  const selectedOption = question ? answers[question.id] : null;

  function handleSelect(optionId: string) {
    if (!question) return;
    setAnswers((prev) => ({ ...prev, [question.id]: optionId }));
  }

  async function handleContinue() {
    if (!selectedOption) return;

    if (isLastStep) {
      setIsSubmitting(true);
      setError(null);
      try {
        const answerPayload: Answer[] = questions
          .filter((q) => answers[q.id])
          .map((q) => ({
            personalizationId: q.id,
            personalizationOptionId: answers[q.id],
          }));
        await platformJson(`/core/api/v1/personalization/me`, {
          method: "POST",
          body: JSON.stringify(answerPayload),
        });
        setOnboarded();
        router.push("/home");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Couldn't save answers.");
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setCurrentStep((s) => s + 1);
    }
  }

  function handleBack() {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
    } else {
      router.back();
    }
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6">
        <div className="text-center space-y-4 max-w-sm">
          <p className="text-sm text-text-secondary">
            No personalization questions yet. You can set your preferences later from Profile.
          </p>
          <Button
            onClick={() => {
              setOnboarded();
              router.push("/home");
            }}
          >
            Continue
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-[428px] px-6 flex flex-col lg:max-w-lg">
        {/* Top bar */}
        <div className="pt-12 lg:pt-8">
          <div className="flex items-center justify-between mb-6">
            <BackButton onClick={handleBack} />
            <Logo size="sm" />
            <div className="w-10" />
          </div>
          <ProgressBar totalSteps={totalSteps} currentStep={currentStep + 1} />
        </div>

        {/* Question */}
        {question && (
          <div className="flex-1 flex flex-col pt-10">
            <h2 className="text-2xl font-bold text-text-primary">
              {question.question}
            </h2>

            {/* Options */}
            <div className="mt-8 space-y-3 flex-1">
              {question.options.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleSelect(opt.id)}
                  className={`w-full p-4 rounded-2xl border-2 text-left font-medium transition-all ${
                    selectedOption === opt.id
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border/30 bg-surface text-text-primary hover:border-border/60"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Continue button */}
            <div className="py-8 space-y-3">
              {error && (
                <p className="text-sm text-danger bg-danger/10 rounded-lg px-3 py-2">{error}</p>
              )}
              <Button
                onClick={handleContinue}
                disabled={!selectedOption}
                isLoading={isSubmitting}
              >
                Continue
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
