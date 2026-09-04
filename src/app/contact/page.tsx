import type { Metadata } from "next";
import Link from "next/link";

import { QuoteForm } from "@/components/quote-form";
import { buttonVariants } from "@/components/ui/button";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Neem contact op met kunststof-gevel.nl voor advies, levering of montage.",
};

export default function ContactPage() {
  return (
    <div className="container-kg py-12 sm:py-16">
      <p className="kicker">Contact</p>
      <h1 className="mt-2 max-w-2xl">Bel, mail of stuur de gevel mee.</h1>
      <p className="mt-4 max-w-xl text-[var(--color-text-soft)]">
        We nemen geen ticketsysteem. Op werkdagen krijgt u een persoon terug.
        Voor een prijs: gebruik het offerteformulier, dan hebben we meteen het
        oppervlak.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        <a
          href={site.phoneHref}
          className="border border-[var(--color-border)] bg-surface p-5 text-inherit no-underline hover:text-inherit hover:bg-tint"
        >
          <p className="text-[13px] text-[var(--color-text-muted)]">Telefoon</p>
          <p className="mt-1 font-heading text-[22px] font-semibold">{site.phone}</p>
        </a>
        <a
          href={site.emailHref}
          className="border border-[var(--color-border)] bg-surface p-5 text-inherit no-underline hover:text-inherit hover:bg-tint"
        >
          <p className="text-[13px] text-[var(--color-text-muted)]">E-mail</p>
          <p className="mt-1 font-heading text-[22px] font-semibold">{site.email}</p>
        </a>
        <div className="border border-[var(--color-border)] bg-surface p-5">
          <p className="text-[13px] text-[var(--color-text-muted)]">Adres</p>
          <p className="mt-1 font-heading text-[22px] font-semibold">{site.address}</p>
          <p className="text-[13px] text-[var(--color-text-muted)]">{site.hours}</p>
        </div>
      </div>

      <div className="mt-14 grid gap-10 lg:grid-cols-[minmax(0,28rem)_1fr] lg:items-start">
        <div>
          <h2>Stuur een aanvraag</h2>
          <p className="mt-2 text-[var(--color-text-muted)]">
            Zelfde formulier als op de offertepagina. Foto’s mag u daarna mailen
            naar {site.email}.
          </p>
          <Link href="/offerte" className={buttonVariants({ variant: "tertiary" }) + " mt-4 inline-flex"}>
            Alleen de offertepagina
          </Link>
        </div>
        <QuoteForm />
      </div>
    </div>
  );
}
