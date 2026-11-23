function Star({ filled, tone, size }: { filled: boolean; tone: "ink" | "signal"; size: number }) {
  const fill = tone === "signal" ? "#FFD400" : "#1B2838";
  const stroke = tone === "signal" ? "#F5B800" : "#1B2838";
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" aria-hidden className="shrink-0">
      <path
        d="M7 1.1 8.7 5.1h4.1L9.6 7.6l1.2 3.9L7 9.2 3.2 11.5 4.4 7.6 1.2 5.1h4.1z"
        fill={filled ? fill : "none"}
        stroke={stroke}
        strokeWidth="0.8"
      />
    </svg>
  );
}

export function ReviewStars({
  rating,
  tone = "ink",
  size = 14,
  label,
}: {
  rating: number;
  tone?: "ink" | "signal";
  size?: number;
  label?: string;
}) {
  const score = Math.max(0, Math.min(5, Math.round(rating)));
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={label ?? `${score} van 5`}>
      {Array.from({ length: 5 }, (_, index) => (
        <Star key={index} filled={index < score} tone={tone} size={size} />
      ))}
    </span>
  );
}
