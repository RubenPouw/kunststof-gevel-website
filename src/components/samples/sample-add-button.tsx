"use client";

import { buttonVariants } from "@/components/ui/button";
import type { SampleColor } from "@/lib/catalog/types";
import { SAMPLE_LIMIT, useSamples } from "@/lib/samples";
import { cn } from "@/lib/utils";

export function SampleAddButton({
  sample,
  className,
  label = "+ staal",
}: {
  sample: SampleColor;
  className?: string;
  label?: string;
}) {
  const { has, toggle, count } = useSamples();
  const selected = has(sample.id);
  const blocked = !selected && count >= SAMPLE_LIMIT;

  return (
    <button
      type="button"
      onClick={() => toggle(sample)}
      disabled={blocked}
      className={cn(
        buttonVariants({ variant: "outline" }),
        "text-[14px]",
        selected && "bg-tint",
        className,
      )}
    >
      {selected ? "In tray" : label}
    </button>
  );
}
