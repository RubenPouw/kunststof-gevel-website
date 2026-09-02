import type { Metadata } from "next";
import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";

import { QuoteForm } from "@/components/quote-form";
import { buttonVariants } from "@/components/ui/button";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Contact",
  description: "Neem contact op met Kunststofgevel voor advies, levering of montage.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
      <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">
        Contact
      </p>
      <h1 className="mt-2 max-w-2xl text-4xl sm:text-6xl">Bel, mail of stuur de gevel mee.</h1>
      <p className="mt-4 max-w-xl text-lg text-muted-foreground">
        We nemen geen ticketsysteem. Op werkdagen krijg je een persoon terug.
        Voor een prijs: gebruik het offerteformulier, dan hebben we meteen
        het oppervlak.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        <a
          href={site.phoneHref}
          className="rounded-2xl bg-card p-5 ring-1 ring-foreground/10 transition hover:shadow-md"
        >
          <Phone className="size-5 text-primary" />
          <p className="mt-3 text-sm text-muted-foreground">Telefoon</p>
          <p className="text-lg font-medium">{site.phone}</p>
        </a>
        <a
          href={site.emailHref}
          className="rounded-2xl bg-card p-5 ring-1 ring-foreground/10 transition hover:shadow-md"
        >
          <Mail className="size-5 text-primary" />
          <p className="mt-3 text-sm text-muted-foreground">E-mail</p>
          <p className="text-lg font-medium">{site.email}</p>
        </a>
        <div className="rounded-2xl bg-card p-5 ring-1 ring-foreground/10">
          <MapPin className="size-5 text-primary" />
          <p className="mt-3 text-sm text-muted-foreground">Werkgebied</p>
          <p className="text-lg font-medium">{site.region}</p>
          <p className="text-sm text-muted-foreground">{site.hours}</p>
        </div>
      </div>

      <div className="mt-14 grid gap-10 lg:grid-cols-[minmax(0,28rem)_1fr] lg:items-start">
        <div>
          <h2 className="text-3xl">Stuur een aanvraag</h2>
          <p className="mt-2 text-muted-foreground">
            Zelfde formulier als op de offertepagina. Foto’s mag je daarna
            mailen naar {site.email}.
          </p>
          <Link
            href="/offerte"
            className={cn(buttonVariants({ variant: "outline" }), "mt-4 inline-flex")}
          >
            Alleen de offertepagina
          </Link>
        </div>
        <QuoteForm />
      </div>
    </div>
  );
}
