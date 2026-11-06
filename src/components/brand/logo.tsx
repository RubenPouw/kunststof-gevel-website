import Link from "next/link";

import { CavesuppliesMark } from "@/components/brand/CavesuppliesMark";
import { cn } from "@/lib/utils";

type LogoProps = {
  size?: number;
  tone?: "light" | "dark";
  bar?: boolean;
  tagline?: boolean;
  /** Wordmark plus "onderdeel van Cavesupplies" and the C mark. */
  lockup?: boolean;
  href?: string;
  className?: string;
};

export function Logo({
  size = 20,
  tone = "light",
  tagline = false,
  lockup = false,
  href = "/",
  className,
}: LogoProps) {
  const dark = tone === "dark";
  const color = dark ? "var(--kg-kalk)" : "var(--kg-navy)";
  const lineSize = size * 0.58;
  const content = (
    <span className={cn("inline-flex max-w-full shrink-0 flex-col items-start gap-0.5", className)}>
      <span className="inline-flex max-w-full shrink-0 flex-wrap items-center gap-x-3 gap-y-1">
        <span
          className="shrink-0 whitespace-nowrap font-bold"
          style={{
            fontSize: size,
            lineHeight: 1,
            letterSpacing: "-0.03em",
            color,
          }}
        >
          kunststof-gevel.nl
        </span>
        {lockup ? (
          <span
            className="inline-flex shrink-0 items-baseline gap-1.5 whitespace-nowrap font-medium"
            style={{ fontSize: lineSize, lineHeight: 1.15, color }}
          >
            <CavesuppliesMark />
            <span className="whitespace-nowrap">onderdeel van Cavesupplies</span>
          </span>
        ) : null}
      </span>
      {tagline ? (
        <span
          className="mt-3 max-w-xs"
          style={{
            fontSize: 15,
            lineHeight: 1.5,
            color: dark ? "var(--kg-grind)" : "var(--kg-text-2)",
          }}
        >
          Nooit meer schilderen. Vervang hout door kunststof.
        </span>
      ) : null}
    </span>
  );

  if (!href) return content;

  return (
    <Link
      href={href}
      className="inline-flex max-w-full shrink-0 text-inherit no-underline hover:text-inherit hover:no-underline"
      aria-label={lockup ? "kunststof-gevel.nl, onderdeel van Cavesupplies, naar home" : "kunststof-gevel.nl, naar home"}
    >
      {content}
    </Link>
  );
}
