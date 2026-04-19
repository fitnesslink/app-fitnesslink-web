"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Provider as JotaiProvider, useSetAtom } from "jotai";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { onIdTokenChanged } from "firebase/auth";
import { firebaseAuth } from "./firebase/client";
import { firebaseUserToAppUser } from "./firebase/auth";
import { authHydratedAtom, idTokenAtom, userAtom } from "./state/auth";
import { jotaiStore } from "./state/store";

function FirebaseAuthSync() {
  const setUser = useSetAtom(userAtom);
  const setIdToken = useSetAtom(idTokenAtom);
  const setHydrated = useSetAtom(authHydratedAtom);

  useEffect(() => {
    const unsub = onIdTokenChanged(firebaseAuth, async (fbUser) => {
      if (fbUser) {
        const token = await fbUser.getIdToken();
        setIdToken(token);
        setUser(firebaseUserToAppUser(fbUser));
      } else {
        setIdToken(null);
        setUser(null);
      }
      setHydrated(true);
    });
    return unsub;
  }, [setUser, setIdToken, setHydrated]);

  return null;
}

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <JotaiProvider store={jotaiStore}>
      <QueryClientProvider client={queryClient}>
        <FirebaseAuthSync />
        {children}
        {process.env.NODE_ENV === "development" && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </JotaiProvider>
  );
}
