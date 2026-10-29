import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AssortmentSlice } from "@/components/catalog/assortment-slice";
import { gevelTypes } from "@/data/seo/slices";
import { getProductsByCategory } from "@/lib/catalog";

type Props = { params: Promise<{ type: string }> };

export const revalidate = 3600;
export const dynamicParams = false;

export function generateStaticParams() {
  return gevelTypes.map((type) => ({ type: type.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { type } = await params;
  const profile = gevelTypes.find((item) => item.slug === type);
  if (!profile) return { title: "Gevelbekleding" };
  return {
    title: profile.title,
    description: profile.intro,
    alternates: { canonical: `/gevelbekleding/${profile.slug}` },
  };
}

export default async function GevelTypePage({ params }: Props) {
  const { type } = await params;
  const profile = gevelTypes.find((item) => item.slug === type);
  if (!profile) notFound();
  const products = (await getProductsByCategory("gevelbekleding")).filter(
    (product) => product.profileType === profile.profile,
  );
  return (
    <AssortmentSlice
      kicker="Gevelbekleding"
      title={profile.h1}
      intro={profile.intro}
      products={products}
      basePath={`/gevelbekleding/${profile.slug}`}
      parentHref="/gevelbekleding"
      parentLabel="Gevelbekleding"
    />
  );
}
