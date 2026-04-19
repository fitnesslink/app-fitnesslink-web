"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Provider as JotaiProvider, useSetAtom } from "jotai";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { authHydratedAtom } from "./state/auth";

function AuthHydrator() {
  const setHydrated = useSetAtom(authHydratedAtom);
  useEffect(() => {
    setHydrated(true);
  }, [setHydrated]);
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
    <JotaiProvider>
      <QueryClientProvider client={queryClient}>
        <AuthHydrator />
        {children}
        {process.env.NODE_ENV === "development" && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </JotaiProvider>
  );
}
