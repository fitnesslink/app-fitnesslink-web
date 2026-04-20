"use client";

import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  variant?: "dark" | "light";
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, variant = "dark", className = "", id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    // dark = white pill on dark bg (mobile), light = bordered on light bg (desktop)
    const inputStyles =
      variant === "dark"
        ? "bg-white text-text-primary placeholder:text-text-secondary/60"
        : "bg-white text-text-primary border border-border/30 placeholder:text-text-secondary/60";

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-white/70 lg:text-text-secondary mb-1.5"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`w-full h-14 px-6 rounded-full border-0 transition-colors outline-2 outline-transparent focus:outline-primary ${inputStyles} ${
            error ? "outline-error" : ""
          } ${className}`}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-error">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
