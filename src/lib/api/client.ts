import { idTokenAtom } from "@/lib/state/auth";
import { jotaiStore } from "@/lib/state/store";
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

  const res = await fetch(`${baseUrl()}${path}`, { ...init, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new ApiError(res.status, res.statusText, body);
  }
  return res;
}

export async function platformJson<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const res = await platformFetch(path, init);
  return res.json() as Promise<T>;
}
