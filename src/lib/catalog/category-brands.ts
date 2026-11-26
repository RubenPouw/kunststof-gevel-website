import { isProfileBrandBlocked } from "@/lib/catalog/brand-profiles";
import type { Brand } from "@/lib/catalog/types";

export const CATEGORY_BRAND_COPY = {
  title: "Kies je merk",
} as const;

/** Brands of this category only. Blocked lines and the leftover bucket stay out. */
export function brandsForCategoryStrip(brands: Brand[]): Brand[] {
  const seen = new Set<string>();
  const tiles: Brand[] = [];
  for (const brand of brands) {
    if (seen.has(brand.slug) || brand.slug === "overig") continue;
    if (isProfileBrandBlocked(brand.slug, brand.name)) continue;
    if (/\beko\b/i.test(`${brand.slug} ${brand.name}`)) continue;
    seen.add(brand.slug);
    tiles.push(brand);
  }
  return tiles.sort((a, b) => a.name.localeCompare(b.name, "nl") || a.slug.localeCompare(b.slug));
}
