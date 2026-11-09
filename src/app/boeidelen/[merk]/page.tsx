import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CategoryListing } from "@/components/catalog/category-listing";
import { boeiKeralitArticle, pageSeo } from "@/data/seo/category-pages";

export const revalidate = 3600;

const BRANDS = {
  keralit: pageSeo.boeiKeralit,
  vinyplus: pageSeo.boeiVinyplus,
  milexx: pageSeo.boeiMilexx,
} as const;

type BrandKey = keyof typeof BRANDS;

type Props = { params: Promise<{ merk: string }> };

export function generateStaticParams() {
  return (Object.keys(BRANDS) as BrandKey[]).map((merk) => ({ merk }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { merk } = await params;
  const page = BRANDS[merk as BrandKey];
  if (!page) return { title: "Boeidelen" };
  return {
    title: { absolute: page.title },
    description: page.description,
    alternates: { canonical: page.path },
  };
}

export default async function BoeiBrandPage({ params }: Props) {
  const { merk } = await params;
  const page = BRANDS[merk as BrandKey];
  if (!page) notFound();
  return (
    <CategoryListing
      slug="dakranden"
      filters={{ brandSlug: page.brand }}
      page={1}
      heading={{
        h1: page.h1,
        path: page.path,
        description: page.description,
        intro: merk === "keralit" ? boeiKeralitArticle.intro : page.description,
      }}
      article={merk === "keralit" ? boeiKeralitArticle : undefined}
    />
  );
}
