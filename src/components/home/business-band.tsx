import Link from "next/link";

import { ColorPanel } from "@/components/brand/color-panel";
import { buttonVariants } from "@/components/ui/button";
import { businessPoints } from "@/lib/site";
import { cn } from "@/lib/utils";

export function BusinessBand() {
  return (
    <section className="container-kg section-kg border border-[var(--color-border)]">
      <div className="grid lg:grid-cols-2">
        <div className="relative min-h-[280px]">
          <ColorPanel hex="#16307A" className="absolute inset-0" />
        </div>
        <div className="p-8 sm:p-12" style={{ background: "var(--gradient-light)" }}>
          <p className="kicker">Zakelijk programma</p>
          <h2 className="mt-2 font-heading text-[40px] leading-none font-bold uppercase">
            Bestelt u voor uw zaak?
          </h2>
          <p className="mt-4 max-w-md text-[var(--color-text-soft)]">
            Zelfde prijsafspraak als particulier, voorraad van de merken die we zelf plaatsen,
            en bericht binnen 24 uur.
          </p>
          <ul className="mt-6 space-y-2 text-[15px]">
            {businessPoints.map((point) => (
              <li key={point}>
                <span className="mr-2 font-bold text-brand">✓</span>
                {point}
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/zakelijk" className={cn(buttonVariants({ variant: "secondary" }))}>
              Schrijf u gratis in
            </Link>
            <Link href="/zakelijk" className={cn(buttonVariants({ variant: "tertiary" }))}>
              Lees de voordelen
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
