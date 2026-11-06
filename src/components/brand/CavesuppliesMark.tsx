import { cn } from "@/lib/utils";

type CavesuppliesMarkProps = {
  className?: string;
};

/**
 * Cavesupplies mark: a square C made of a cap and an L.
 * The cap's top-right corner is cut at 45 degrees.
 * The viewBox is the ink, so a height of 1cap matches the neighbouring capitals.
 * In the lockup the mark is one colour, the same as the type next to it.
 */
export function CavesuppliesMark({ className }: CavesuppliesMarkProps) {
  return (
    <svg
      viewBox="12 10 76 80"
      className={cn("block h-[0.7em] w-[0.665em] shrink-0", className)}
      style={{ height: "1cap", width: "calc(1cap * 76 / 80)" }}
      role="img"
      aria-label="Cavesupplies"
    >
      <path d="M12 10 H78 L88 20 V32 H12 Z" fill="currentColor" />
      <rect x="12" y="35" width="22" height="33" fill="currentColor" />
      <rect x="12" y="68" width="76" height="22" fill="currentColor" />
    </svg>
  );
}
