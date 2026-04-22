"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { media } from "@/lib/api/core";

export type MediaType = "workoutimage" | "movementimage" | "movementvideo" | "photo";

type ResolvedItem = { id?: string; url?: string | null };

const EMPTY_MAP: ReadonlyMap<string, string> = new Map();

export function useResolvedMedia(
  ids: ReadonlyArray<string | null | undefined>,
  type: MediaType
): ReadonlyMap<string, string> {
  const unique = useMemo(() => {
    const set = new Set<string>();
    for (const id of ids) if (id) set.add(id);
    return Array.from(set).sort();
  }, [ids]);

  const { data } = useQuery({
    queryKey: ["media", "resolve", type, unique],
    queryFn: async () => {
      const res = (await media.resolveMedia({
        items: unique.map((id) => ({ id, type })),
      })) as ResolvedItem[];
      const map = new Map<string, string>();
      for (const item of res ?? []) {
        if (item.id && item.url) map.set(item.id, item.url);
      }
      return map;
    },
    enabled: unique.length > 0,
    staleTime: 50 * 60 * 1000,
  });

  return data ?? EMPTY_MAP;
}
