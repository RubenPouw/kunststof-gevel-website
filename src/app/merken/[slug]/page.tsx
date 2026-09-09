import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CategoryPage } from "@/components/catalog/category-page";
import {
  applyListingFilters,
  brands,
  getBrand,
  getProductsByBrand,
  parseListingSearchParams,
} from "@/lib/catalog";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export function generateStaticParams() {
  return brands.map((brand) => ({ slug: brand.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const brand = getBrand(slug);
  if (!brand) return { title: "Merk" };
  return { title: brand.name, description: brand.summary };
}

export default async function BrandPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const brand = getBrand(slug);
  if (!brand) notFound();
  const filters = parseListingSearchParams(await searchParams);
  const all = getProductsByBrand(brand.slug);
  const products = applyListingFilters(all, { inStockOnly: filters.inStockOnly });

  return (
    <CategoryPage
      kicker="Merken"
      title={brand.name}
      intro={brand.summary}
      products={products}
      basePath={`/merken/${brand.slug}`}
      inStockOnly={filters.inStockOnly}
    />
  );
}
