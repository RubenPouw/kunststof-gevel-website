import type { Metadata } from "next";

import { kleurLabel, kleurMetadata, KleurPage } from "@/components/catalog/kleur-page";

export const revalidate = 3600;
export const dynamicParams = true;

type Props = { params: Promise<{ slug: string; kleur: string }> };

const BRAND_LABEL: Record<string, string> = {
  keralit: "Keralit",
  eurotexx: "Eurotexx",
  kerrafront: "Kerrafront",
  milexx: "Milexx",
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, kleur } = await params;
  const canonical = `/merken/${slug}/kleuren/${kleur}`;
  return kleurMetadata(`${kleurLabel(kleur)}, ${BRAND_LABEL[slug] ?? slug}`, canonical);
}

export default async function MerkKleurPage({ params }: Props) {
  const { slug, kleur } = await params;
  const label = BRAND_LABEL[slug] ?? slug;
  return (
    <KleurPage
      slug={kleur}
      brandSlug={slug}
      brandLabel={label}
      parentHref={slug === "keralit" ? "/product-categorie/kunststof-gevelbekleding/keralit-gevelbekleding" : `/merken/${slug}`}
      parentLabel={label}
      canonical={`/merken/${slug}/kleuren/${kleur}`}
    />
  );
}
