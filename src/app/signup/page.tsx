"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signUpWithEmail } from "@/lib/firebase/auth";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { SocialLogin } from "@/components/ui/SocialLogin";

export default function SignupPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const isValid =
    firstName.length > 0 &&
    lastName.length > 0 &&
    email.length > 0 &&
    password.length >= 8 &&
    password === confirmPassword;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);
    try {
      await signUpWithEmail(firstName, lastName, email, password);
      router.push("/plans");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthLayout activeTab="signup">
      <form onSubmit={handleSubmit}>
        {/* Title */}
        <div className="mb-6">
          <p className="mt-1 text-text-secondary text-sm">
            Start your personalized fitness journey
          </p>
        </div>

        {/* Inputs */}
        <div className="space-y-3">
          <Input
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            autoComplete="given-name"
          />
          <Input
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            autoComplete="family-name"
          />
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
            autoComplete="new-password"
          />
          <Input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
          />
        </div>

        {error && (
          <p className="mt-3 text-sm text-error text-center bg-error/10 rounded-full px-4 py-2">
            {error}
          </p>
        )}

        {/* Sign up button */}
        <div className="mt-5">
          <Button type="submit" isLoading={isLoading} disabled={!isValid}>
            Sign Up
          </Button>
        </div>

        {/* Social login */}
        <SocialLogin redirectTo="/plans" />

        {/* Login link */}
        <p className="text-center text-sm text-text-secondary mt-4">
          Already have an account?{" "}
          <Link href="/login" className="text-primary font-medium">
            Login
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
