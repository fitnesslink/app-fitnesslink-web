"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { sendPasswordReset } from "@/lib/firebase/auth";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { SocialLogin } from "@/components/ui/SocialLogin";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const isValid = email.length > 0 && /\S+@\S+\.\S+/.test(email);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!isValid) {
      setError("Please enter a valid email");
      return;
    }

    setIsLoading(true);
    try {
      await sendPasswordReset(email);
      setIsSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthLayout showBackButton>
      {isSent ? (
        <div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">Check Your Email</h1>
          <p className="text-text-secondary text-sm mb-8">
            We&apos;ve sent a password reset link to {email}
          </p>
          <Button onClick={() => router.push("/login")}>
            Back to Login
          </Button>
          <button
            onClick={() => {
              setIsSent(false);
              setEmail("");
            }}
            className="w-full text-center text-sm text-primary font-medium mt-4"
          >
            Didn&apos;t receive it? Try again
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <h1 className="text-3xl font-bold text-text-primary mb-2">Forgot Password</h1>
          <p className="text-text-secondary text-sm mb-8">
            Enter your email to receive a reset link
          </p>

          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />

          {error && (
            <p className="mt-3 text-sm text-error text-center bg-white/10 rounded-full px-4 py-2">
              {error}
            </p>
          )}

          <div className="mt-6">
            <Button type="submit" isLoading={isLoading} disabled={!isValid}>
              Send Reset Link
            </Button>
          </div>

          <SocialLogin />

          <p className="text-center text-sm text-text-secondary mt-4">
            Remember your password?{" "}
            <Link href="/login" className="text-primary font-medium">
              Login
            </Link>
          </p>
        </form>
      )}
    </AuthLayout>
  );
}
