import { cavesuppliesMarkPath, MARK_UNITS } from "@/lib/brand/lockup";
import { cn } from "@/lib/utils";

type MarkProps = {
  size?: number;
  fill?: string;
  className?: string;
  title?: string;
};

/** One-colour Cavesupplies C. No gradient. At least 12px tall. */
export function CavesuppliesMark({
  size = 12,
  fill = "currentColor",
  className,
  title,
}: MarkProps) {
  const height = Math.max(12, size);
  return (
    <svg
      viewBox={`0 0 ${MARK_UNITS} ${MARK_UNITS}`}
      width={height}
      height={height}
      className={cn("block shrink-0", className)}
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
    >
      {title ? <title>{title}</title> : null}
      <path d={cavesuppliesMarkPath()} fill={fill} />
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
