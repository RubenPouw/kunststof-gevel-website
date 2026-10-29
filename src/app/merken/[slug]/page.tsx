import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BrandListing } from "@/components/catalog/brand-listing";
import { getBrandStory } from "@/data/seo/brands";
import { getBrand, getProductsByBrand, listBrands } from "@/lib/catalog";
import { PAGE_SIZE } from "@/lib/catalog/listing";
import { staticBrands } from "@/lib/catalog/static";

type Props = { params: Promise<{ slug: string }> };

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  const brands = await listBrands();
  const slugs = new Set<string>([
    ...staticBrands.map((brand) => brand.slug),
    ...brands.map((brand) => brand.slug),
  ]);
  return [...slugs].map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const brand = await getBrand(slug);
  if (!brand) return { title: "Merk" };
  const story = getBrandStory(brand.slug);
  const products = await getProductsByBrand(brand.slug);
  const pages = Math.ceil(products.length / PAGE_SIZE);
  return {
    title: story?.metaTitle ?? brand.name,
    description: story?.description ?? brand.summary,
    alternates: { canonical: `/merken/${brand.slug}` },
    ...(brand.slug === "overig" ? { robots: { index: false, follow: true } } : {}),
    ...(pages > 1 ? { pagination: { next: `/merken/${brand.slug}?pagina=2` } } : {}),
  };
}

export default async function BrandPage({ params }: Props) {
  const { slug } = await params;
  const listing = await BrandListing({ slug, filters: {}, page: 1 });
  if (!listing) notFound();
  return listing;
}
