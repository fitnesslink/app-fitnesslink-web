"use client";

import { useQuery } from "@tanstack/react-query";
import { movements, media } from "@/lib/api/core";
import { Sheet } from "@/components/ui/Sheet";
import { Chip } from "@/components/ui/Chip";
import { Skeleton } from "@/components/ui/Skeleton";
import type { MovementDetail } from "@/lib/catalog/types";
import { placeholderMovementDetail } from "@/lib/catalog/placeholder";

interface MovementPreviewSheetProps {
  movementId: string | null;
  onClose: () => void;
}

async function fetchMovement(id: string): Promise<MovementDetail> {
  try {
    const res = (await movements.getMovement(id)) as MovementDetail | null;
    if (!res) return placeholderMovementDetail(id);
    return {
      ...placeholderMovementDetail(id),
      ...res,
      anatomyTags: res.anatomyTags ?? [],
      equipmentTags: res.equipmentTags ?? [],
    };
  } catch {
    return placeholderMovementDetail(id);
  }
}

async function fetchMediaUrl(mediaId: string | undefined): Promise<string | null> {
  if (!mediaId) return null;
  try {
    const res = (await media.resolveMedia({
      items: [{ id: mediaId, type: "video" }],
    })) as { items?: Array<{ url?: string }> };
    return res.items?.[0]?.url ?? null;
  } catch {
    return null;
  }
}

export function MovementPreviewSheet({ movementId, onClose }: MovementPreviewSheetProps) {
  const { data, isLoading } = useQuery({
    queryKey: movements.keys.detail(movementId ?? ""),
    queryFn: () => fetchMovement(movementId!),
    enabled: !!movementId,
  });

  const { data: videoUrl } = useQuery({
    queryKey: ["media", "resolve", data?.videoMediaId ?? null],
    queryFn: () => fetchMediaUrl(data?.videoMediaId),
    enabled: !!data?.videoMediaId,
  });

  return (
    <Sheet
      open={!!movementId}
      onClose={onClose}
      title={data?.name ?? "Movement preview"}
      variant="side"
      width={420}
    >
      {isLoading || !data ? (
        <div className="space-y-4">
          <Skeleton className="aspect-video w-full" />
          <Skeleton variant="text" className="w-3/4 h-5" />
          <Skeleton variant="text" className="w-full" />
          <Skeleton variant="text" className="w-full" />
        </div>
      ) : (
        <div className="space-y-5">
          <div className="aspect-video rounded-lg overflow-hidden bg-background flex items-center justify-center">
            {videoUrl ? (
              <video src={videoUrl} controls playsInline className="w-full h-full object-cover" />
            ) : (
              <div className="text-center text-text-secondary">
                <svg className="w-12 h-12 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                <p className="text-xs mt-2">Video preview unavailable</p>
              </div>
            )}
          </div>

          {data.description && (
            <p className="text-sm text-text-primary leading-relaxed">{data.description}</p>
          )}

          {data.anatomyTags.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary mb-2">
                Anatomy
              </p>
              <div className="flex flex-wrap gap-2">
                {data.anatomyTags.map((tag) => (
                  <Chip key={tag} tone="primary" className="cursor-default">
                    {tag}
                  </Chip>
                ))}
              </div>
            </div>
          )}

          {data.equipmentTags.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary mb-2">
                Equipment
              </p>
              <div className="flex flex-wrap gap-2">
                {data.equipmentTags.map((tag) => (
                  <Chip key={tag} tone="soft" className="cursor-default">
                    {tag}
                  </Chip>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Sheet>
  );
}
