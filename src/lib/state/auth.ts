"use client";

import { atom, useAtomValue, useSetAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import type { User } from "@/types";

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

export const userAtom = atomWithStorage<User | null>("fl_user", null);
export const idTokenAtom = atomWithStorage<string | null>("fl_token", null);
export const isOnboardedAtom = atomWithStorage<boolean>("fl_onboarded", false);
export const selectedPlanIdAtom = atomWithStorage<string | null>("fl_plan", null);

// Flipped to true by the root provider once the client has hydrated storage.
// Gates authStatusAtom so SSR + first client paint both report "loading"
// instead of flashing "unauthenticated".
export const authHydratedAtom = atom(false);

export const authStatusAtom = atom<AuthStatus>((get) => {
  if (!get(authHydratedAtom)) return "loading";
  return get(userAtom) ? "authenticated" : "unauthenticated";
});

export function useAuth() {
  const user = useAtomValue(userAtom);
  const token = useAtomValue(idTokenAtom);
  const status = useAtomValue(authStatusAtom);
  const isOnboarded = useAtomValue(isOnboardedAtom);
  const selectedPlanId = useAtomValue(selectedPlanIdAtom);
  const setUser = useSetAtom(userAtom);
  const setToken = useSetAtom(idTokenAtom);
  const setIsOnboarded = useSetAtom(isOnboardedAtom);
  const setSelectedPlanId = useSetAtom(selectedPlanIdAtom);

  return {
    user,
    token,
    isLoading: status === "loading",
    status,
    isOnboarded,
    selectedPlanId,
    login: (u: User, t: string) => {
      setUser(u);
      setToken(t);
    },
    logout: () => {
      setUser(null);
      setToken(null);
      setIsOnboarded(false);
      setSelectedPlanId(null);
    },
    setOnboarded: () => setIsOnboarded(true),
    setSelectedPlan: (planId: string) => setSelectedPlanId(planId),
  };
}
