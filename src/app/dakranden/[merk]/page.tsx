import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AssortmentSlice } from "@/components/catalog/assortment-slice";
import { SeoArticle } from "@/components/seo/article";
import { dakrandCopy, dakrandMerken } from "@/data/seo/slices";
import restoredDakrand from "@/data/seo/restored-dakrand-keralit.json" with { type: "json" };
import { getProductsByCategory } from "@/lib/catalog";
import type { SeoSection } from "@/data/seo/brands";

type Props = { params: Promise<{ merk: string }> };

export const revalidate = 3600;
export const dynamicParams = false;

export function generateStaticParams() {
  return dakrandMerken.map((merk) => ({ merk: merk.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { merk } = await params;
  const brand = dakrandMerken.find((item) => item.slug === merk);
  if (!brand) return { title: "Dakrand" };
  const copy = dakrandCopy(brand.label);
  return {
    title: copy.title,
    description: copy.intro,
    alternates: { canonical: `/dakranden/${brand.slug}` },
  };
}

export default async function DakrandMerkPage({ params }: Props) {
  const { merk } = await params;
  const brand = dakrandMerken.find((item) => item.slug === merk);
  if (!brand) notFound();
  const copy = dakrandCopy(brand.label);
  const products = (await getProductsByCategory("dakranden")).filter((product) => product.brandSlug === brand.slug);
  return (
    <>
      <AssortmentSlice
        kicker="Dakranden"
        title={copy.h1}
        intro={copy.intro}
        products={products}
        basePath={`/dakranden/${brand.slug}`}
        parentHref="/dakranden"
        parentLabel="Dakranden"
      />
      {brand.slug === "keralit" ? (
        <SeoArticle sections={restoredDakrand as SeoSection[]} links={[{ href: "/stalen", label: "Kleurstaal aanvragen" }]} />
      ) : null}
    </>
  );
}
