import type {
  AuthResponse,
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

export const api = {
  login(email: string, password: string) {
    return request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  signup(firstName: string, lastName: string, email: string, password: string) {
    return request<AuthResponse>("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ firstName, lastName, email, password }),
    });
  },

  forgotPassword(email: string) {
    return request<{ message: string }>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

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
