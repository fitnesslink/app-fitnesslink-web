import { idTokenAtom } from "@/lib/state/auth";
import { jotaiStore } from "@/lib/state/store";
import { pushToast } from "@/lib/state/toasts";
import type { components, paths } from "@/types/api";

export type ApiPaths = paths;
export type ApiSchemas = components["schemas"];
export type ApiSchema<K extends keyof ApiSchemas> = ApiSchemas[K];

const DEFAULT_BASE_URL = "http://localhost:5100";

function baseUrl(): string {
  return process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_BASE_URL;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly statusText: string,
    public readonly body: unknown,
    message?: string
  ) {
    super(message ?? `${status} ${statusText}`);
    this.name = "ApiError";
  }
}

export class NetworkError extends Error {
  constructor(public readonly cause: unknown) {
    super("Network request failed");
    this.name = "NetworkError";
  }
}

/** Set from providers.tsx so the auth-invalidation path can run client-side nav. */
let onUnauthorized: (() => void) | null = null;
export function configureApiClient(opts: { onUnauthorized: () => void }) {
  onUnauthorized = opts.onUnauthorized;
}

// Dedup repeated toasts for the same class of error so a burst of failed
// requests doesn't spam the user.
const recentToast = new Map<string, number>();
const TOAST_DEDUPE_MS = 4000;

function toastOnce(key: string, fn: () => void) {
  const now = Date.now();
  const last = recentToast.get(key) ?? 0;
  if (now - last < TOAST_DEDUPE_MS) return;
  recentToast.set(key, now);
  fn();
}

export async function platformFetch(
  path: string,
  init?: RequestInit
): Promise<Response> {
  const token = jotaiStore.get(idTokenAtom);
  const headers = new Headers(init?.headers);
  if (!headers.has("Content-Type") && init?.body) {
    headers.set("Content-Type", "application/json");
  }
  if (token) headers.set("Authorization", `Bearer ${token}`);

  let res: Response;
  try {
    res = await fetch(`${baseUrl()}${path}`, { ...init, headers });
  } catch (err) {
    // `fetch` rejects on DNS/TLS failures and when the browser is offline.
    toastOnce("network", () => {
      pushToast({
        tone: "warning",
        title: navigator?.onLine === false ? "You appear to be offline" : "Network error",
        description: "We couldn't reach the server.",
        actionLabel: "Retry",
        onAction: () => {
          // Best-effort reload; the caller's onError path will also rerun.
          if (typeof window !== "undefined") window.location.reload();
        },
        duration: 8000,
      });
    });
    throw new NetworkError(err);
  }

  if (!res.ok) {
    const body = await res.json().catch(() => null);

    if (res.status === 401) {
      // Token expired or invalid — bounce through the configured auth handler.
      toastOnce("unauthorized", () => {
        pushToast({
          tone: "warning",
          title: "Please sign in again",
          duration: 5000,
        });
      });
      onUnauthorized?.();
    } else if (res.status >= 500) {
      toastOnce(`5xx-${res.status}`, () => {
        pushToast({
          tone: "danger",
          title: "Something went wrong",
          description: `Server responded ${res.status}. Try again in a moment.`,
          duration: 6000,
        });
      });
    }

    throw new ApiError(res.status, res.statusText, body);
  }
  return res;
}

export async function platformJson<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const res = await platformFetch(path, init);
  if (res.status === 204) return undefined as T;
  const text = await res.text();
  if (!text) return undefined as T;
  return JSON.parse(text) as T;
}
