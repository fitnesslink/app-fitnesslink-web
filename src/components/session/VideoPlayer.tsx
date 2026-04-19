"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { media } from "@/lib/api/core";

interface VideoPlayerProps {
  /** Media id (Azure Blob asset); resolved to a SAS URL via `media.resolveMedia` */
  mediaId?: string | null;
  /** Optional direct URL (skips resolve roundtrip — useful for playlist tests) */
  src?: string;
  poster?: string;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  onEnded?: () => void;
  className?: string;
}

async function resolveUrl(mediaId: string): Promise<string | null> {
  try {
    const res = (await media.resolveMedia({
      items: [{ id: mediaId, type: "video" }],
    })) as { items?: Array<{ url?: string }> };
    return res.items?.[0]?.url ?? null;
  } catch {
    return null;
  }
}

export function VideoPlayer({
  mediaId,
  src,
  poster,
  autoPlay = true,
  loop = true,
  muted = true,
  onEnded,
  className = "",
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [buffering, setBuffering] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const { data: resolvedUrl, isLoading } = useQuery({
    queryKey: ["media", "resolve", mediaId ?? null],
    queryFn: () => resolveUrl(mediaId!),
    enabled: !!mediaId && !src,
  });

  const url = src ?? resolvedUrl ?? null;

  useEffect(() => {
    // When autoPlay fails (browser policy), surface a subtle play-to-start state
    const video = videoRef.current;
    if (!video || !url) return;
    const onWaiting = () => setBuffering(true);
    const onPlaying = () => setBuffering(false);
    const onError = () => setLoadError(true);
    video.addEventListener("waiting", onWaiting);
    video.addEventListener("playing", onPlaying);
    video.addEventListener("error", onError);
    return () => {
      video.removeEventListener("waiting", onWaiting);
      video.removeEventListener("playing", onPlaying);
      video.removeEventListener("error", onError);
    };
  }, [url]);

  const isFetching = (mediaId && !src && isLoading) as boolean;

  if (!url && !isFetching) {
    return (
      <div
        className={`relative w-full h-full bg-black flex items-center justify-center text-white/60 ${className}`}
      >
        <div className="text-center px-6">
          <svg className="w-14 h-14 mx-auto mb-3 opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
          <p className="text-sm">Video preview unavailable</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full bg-black ${className}`}>
      {url && (
        <video
          ref={videoRef}
          src={url}
          poster={poster}
          autoPlay={autoPlay}
          loop={loop}
          muted={muted}
          playsInline
          controls={false}
          preload="metadata"
          onEnded={onEnded}
          className="w-full h-full object-cover"
        />
      )}
      {(isFetching || (buffering && !loadError)) && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      )}
      {loadError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 text-white/80 text-sm">
          Couldn&apos;t load video
        </div>
      )}
    </div>
  );
}
