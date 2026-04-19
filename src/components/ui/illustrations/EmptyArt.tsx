// Line-art SVGs for empty-state tiles. Single-color (currentColor) so the
// containing `<EmptyState>` can tint them via Tailwind text color classes.

import type { SVGProps } from "react";

type Props = SVGProps<SVGSVGElement>;

const BASE: SVGProps<SVGSVGElement> = {
  viewBox: "0 0 160 120",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
};

const SIZE = "w-32 h-24 mx-auto";

export function WorkoutsEmptyArt(props: Props) {
  return (
    <svg {...BASE} {...props} className={`${SIZE} ${props.className ?? ""}`}>
      <line x1="40" y1="60" x2="120" y2="60" />
      <rect x="30" y="45" width="12" height="30" rx="2" />
      <rect x="118" y="45" width="12" height="30" rx="2" />
      <rect x="22" y="52" width="8" height="16" rx="1.5" />
      <rect x="130" y="52" width="8" height="16" rx="1.5" />
    </svg>
  );
}

export function ProgramsEmptyArt(props: Props) {
  return (
    <svg {...BASE} {...props} className={`${SIZE} ${props.className ?? ""}`}>
      <rect x="30" y="30" width="100" height="70" rx="6" />
      <line x1="30" y1="50" x2="130" y2="50" />
      <line x1="50" y1="30" x2="50" y2="100" />
      <circle cx="40" cy="40" r="2" fill="currentColor" />
      <line x1="60" y1="65" x2="125" y2="65" opacity="0.5" />
      <line x1="60" y1="78" x2="115" y2="78" opacity="0.5" />
      <line x1="60" y1="91" x2="120" y2="91" opacity="0.5" />
    </svg>
  );
}

export function FoodLogEmptyArt(props: Props) {
  return (
    <svg {...BASE} {...props} className={`${SIZE} ${props.className ?? ""}`}>
      <circle cx="80" cy="62" r="30" />
      <path d="M58 62h44" />
      <path d="M80 38v48" opacity="0.3" />
      <path d="M63 48l34 28" opacity="0.3" />
      <path d="M97 48l-34 28" opacity="0.3" />
    </svg>
  );
}

export function HabitsEmptyArt(props: Props) {
  return (
    <svg {...BASE} {...props} className={`${SIZE} ${props.className ?? ""}`}>
      <rect x="25" y="40" width="110" height="50" rx="4" />
      {Array.from({ length: 14 }).map((_, i) => (
        <rect
          key={i}
          x={30 + (i % 7) * 15}
          y={47 + Math.floor(i / 7) * 18}
          width="10"
          height="10"
          rx="1.5"
          opacity={i % 3 === 0 ? 0.9 : 0.3}
        />
      ))}
    </svg>
  );
}

export function PhotosEmptyArt(props: Props) {
  return (
    <svg {...BASE} {...props} className={`${SIZE} ${props.className ?? ""}`}>
      <rect x="30" y="35" width="100" height="60" rx="4" />
      <circle cx="80" cy="65" r="14" />
      <circle cx="80" cy="65" r="7" opacity="0.4" />
      <rect x="58" y="30" width="44" height="8" rx="2" />
    </svg>
  );
}

export function NotificationsEmptyArt(props: Props) {
  return (
    <svg {...BASE} {...props} className={`${SIZE} ${props.className ?? ""}`}>
      <path d="M65 40c0-8 6.7-15 15-15s15 7 15 15v18c0 6 3 10 5 12H60c2-2 5-6 5-12V40z" />
      <path d="M76 84a4 4 0 0 0 8 0" />
      <line x1="30" y1="40" x2="40" y2="40" opacity="0.5" />
      <line x1="120" y1="40" x2="130" y2="40" opacity="0.5" />
      <line x1="35" y1="55" x2="42" y2="55" opacity="0.3" />
      <line x1="118" y1="55" x2="125" y2="55" opacity="0.3" />
    </svg>
  );
}

export function ScheduleEmptyArt(props: Props) {
  return (
    <svg {...BASE} {...props} className={`${SIZE} ${props.className ?? ""}`}>
      <rect x="30" y="35" width="100" height="70" rx="4" />
      <line x1="30" y1="55" x2="130" y2="55" />
      <line x1="50" y1="30" x2="50" y2="40" />
      <line x1="110" y1="30" x2="110" y2="40" />
      {Array.from({ length: 12 }).map((_, i) => (
        <circle
          key={i}
          cx={42 + (i % 4) * 26}
          cy={70 + Math.floor(i / 4) * 12}
          r="2"
          opacity={i % 4 === 1 ? 1 : 0.2}
          fill="currentColor"
        />
      ))}
    </svg>
  );
}

export function GoalsEmptyArt(props: Props) {
  return (
    <svg {...BASE} {...props} className={`${SIZE} ${props.className ?? ""}`}>
      <circle cx="80" cy="60" r="36" />
      <circle cx="80" cy="60" r="22" />
      <circle cx="80" cy="60" r="8" />
      <path d="M80 12l4 10-4-2-4 2z" />
    </svg>
  );
}
