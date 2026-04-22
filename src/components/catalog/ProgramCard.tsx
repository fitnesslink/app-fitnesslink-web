"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { ProgramSummary } from "@/lib/catalog/types";

const levelTone: Record<string, "default" | "primary" | "warning"> = {
  beginner: "default",
  intermediate: "primary",
  advanced: "warning",
};

export function ProgramCard({ program }: { program: ProgramSummary }) {
  const [imageFailed, setImageFailed] = useState(false);
  const imageUrl = !imageFailed ? program.thumbnailUrl ?? null : null;

  return (
    <Link
      href={`/catalog/programs/${program.id}`}
      className="block"
      aria-label={`Open program ${program.name}`}
    >
      <Card className="h-full hover:border-primary transition-colors flex flex-col gap-3">
        <div className="aspect-[4/3] rounded-lg bg-gradient-to-br from-primary to-primary-hover text-white flex items-center justify-center overflow-hidden">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt=""
              className="w-full h-full object-cover"
              loading="lazy"
              onError={() => setImageFailed(true)}
            />
          ) : (
            <div className="text-center">
              <p className="text-3xl font-bold tabular-nums">{program.weeks}</p>
              <p className="text-xs uppercase tracking-wide opacity-90">weeks</p>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-text-primary truncate">{program.name}</h3>
          {program.description && (
            <p className="text-xs text-text-secondary mt-0.5 line-clamp-2">{program.description}</p>
          )}
        </div>
        {program.trainingLevel && (
          <div>
            <Badge tone={levelTone[program.trainingLevel] ?? "default"}>
              {program.trainingLevel}
            </Badge>
          </div>
        )}
      </Card>
    </Link>
  );
}
