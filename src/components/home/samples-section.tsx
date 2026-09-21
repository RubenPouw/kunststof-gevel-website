"use client";

import { useEffect } from "react";

import { SectionHead } from "@/components/brand/section-head";
import { SampleTrayCard } from "@/components/samples/sample-tray-card";
import type { SampleColor } from "@/lib/catalog/types";
import { SAMPLE_LIMIT, useSamples } from "@/lib/samples";
import { cn } from "@/lib/utils";

export function SamplesSection({ colors }: { colors: SampleColor[] }) {
  const { has, toggle, count, items } = useSamples();

  useEffect(() => {
    if (window.location.hash !== "#stalen") return;
    document.getElementById("stalen")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <section id="stalen" className="container-kg section-kg scroll-mt-[130px]">
      <div className="grid gap-8 lg:grid-cols-[8fr_4fr]">
        <div>
          <SectionHead title="Kies je kleur" aside="Gratis · maximaal 4 stalen" />
          <p className="mb-5 max-w-[560px] text-kg-text-2">
            Echte paneelstalen, binnen 2 werkdagen thuis. Kies in daglicht, niet op een scherm.
          </p>
          <div className="grid grid-cols-3 gap-x-5 gap-y-3 sm:grid-cols-4 md:grid-cols-6">
            {colors.slice(0, 12).map((color) => {
              const selected = has(color.id);
              const pos = items.findIndex((item) => item.id === color.id);
              const blocked = !selected && count >= SAMPLE_LIMIT;
              return (
                <button
                  key={color.id}
                  type="button"
                  onClick={() => toggle(color)}
                  disabled={blocked}
                  className="relative text-left disabled:opacity-45"
                >
                  <div
                    className={cn("relative aspect-square", selected && "outline outline-2 outline-offset-2 outline-kg-navy")}
                    style={{ background: color.hex }}
                  >
                    {selected ? (
                      <span className="absolute top-1.5 right-1.5 bg-kg-navy px-1.5 py-0.5 font-mono text-[11px] text-kg-signal">
                        {String(pos + 1).padStart(2, "0")}
                      </span>
                    ) : null}
                  </div>
                  <span className="mt-2 block text-[15px] font-medium">{color.colorName}</span>
                  <span className="block font-mono text-[12px] text-kg-text-2">{color.ral ?? color.brandName}</span>
                </button>
              );
            })}
          </div>
        </div>
        <SampleTrayCard className="h-fit lg:sticky lg:top-[130px]" />
      </div>
    </section>
  );
}
