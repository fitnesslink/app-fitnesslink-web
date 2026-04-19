"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/lib/state/auth";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";

export default function HomePage() {
  const [showSplash, setShowSplash] = useState(true);
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isLoading && user) {
      router.replace("/onboarding");
    }
  }, [isLoading, user, router]);

  if (showSplash || isLoading) {
    return (
      <div className="min-h-screen bg-primary flex flex-col items-center justify-center">
        <Image
          src="/images/flkettlebell.svg"
          alt="FitnessLink"
          width={120}
          height={120}
          priority
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex flex-col">
      {/* Background image with dark tint */}
      <div className="absolute inset-0">
        <Image
          src="/images/auth-bg-0.jpg"
          alt=""
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col justify-end px-8 pb-8 max-w-[428px] mx-auto w-full">
        {/* Logo at top center */}
        <div className="flex-1" />
        <div className="absolute top-0 left-0 right-0 flex justify-center pt-16">
          <Logo variant="light" size="lg" />
        </div>

        {/* Taglines */}
        <div className="mb-6">
          <p className="text-white/80 text-sm mb-1">Start your fitness journey now</p>
          <h1 className="text-white text-3xl font-bold leading-tight">Fitness for everyone<br />everywhere.</h1>
        </div>

        {/* CTA buttons at bottom */}
        <div className="pb-4">
          <Button
            variant="primary"
            onClick={() => router.push("/signup")}
          >
            Sign Up
          </Button>
          <p className="text-white/80 text-sm text-center mt-4">
            Already have an account?{" "}
            <button
              onClick={() => router.push("/login")}
              className="text-primary font-semibold underline cursor-pointer"
            >
              Log in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
