import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BrandListing } from "@/components/catalog/brand-listing";
import { CategoryListing } from "@/components/catalog/category-listing";
import { categoryViewMetadata } from "@/data/seo/categories";
import { brandViewMetadata } from "@/lib/seo/listing-meta";
import { getProductsByBrand, getProductsByCategory, listBrands, parseListingSearchParams } from "@/lib/catalog";
import { PAGE_SIZE, prepareListing } from "@/lib/catalog/listing";
import { decodeListingState, isCategorySlug } from "@/lib/catalog/paths";
import { categorySlugs } from "@/lib/catalog/types";

type Props = { params: Promise<{ kind: string; slug: string; state: string[] }> };

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  const params: { kind: string; slug: string; state: string[] }[] = [];
  for (const slug of categorySlugs) {
    const products = await getProductsByCategory(slug);
    const pages = Math.min(Math.ceil(products.length / PAGE_SIZE), 4);
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
  return { ...decoded, filters };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const decoded = await readState(params);
  if (!decoded) return { title: "Assortiment", robots: { index: false, follow: false } };
  if (decoded.kind === "categorie") {
    if (!isCategorySlug(decoded.slug)) return { title: "Assortiment", robots: { index: false, follow: false } };
    const products = await getProductsByCategory(decoded.slug);
    const view = prepareListing(products, decoded.filters, decoded.pagina);
    return categoryViewMetadata(decoded.slug, decoded.filters, view.page, view.pages);
  }
  const products = await getProductsByBrand(decoded.slug);
  const view = prepareListing(products, decoded.filters, decoded.pagina);
  return brandViewMetadata(decoded.slug, decoded.filters, view.page, view.pages);
}

export default async function ListingStatePage({ params }: Props) {
  const decoded = await readState(params);
  if (!decoded) notFound();
  if (decoded.kind === "categorie") {
    if (!isCategorySlug(decoded.slug)) notFound();
    return <CategoryListing slug={decoded.slug} filters={decoded.filters} page={decoded.pagina} />;
  }
  const listing = await BrandListing({ slug: decoded.slug, filters: decoded.filters, page: decoded.pagina });
  if (!listing) notFound();
  return listing;
}
