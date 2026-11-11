import { exclVat, inclVat, roundMoney } from "@/lib/format";
import { inferProductGroup } from "@/lib/catalog/measures";
import { isHplSheetText } from "@/lib/catalog/text-rules";

/** Subtotaal van kwalificerende panelen, inclusief btw, vanaf waar 2,5% geldt. */
export const VOLUME_PANEL_THRESHOLD_INCL = 2000;
export const VOLUME_PANEL_RATE = 0.025;

export type VolumeDiscountProduct = {
  name: string;
  slug?: string;
  category?: string;
  brand?: string;
  brandSlug?: string;
  productType?: string;
  saleUnit?: string;
};

/**
 * Panelen die meetellen voor de volumekorting.
 * Het Shopify-type en de collectie zijn niet leidend: type Dakrand bevat ook
 * profielen en lijm, en een potdeksel kan als "Heering overig" binnenkomen.
 */
export function isVolumeDiscountEligible(product: VolumeDiscountProduct) {
  const text = `${product.name} ${product.slug ?? ""} ${product.brand ?? ""} ${product.brandSlug ?? ""}`
    .replace(/-/g, " ")
    .toLowerCase();
  if (isRetiredBrand(text) || isExcluded(text)) return false;
  if (isZiererStrip(text)) return true;
  if (isHplPlate(product, text)) return true;
  if (isCeilingPanel(text)) return true;
  if (isListedDakrandPanel(text)) return true;
  return isFacadeCladding(product, text);
}

export function quoteVolumeDiscount(qualifyingIncl: number) {
  const eligibleIncl = roundMoney(Math.max(0, qualifyingIncl));
  const applied = eligibleIncl >= VOLUME_PANEL_THRESHOLD_INCL;
  const discountIncl = applied ? roundMoney(eligibleIncl * VOLUME_PANEL_RATE) : 0;
  const remainingIncl = applied ? 0 : roundMoney(VOLUME_PANEL_THRESHOLD_INCL - eligibleIncl);
  return {
    eligibleIncl,
    applied,
    discountIncl,
    discountExcl: discountIncl ? exclVat(discountIncl) : 0,
    remainingIncl,
    remainingExcl: remainingIncl ? exclVat(remainingIncl) : 0,
  };
}

/** Incl. btw van de regels die meetellen. `unitExcl` is de stuksprijs excl. btw. */
export function qualifyingInclFromLines(
  lines: { unitExcl: number; qty: number; eligible: boolean }[],
) {
  return roundMoney(
    lines.reduce((sum, line) => (line.eligible ? sum + inclVat(line.unitExcl * line.qty) : sum), 0),
  );
}

function isRetiredBrand(text: string) {
  return /\b(?:profex|duafort|canexel)\b/.test(text);
}

const EXCLUDED =
  /wonderboard|hygi[eë]nische wand|sierlijst|profiel|hoekstuk|hoekprofiel|eindkap|eindprofiel|\bclips?\b|schroef|bevestiging|\blijm\b|\bkit\b|reiniger|startprofiel|verbind|stootvoeg|ventilatie|\btrim\b|\bkraal\b|tussenstuk|afdicht|verzend|vensterbank|\bkozijn\b/;

function isExcluded(text: string) {
  return EXCLUDED.test(text);
}

function isZiererStrip(text: string) {
  return /steenstrip|leisteen/.test(text);
}

function isHplPlate(product: VolumeDiscountProduct, text: string) {
  if (product.saleUnit === "sheet" || isHplSheetText(text)) return true;
  return product.category === "hpl-platen" && /plaat/.test(text);
}

function isCeilingPanel(text: string) {
  return /plafond\s*paneel|plafondpaneel|buitenplafond|binnenplafond/.test(text);
}

function isListedDakrandPanel(text: string) {
  if (/unipanel/.test(text) && /bouwpaneel/.test(text)) {
    return /(185|235|285|385|610)/.test(text);
  }
  if (/big board/.test(text)) {
    return /(225|300|395)/.test(text) && /(?:x|×)\s*16|\bx16\b/.test(text);
  }
  if (/haakse hoek/.test(text) && /(milexx|volschuim)/.test(text)) {
    return /\b35\b/.test(text) && !/\d{2,3}\s*(?:x|×)\s*35/.test(text);
  }
  if (!/dakrand\s*paneel|dakrandpaneel/.test(text)) return false;
  if (/viny/.test(text)) return /(200|295)/.test(text);
  if (/keralit/.test(text)) return /(200|250|300|350)/.test(text);
  return false;
}

function isFacadeCladding(product: VolumeDiscountProduct, text: string) {
  if (!/rabat|sponning|potdeksel|rondkant|quattro/.test(text)) return false;
  return inferProductGroup(product.name, product.productType) === "gevelpaneel";
}
