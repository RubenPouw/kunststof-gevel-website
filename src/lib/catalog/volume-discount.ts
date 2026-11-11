import { exclVat, roundMoney } from "@/lib/format";

/** Materiaalsubtotaal inclusief btw vanaf waar € 75 korting op de materiaalorder geldt. */
export const ORDER_DISCOUNT_THRESHOLD_INCL = 2000;
export const ORDER_DISCOUNT_INCL = 75;

/**
 * Shopify automatic discount that mirrors this rule.
 * It does not combine with order discounts, so checkout keeps one of the two.
 */
export const SHOPIFY_ORDER_DISCOUNT_ID = "gid://shopify/DiscountAutomaticNode/1945432588626";

/** Codes that replace the € 75. They do not stack with it. */
export const REPLACING_DISCOUNT_CODES = ["popup50", "Bestelling100"] as const;

/**
 * € 75 over het materiaalsubtotaal zodra dat € 2.000 incl. btw of meer is.
 * Verzending en montage horen niet in `materialIncl` en krijgen geen korting.
 * Staat er een kortingscode op (popup50 of Bestelling100), dan vervalt de € 75.
 */
export function quoteOrderDiscount(materialIncl: number, codeApplied = false) {
  const baseIncl = roundMoney(Math.max(0, materialIncl));
  const applied = !codeApplied && baseIncl >= ORDER_DISCOUNT_THRESHOLD_INCL;
  const discountIncl = applied ? ORDER_DISCOUNT_INCL : 0;
  const remainingIncl = codeApplied || applied ? 0 : roundMoney(ORDER_DISCOUNT_THRESHOLD_INCL - baseIncl);
  return {
    baseIncl,
    applied,
    codeApplied,
    discountIncl,
    discountExcl: discountIncl ? exclVat(discountIncl) : 0,
    remainingIncl,
    remainingExcl: remainingIncl ? exclVat(remainingIncl) : 0,
  };
}
