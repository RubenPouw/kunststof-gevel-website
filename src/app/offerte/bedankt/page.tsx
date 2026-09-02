import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

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
    <div className="mx-auto max-w-xl px-4 py-16 sm:px-6 sm:py-24">
      <div className="rounded-2xl bg-card p-6 ring-1 ring-foreground/10 sm:p-8">
        <CheckCircle2 className="size-10 text-primary" />
        <h1 className="font-heading mt-4 text-4xl">Aanvraag ontvangen</h1>
        <p className="mt-3 text-muted-foreground">
          Referentie <span className="font-medium text-foreground">{reference}</span>.
          We reageren op werkdagen binnen 24 uur op {email}.
        </p>
        {area > 0 ? (
          <p className="mt-4 rounded-xl bg-secondary px-4 py-3 text-sm">
            Indicatie inclusief montage voor {area} m²:{" "}
            <strong>
              €{low.toLocaleString("nl-NL")} – €{high.toLocaleString("nl-NL")}
            </strong>
            . Dit is geen offerte; de vaste prijs volgt na opname.
          </p>
        ) : null}
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/offerte" className={cn(buttonVariants({ size: "lg" }), "h-11 px-5")}>
            Nieuwe aanvraag
          </Link>
          <Link href="/contact" className="self-center text-sm underline underline-offset-4">
            Liever bellen? {site.phone}
          </Link>
        </div>
      </div>
    </div>
  );
}
