import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AssortmentSlice } from "@/components/catalog/assortment-slice";
import { KleurPage } from "@/components/catalog/kleur-page";
import { dutchKleurLabel, hplFinishMatch, hplFinishes } from "@/data/seo/slices";
import { getProductsByCategory, listProducts } from "@/lib/catalog";
import { slugKey } from "@/lib/catalog/derive";
import type { Product } from "@/lib/catalog/types";

type Props = { params: Promise<{ kleur: string }> };

const RESERVED = new Set(["kleur-structuur", "6-mm", "boeiboord", "dakoverstek", "gevel", "balkon"]);

export const revalidate = 3600;
export const dynamicParams = true;

export function generateStaticParams() {
  return hplFinishes.map((finish) => ({ kleur: finish.slug }));
}

function finishOf(slug: string) {
  return hplFinishes.find((finish) => finish.slug === slug);
}

function colourHit(product: Product, slug: string) {
  return product.colors.some((color) => {
    const key = slugKey(color.name);
    return key === slug || key.split("-").includes(slug);
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { kleur } = await params;
  if (RESERVED.has(kleur)) return { title: "HPL" };
  const finish = finishOf(kleur);
  if (finish) {
    return {
      title: finish.title,
      description: finish.intro,
      alternates: { canonical: `/hpl-plaat/${finish.slug}` },
    };
  }
  const label = dutchKleurLabel(kleur);
  const canonical = `/hpl-plaat/${kleur}`;
  return {
    title: `HPL plaat ${label}`,
    description: `HPL platen in ${label}. Hele plaat, wij zagen niet op maat.`,
    alternates: { canonical },
  };
}

export default async function HplKleurPage({ params }: Props) {
  const { kleur } = await params;
  if (RESERVED.has(kleur)) notFound();
  const finish = finishOf(kleur);
  if (finish) {
    const products = (await getProductsByCategory("hpl-platen")).filter((product) => hplFinishMatch(product, finish.slug));
    return (
      <AssortmentSlice
        kicker="HPL"
        title={finish.h1}
        intro={finish.intro}
        products={products}
        basePath={`/hpl-plaat/${finish.slug}`}
        parentHref="/hpl-plaat"
        parentLabel="HPL plaat"
      />
    );
  }
  const products = await listProducts();
  const known = products.some((product) => product.category === "hpl-platen" && colourHit(product, kleur));
  if (!known) notFound();
  const label = dutchKleurLabel(kleur);
  return (
    <KleurPage
      slug={kleur}
      loose
      productFilter={(product) => product.category === "hpl-platen"}
      brandLabel="HPL plaat"
      heading={`HPL plaat in ${label}`}
      intro={`HPL platen in ${label} uit de shopcollectie. Een plaat gaat de deur uit als hele plaat. Wij zagen niet op maat.`}
      parentHref="/hpl-plaat"
      parentLabel="HPL plaat"
      canonical={`/hpl-plaat/${kleur}`}
    />
  );
}
