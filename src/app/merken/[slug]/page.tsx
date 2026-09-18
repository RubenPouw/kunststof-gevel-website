import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BrandHero } from "@/components/catalog/brand-hero";
import { GuaranteeBand } from "@/components/catalog/guarantee-band";
import { ProductListing } from "@/components/catalog/product-listing";
import {
  applyListingFilters,
  getBrand,
  getProductsByBrand,
  parseListingSearchParams,
} from "@/lib/catalog";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const brand = await getBrand(slug);
  if (!brand) return { title: "Merk" };
  return { title: brand.name, description: brand.summary };
}

export default async function BrandPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const brand = await getBrand(slug);
  if (!brand) notFound();
  const filters = parseListingSearchParams(await searchParams);
  const all = await getProductsByBrand(brand.slug);
  const products = applyListingFilters(all, filters);

  return (
    <div className="pb-8">
      <BrandHero brand={brand} intro={brand.summary} />
      <div className="container-kg">
        <ProductListing
          products={products}
          allProducts={all}
          basePath={`/merken/${brand.slug}`}
          filters={filters}
          totalUnfiltered={all.length}
        />
      </div>
      <GuaranteeBand />
    </div>
  );
}
