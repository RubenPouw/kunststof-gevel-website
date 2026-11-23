import { matchProductLine } from "@/lib/catalog/text-rules";

import { isBannedSampleText } from "./banned";
import { sampleBrandLabel } from "./labels";

/** Client-side filter state. "alle" is the reset for that row. */
export const STAAL_FILTER_ALL = "alle";

export type StaalFacet = {
  id: string;
  label: string;
  swatches: number;
};

export type StaalGroupFilter = {
  id: string;
  title: string;
  image?: string;
  swatches: { name: string; lineLabel: string; image?: string; productSlugs: string[] }[];
  categoryId: string;
  categoryLabel: string;
  brandId: string;
  brandLabel: string;
};

type BrandRef = { id: string; label: string };

/**
 * Known panel kinds, in the order of the filter row.
 * A line that matches none of these keeps its own title, placed with the gevel lines.
 */
const CATEGORY_RULES: { id: string; label: string; test: RegExp }[] = [
  { id: "vario", label: "Vario", test: /\bvario\b/i },
  { id: "potdeksel", label: "Potdeksel", test: /potdeksel/i },
  { id: "rabat", label: "Rabat", test: /rabat/i },
  { id: "steenstrip", label: "Steenstrip", test: /steenstrip|wildverband|leisteen|\bgrof\b/i },
  { id: "multisponning", label: "Multisponning", test: /quattro|multisponning|multi[\s-]*sponning|dubbel[\s-]*sponning/i },
  { id: "sponning", label: "Sponning", test: /sponning|rondkant|\bshadow\b|\btrend\b/i },
];

const CATEGORY_RANK = [
  "potdeksel",
  "sponning",
  "rabat",
  "vario",
  "multisponning",
  "steenstrip",
  "dakrand",
  "boeideel",
  "daktrim",
  "vensterbank",
  "hpl",
  "plafond",
];

const BRAND_RANK = ["keralit", "vinyplus", "eurotexx", "kerrafront", "zierer", "milexx", "milinboard", "florence", "novicell", "unipanel"];

/**
 * Vario and wildverband do not print a brand on the sample card.
 * The catalog already ties them to these lines: vinyplus-vario, Zierer wildverband.
 */
const BRAND_FALLBACK: { test: RegExp; id: string }[] = [
  { test: /\bvario\b/i, id: "vinyplus" },
  { test: /\bwildverband\b/i, id: "zierer" },
];

function categoryRank(id: string) {
  const known = CATEGORY_RANK.indexOf(id);
  if (known >= 0) return known;
  return CATEGORY_RANK.indexOf("steenstrip") + 0.5;
}

function brandRank(id: string) {
  const known = BRAND_RANK.indexOf(id);
  return known >= 0 ? known : BRAND_RANK.length;
}

export function staalCategoryOf(sectionId: string, groupId: string, title: string): { id: string; label: string } {
  const text = `${groupId} ${title}`;
  if (sectionId === "dakrand" || sectionId === "dakranden") {
    if (/boeiboord|boeideel/i.test(text)) return { id: "boeideel", label: "Boeidelen" };
    if (/daktrim/i.test(text)) return { id: "daktrim", label: "Daktrim" };
    return { id: "dakrand", label: "Dakranden" };
  }
  if (sectionId === "vensterbank" || sectionId === "vensterbanken") {
    return { id: "vensterbank", label: "Vensterbanken" };
  }
  if (sectionId === "hpl" || sectionId === "hpl-platen") return { id: "hpl", label: "HPL platen" };
  if (sectionId === "plafond" || sectionId === "plafondpanelen") return { id: "plafond", label: "Plafondpanelen" };
  for (const rule of CATEGORY_RULES) {
    if (rule.test.test(text)) return { id: rule.id, label: rule.label };
  }
  const label = title.split("·").pop()?.trim() || title.trim() || "Gevelpanelen";
  const id = groupId.split("/").pop() || "gevel";
  return { id, label };
}

export function staalBrandOf(
  group: { id: string; title: string; image?: string; swatches: { image?: string; productSlugs: string[] }[] },
  brandBySlug: Record<string, BrandRef> = {},
): BrandRef | null {
  const slugs = [...new Set(group.swatches.flatMap((swatch) => swatch.productSlugs))];
  const fromProducts = new Map<string, BrandRef>();
  for (const slug of slugs) {
    const brand = brandBySlug[slug];
    if (!brand?.id || isBannedSampleText(`${brand.id} ${brand.label}`)) continue;
    fromProducts.set(brand.id, { id: brand.id, label: sampleBrandLabel(brand.id) || brand.label });
  }
  if (fromProducts.size === 1) return [...fromProducts.values()][0];

  const images = [group.image, ...group.swatches.map((swatch) => swatch.image)].filter((image): image is string => Boolean(image));
  const text = `${group.title} ${group.id} ${images.join(" ")}`;
  if (isBannedSampleText(text)) return null;
  const slug = matchProductLine(text);
  const named = slug ? sampleBrandLabel(slug) : undefined;
  if (slug && named && !isBannedSampleText(`${slug} ${named}`)) return { id: slug, label: named };
  const hay = `${group.title} ${group.id}`;
  for (const rule of BRAND_FALLBACK) {
    if (!rule.test.test(hay)) continue;
    const label = sampleBrandLabel(rule.id);
    if (label && !isBannedSampleText(`${rule.id} ${label}`)) return { id: rule.id, label };
  }
  return null;
}

export function isBannedStaalGroup(group: { id: string; title: string; swatches: { name: string; lineLabel: string }[] }) {
  const blob = [group.id, group.title, ...group.swatches.flatMap((swatch) => [swatch.name, swatch.lineLabel])].join("\n");
  return isBannedSampleText(blob);
}

export function staalGroupVisible(group: { categoryId: string; brandId: string }, categoryId: string, brandId: string) {
  if (categoryId !== STAAL_FILTER_ALL && group.categoryId !== categoryId) return false;
  if (brandId !== STAAL_FILTER_ALL && group.brandId !== brandId) return false;
  return true;
}

export function staalFilterFacets(groups: StaalGroupFilter[]): { categories: StaalFacet[]; brands: StaalFacet[] } {
  const categories = new Map<string, StaalFacet>();
  const brands = new Map<string, StaalFacet>();
  for (const group of groups) {
    const swatches = group.swatches.length;
    const category = categories.get(group.categoryId) ?? { id: group.categoryId, label: group.categoryLabel, swatches: 0 };
    category.swatches += swatches;
    categories.set(group.categoryId, category);
    if (!group.brandId) continue;
    const brand = brands.get(group.brandId) ?? { id: group.brandId, label: group.brandLabel, swatches: 0 };
    brand.swatches += swatches;
    brands.set(group.brandId, brand);
  }
  const byLabel = (a: StaalFacet, b: StaalFacet) => a.label.localeCompare(b.label, "nl");
  return {
    categories: [...categories.values()].sort((a, b) => categoryRank(a.id) - categoryRank(b.id) || byLabel(a, b)),
    brands: [...brands.values()].sort((a, b) => brandRank(a.id) - brandRank(b.id) || byLabel(a, b)),
  };
}
