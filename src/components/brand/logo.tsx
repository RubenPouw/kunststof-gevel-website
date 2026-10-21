import Link from "next/link";

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
  size = 20,
  tone = "light",
  tagline = false,
  href = "/",
  className,
}: LogoProps) {
  const dark = tone === "dark";
  const content = (
    <span className={cn("inline-flex w-max flex-col items-stretch gap-0.5", className)}>
      <span
        className="whitespace-nowrap font-bold"
        style={{
          fontSize: size,
          lineHeight: 1,
          letterSpacing: "-0.03em",
          color: dark ? "var(--kg-kalk)" : "var(--kg-navy)",
        }}
      >
        kunststof-gevel.nl
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
      className="inline-flex w-max text-inherit no-underline hover:text-inherit hover:no-underline"
      aria-label="kunststof-gevel.nl, naar home"
    >
      {content}
    </Link>
  );
}
