"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import SimpleBar from "simplebar-react";
import "simplebar-react/dist/simplebar.min.css";
import { Logo } from "@/components/ui/Logo";
import { BackButton } from "@/components/layout/BackButton";

interface AuthLayoutProps {
  children: ReactNode;
  /** Which tab is active — used for the Sign Up / Login switcher */
  activeTab?: "login" | "signup";
  /** Show a back button at the top of the page */
  showBackButton?: boolean;
}

function AuthTabs({
  activeTab,
  onNavigate,
}: {
  activeTab: "login" | "signup";
  onNavigate: (path: string) => void;
}) {
  return (
    <div className="flex justify-center gap-12 mb-6">
      <button
        type="button"
        onClick={() => onNavigate("/signup")}
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
        onClick={() => onNavigate("/login")}
        className={`pb-2 text-lg font-medium transition-colors border-b-[3px] ${
          activeTab === "login"
            ? "text-text-primary border-primary"
            : "text-text-secondary border-transparent"
        }`}
      >
        Login
      </button>
    </div>
  );
}

export function AuthLayout({ children, activeTab, showBackButton }: AuthLayoutProps) {
  const router = useRouter();

  return (
    <>
      {/* ===== MOBILE LAYOUT (< lg) ===== */}
      <div className="lg:hidden h-dvh overflow-hidden relative flex flex-col bg-black">
        {/* Background image */}
        <div className="absolute inset-0">
          <Image
            src="/images/auth-bg-0.jpg"
            alt=""
            fill
            className="object-cover object-top"
            priority
          />
          <div className="absolute inset-0 z-[1] bg-black/20" />
        </div>

        {/* Top bar */}
        <div className="relative z-10 flex items-center px-6 pt-14 pb-4">
          <BackButton onClick={() => router.back()} />
          <div className="flex-1 flex justify-center -ml-10">
            <Logo variant="light" size="lg" />
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Bottom panel */}
        <div className="relative z-10 bg-background rounded-t-[2rem] pt-6 px-8 flex flex-col max-h-[85dvh] overflow-hidden">
          {activeTab && (
            <div className="shrink-0">
              <AuthTabs
                activeTab={activeTab}
                onNavigate={(path) => router.push(path)}
              />
            </div>
          )}
          <div className="flex-1 min-h-0">
            <SimpleBar style={{ maxHeight: "100%" }} className="pb-8">
              <div className="w-full max-w-[364px] mx-auto p-1">{children}</div>
            </SimpleBar>
          </div>
        </div>
      </div>

      {/* ===== DESKTOP LAYOUT (≥ lg) ===== */}
      <div className="hidden lg:flex h-dvh overflow-hidden bg-background">
        {/* Left side — image (hidden on very large screens) */}
        <div className="relative w-[40%] min-w-[400px] max-w-[770px] 2xl:hidden">
          <Image
            src="/images/auth-bg-0.jpg"
            alt=""
            fill
            className="object-cover object-top"
            priority
          />
        </div>

        {/* Right side — form area */}
        <div className="flex-1 flex flex-col px-8">
          {/* Top bar with back button */}
          {showBackButton && (
            <div className="pt-6 pl-2">
              <BackButton onClick={() => router.back()} />
            </div>
          )}

          <div className="flex-1 flex items-center justify-center">
            <div className="w-full max-w-[412px] bg-background rounded-[2rem] p-10 flex flex-col max-h-[90dvh]">
              {/* Logo */}
              <div className="shrink-0 flex justify-center mb-8">
                <Logo variant="dark" size="lg" />
              </div>

              {/* Tabs */}
              {activeTab && (
                <div className="shrink-0">
                  <AuthTabs
                    activeTab={activeTab}
                    onNavigate={(path) => router.push(path)}
                  />
                </div>
              )}

              {/* Form content — scrollable */}
              <div className="flex-1 min-h-0">
                <SimpleBar style={{ maxHeight: "100%" }}>
                  <div className="p-1">{children}</div>
                </SimpleBar>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
