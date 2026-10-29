import { CavesuppliesMark } from "@/components/brand/marks";
import { lockupColor, lockupMetrics } from "@/lib/brand/lockup";
import { cn } from "@/lib/utils";

/** Niche lockup: name, then the C-mark and “onderdeel van Cavesupplies”. */
export function Lockup({
  size = 20,
  tone = "dark",
  className,
}: {
  size?: number;
  /** dark = kalk on navy. light = nachtblauw on a light ground. */
  tone?: "light" | "dark";
  className?: string;
}) {
  const metrics = lockupMetrics(size);
  const color = lockupColor(tone);

  return (
    <span
      className={cn("inline-flex w-max max-w-full flex-col items-start", className)}
      style={{ color, fontFamily: "var(--font-body)", rowGap: metrics.lineGap }}
    >
      <span
        className="whitespace-nowrap"
        style={{
          fontSize: size,
          fontWeight: 700,
          lineHeight: 1,
          letterSpacing: "var(--logo-tracking)",
        }}
      >
        kunststof-gevel.nl
      </span>
      <span className="inline-flex items-center whitespace-nowrap" style={{ columnGap: metrics.markGap }}>
        <CavesuppliesMark size={metrics.mark} fill={color} />
        <span style={{ fontSize: metrics.line2, fontWeight: 400, lineHeight: 1 }}>onderdeel van Cavesupplies</span>
      </span>
    </span>
  );
}
