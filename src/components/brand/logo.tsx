import Link from "next/link";

import { Lockup } from "@/components/brand/lockup";
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
    <span className={cn("inline-flex w-max max-w-full flex-col items-start", className)}>
      <Lockup size={size} tone={tone} />
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
      className="inline-flex w-max max-w-full text-inherit no-underline hover:text-inherit hover:no-underline"
      aria-label="kunststof-gevel.nl, onderdeel van Cavesupplies, naar home"
    >
      {content}
    </Link>
  );
}
