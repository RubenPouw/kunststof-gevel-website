import Link from "next/link";

import { Bevel } from "@/components/brand/section-head";
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
    <section className="container-kg pt-8 lg:pt-10">
      <div className="grid items-end gap-5 lg:grid-cols-[7fr_5fr]">
        <div>
          <p className="font-mono text-[13px] text-kg-text-2">
            <Link href="/" className="no-underline hover:underline">
              Home
            </Link>
            {" / "}
            <Link href="/merken" className="no-underline hover:underline">
              Merken
            </Link>
            {" / "}
            {brand.name}
          </p>
          <h1 className="display-plp mt-3">{brand.name}</h1>
          <p className="mt-4 max-w-lg text-[16px] text-kg-text-2">{intro}</p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link href="/#stalen" className={cn(buttonVariants({ variant: "primary" }), "no-underline hover:no-underline")}>
              {brand.name} stalen aanvragen
            </Link>
            <Link href="/montage" className={cn(buttonVariants({ variant: "outline" }), "no-underline hover:no-underline")}>
              Montage-instructie
            </Link>
            <span className="font-mono text-[13px] text-kg-text-2">Groot project? Prijs op maat</span>
          </div>
        </div>
        <Bevel size={24} className="relative h-[220px] lg:h-[300px]" style={{ background: "#3A3D41" }}>
          <div
            className="absolute inset-0"
            style={{
              background:
                "repeating-linear-gradient(90deg, #2f3236 0 10px, #3A3D41 10px 22px)",
            }}
          />
        </Bevel>
      </div>
    </section>
  );
}
