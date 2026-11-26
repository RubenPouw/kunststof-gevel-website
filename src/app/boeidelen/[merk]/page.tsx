import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CategoryListing } from "@/components/catalog/category-listing";
import { boeiKeralitArticle, pageSeo } from "@/data/seo/category-pages";
import { resolveSprintLink } from "@/data/seo/product-sprint";
import { listProducts } from "@/lib/catalog";

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
  const products = merk === "keralit" ? await listProducts() : [];
  const widths =
    merk === "keralit"
      ? [
          { label: "boeideel 200 mm", slugs: ["keralit-dakrandpaneel-200mm", "keralit-dakrand-paneel-200"] },
          { label: "boeideel 250 mm", slugs: ["keralit-dakrandpaneel-250mm", "keralit-dakrand-paneel-250"] },
          { label: "boeideel 300 mm", slugs: ["keralit-dakrandpaneel-300mm", "keralit-dakrand-paneel-300"] },
          { label: "boeideel 350 mm", slugs: ["keralit-dakrandpaneel-350mm"] },
        ].flatMap((link) => {
          const resolved = resolveSprintLink(link, products);
          return resolved ? [resolved] : [];
        })
      : [];
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
      article={
        merk === "keralit"
          ? { ...boeiKeralitArticle, links: [...widths, ...boeiKeralitArticle.links] }
          : undefined
      }
    />
  );
}
