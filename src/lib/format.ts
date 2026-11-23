export const VAT_RATE = 1.21;

/**
 * Bedragen zoals de klant ze ziet, inclusief btw.
 * Excl. btw is dit bedrag gedeeld door 1,21. Niet nog eens vermenigvuldigen.
 */
export const FREE_SHIPPING_FROM = 499;
export const SHIPPING_FLAT = 49.95;
export const GEVEL_MOUNT_PER_M2 = 38;

export function formatPrice(value: number) {
  return `€ ${value.toLocaleString("nl-NL", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatMoneyLabel(value: number) {
  return formatPrice(value);
}

export function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

export function exclVat(incl: number) {
  return roundMoney(incl / VAT_RATE);
}

export function inclVat(excl: number) {
  return roundMoney(excl * VAT_RATE);
}

/** Hele euro's zonder decimalen, zoals in de USP-balk: €499. */
export function euroPlain(value: number) {
  if (Number.isInteger(value)) return `€${value.toLocaleString("nl-NL")}`;
  return formatPrice(value);
}

export type ShippingQuote = {
  /** Excl. btw, op te tellen bij het excl.-subtotaal. 0 als de zending gratis is. */
  shippingExcl: number;
  /** Incl. btw, het bedrag dat de klant ziet. */
  shippingIncl: number;
  remainingExcl: number;
  remainingIncl: number;
};

/** Drempel en transport op het incl.-bedrag. Excl. volgt uit delen door 1,21. */
export function quoteShipping(subtotalExcl: number, hasLines: boolean): ShippingQuote {
  const materialIncl = inclVat(Math.max(0, subtotalExcl));
  const free = !hasLines || materialIncl >= FREE_SHIPPING_FROM;
  const remainingIncl = free ? 0 : roundMoney(FREE_SHIPPING_FROM - materialIncl);
  return {
    shippingExcl: free ? 0 : exclVat(SHIPPING_FLAT),
    shippingIncl: free ? 0 : SHIPPING_FLAT,
    remainingExcl: remainingIncl ? exclVat(remainingIncl) : 0,
    remainingIncl,
  };
}

export function shippingEstimateCopy() {
  return `Verzending ${formatPrice(exclVat(SHIPPING_FLAT))} excl. btw. Gratis vanaf ${formatPrice(exclVat(FREE_SHIPPING_FROM))} excl. btw. Het bedrag in de checkout is leidend.`;
}

export function shippingEstimateInclCopy() {
  return `Verzending ${formatPrice(SHIPPING_FLAT)} incl. btw. Gratis vanaf ${formatPrice(FREE_SHIPPING_FROM)} incl. btw. Het bedrag in de checkout is leidend.`;
}

export function shippingEstimateBothCopy() {
  return `Verzending ${formatPrice(exclVat(SHIPPING_FLAT))} excl. btw (${formatPrice(SHIPPING_FLAT)} incl. 21% btw). Gratis vanaf ${formatPrice(exclVat(FREE_SHIPPING_FROM))} excl. btw (${formatPrice(FREE_SHIPPING_FROM)} incl. 21% btw). Het bedrag in de checkout is leidend.`;
}

export function shippingPolicyCopy() {
  return `We leveren in Nederland. Onder ${formatPrice(FREE_SHIPPING_FROM)} incl. btw rekenen we in de winkelwagen ${formatPrice(SHIPPING_FLAT)} incl. btw verzending als indicatie (${formatPrice(exclVat(SHIPPING_FLAT))} excl. btw). Daarboven is de indicatie gratis. Het bedrag in de Shopify-checkout is leidend, omdat de vervoerder en het gewicht daar worden bepaald.`;
}

export function formatLengthMm(length: string) {
  const meters = length.trim().toLowerCase().match(/^(\d+(?:[.,]\d+)?)\s*(m|meter|mtr)\b/);
  if (meters) {
    const mm = Math.round(Number(meters[1].replace(",", ".")) * 1000);
    return `${mm.toLocaleString("nl-NL")} mm`;
  }
  const mm = length.trim().match(/^(\d+(?:[.,]\d+)?)\s*mm$/i);
  if (mm) {
    const n = Number(mm[1].replace(",", "."));
    if (!Number.isInteger(n)) return `${mm[1].replace(".", ",")} mm`;
    return `${n.toLocaleString("nl-NL")} mm`;
  }
  if (/^\d+$/.test(length.trim())) {
    return `${Number(length).toLocaleString("nl-NL")} mm`;
  }
  return length;
}

export function formatNlNumber(value: number, digits = 1) {
  return value.toLocaleString("nl-NL", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}
