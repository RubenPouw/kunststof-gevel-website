import type { CategorySlug } from "@/lib/catalog/types";

/**
 * Confirmed lead time in weeks, per category or per product slug.
 * Null means the number is not confirmed and must not be shown.
 * Kozijnen stay null until a supplier week count is confirmed.
 */
export const leadTimeWeeksByCategory: Record<CategorySlug | "kozijnen", number | null> = {
  gevelbekleding: null,
  dakranden: null,
  kozijnafwerking: null,
  montage: null,
  "hpl-platen": null,
  kozijnen: null,
};

export const leadTimeWeeksByProduct: Record<string, number> = {};

export function confirmedLeadTimeWeeks(category?: string | null, slug?: string | null): number | null {
  if (slug && Object.prototype.hasOwnProperty.call(leadTimeWeeksByProduct, slug)) {
    const weeks = leadTimeWeeksByProduct[slug];
    return Number.isInteger(weeks) && weeks > 0 ? weeks : null;
  }
  if (category && category in leadTimeWeeksByCategory) {
    const weeks = leadTimeWeeksByCategory[category as CategorySlug | "kozijnen"];
    return weeks != null && weeks > 0 ? weeks : null;
  }
  return null;
}

/** Week count only when confirmed. Otherwise the existing stock or delivery sentence. */
export function leadTimeLabel(weeks: number | null, fallback: string) {
  if (weeks == null) return fallback;
  return weeks === 1 ? "Levertijd 1 week" : `Levertijd ${weeks} weken`;
}
