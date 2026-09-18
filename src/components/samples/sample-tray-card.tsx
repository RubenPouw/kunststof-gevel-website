"use client";

import Link from "next/link";

import { ColorPanel } from "@/components/brand/color-panel";
import { SegmentBar } from "@/components/brand/segment-bar";
import { buttonVariants } from "@/components/ui/button";
import { SAMPLE_LIMIT, trayProgress, useSamples } from "@/lib/samples";
import { cn } from "@/lib/utils";

export function SampleTrayCard({ className }: { className?: string }) {
  const { items, count, remove } = useSamples();

  return (
    <aside className={cn("border border-[var(--color-border)] bg-surface p-6", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="font-heading text-[22px] font-semibold">Uw stalen</h3>
        <p className="text-[13px] text-[var(--color-text-muted)]">
          {count} van {SAMPLE_LIMIT}
        </p>
      </div>
      <SegmentBar size={60} progress={trayProgress(count)} className="mt-4" />
      <ul className="mt-5 grid gap-2">
        {Array.from({ length: SAMPLE_LIMIT }, (_, index) => {
          const item = items[index];
          if (!item) {
            return (
              <li
                key={`empty-${index}`}
                className="flex min-h-14 items-center gap-3 border border-dashed border-[var(--color-border-strong)] px-3"
              >
                <span className="size-8 border border-dashed border-[var(--color-border-strong)]" />
                <span className="text-[13px] text-[var(--color-text-muted)]">
                  Staal {index + 1}
                  <span className="block text-[11px]">Kies een kleur</span>
                </span>
              </li>
            );
          }
          return (
            <li
              key={item.id}
              className="flex min-h-14 items-center gap-3 border border-brand px-3"
            >
              <ColorPanel hex={item.hex} className="size-8" />
              <span className="min-w-0 flex-1">
                <span className="block text-[14px] font-medium">{item.colorName}</span>
                <span className="block text-[11px] text-[var(--color-text-muted)]">
                  {item.ral ?? item.brandName}
                </span>
              </span>
              <button
                type="button"
                onClick={() => remove(item.id)}
                className="grid size-11 place-items-center text-[18px] leading-none text-kg-ink"
                aria-label={`${item.colorName} verwijderen`}
              >
                ×
              </button>
            </li>
          );
        })}
      </ul>
      <Link
        href="/stalen"
        className={cn(
          buttonVariants({ variant: "primary", block: true }),
          "mt-5",
          count === 0 && "pointer-events-none opacity-45",
        )}
        aria-disabled={count === 0}
      >
        Stalen gratis aanvragen
      </Link>
      <p className="mt-2 text-[13px] text-[var(--color-text-muted)]">
        Binnen 2 werkdagen thuis. U zit nergens aan vast.
      </p>
    </aside>
  );
}
