"use client";

import { atom, useAtomValue, useSetAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { firebaseSignOut } from "@/lib/firebase/auth";
import type { User } from "@/types";

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

// Synced from Firebase by FirebaseAuthSync (providers.tsx).
// Not persisted locally — Firebase owns session persistence.
export const userAtom = atom<User | null>(null);
export const idTokenAtom = atom<string | null>(null);

// Scaffolding state for the mock onboarding/plan flow — unrelated to Firebase.
export const isOnboardedAtom = atomWithStorage<boolean>("fl_onboarded", false);
export const selectedPlanIdAtom = atomWithStorage<string | null>("fl_plan", null);

// Flipped to true after Firebase's first `onIdTokenChanged` emission.
// Gates authStatusAtom so SSR + the first-paint window both report "loading"
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
  const setIsOnboarded = useSetAtom(isOnboardedAtom);
  const setSelectedPlanId = useSetAtom(selectedPlanIdAtom);

  return {
    user,
    token,
    isLoading: status === "loading",
    status,
    isOnboarded,
    selectedPlanId,
    logout: async () => {
      await firebaseSignOut();
      setIsOnboarded(false);
      setSelectedPlanId(null);
    },
    setOnboarded: () => setIsOnboarded(true),
    setSelectedPlan: (planId: string) => setSelectedPlanId(planId),
  };
}
