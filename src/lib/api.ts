import type {
  PlansResponse,
  QuestionsResponse,
  Subscription,
  PaymentMethod,
  Answer,
} from "@/types";

const BASE_URL = "/api";

async function request<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${BASE_URL}${url}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }

  return res.json();
}

// Mock routes still used by the plans / payment / onboarding scaffolding.
// Auth (login / signup / forgot-password) is owned by Firebase — see src/lib/firebase/auth.ts.
export const api = {
  getPlans() {
    return request<PlansResponse>("/plans");
  },

  submitPayment(planId: string, paymentMethod: PaymentMethod) {
    return request<{ subscription: Subscription }>("/payment", {
      method: "POST",
      body: JSON.stringify({ planId, paymentMethod }),
    });
  },

  getOnboardingQuestions() {
    return request<QuestionsResponse>("/onboarding/questions");
  },

  submitOnboardingAnswers(answers: Answer[]) {
    return request<{ message: string; profileComplete: boolean }>(
      "/onboarding/answers",
      {
        method: "POST",
        body: JSON.stringify({ answers }),
      }
    );
  },
};
