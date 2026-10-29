import type { Metadata } from "next";

import { getBrandStory } from "@/data/seo/brands";
import { getLandingStory, isLandingSlug } from "@/data/seo/landings";
import { getBrand, hasActiveFilters } from "@/lib/catalog";
import { productsForLandingSlug } from "@/lib/catalog/landing-products";
import { KERALIT_CANONICAL } from "@/lib/seo/migratie";
import { CATEGORY_PAGE_SIZE, listingPageHref, prepareListing } from "@/lib/catalog/listing";
import type { ListingFilters } from "@/lib/catalog/types";

export async function landingViewMetadata(slug: string, filters: ListingFilters, pagina: number): Promise<Metadata> {
  const story = getLandingStory(slug);
  if (!story || !isLandingSlug(slug)) return { title: "Assortiment", robots: { index: false, follow: false } };
  const products = await productsForLandingSlug(slug);
  const view = prepareListing(products, filters, pagina, CATEGORY_PAGE_SIZE);
  const path = slug === "keralit-gevelbekleding" ? KERALIT_CANONICAL : `/${slug}`;
  const filtered = hasActiveFilters(filters) || pagina > 1;
  const title = story.metaTitle.includes("|") ? { absolute: story.metaTitle } : story.metaTitle;
  return {
    title,
    description: story.description,
    alternates: filtered ? undefined : { canonical: path },
    robots: filtered ? { index: false, follow: true } : undefined,
    pagination: {
      previous: pagina > 1 ? listingPageHref(path, filters, pagina - 1) : undefined,
      next: pagina < view.pages ? listingPageHref(path, filters, pagina + 1) : undefined,
    },
  };
}

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
  const filtered = hasActiveFilters(filters);
  return {
    title: story?.metaTitle ?? `${brand.name} gevelbekleding`,
    description: story?.description ?? brand.summary,
    alternates: filtered ? undefined : { canonical: path },
    robots: filtered ? { index: false, follow: true } : undefined,
    pagination: {
      previous: pagina > 1 ? listingPageHref(path, filters, pagina - 1) : undefined,
      next: pagina < pages ? listingPageHref(path, filters, pagina + 1) : undefined,
    },
  };
}
