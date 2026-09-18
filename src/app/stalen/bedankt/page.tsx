import type { Metadata } from "next";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Stalen onderweg",
};

export default async function StalenBedanktPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const value = (key: string) => {
    const raw = params[key];
    return Array.isArray(raw) ? raw[0] : raw;
  };
  const reference = value("ref") ?? "onbekend";
  const email = value("email") ?? site.email;
  const n = value("n") ?? "uw";

  return (
    <div className="container-kg max-w-xl py-16">
      <div className="border border-[var(--color-border)] bg-surface p-6 sm:p-8">
        <p className="font-bold text-brand">✓</p>
        <h1 className="mt-4">Aanvraag ontvangen</h1>
        <p className="mt-3 text-[var(--color-text-soft)]">
          Referentie <span className="font-semibold text-kg-ink">{reference}</span>. {n} staal
          {n === "1" ? "" : "en"} gaan binnen twee werkdagen naar u onderweg. Bevestiging naar {email}.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/gevelbekleding" className={buttonVariants({ variant: "secondary", size: "lg" })}>
            Verder winkelen
          </Link>
          <Link href="/contact" className="self-center text-[14px] underline">
            Liever bellen? {site.phone}
          </Link>
        </div>
      </div>
    </div>
  );
}
