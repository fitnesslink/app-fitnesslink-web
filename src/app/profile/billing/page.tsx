"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/state/auth";
import { subscriptions } from "@/lib/api/billing";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import type { Subscription } from "@/lib/profile/types";

async function fetchSubscription(): Promise<Subscription | null> {
  try {
    return ((await subscriptions.getMySubscription()) as Subscription | null) ?? null;
  } catch {
    return null;
  }
}

const STATUS_TONE: Record<Subscription["status"], "primary" | "warning" | "danger" | "info"> = {
  active: "primary",
  trialing: "info",
  past_due: "warning",
  canceled: "danger",
};

export default function BillingPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [authLoading, user, router]);

  const { data: sub, isLoading: subLoading } = useQuery({
    queryKey: subscriptions.keys.all,
    queryFn: fetchSubscription,
  });

  if (authLoading || !user) return null;

  const price = sub ? `$${(sub.priceCents / 100).toFixed(2)}` : "—";

  return (
    <AppShell subtitle="Billing">
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

        {subLoading ? (
          <p className="text-sm text-text-secondary">Loading…</p>
        ) : !sub ? (
          <Card>
            <CardContent>
              <p className="text-sm text-text-secondary">
                No subscription yet. Pick a plan to get started.
              </p>
              <div className="mt-3">
                <Link href="/plans">
                  <Button variant="primary" fullWidth={false} className="!h-11 px-5 text-sm">
                    View plans
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <CardHeader
                title="Current plan"
                action={<Badge tone={STATUS_TONE[sub.status]}>{sub.status.replace("_", " ")}</Badge>}
              />
              <CardContent>
                <div className="flex items-baseline gap-3">
                  <p className="text-3xl font-bold text-text-primary">{sub.planName}</p>
                  <p className="text-sm text-text-secondary">
                    {price} / {sub.interval}
                  </p>
                </div>
                {sub.renewsAt && sub.status === "active" && (
                  <p className="text-sm text-text-secondary mt-2">
                    Renews {new Date(sub.renewsAt).toLocaleDateString(undefined, {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader title="Payment method" />
              <CardContent>
                {sub.paymentMethodLast4 ? (
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-text-primary">
                      <span className="font-semibold">{sub.paymentMethodBrand}</span> ending in{" "}
                      <span className="tabular-nums">•••• {sub.paymentMethodLast4}</span>
                    </p>
                    <Link
                      href="/payment"
                      className="text-sm text-primary font-medium hover:underline"
                    >
                      Update
                    </Link>
                  </div>
                ) : (
                  <p className="text-sm text-text-secondary">No payment method on file.</p>
                )}
              </CardContent>
            </Card>

            <div className="flex flex-wrap gap-2">
              <Link href="/plans">
                <Button variant="secondary" fullWidth={false} className="!h-11 px-5 text-sm">
                  Change plan
                </Button>
              </Link>
              {sub.status === "active" && (
                <Button
                  variant="secondary"
                  fullWidth={false}
                  className="!h-11 px-5 text-sm !text-danger"
                >
                  Cancel subscription
                </Button>
              )}
            </div>

            <p className="text-xs text-text-secondary">
              Status changes via Stripe / Apple / Google webhooks appear here on refresh.
            </p>
          </>
        )}
      </div>
    </AppShell>
  );
}
