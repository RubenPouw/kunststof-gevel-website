import Link from "next/link";

import { SegmentBar } from "@/components/brand/segment-bar";
import { cn } from "@/lib/utils";

type LogoProps = {
  size?: number;
  tone?: "light" | "dark";
  bar?: boolean;
  tagline?: boolean;
  href?: string;
  className?: string;
};

export function Logo({
  size = 17,
  tone = "light",
  bar = true,
  tagline = false,
  href = "/",
  className,
}: LogoProps) {
  const dark = tone === "dark";
  const content = (
    <span
      className={cn("inline-flex flex-col self-start", className)}
      style={{ gap: Math.round(size * 0.25) }}
    >
      <span
        className="whitespace-nowrap"
        style={{
          font: `500 ${size}px/1 var(--font-body)`,
          letterSpacing: "var(--logo-tracking)",
          color: dark ? "var(--kg-offwhite)" : "var(--kg-ink)",
        }}
      >
        kunststof-gevel
        <span style={{ color: "var(--kg-orange)" }}>.nl</span>
      </span>
      {bar ? <SegmentBar size={size} tone={tone} /> : null}
      {tagline ? (
        <span
          className="uppercase"
          style={{
            font: `500 ${Math.round(size * 0.23)}px/1 var(--font-body)`,
            letterSpacing: "0.1em",
            color: dark ? "var(--kg-blue-100)" : "var(--kg-ink)",
            opacity: dark ? 1 : 0.7,
          }}
        >
          Geniet langer van uw huis, ga voor kunststof
        </span>
      ) : null}
    </span>
  );

  if (!href) return content;

  return (
    <Link href={href} className="inline-flex text-inherit no-underline hover:text-inherit">
      <span className="sr-only">kunststof-gevel.nl, naar home</span>
      <span aria-hidden>{content}</span>
    </Link>
  );
}
