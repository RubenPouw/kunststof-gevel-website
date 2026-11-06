export type CeilingPlace = "binnen" | "buiten";

/**
 * Florence lines whose public name does not say binnen or buiten.
 * 10 mm belongs to the binnenplafond paneel (250×10).
 * 16,5 mm belongs to the buitenplafond paneel (250×16,5).
 * The H-verbinding of 16,5 mm is the old article florence-buitenplafond-h-verbindingprofiel.
 * The plint is 35×6 mm and does not match either panel, so it stays unknown.
 */
export const FLORENCE_PLACE_BY_SLUG: Record<string, CeilingPlace | "onbekend"> = {
  "florence-h-verbindingprofiel-16-5mm": "buiten",
  "florence-omrandingprofiel-10mm-2-delig": "binnen",
  "florence-knikhoekprofiel-10mm": "binnen",
  "florence-plafondplint-35x6mm-2-delig": "onbekend",
};

function exclusivePlace(text: string): CeilingPlace | undefined {
  const value = text.toLowerCase();
  const buiten = /buitenplafond/.test(value);
  const binnen = /binnenplafond/.test(value);
  if (buiten && !binnen) return "buiten";
  if (binnen && !buiten) return "binnen";
  return undefined;
}

function placeFromTags(tags: string[]): CeilingPlace | undefined {
  const folded = tags.map((tag) => tag.trim().toLowerCase());
  const buiten = folded.some((tag) => tag === "buiten" || tag === "buitenplafond");
  const binnen = folded.some((tag) => tag === "binnen" || tag === "binnenplafond");
  if (buiten && !binnen) return "buiten";
  if (binnen && !buiten) return "binnen";
  return undefined;
}

/** Binnen or buiten from tags, title, handle and description. Unknown stays undefined. */
export function ceilingPlaceOf(product: {
  slug: string;
  name: string;
  description?: string;
  tags?: string[];
  productType?: string;
}): CeilingPlace | undefined {
  const named = exclusivePlace(`${product.name} ${product.slug.replace(/-/g, " ")}`);
  if (named) return named;

  const fromTags = placeFromTags(product.tags ?? []);
  if (fromTags) return fromTags;

  const fromCopy = exclusivePlace(`${product.description ?? ""} ${product.productType ?? ""}`);
  if (fromCopy) return fromCopy;

  const mapped = FLORENCE_PLACE_BY_SLUG[product.slug];
  if (mapped === "binnen" || mapped === "buiten") return mapped;
  return undefined;
}
