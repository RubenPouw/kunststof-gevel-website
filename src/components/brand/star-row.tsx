function StarGlyph({ filled }: { filled: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden className="block">
      <path
        d="M12 2.2 14.8 8.4l6.8.8-5 4.7 1.3 6.7L12 17.6 6.1 20.6 7.4 13.9 2.4 9.2l6.8-.8L12 2.2Z"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="miter"
      />
    </svg>
  );
}

function Star({ fill }: { fill: number }) {
  const amount = Math.min(1, Math.max(0, fill));
  return (
    <span className="relative inline-block h-[14px] w-[14px] shrink-0">
      <StarGlyph filled={false} />
      {amount > 0 ? (
        <span
          className="absolute top-0 left-0 h-[14px] overflow-hidden"
          style={{ width: `${Math.round(amount * 100)}%` }}
        >
          <StarGlyph filled />
        </span>
      ) : null}
    </span>
  );
}

export function StarRow({ value }: { value: number }) {
  const safe = Math.min(5, Math.max(0, value));
  return (
    <span className="inline-flex items-center gap-0.5 text-kg-navy" aria-hidden>
      {Array.from({ length: 5 }, (_, index) => (
        <Star key={index} fill={safe - index} />
      ))}
    </span>
  );
}
