import { exclVat, roundMoney } from "@/lib/format";

/** Materiaalsubtotaal inclusief btw vanaf waar 2,5% op de hele materiaalorder geldt. */
export const ORDER_DISCOUNT_THRESHOLD_INCL = 2000;
export const ORDER_DISCOUNT_RATE = 0.025;

/**
 * 2,5% over het materiaalsubtotaal zodra dat € 2.000 incl. btw of meer is.
 * Verzending en montage horen niet in `materialIncl` en krijgen geen korting.
 * Een kortingscode van € 50 of € 100 incl. btw komt hier bovenop via stackCodeDiscount.
 * De code verlaagt het bedrag waarover de 2,5% wordt gerekend niet.
 */
export function quoteOrderDiscount(materialIncl: number) {
  const baseIncl = roundMoney(Math.max(0, materialIncl));
  const applied = baseIncl >= ORDER_DISCOUNT_THRESHOLD_INCL;
  const discountIncl = applied ? roundMoney(baseIncl * ORDER_DISCOUNT_RATE) : 0;
  const remainingIncl = applied ? 0 : roundMoney(ORDER_DISCOUNT_THRESHOLD_INCL - baseIncl);
  return {
    baseIncl,
    applied,
    discountIncl,
    discountExcl: discountIncl ? exclVat(discountIncl) : 0,
    remainingIncl,
    remainingExcl: remainingIncl ? exclVat(remainingIncl) : 0,
  };
}

/** Vaste codes stapelen op de 2,5%. Er is nog geen codeveld in de winkelwagen. */
export function stackCodeDiscount(order: ReturnType<typeof quoteOrderDiscount>, codeIncl: number) {
  const code = roundMoney(Math.max(0, codeIncl));
  const discountIncl = roundMoney(order.discountIncl + code);
  return {
    ...order,
    codeIncl: code,
    discountIncl,
    discountExcl: discountIncl ? exclVat(discountIncl) : 0,
  };
}
