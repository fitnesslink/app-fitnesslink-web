import Image from "next/image";

type Size = "sm" | "md" | "lg" | "xl";

interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: Size;
  className?: string;
}

const sizeClass: Record<Size, { box: string; text: string; px: number }> = {
  sm: { box: "w-8 h-8", text: "text-xs", px: 32 },
  md: { box: "w-10 h-10", text: "text-sm", px: 40 },
  lg: { box: "w-14 h-14", text: "text-base", px: 56 },
  xl: { box: "w-20 h-20", text: "text-lg", px: 80 },
};

function initials(name?: string): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export function Avatar({ src, alt, name, size = "md", className = "" }: AvatarProps) {
  const { box, text, px } = sizeClass[size];
  if (src) {
    return (
      <div className={`${box} relative rounded-full overflow-hidden ${className}`}>
        <Image src={src} alt={alt ?? name ?? ""} width={px} height={px} className="object-cover" />
      </div>
    );
  }
  return (
    <div
      className={`${box} rounded-full bg-primary-soft text-primary font-semibold flex items-center justify-center ${text} ${className}`}
      aria-label={name}
    >
      {initials(name)}
    </div>
  );
}
