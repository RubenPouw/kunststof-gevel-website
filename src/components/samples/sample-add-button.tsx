"use client";

import { buttonVariants } from "@/components/ui/button";
import type { SampleColor } from "@/lib/catalog/types";
import { SAMPLE_LIMIT, useSamples } from "@/lib/samples";
import { cn } from "@/lib/utils";

export function SampleAddButton({
  sample,
  className,
  label = "Staal",
  caption,
  variant = "outline",
  size = "sm",
}: {
  sample: SampleColor;
  className?: string;
  label?: string;
  caption?: string;
  variant?: "outline" | "secondary";
  size?: "sm" | "default";
}) {
  const { has, toggle, count } = useSamples();
  const selected = has(sample.id);
  const blocked = !selected && count >= SAMPLE_LIMIT;

  const button = (
    <button
      type="button"
      onClick={() => toggle(sample)}
      disabled={blocked}
      aria-pressed={selected}
      className={cn(
        buttonVariants({ variant, size }),
        size === "sm" && "text-[14px]",
        selected && "bg-kg-kalk",
        className,
      )}
    >
      {selected ? "In tray" : label}
    </button>
  );

  if (!caption) return button;

  return (
    <span className="flex flex-col">
      {button}
      <span className="mt-1 text-[13px] text-kg-text-2">{caption}</span>
    </span>
  );
}
