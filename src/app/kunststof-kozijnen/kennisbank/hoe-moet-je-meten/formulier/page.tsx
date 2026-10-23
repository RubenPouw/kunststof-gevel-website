import type { Metadata } from "next";
import Link from "next/link";

import { PrintFormButton } from "@/components/kozijnen/print-button";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd } from "@/lib/seo/schema";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Meetformulier kozijn",
  description: "Print of download het meetformulier voor een kunststof kozijn. Drie breedtes, drie hoogtes, de kleinste maat.",
  alternates: { canonical: "/kunststof-kozijnen/kennisbank/hoe-moet-je-meten/formulier" },
};

const FIELDS = [
  "Adres",
  "Ruimte of gevel",
  "Nieuwbouw of renovatie",
  "Stelkozijn aanwezig",
  "Breedte boven",
  "Breedte midden",
  "Breedte onder",
  "Hoogte links",
  "Hoogte midden",
  "Hoogte rechts",
  "Diagonaal 1",
  "Diagonaal 2",
  "Aanslag of stomp",
  "Onderdorpel",
  "Onderkant glas vanaf de vloer",
  "Draairichting, van buiten",
  "Notities",
];

export default function MeetFormPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Kennisbank", path: "/kunststof-kozijnen/kennisbank" },
          { name: "Meten", path: "/kunststof-kozijnen/kennisbank/hoe-moet-je-meten" },
          { name: "Formulier", path: "/kunststof-kozijnen/kennisbank/hoe-moet-je-meten/formulier" },
        ])}
      />
      <div className="container-kg max-w-3xl py-12 print:py-0">
        <p className="font-mono text-[13px] text-kg-text-2 print:hidden">
          <Link href="/kunststof-kozijnen/kennisbank/hoe-moet-je-meten" className="underline underline-offset-[3px]">
            Meetinstructie
          </Link>
          {" / Formulier"}
        </p>
        <h1 className="mt-4">Meetformulier</h1>
        <p className="mt-3 text-[16px] text-kg-text-2">
          Maten in millimeters. Drie keer meten, de kleinste breedte en de kleinste hoogte aanhouden.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3 print:hidden">
          <a className="inline-flex h-12 items-center bg-kg-navy px-4 text-[15px] font-medium text-white no-underline" href="/api/kozijnen/meetformulier">
            PDF downloaden
          </a>
          <PrintFormButton />
        </div>
        <form className="mt-8 grid gap-4 print:mt-4" action="#">
          {FIELDS.map((field) => (
            <label key={field} className="grid gap-1 text-[14px] sm:grid-cols-[16rem_1fr] sm:items-center">
              <span>{field}</span>
              <input className="h-11 border border-kg-navy bg-white px-3" name={field} />
            </label>
          ))}
        </form>
        <p className="mt-6 text-[14px] text-kg-text-2">
          De kleinste breedte en de kleinste hoogte gaan naar de aanvraag.{" "}
          <Link href="/kunststof-kozijnen" className="print:hidden">
            Naar de configurator
          </Link>
        </p>
      </div>
    </>
  );
}
