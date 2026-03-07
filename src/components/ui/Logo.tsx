"use client";

interface LogoProps {
  variant?: "light" | "dark";
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: "text-lg",
  md: "text-2xl",
  lg: "text-4xl",
};

export function Logo({ variant = "dark", size = "md" }: LogoProps) {
  const color = variant === "light" ? "text-white" : "text-text-primary";
  return (
    <div className={`${sizeMap[size]} ${color} tracking-widest`}>
      <span className="font-bold">FITNESS</span>
      <span className="font-light ml-1">LINK</span>
    </div>
  );
}
