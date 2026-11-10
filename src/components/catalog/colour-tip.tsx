import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Colour name above a swatch. Immediate on hover and keyboard focus, not the slow native title. */
export function ColourTip({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <span className={cn("group/tip relative inline-flex", className)}>
      {children}
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-[calc(100%+6px)] left-1/2 z-30 -translate-x-1/2 bg-kg-navy px-2 py-1 font-sans text-[13px] leading-none font-medium whitespace-nowrap text-white opacity-0 group-hover/tip:opacity-100 group-has-[:focus-visible]/tip:opacity-100 max-sm:hidden"
      >
        {label}
      </span>
    </span>
  );
}
