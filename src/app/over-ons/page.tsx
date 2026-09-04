import type { Metadata } from "next";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Over ons",
  description:
    "kunststof-gevel.nl is onderdeel van Cavemen BV. Advies, levering en plaatsing van kunststof gevelbekleding.",
};

export default function OverOnsPage() {
  return (
    <div className="container-kg max-w-3xl py-12 sm:py-16">
      <p className="kicker">Over ons</p>
      <h1 className="mt-2">Webshop eerst. Montage als u wilt.</h1>
      <div className="mt-8 space-y-5 text-[var(--color-text-soft)]">
        <p>
          {site.name} is de webshop van {site.company} voor kunststof
          gevelbekleding, dakranden en kozijnafwerking. U bestelt uit voorraad,
          of wij rekenen een vaste prijs voor plaatsing.
        </p>
        <p>
          We werken landelijk, met vaste ploegen en een korte lijst merken die
          we kennen. Dat betekent: geen exotische kleuren die zes weken op zich
          laten wachten, wel systemen waarvan we de garantie en de
          montagevoorschriften uit ons hoofd kennen.
        </p>
        <p>
          Particulier of aannemer: dezelfde prijsafspraak. Na opname krijgt u
          één bedrag, inclusief hoekprofielen, startlatten en afvoer van
          zaagresten.
        </p>
      </div>

      <dl className="mt-12 grid gap-4 sm:grid-cols-2">
        <div className="border border-[var(--color-border)] bg-surface p-5">
          <dt className="text-[13px] text-[var(--color-text-muted)]">Adres</dt>
          <dd className="mt-1 font-heading text-[22px] font-semibold">{site.address}</dd>
        </div>
        <div className="border border-[var(--color-border)] bg-surface p-5">
          <dt className="text-[13px] text-[var(--color-text-muted)]">Bereikbaar</dt>
          <dd className="mt-1 font-heading text-[22px] font-semibold">{site.hours}</dd>
        </div>
      </dl>

      <Link href="/offerte" className={buttonVariants({ variant: "primary", size: "lg" }) + " mt-10 inline-flex"}>
        Plan een opname
      </Link>
    </div>
  );
}
