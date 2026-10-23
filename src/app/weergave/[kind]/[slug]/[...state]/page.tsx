import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BrandListing } from "@/components/catalog/brand-listing";
import { CategoryListing } from "@/components/catalog/category-listing";
import { LandingListing } from "@/components/catalog/landing-listing";
import { categoryViewMetadata } from "@/data/seo/categories";
import { brandViewMetadata, landingViewMetadata } from "@/lib/seo/listing-meta";
import { getProductsByBrand, getProductsByCategory, listBrands, parseListingSearchParams } from "@/lib/catalog";
import { parseListingPresentation } from "@/lib/catalog/helpers";
import { CATEGORY_PAGE_SIZE, PAGE_SIZE, prepareListing } from "@/lib/catalog/listing";
import { decodeListingState, isCategorySlug } from "@/lib/catalog/paths";
import { categorySlugs } from "@/lib/catalog/types";

type Props = { params: Promise<{ kind: string; slug: string; state: string[] }> };

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  const params: { kind: string; slug: string; state: string[] }[] = [];
  for (const slug of categorySlugs) {
    const products = await getProductsByCategory(slug);
    const pages = Math.min(Math.ceil(products.length / CATEGORY_PAGE_SIZE), 4);
    for (let page = 2; page <= pages; page += 1) {
      params.push({ kind: "categorie", slug, state: ["p", String(page)] });
    }
  }
  const brands = await listBrands();
  for (const brand of brands) {
    const products = await getProductsByBrand(brand.slug);
    const pages = Math.min(Math.ceil(products.length / PAGE_SIZE), 3);
    for (let page = 2; page <= pages; page += 1) {
      params.push({ kind: "merk", slug: brand.slug, state: ["p", String(page)] });
    }
  }
  return params;
}

async function readState(params: Props["params"]) {
  const { kind, slug, state } = await params;
  const decoded = decodeListingState(kind, slug, state);
  if (!decoded) return null;
  const filters = parseListingSearchParams(Object.fromEntries(decoded.search.entries()));
  const presentation = parseListingPresentation(decoded.search);
  return { ...decoded, filters, presentation };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const decoded = await readState(params);
  if (!decoded) return { title: "Assortiment", robots: { index: false, follow: false } };
  if (decoded.kind === "categorie") {
    if (!isCategorySlug(decoded.slug)) return { title: "Assortiment", robots: { index: false, follow: false } };
    const products = await getProductsByCategory(decoded.slug);
    const view = prepareListing(products, decoded.filters, decoded.pagina, CATEGORY_PAGE_SIZE, decoded.presentation.sort);
    return categoryViewMetadata(decoded.slug, decoded.filters, view.page, view.pages);
  }
  if (decoded.kind === "land") {
    return landingViewMetadata(decoded.slug, decoded.filters, decoded.pagina);
  }
  const products = await getProductsByBrand(decoded.slug);
  const view = prepareListing(products, decoded.filters, decoded.pagina, PAGE_SIZE, decoded.presentation.sort);
  return brandViewMetadata(decoded.slug, decoded.filters, view.page, view.pages);
}

export default async function ListingStatePage({ params }: Props) {
  const decoded = await readState(params);
  if (!decoded) notFound();
  if (decoded.kind === "categorie") {
    if (!isCategorySlug(decoded.slug)) notFound();
    return (
      <CategoryListing
        slug={decoded.slug}
        filters={decoded.filters}
        page={decoded.pagina}
        presentation={decoded.presentation}
      />
    );
  }
  if (decoded.kind === "land") {
    const listing = await LandingListing({
      slug: decoded.slug,
      filters: decoded.filters,
      page: decoded.pagina,
      presentation: decoded.presentation,
    });
    if (!listing) notFound();
    return listing;
  }
  const listing = await BrandListing({
    slug: decoded.slug,
    filters: decoded.filters,
    page: decoded.pagina,
    presentation: decoded.presentation,
  });
  if (!listing) notFound();
  return listing;
}
