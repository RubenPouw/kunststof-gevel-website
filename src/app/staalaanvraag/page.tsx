import type { Metadata } from "next";

import { StaalPicker } from "@/components/staal/picker";
import { getCatalog } from "@/lib/catalog";
import { isBannedSampleProduct } from "@/lib/staal/banned";
import { applyFillout } from "@/lib/staal/fillout";
import { buildStaalTree, STAAL_DESCRIPTION, STAAL_HEADING } from "@/lib/staal/tree";

export const metadata: Metadata = {
  title: STAAL_HEADING,
  description: STAAL_DESCRIPTION,
  alternates: { canonical: "/staalaanvraag" },
};

type Props = {
  searchParams: Promise<{ groep?: string; product?: string; paneel?: string }>;
};

export default async function StaalaanvraagPage({ searchParams }: Props) {
  const params = await searchParams;
  const catalog = await getCatalog();
  const tree = applyFillout(buildStaalTree(catalog.products));
  const brandBySlug = Object.fromEntries(
    catalog.products
      .filter((product) => product.brandSlug && !isBannedSampleProduct(product))
      .map((product) => [product.slug, { id: product.brandSlug, label: product.brand }]),
  );
  return (
    <div className="container-kg py-8 sm:py-12">
      <StaalPicker
        tree={tree}
        groep={params.groep}
        product={params.product}
        paneel={params.paneel}
        brandBySlug={brandBySlug}
      />
    </div>
  );
}
