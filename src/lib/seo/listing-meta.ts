import type { Metadata } from "next";

import { getBrandStory } from "@/data/seo/brands";
import { getBrand, hasActiveFilters } from "@/lib/catalog";
import { listingPageHref } from "@/lib/catalog/listing";
import type { ListingFilters } from "@/lib/catalog/types";

export async function brandViewMetadata(
  slug: string,
  filters: ListingFilters,
  pagina: number,
  pages: number,
): Promise<Metadata> {
  const brand = await getBrand(slug);
  if (!brand) return { title: "Merk", robots: { index: false, follow: false } };
  const story = getBrandStory(brand.slug);
  const path = `/merken/${brand.slug}`;
  return {
    title: story?.metaTitle ?? brand.name,
    description: story?.description ?? brand.summary,
    alternates: { canonical: path },
    robots: hasActiveFilters(filters) ? { index: false, follow: true } : undefined,
    pagination: {
      previous: pagina > 1 ? listingPageHref(path, filters, pagina - 1) : undefined,
      next: pagina < pages ? listingPageHref(path, filters, pagina + 1) : undefined,
    },
  };
}
