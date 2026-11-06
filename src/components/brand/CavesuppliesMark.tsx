import { cn } from "@/lib/utils";

type CavesuppliesMarkProps = {
  className?: string;
};

/**
 * Cavesupplies mark, "kap op poten".
 * Width 1, cap 0.22, joint 0.06, left leg 0.30, foot 0.30, height 0.75.
 * The cap's top-right corner is cut at 45 degrees. One colour, currentColor.
 */
export function CavesuppliesMark({ className }: CavesuppliesMarkProps) {
  return (
    <svg
      viewBox="0 0 100 75"
      className={cn("block h-[0.7em] w-[0.933em] shrink-0", className)}
      style={{ height: "1cap", width: "calc(1cap / 0.75)" }}
      role="img"
      aria-label="Cavesupplies"
    >
      <path d="M0 0 H90 L100 10 V22 H0 Z" fill="currentColor" />
      <path d="M0 28 H30 V45 H100 V75 H0 Z" fill="currentColor" />
    </svg>
  );
}
