"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";
import type { ReactNode } from "react";
import type { User } from "@/types";

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isOnboarded: boolean;
  selectedPlanId: string | null;
}

interface AuthContextValue extends AuthState {
  login: (user: User, token: string) => void;
  logout: () => void;
  setOnboarded: () => void;
  setSelectedPlan: (planId: string) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    isOnboarded: false,
    selectedPlanId: null,
  });

  useEffect(() => {
    const stored = localStorage.getItem("fl_auth");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setState((s) => ({ ...s, ...parsed, isLoading: false }));
      } catch {
        setState((s) => ({ ...s, isLoading: false }));
      }
    } else {
      setState((s) => ({ ...s, isLoading: false }));
    }
  }, []);

  const persist = useCallback((next: Partial<AuthState>) => {
    setState((prev) => {
      const updated = { ...prev, ...next };
      localStorage.setItem(
        "fl_auth",
        JSON.stringify({
          user: updated.user,
          token: updated.token,
          isOnboarded: updated.isOnboarded,
          selectedPlanId: updated.selectedPlanId,
        })
      );
      return updated;
    });
  }, []);

  const login = useCallback(
    (user: User, token: string) => persist({ user, token }),
    [persist]
  );

  const logout = useCallback(() => {
    localStorage.removeItem("fl_auth");
    setState({
      user: null,
      token: null,
      isLoading: false,
      isOnboarded: false,
      selectedPlanId: null,
    });
  }, []);

  const setOnboarded = useCallback(
    () => persist({ isOnboarded: true }),
    [persist]
  );

  const setSelectedPlan = useCallback(
    (planId: string) => persist({ selectedPlanId: planId }),
    [persist]
  );

  return (
    <AuthContext.Provider
      value={{ ...state, login, logout, setOnboarded, setSelectedPlan }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
