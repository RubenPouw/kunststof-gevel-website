function Star({ filled }: { filled: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
      <path
        d="M7 1.1 8.7 5.1h4.1L9.6 7.6l1.2 3.9L7 9.2 3.2 11.5 4.4 7.6 1.2 5.1h4.1z"
        fill={filled ? "#1B2838" : "none"}
        stroke="#1B2838"
        strokeWidth="0.8"
      />
    </svg>
  );
}

export function ReviewStars({ rating }: { rating: number }) {
  const score = Math.max(0, Math.min(5, Math.round(rating)));
  return (
    <span className="inline-flex gap-0.5" aria-label={`${score} van 5`}>
      {Array.from({ length: 5 }, (_, index) => (
        <Star key={index} filled={index < score} />
      ))}
    </span>
  );
}