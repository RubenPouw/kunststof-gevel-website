import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { KleurPage } from "@/components/catalog/kleur-page";
import { isVensterbankProduct, vensterbankKleuren, vensterbankKleurCopy } from "@/data/seo/slices";

type Props = { params: Promise<{ kleur: string }> };

export const revalidate = 3600;
export const dynamicParams = false;

export function generateStaticParams() {
  return vensterbankKleuren.map((kleur) => ({ kleur }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { kleur } = await params;
  if (!(vensterbankKleuren as readonly string[]).includes(kleur)) return { title: "Vensterbank" };
  const copy = vensterbankKleurCopy(kleur);
  const canonical = `/kunststof-vensterbank/kleuren/${kleur}`;
  return {
    title: copy.title,
    description: copy.intro,
    alternates: { canonical },
  };
}

export default async function VensterbankKleurPage({ params }: Props) {
  const { kleur } = await params;
  if (!(vensterbankKleuren as readonly string[]).includes(kleur)) notFound();
  const copy = vensterbankKleurCopy(kleur);
  const canonical = `/kunststof-vensterbank/kleuren/${kleur}`;
  return (
    <KleurPage
      slug={kleur}
      loose
      productFilter={isVensterbankProduct}
      brandLabel="Kunststof vensterbank"
      heading={copy.h1}
      intro={copy.intro}
      parentHref="/kunststof-vensterbank"
      parentLabel="Vensterbanken"
      canonical={canonical}
    />
  );
}
