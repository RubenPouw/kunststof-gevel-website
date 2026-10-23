/** Storefront GIDs and webhook numeric ids share the trailing number. */
export function shopifyNumericId(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") return "";
  const text = String(value);
  const match = text.match(/(\d+)$/);
  return match?.[1] ?? text;
}
