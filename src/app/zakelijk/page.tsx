import type { Metadata } from "next";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Zakelijk",
  description: "Vaste prijzen voor aannemers. Geen staffelkortingen die later in meerwerk verdwijnen.",
};

export default function ZakelijkPage() {
  return (
    <div className="container-kg max-w-3xl py-12 sm:py-16">
      <p className="kicker">Zakelijk</p>
      <h1 className="mt-2">Voor aannemers die herhalen.</h1>
      <div className="mt-6 space-y-4 text-[var(--color-text-soft)]">
        <p>
          Particulier of aannemer: dezelfde prijsafspraak. Geen staffelkortingen
          die later in meerwerk verdwijnen. Na opname krijgt u één bedrag,
          inclusief hoekprofielen, startlatten en afvoer van zaagresten.
        </p>
        <p>
          We werken met een korte lijst merken: Keralit, VinyPlus, Eurotexx en
          Wooddesign. Dat betekent voorraad, bekende folies en garantie die we
          uit ons hoofd kennen.
        </p>
        <p>
          Bestellen via de webshop of een projectofferte. Altijd binnen 24 uur
          bericht. Vragen? WhatsApp of {site.email}.
        </p>
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/offerte" className={buttonVariants({ variant: "primary" })}>
          Vraag een projectofferte
        </Link>
        <Link href="/inloggen" className={buttonVariants({ variant: "tertiary" })}>
          Zakelijk inloggen
        </Link>
      </div>
    </div>
  );
}
