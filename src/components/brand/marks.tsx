import { cn } from "@/lib/utils";

type MarkProps = {
  size?: number;
  fill?: string;
  className?: string;
  title?: string;
};

export function CavesuppliesMark({
  size = 11,
  fill = "currentColor",
  className,
  title = "Cavesupplies",
}: MarkProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={cn("shrink-0", className)}
      aria-hidden={!title}
      role={title ? "img" : undefined}
    >
      {title ? <title>{title}</title> : null}
      <path d="M12 10 H78 L88 20 V32 H12 Z" fill={fill} />
      <rect x="12" y="35" width="22" height="33" fill={fill} />
      <rect x="12" y="68" width="76" height="22" fill={fill} />
    </svg>
  );
}

export function CavemenMark({
  size = 18,
  className,
  mono = false,
  fill = "#4A5568",
}: MarkProps & { mono?: boolean }) {
  if (mono) {
    return (
      <svg viewBox="0 0 100 100" width={size} height={size} className={cn("shrink-0", className)} aria-hidden>
        <path d="M10 12 H80 L90 22 V34 H10 Z" fill={fill} />
        <rect x="10" y="37" width="22" height="51" fill={fill} />
        <rect x="39" y="37" width="22" height="51" fill={fill} />
        <rect x="68" y="37" width="22" height="51" fill={fill} />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={cn("shrink-0", className)} aria-hidden>
      <path d="M10 12 H80 L90 22 V34 H10 Z" fill="url(#gb)" />
      <rect x="10" y="37" width="22" height="51" fill="#F4F2ED" />
      <rect x="39" y="37" width="22" height="51" fill="#D3D6D9" />
      <rect x="68" y="37" width="22" height="51" fill="#B9C0C7" />
    </svg>
  );
}
