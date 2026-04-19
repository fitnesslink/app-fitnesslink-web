"use client";

import type { InputHTMLAttributes } from "react";

interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  showValue?: boolean;
}

export function Slider({ showValue, className = "", value, ...props }: SliderProps) {
  return (
    <div className="flex items-center gap-3">
      <input
        type="range"
        value={value}
        className={`flex-1 accent-primary ${className}`}
        {...props}
      />
      {showValue && (
        <span className="text-sm font-medium text-text-primary tabular-nums min-w-[2ch] text-right">
          {value}
        </span>
      )}
    </div>
  );
}
