/** How many colour dots a card shows before +N. */
export const CARD_SWATCH_LIMIT = 6;

export function visibleCardSwatches<T>(swatches: T[], activeIndex: number, limit = CARD_SWATCH_LIMIT) {
  if (swatches.length <= limit) {
    return swatches.map((swatch, index) => ({ swatch, index }));
  }
  const safeIndex = activeIndex >= 0 && activeIndex < swatches.length ? activeIndex : 0;
  if (safeIndex < limit) {
    return swatches.slice(0, limit).map((swatch, index) => ({ swatch, index }));
  }
  const head = swatches.slice(0, limit - 1).map((swatch, index) => ({ swatch, index }));
  return [...head, { swatch: swatches[safeIndex], index: safeIndex }];
}

export function isWoodColour(name: string, family?: string) {
  if (family === "houtlook") return true;
  return /nerf|eiken|\boak\b|ceder|cedar|noten|walnoot|mahog|meranti/i.test(name);
}
