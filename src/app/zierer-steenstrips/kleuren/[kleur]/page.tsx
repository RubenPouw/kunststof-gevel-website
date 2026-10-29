import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { KleurPage } from "@/components/catalog/kleur-page";
import { isZiererStrip, ziererKleuren, ziererKleurCopy } from "@/data/seo/slices";

type Props = { params: Promise<{ kleur: string }> };

export const revalidate = 3600;
export const dynamicParams = false;

export function generateStaticParams() {
  return ziererKleuren.map((kleur) => ({ kleur }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { kleur } = await params;
  if (!(ziererKleuren as readonly string[]).includes(kleur)) return { title: "Zierer" };
  const copy = ziererKleurCopy(kleur);
  const canonical = `/zierer-steenstrips/kleuren/${kleur}`;
  return {
    title: copy.title,
    description: copy.intro,
    alternates: { canonical },
  };
}

export default async function ZiererKleurPage({ params }: Props) {
  const { kleur } = await params;
  if (!(ziererKleuren as readonly string[]).includes(kleur)) notFound();
  const copy = ziererKleurCopy(kleur);
  const canonical = `/zierer-steenstrips/kleuren/${kleur}`;
  return (
    <KleurPage
      slug={kleur}
      loose
      productFilter={isZiererStrip}
      brandLabel="Zierer"
      heading={copy.h1}
      intro={copy.intro}
      parentHref="/zierer-steenstrips"
      parentLabel="Zierer steenstrips"
      canonical={canonical}
    />
  );
}
