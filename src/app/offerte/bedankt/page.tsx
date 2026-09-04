import type { Metadata } from "next";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Aanvraag ontvangen",
};

export default async function OfferteBedanktPage({
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
  const area = Number(value("area") ?? "0");
  const low = Number(value("low") ?? "0");
  const high = Number(value("high") ?? "0");

  return (
    <div className="container-kg max-w-xl py-16">
      <div className="border border-[var(--color-border)] bg-surface p-6 sm:p-8">
        <p className="font-bold text-brand">✓</p>
        <h1 className="mt-4">Aanvraag ontvangen</h1>
        <p className="mt-3 text-[var(--color-text-soft)]">
          Referentie <span className="font-semibold text-kg-ink">{reference}</span>.
          We reageren op werkdagen binnen 24 uur op {email}.
        </p>
        {area > 0 ? (
          <p className="mt-4 bg-kg-offwhite px-4 py-3 text-[14px]">
            Indicatie inclusief montage voor {area} m²:{" "}
            <strong className="font-heading text-[22px] font-bold">
              {formatPrice(low)} – {formatPrice(high)}
            </strong>
            . Dit is geen offerte; de vaste prijs volgt na opname.
          </p>
        ) : null}
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/offerte" className={buttonVariants({ variant: "secondary", size: "lg" })}>
            Nieuwe aanvraag
          </Link>
          <Link href="/contact" className="self-center text-[14px] underline">
            Liever bellen? {site.phone}
          </Link>
        </div>
      </div>
    </div>
  );
}
