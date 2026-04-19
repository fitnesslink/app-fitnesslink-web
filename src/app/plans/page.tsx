"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/state/auth";
import { api } from "@/lib/api";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/Button";
import { BackButton } from "@/components/layout/BackButton";
import type { Plan } from "@/types";

export default function PlansPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, setSelectedPlan } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/signup");
      return;
    }
    api.getPlans().then((res) => {
      setPlans(res.plans);
      setIsLoading(false);
    });
  }, [authLoading, user, router]);

  function handleContinue() {
    if (!selectedId) return;
    setSelectedPlan(selectedId);
    router.push("/payment");
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black/50">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <AuthLayout>
      {/* Back button */}
      <div className="mb-4">
        <BackButton onClick={() => router.back()} />
      </div>

      {/* Title */}
      <h1 className="text-3xl font-bold text-white mb-2">Choose Your Plan</h1>
      <p className="text-white/70 text-sm mb-6">
        Select the plan that fits your goals
      </p>

      {/* Plan cards */}
      <div className="space-y-4">
        {plans.map((plan) => (
          <button
            key={plan.id}
            onClick={() => setSelectedId(plan.id)}
            className={`w-full p-5 rounded-3xl text-left transition-all ${
              selectedId === plan.id
                ? "bg-white ring-2 ring-primary"
                : "bg-white/90 hover:bg-white"
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-text-primary">
                  {plan.name}
                </h3>
                <p className="text-sm text-text-secondary mt-0.5">
                  {plan.description}
                </p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-text-primary">
                  ${plan.price}
                </span>
                <span className="text-sm text-text-secondary">
                  /{plan.interval === "month" ? "mo" : "yr"}
                </span>
                {plan.savings && (
                  <p className="text-xs font-semibold text-primary mt-0.5">
                    {plan.savings}
                  </p>
                )}
              </div>
            </div>
            <ul className="mt-3 space-y-1.5">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-text-secondary">
                  <svg className="w-4 h-4 text-primary flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
          </button>
        ))}
      </div>

      {/* CTA */}
      <div className="mt-6">
        <Button onClick={handleContinue} disabled={!selectedId}>
          Continue
        </Button>
      </div>
    </AuthLayout>
  );
}
