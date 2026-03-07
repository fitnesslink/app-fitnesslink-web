"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { BackButton } from "@/components/layout/BackButton";

interface AuthLayoutProps {
  children: ReactNode;
  /** Which tab is active — used for the Sign Up / Login switcher */
  activeTab?: "login" | "signup";
}

export function AuthLayout({ children, activeTab }: AuthLayoutProps) {
  const router = useRouter();

  return (
    <div className="min-h-dvh relative flex flex-col bg-black">
      {/* Background image — fills the screen behind everything */}
      <div className="absolute inset-0">
        <Image
          src="/images/auth-bg-0.jpg"
          alt=""
          fill
          className="object-cover object-top"
          priority
        />
        {/* Dark tint overlay — black at 20% opacity */}
        <div className="absolute inset-0 z-[1] bg-black/20" />
      </div>

      {/* Top bar: back button + logo */}
      <div className="relative z-10 flex items-center px-6 pt-14 pb-4">
        <BackButton onClick={() => router.back()} />
        <div className="flex-1 flex justify-center -ml-10">
          <Logo variant="light" size="lg" />
        </div>
      </div>

      {/* Spacer — pushes the panel to the bottom */}
      <div className="flex-1" />

      {/* Curved gray panel */}
      <div className="relative z-10 bg-background rounded-t-[2rem] pt-6 pb-8 px-8">
        {/* Sign Up / Login tabs */}
        {activeTab && (
          <div className="flex justify-center gap-12 mb-6">
            <button
              type="button"
              onClick={() => router.push("/signup")}
              className={`pb-2 text-lg font-medium transition-colors border-b-[3px] ${
                activeTab === "signup"
                  ? "text-text-primary border-primary"
                  : "text-text-secondary border-transparent"
              }`}
            >
              Sign Up
            </button>
            <button
              type="button"
              onClick={() => router.push("/login")}
              className={`pb-2 text-lg font-medium transition-colors border-b-[3px] ${
                activeTab === "login"
                  ? "text-text-primary border-primary"
                  : "text-text-secondary border-transparent"
              }`}
            >
              Login
            </button>
          </div>
        )}

        {/* Form content */}
        <div className="w-full max-w-[364px] mx-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
