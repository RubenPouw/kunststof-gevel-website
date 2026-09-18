"use client";

import { useEffect } from "react";

import { ColorPanel } from "@/components/brand/color-panel";
import { SampleTrayCard } from "@/components/samples/sample-tray-card";
import type { SampleColor } from "@/lib/catalog/types";
import { SAMPLE_LIMIT, useSamples } from "@/lib/samples";
import { cn } from "@/lib/utils";

export function SamplesSection({ colors }: { colors: SampleColor[] }) {
  const { has, toggle, count } = useSamples();

  useEffect(() => {
    if (window.location.hash !== "#stalen") return;
    document.getElementById("stalen")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <section id="stalen" className="container-kg section-kg scroll-mt-[130px]">
      <div className="grid gap-12 lg:grid-cols-[1fr_360px]">
        <div>
          <p className="kicker">Gratis kleurstalen</p>
          <h2 className="mt-2 font-heading text-[44px] leading-none font-bold uppercase">Kies je kleur</h2>
          <p className="mt-4 max-w-xl text-[var(--color-text-soft)]">
            Vraag tot vier kleuren gratis aan. U ziet de folie in uw licht, zonder verplichting.
            Kies hieronder; de tray rechts houdt bij wat u meeneemt.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-px bg-[var(--color-border)] sm:grid-cols-4 md:grid-cols-6">
            {colors.map((color) => {
              const selected = has(color.id);
              const blocked = !selected && count >= SAMPLE_LIMIT;
              return (
                <button
                  key={color.id}
                  type="button"
                  onClick={() => toggle(color)}
                  disabled={blocked}
                  className="relative bg-kg-offwhite p-0 text-left transition-colors duration-150 disabled:opacity-45"
                >
                  <div className="relative aspect-square">
                    <ColorPanel hex={color.hex} className="absolute inset-0" />
                    {selected ? (
                      <span className="absolute top-2 right-2 grid size-6 place-items-center bg-brand text-[12px] font-bold text-white">
                        ✓
                      </span>
                    ) : null}
                  </div>
                  <span className="block px-2 py-2">
                    <span className="block text-[14px] font-medium">{color.colorName}</span>
                    <span className="block text-[11px] text-[var(--color-text-muted)]">
                      {color.ral ?? color.brandName}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
        <SampleTrayCard className={cn("lg:sticky lg:top-[130px] h-fit")} />
      </div>
    </section>
  );
}
