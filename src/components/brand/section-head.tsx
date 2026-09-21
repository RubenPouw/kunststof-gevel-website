import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function SectionHead({
  title,
  aside,
  className,
}: {
  title: string;
  aside?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-5 flex items-baseline justify-between gap-4 border-b border-kg-navy pb-2.5",
        className,
      )}
    >
      <h2 className="text-[28px] leading-[1.1] font-bold tracking-[-0.03em]">{title}</h2>
      {aside ? (
        <span className="shrink-0 font-mono text-[14px] text-kg-text-2">{aside}</span>
      ) : null}
    </div>
  );
}

export function Bevel({
  size = 16,
  className,
  children,
  style,
}: {
  size?: 8 | 16 | 24;
  className?: string;
  children?: ReactNode;
  style?: React.CSSProperties;
}) {
  const clip =
    size === 24
      ? "bevel-24"
      : size === 8
        ? "bevel-8"
        : "bevel-16";
  return (
    <div className={cn("overflow-hidden", clip, className)} style={style}>
      {children}
    </div>
  );
}
