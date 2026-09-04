import { cn } from "@/lib/utils";

const tones: Record<string, string[]> = {
  rabat: ["#7A4E2E", "#8C5A36", "#6E4326", "#9A6840"],
  sponningdeel: ["#3A3D41", "#45484C", "#323538", "#4C5055"],
  potdeksel: ["#5C2E22", "#6B3828", "#4E261C", "#7A4330"],
  "zweeds-rabat": ["#A39480", "#B3A490", "#8E8170", "#C4B6A2"],
};

export function ProfileSample({
  variant,
  className,
}: {
  variant: keyof typeof tones;
  className?: string;
}) {
  const colors = tones[variant] ?? tones.rabat;
  const isSponning = variant === "sponningdeel";
  const isZweeds = variant === "zweeds-rabat";

  return (
    <div
      className={cn(
        "relative h-44 overflow-hidden ring-1 ring-[var(--color-border)]",
        className,
      )}
      aria-hidden
    >
      <div className="absolute inset-0 flex flex-col gap-[3px] bg-[#1a1612] p-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="relative min-h-0 flex-1 overflow-hidden"
            style={{
              background: `linear-gradient(90deg, ${colors[i % colors.length]} 0%, ${colors[(i + 1) % colors.length]} 55%, ${colors[(i + 2) % colors.length]} 100%)`,
              clipPath: isZweeds
                ? "polygon(0 18%, 100% 0, 100% 100%, 0 100%)"
                : isSponning
                  ? undefined
                  : "polygon(0 0, 100% 0, 100% 100%, 0 82%)",
              marginTop: isSponning || i === 0 ? 0 : -6,
            }}
          >
            <div className="absolute inset-y-0 left-[12%] w-px bg-black/15" />
            <div className="absolute inset-y-0 left-[38%] w-px bg-white/10" />
            <div className="absolute inset-y-0 left-[71%] w-px bg-black/10" />
          </div>
        ))}
      </div>
    </div>
  );
}
