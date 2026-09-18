import Link from "next/link";

import { ColorPanel } from "@/components/brand/color-panel";
import { buttonVariants } from "@/components/ui/button";
import type { Brand } from "@/lib/catalog/types";
import { cn } from "@/lib/utils";

export function BrandHero({
  brand,
  intro,
}: {
  brand: Brand;
  intro: string;
}) {
  return (
    <section className="container-kg mt-6">
      <div className="grid border border-[var(--color-border)] lg:grid-cols-2">
        <div className="px-8 py-12 text-white sm:px-14 sm:py-12" style={{ background: "var(--gradient-ink)" }}>
          <p className="text-[13px] text-[var(--kg-blue-300)]">
            <Link href="/" className="text-[var(--kg-blue-300)] no-underline hover:text-white">
              Home
            </Link>
            {" / "}
            <Link href="/merken" className="text-[var(--kg-blue-300)] no-underline hover:text-white">
              Merken
            </Link>
            {" / "}
            {brand.name}
          </p>
          <h1 className="display-plp mt-4 text-white">{brand.name} gevelbekleding</h1>
          <p className="mt-4 max-w-lg text-[15px] text-white/85">{intro}</p>
          <ul className="mt-6 space-y-2 text-[15px] text-white">
            {["Onderhoudsvrij en kleurvast", "Direct uit voorraad", "Passende hulpstukken erbij"].map((item) => (
              <li key={item}>
                <span className="mr-2 text-[var(--kg-blue-300)]">✓</span>
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link href="/#stalen" className={cn(buttonVariants({ variant: "primary" }))}>
              Vraag {brand.name} stalen aan
            </Link>
            <Link href="/offerte" className="text-[15px] text-white underline underline-offset-4 hover:text-[var(--kg-blue-100)]">
              Groot project? Prijs op maat
            </Link>
          </div>
        </div>
        <div className="relative min-h-[280px] lg:min-h-[420px]">
          <ColorPanel hex="#3A3D41" className="absolute inset-0" />
        </div>
      </div>
    </section>
  );
}
