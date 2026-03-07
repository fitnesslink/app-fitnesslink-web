"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { BackButton } from "@/components/layout/BackButton";

export default function PaymentPage() {
  const router = useRouter();
  const { user, selectedPlanId, isLoading: authLoading } = useAuth();
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || !selectedPlanId)) {
      router.replace("/plans");
    }
  }, [authLoading, user, selectedPlanId, router]);

  function formatCardNumber(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
  }

  function formatExpiry(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 4);
    if (digits.length > 2) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return digits;
  }

  const isValid =
    cardName.length > 0 &&
    cardNumber.replace(/\s/g, "").length === 16 &&
    expiry.length === 5 &&
    cvv.length >= 3;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;

    setIsLoading(true);
    try {
      await api.submitPayment(selectedPlanId!, {
        name: cardName,
        cardNumber: cardNumber.replace(/\s/g, ""),
        expiry,
        cvv,
      });
      router.push("/onboarding");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed");
    } finally {
      setIsLoading(false);
    }
  }

  if (authLoading) return null;

  return (
    <AuthLayout>
      {/* Back button */}
      <div className="mb-4">
        <BackButton onClick={() => router.back()} />
      </div>

      <form onSubmit={handleSubmit}>
        <h1 className="text-3xl font-bold text-white mb-2">Payment Details</h1>
        <p className="text-white/70 text-sm mb-6">
          Enter your card information to subscribe
        </p>

        {/* Inputs */}
        <div className="space-y-3">
          <Input
            placeholder="Name on Card"
            value={cardName}
            onChange={(e) => setCardName(e.target.value)}
            autoComplete="cc-name"
          />
          <Input
            placeholder="Card Number"
            value={cardNumber}
            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
            autoComplete="cc-number"
            inputMode="numeric"
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              placeholder="MM/YY"
              value={expiry}
              onChange={(e) => setExpiry(formatExpiry(e.target.value))}
              autoComplete="cc-exp"
              inputMode="numeric"
            />
            <Input
              placeholder="CVV"
              value={cvv}
              onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
              autoComplete="cc-csc"
              inputMode="numeric"
              type="password"
            />
          </div>
        </div>

        {error && (
          <p className="mt-3 text-sm text-error text-center bg-white/10 rounded-full px-4 py-2">
            {error}
          </p>
        )}

        <div className="mt-6">
          <Button type="submit" isLoading={isLoading} disabled={!isValid}>
            Subscribe Now
          </Button>
        </div>
      </form>
    </AuthLayout>
  );
}
