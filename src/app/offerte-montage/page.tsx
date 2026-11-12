import type { Metadata } from "next";

import { montageQuoteShouldIndex } from "@/lib/montage-quote";

import { MontageQuotePrefill } from "./prefill";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  const prefilled = !montageQuoteShouldIndex(params);
  return {
    title: "Offerte montage",
    description:
      "Vraag vrijblijvend een montage-offerte aan. Cavemen monteert gevelbekleding en kozijnen.",
    alternates: { canonical: "/offerte-montage" },
    ...(prefilled ? { robots: { index: false, follow: true } } : {}),
  };
}

export default function MontageOffertePage() {
  return (
    <div className="container-kg max-w-3xl py-12 sm:py-16">
      <MontageQuotePrefill />
    </div>
  );
}
