import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import type { SampleColor } from "@/lib/catalog/types";
import { cn } from "@/lib/utils";

function previewSwatches(colors: SampleColor[]) {
  const seen = new Set<string>();
  const swatches: { id: string; hex: string }[] = [];
  for (const color of colors) {
    const hex = color.hex.trim().toLowerCase();
    if (!hex || seen.has(hex)) continue;
    seen.add(hex);
    swatches.push({ id: color.id, hex: color.hex });
    if (swatches.length >= 6) break;
  }
  return swatches;
}

export function SamplesSection({ colors }: { colors: SampleColor[] }) {
  const swatches = previewSwatches(colors);

  return (
    <section id="stalen" className="container-kg section-kg scroll-mt-[130px]">
      <div className="flex flex-col gap-6 bg-kg-navy px-6 py-8 text-kg-kalk sm:px-10 sm:py-10 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
        <div className="max-w-xl">
          <p className="font-mono text-[13px] text-kg-grind">Gratis · maximaal 4 stalen</p>
          <h2 className="mt-3 text-[28px] leading-[1.1] font-bold tracking-[-0.03em] sm:text-[34px]">
            Gratis kleurstalen
          </h2>
          <p className="mt-4 max-w-md text-[15px] leading-[1.5] text-kg-grind">
            Echte paneelstalen, gratis en binnen 2 werkdagen thuis. Kies in daglicht, niet op een scherm.
          </p>
          {swatches.length > 0 ? (
            <ul className="mt-5 flex" aria-hidden="true">
              {swatches.map((swatch) => (
                <li
                  key={swatch.id}
                  className="-ml-2 size-9 border-2 border-kg-navy first:ml-0"
                  style={{ background: swatch.hex }}
                />
              ))}
            </ul>
          ) : null}
        </div>
        <Link
          href="/staalaanvraag"
          className={cn(buttonVariants({ variant: "signal" }), "w-fit no-underline hover:no-underline")}
        >
          Gratis stalen aanvragen
        </Link>
      </div>
    </section>
  );
}
