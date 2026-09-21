"use client";

import Link from "next/link";

import { SAMPLE_LIMIT, useSamples } from "@/lib/samples";
import { cn } from "@/lib/utils";

export function SampleTrayCard({ className }: { className?: string }) {
  const { items, count, remove } = useSamples();

  return (
    <aside className={cn("bg-kg-navy p-6 text-kg-kalk", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-[22px] font-bold tracking-[-0.03em]">Uw stalen</h3>
        <p className="font-mono text-[13px] text-kg-grind">
          {count} van {SAMPLE_LIMIT}
        </p>
      </div>
      <ul className="mt-5 grid gap-2">
        {Array.from({ length: SAMPLE_LIMIT }, (_, index) => {
          const item = items[index];
          if (!item) {
            return (
              <li
                key={`empty-${index}`}
                className="flex min-h-14 items-center gap-3 bg-kg-navy-2 px-3"
                style={{ boxShadow: "inset 0 3px 0 #2A4258" }}
              >
                <span className="size-[30px] bg-[var(--kg-line-dark)]" />
                <span className="font-mono text-[13px] text-kg-grind">
                  Staal {index + 1}
                  <span className="block">kies een kleur</span>
                </span>
              </li>
            );
          }
          return (
            <li
              key={item.id}
              className="flex min-h-14 items-center gap-3 bg-kg-navy-2 px-3"
              style={{ boxShadow: "inset 0 3px 0 #FFD400" }}
            >
              <span className="size-[30px]" style={{ background: item.hex }} />
              <span className="min-w-0 flex-1">
                <span className="block text-[14px] font-medium text-kg-kalk">{item.colorName}</span>
                <span className="block font-mono text-[12px] text-kg-grind">
                  {item.ral ?? item.brandName}
                </span>
              </span>
              <button
                type="button"
                onClick={() => remove(item.id)}
                className="grid size-11 place-items-center text-[18px] leading-none text-kg-kalk"
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
          "mt-5 flex h-12 items-center justify-center bg-kg-signal text-[15px] font-medium text-kg-navy no-underline hover:no-underline",
          count === 0 && "pointer-events-none opacity-45",
        )}
        aria-disabled={count === 0}
      >
        Stalen aanvragen
      </Link>
      <p className="mt-2 font-mono text-[13px] text-kg-grind">
        Gratis · binnen 2 werkdagen · geen verplichting
      </p>
    </aside>
  );
}
