import type { Metadata } from "next";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Over ons",
  description:
    "Kunststofgevel is een Nederlands montagebedrijf voor onderhoudsarme gevelbekleding. Advies, levering en plaatsing.",
};

export default function OverOnsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
      <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">
        Over ons
      </p>
      <h1 className="mt-2 text-4xl sm:text-6xl">Montage eerst. Webshop later.</h1>
      <div className="mt-8 space-y-5 text-lg text-muted-foreground">
        <p>
          {site.name} bestaat omdat te veel gevels falen op de details: geen
          ventilatie achter de panelen, te krappe dilatatie, verkeerde
          schroeven in een folie die daardoor splijt. Wij zijn geen
          anonieme webshop. We komen langs, we meten, en we zetten de gevel
          zelf.
        </p>
        <p>
          We werken landelijk, met vaste ploegen en een korte lijst merken
          die we kennen. Dat betekent: geen exotische kleuren die zes weken
          op zich laten wachten, wel systemen waarvan we de garantie en de
          montagevoorschriften uit ons hoofd kennen.
        </p>
        <p>
          Particulier of aannemer: dezelfde prijsafspraak. Geen
          staffelkortingen die later in meerwerk verdwijnen. Na opname krijg
          je één bedrag, inclusief hoekprofielen, startlatten en afvoer van
          zaagresten.
        </p>
      </div>

      <dl className="mt-12 grid gap-6 sm:grid-cols-2">
        <div className="rounded-2xl bg-card p-5 ring-1 ring-foreground/10">
          <dt className="text-sm text-muted-foreground">Werkgebied</dt>
          <dd className="mt-1 text-xl">{site.region}</dd>
        </div>
        <div className="rounded-2xl bg-card p-5 ring-1 ring-foreground/10">
          <dt className="text-sm text-muted-foreground">Bereikbaar</dt>
          <dd className="mt-1 text-xl">{site.hours}</dd>
        </div>
      </dl>

      <Link href="/offerte" className={cn(buttonVariants({ size: "lg" }), "mt-10 inline-flex h-12 px-6")}>
        Plan een opname
      </Link>
    </div>
  );
}
