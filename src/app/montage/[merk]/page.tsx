import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AssortmentSlice } from "@/components/catalog/assortment-slice";
import { montageCopy, montageMerken } from "@/data/seo/slices";
import { getProductsByCategory } from "@/lib/catalog";

type Props = { params: Promise<{ merk: string }> };

export const revalidate = 3600;
export const dynamicParams = false;

export function generateStaticParams() {
  return montageMerken.map((merk) => ({ merk: merk.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { merk } = await params;
  const brand = montageMerken.find((item) => item.slug === merk);
  if (!brand) return { title: "Montage" };
  const copy = montageCopy(brand.label);
  return {
    title: copy.title,
    description: copy.intro,
    alternates: { canonical: `/montage/${brand.slug}` },
  };
}

export default async function MontageMerkPage({ params }: Props) {
  const { merk } = await params;
  const brand = montageMerken.find((item) => item.slug === merk);
  if (!brand) notFound();
  const copy = montageCopy(brand.label);
  const products = (await getProductsByCategory("montage")).filter((product) => product.brandSlug === brand.slug);
  return (
    <AssortmentSlice
      kicker="Montage"
      title={copy.h1}
      intro={copy.intro}
      products={products}
      basePath={`/montage/${brand.slug}`}
      parentHref="/montage"
      parentLabel="Montage"
    />
  );
}
