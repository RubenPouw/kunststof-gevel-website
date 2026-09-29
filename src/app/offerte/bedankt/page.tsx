import type { Metadata } from "next";
import Link from "next/link";

import { RememberLead } from "@/components/account/remember-lead";
import { buttonVariants } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Aanvraag ontvangen",
  robots: { index: false, follow: false },
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
  const email = value("email") ?? "";
  const area = Number(value("area") ?? "0");
  const low = Number(value("low") ?? "0");
  const high = Number(value("high") ?? "0");
  const montage = value("montage") !== "0";

  return (
    <div className="container-kg max-w-xl py-16">
      <RememberLead
        type="offerte"
        reference={reference}
        email={email}
        summary={
          area > 0
            ? `${area} m² · ${montage ? "inclusief montage" : "materiaal"}`
            : "Offerteaanvraag"
        }
      />
      <div className="border border-[var(--color-border)] bg-surface p-6 sm:p-8">
        <p className="font-bold text-brand">✓</p>
        <h1 className="mt-4">Aanvraag ontvangen</h1>
        <p className="mt-3 text-[var(--color-text-soft)]">
          Referentie <span className="font-semibold text-kg-ink">{reference}</span>.
          We reageren op werkdagen binnen 24 uur op {email || site.email}.
        </p>
        {area > 0 ? (
          <p className="mt-4 bg-kg-offwhite px-4 py-3 text-[14px]">
            Indicatie {montage ? "inclusief montage" : "voor materiaal"} voor {area} m²:{" "}
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
          <Link href="/account" className="self-center text-[14px] underline">
            Bewaar de referentie in uw account
          </Link>
          <Link href={site.phoneHref} className="self-center text-[14px] underline">
            Liever bellen? {site.phone}
          </Link>
        </div>
      </div>
    </div>
  );
}
