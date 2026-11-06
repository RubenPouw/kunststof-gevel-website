import Link from "next/link";

import { CavesuppliesMark } from "@/components/brand/CavesuppliesMark";
import { cn } from "@/lib/utils";

type LogoProps = {
  size?: number;
  tone?: "light" | "dark";
  bar?: boolean;
  tagline?: boolean;
  /** Niche lockup: name, then the C mark and "onderdeel van Cavesupplies" underneath. */
  lockup?: boolean;
  href?: string;
  className?: string;
};

const plex = "var(--font-plex-sans), Helvetica, Arial, sans-serif";

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
  const content = lockup ? (
    <span
      className={cn(
        "inline-flex max-w-full shrink-0 flex-col items-start gap-[0.2em] text-[16px] leading-none sm:text-[20px]",
        className,
      )}
      style={{ fontFamily: plex, color }}
    >
      <span className="shrink-0 whitespace-nowrap font-bold" style={{ letterSpacing: "-0.03em" }}>
        kunststof-gevel.nl
      </span>
      <span
        className="inline-flex shrink-0 items-baseline gap-[0.35em] whitespace-nowrap font-normal leading-[1.15]"
        style={{ fontSize: "0.58em" }}
      >
        <CavesuppliesMark />
        <span className="whitespace-nowrap">onderdeel van Cavesupplies</span>
      </span>
    </span>
  ) : (
    <span className={cn("inline-flex w-max flex-col items-stretch gap-0.5", className)}>
      <span
        className="whitespace-nowrap font-bold"
        style={{
          fontFamily: plex,
          fontSize: size,
          lineHeight: 1,
          letterSpacing: "-0.03em",
          color,
        }}
      >
        kunststof-gevel.nl
      </span>
      {tagline ? (
        <span
          className="mt-3 max-w-xs font-normal"
          style={{
            fontFamily: plex,
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
