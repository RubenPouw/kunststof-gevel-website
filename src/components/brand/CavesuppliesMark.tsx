type CavesuppliesMarkProps = {
  /** Square side, in px. The lockup uses 58% of the wordmark size. */
  size?: number;
  className?: string;
};

/**
 * Cavesupplies mark: a square C made of a cap and an L.
 * The cap's top-right corner is cut at 45 degrees.
 * In the lockup the mark is one colour, the same as the type next to it.
 */
export function CavesuppliesMark({ size = 16, className }: CavesuppliesMarkProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label="Cavesupplies"
    >
      <path d="M12 10 H78 L88 20 V32 H12 Z" fill="currentColor" />
      <rect x="12" y="35" width="22" height="33" fill="currentColor" />
      <rect x="12" y="68" width="76" height="22" fill="currentColor" />
    </svg>
  );
}
