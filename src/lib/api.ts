import type { PlansResponse, Subscription, PaymentMethod } from "@/types";

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

// Local stubs for scaffolding not yet wired to the platform (plans, payment).
// Auth lives in Firebase; onboarding lives in the platform Personalization module.
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
};
