import type { Metadata } from "next";

import { kleurLabel, kleurMetadata, KleurPage } from "@/components/catalog/kleur-page";

export const revalidate = 3600;
export const dynamicParams = true;

type Props = { params: Promise<{ kleur: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { kleur } = await params;
  const canonical = `/gevelbekleding/kleuren/${kleur}`;
  return kleurMetadata(kleurLabel(kleur), canonical);
}

export default async function GevelKleurPage({ params }: Props) {
  const { kleur } = await params;
  return (
    <KleurPage
      slug={kleur}
      brandLabel="Kunststof gevelbekleding"
      parentHref="/gevelbekleding"
      parentLabel="Gevelbekleding"
      canonical={`/gevelbekleding/kleuren/${kleur}`}
    />
  );
}
