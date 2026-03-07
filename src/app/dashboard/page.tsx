"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [isLoading, user, router]);

  if (isLoading || !user) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-surface border-b border-border/20 px-6 py-4 flex items-center justify-between">
        <Logo size="sm" />
        <Button
          variant="secondary"
          fullWidth={false}
          className="!h-10 px-4 text-sm"
          onClick={() => {
            logout();
            router.push("/");
          }}
        >
          Logout
        </Button>
      </header>
      <main className="max-w-2xl mx-auto px-6 py-12 text-center">
        <h1 className="text-3xl font-bold text-text-primary">
          Welcome, {user.firstName}!
        </h1>
        <p className="mt-4 text-text-secondary text-lg">
          Your personalized fitness plan is being created. This is a placeholder
          dashboard that will be built out in future phases.
        </p>
      </main>
    </div>
  );
}
