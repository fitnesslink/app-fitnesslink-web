"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { SocialLogin } from "@/components/ui/SocialLogin";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const isValid = email.length > 0 && password.length > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!isValid) return;

    setIsLoading(true);
    try {
      const res = await api.login(email, password);
      login(res.user, res.token);
      router.push("/onboarding");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthLayout activeTab="login">
      <form onSubmit={handleSubmit}>
        {/* Forgot password link */}
        <div className="flex justify-end mb-4">
          <Link
            href="/forgot-password"
            className="text-sm font-medium text-primary"
          >
            Forgot Password?
          </Link>
        </div>

        {/* Input fields */}
        <div className="space-y-4">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>

        {error && (
          <p className="mt-3 text-sm text-error text-center bg-error/10 rounded-full px-4 py-2">
            {error}
          </p>
        )}

        {/* Login button */}
        <div className="mt-10">
          <Button type="submit" isLoading={isLoading} disabled={!isValid}>
            Login
          </Button>
        </div>

        {/* Or divider + social login */}
        <SocialLogin />
      </form>
    </AuthLayout>
  );
}
