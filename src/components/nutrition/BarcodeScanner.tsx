"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Sheet } from "@/components/ui/Sheet";
import { Button } from "@/components/ui/Button";
import { barcode } from "@/lib/api/nutrition";

interface BarcodeScannerProps {
  open: boolean;
  onClose: () => void;
}

// Types for the still-experimental BarcodeDetector API.
interface DetectedBarcode {
  rawValue: string;
  format: string;
}
type BarcodeDetectorLike = new (opts?: { formats?: string[] }) => {
  detect: (source: CanvasImageSource) => Promise<DetectedBarcode[]>;
};

export function BarcodeScanner({ open, onClose }: BarcodeScannerProps) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const [status, setStatus] = useState<"idle" | "starting" | "scanning" | "unsupported" | "error">(
    "idle"
  );
  const [manualCode, setManualCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const Detector = (globalThis as unknown as { BarcodeDetector?: BarcodeDetectorLike })
      .BarcodeDetector;
    if (!Detector || typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setStatus("unsupported");
      return;
    }

    setStatus("starting");
    let cancelled = false;

    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setStatus("scanning");

        const detector = new Detector!({
          formats: ["ean_13", "ean_8", "upc_a", "upc_e", "code_128", "code_39"],
        });
        const loop = async () => {
          if (cancelled || !videoRef.current) return;
          try {
            const results = await detector.detect(videoRef.current);
            if (results.length > 0) {
              const code = results[0].rawValue;
              handleCode(code);
              return;
            }
          } catch {
            // Per-frame detector errors are frequent on low-light frames; keep scanning.
          }
          rafRef.current = requestAnimationFrame(loop);
        };
        rafRef.current = requestAnimationFrame(loop);
      } catch (err) {
        setStatus("error");
        setError(err instanceof Error ? err.message : "Camera unavailable");
      }
    }

    start();

    return () => {
      cancelled = true;
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function handleCode(code: string) {
    try {
      await barcode.getBarcode(code);
      // TODO: route to a scanned-food review once the backend response is typed.
      onClose();
      router.push(`/nutrition/tracking?scanned=${encodeURIComponent(code)}`);
    } catch {
      setError("Couldn't look up barcode. Try manual search.");
      setStatus("error");
    }
  }

  return (
    <Sheet open={open} onClose={onClose} title="Scan barcode" variant="side" width={420}>
      <div className="space-y-4">
        {status === "unsupported" ? (
          <UnsupportedFallback />
        ) : (
          <div className="aspect-square bg-black rounded-xl overflow-hidden relative">
            <video ref={videoRef} playsInline muted className="w-full h-full object-cover" />
            <div className="absolute inset-[20%] border-2 border-white/80 rounded-lg pointer-events-none" />
            {status === "starting" && (
              <div className="absolute inset-0 flex items-center justify-center text-white/80 text-sm">
                Starting camera…
              </div>
            )}
            {status === "error" && error && (
              <div className="absolute inset-x-0 bottom-0 bg-black/70 text-white text-xs p-3 text-center">
                {error}
              </div>
            )}
          </div>
        )}

        <p className="text-xs text-text-secondary text-center">
          Good lighting and a flat label help the scanner a lot.
        </p>

        <div className="pt-2 border-t border-border-soft">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-text-secondary mb-2">
            Manual entry
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              inputMode="numeric"
              placeholder="e.g. 0049000028911"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value.replace(/\D/g, ""))}
              className="h-11 flex-1 px-3 rounded-lg border border-border-soft bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary tabular-nums"
            />
            <Button
              type="button"
              variant="primary"
              fullWidth={false}
              className="!h-11 px-4 text-sm"
              onClick={() => manualCode && handleCode(manualCode)}
              disabled={!manualCode}
            >
              Look up
            </Button>
          </div>
        </div>
      </div>
    </Sheet>
  );
}

function UnsupportedFallback() {
  return (
    <div className="rounded-xl border border-dashed border-border-soft p-6 text-center text-sm text-text-secondary">
      <svg className="w-10 h-10 mx-auto mb-2 opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="7" width="2" height="10" />
        <rect x="7" y="7" width="1" height="10" />
        <rect x="10" y="7" width="3" height="10" />
        <rect x="15" y="7" width="1" height="10" />
        <rect x="18" y="7" width="3" height="10" />
      </svg>
      <p className="text-text-primary font-medium">Scanning isn&apos;t supported here</p>
      <p className="mt-1">Use manual search below, or open the app on a phone.</p>
    </div>
  );
}
