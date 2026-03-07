"use client";

import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline";
  fullWidth?: boolean;
  isLoading?: boolean;
}

export function Button({
  children,
  variant = "primary",
  fullWidth = true,
  isLoading = false,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const base =
    "h-14 rounded-full font-semibold text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer";

  const isDisabled = disabled || isLoading;

  const variants = {
    primary: isDisabled
      ? "bg-[#9FA9B7] text-white cursor-not-allowed"
      : "bg-primary text-white hover:bg-primary-dark focus:ring-primary",
    secondary:
      "bg-white text-text-primary hover:bg-gray-50 focus:ring-primary",
    outline: isDisabled
      ? "bg-transparent text-white/50 border-2 border-white/50 cursor-not-allowed"
      : "bg-transparent text-white border-2 border-white hover:bg-white hover:text-primary focus:ring-white",
  };

  const width = fullWidth ? "w-full" : "";

  return (
    <button
      className={`${base} ${variants[variant]} ${width} ${className}`}
      disabled={isDisabled}
      {...props}
    >
      {isLoading ? (
        <span className="inline-flex items-center gap-2">
          <svg
            className="animate-spin h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  );
}
