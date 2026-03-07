"use client";

interface BackButtonProps {
  onClick: () => void;
}

export function BackButton({ onClick }: BackButtonProps) {
  return (
    <button
      onClick={onClick}
      aria-label="Go back"
      className="p-2 -ml-2 text-white lg:text-text-primary hover:bg-white/10 lg:hover:bg-black/5 rounded-full transition-colors"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
          d="M15.41 7.41L14 6L8 12L14 18L15.41 16.59L10.83 12L15.41 7.41Z"
          fill="currentColor"
          fillOpacity="0.9"
        />
      </svg>
    </button>
  );
}
