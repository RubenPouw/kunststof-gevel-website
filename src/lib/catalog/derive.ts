import { facadeOrder, HPL_SHEET_M2 } from "@/lib/area";
import { labelColour, resolveColour, UNKNOWN_COLOUR_HEX } from "@/lib/catalog/colours";
import {
  inferProductGroup,
  initialLength,
  isRealListedLength,
  parseWorkingWidthMm,
} from "@/lib/catalog/measures";
import {
  extractHplColor,
  extractPanelLength,
  parseLengthMeters,
  splitColorAndLength,
  withoutTrespa,
} from "@/lib/catalog/text-rules";

import type {
  ColorFamily,
  Product,
  ProductColor,
  ProductVariant,
  ProfileType,
  SampleColor,
} from "./types";

export { parseLengthMeters };
export { parseWorkingWidthMm };

export const THREE_M_PRICE_RATIO = 46.9 / 87.3;

export function slugKey(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function sampleId(brandSlug: string, colorName: string, skuSuffix?: string) {
  return `${brandSlug}:${skuSuffix || slugKey(colorName)}`;
}

export function inferProfileType(name: string, productType?: string): ProfileType {
  const t = `${name} ${productType ?? ""}`.toLowerCase();
  if (/steenstrip|wildverband/.test(t)) return "steenstrip";
  if (/sponning/.test(t)) return "sponning";
  if (/potdeksel/.test(t)) return "potdeksel";
  if (/rondkant/.test(t)) return "rondkant";
  if (/quattro/.test(t)) return "quattro";
  if (/rabat|duafort/.test(t)) return "rabat";
  if (/dakrand|boeideel/.test(t)) return "dakrand";
  if (/vensterbank|overzet/.test(t)) return "vensterbank";
  if (/profiel|schroef|clip|verbind|startpr|eindkap|ventilatie|kit/.test(t)) return "profiel";
  return "overig";
}

export function colorFamilyFromName(colorName: string, context = ""): ColorFamily {
  return resolveColour(colorName, context).family;
}

export function panelsPerM2(workingWidthMm: number, lengthMeters: number) {
  return 1 / ((workingWidthMm / 1000) * lengthMeters);
}

export function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

const CLADDING_PROFILES: ProfileType[] = ["sponning", "potdeksel", "rabat", "rondkant", "quattro"];

export function isFacadePanel(product: Pick<Product, "category" | "name" | "workingWidthMm" | "profileType">) {
  if (!product.workingWidthMm) return false;
  if (inferProductGroup(product.name) !== "gevelpaneel") return false;
  if (/hoekstuk|schroef|wildverband|steenstrip|profiel|clip|ventilatie|kit|verbinding|startpr/i.test(product.name)) {
    return false;
  }
  if (!CLADDING_PROFILES.includes(product.profileType)) return false;
  return product.category === "gevelbekleding" || product.profileType === "rabat" || /rabat/i.test(product.name);
}

function variantLength(variant: ProductVariant, productName: string) {
  const split = splitColorAndLength(variant.colorName);
  let length = variant.length;
  const colorName = split.colorName;

  if (split.length && !parseLengthMeters(length)) length = split.length;
  if (!parseLengthMeters(length)) {
    const fromLength = extractPanelLength(variant.length);
    if (fromLength) length = fromLength;
  }
  if (!parseLengthMeters(length)) {
    const fromOptions = extractPanelLength(
      (variant.options ?? []).map((option) => `${option.name} ${option.value}`).join(" "),
    );
    if (fromOptions) length = fromOptions;
  }
  if (!parseLengthMeters(length)) {
    const fromName = extractPanelLength(productName);
    if (fromName) length = fromName;
  }

  return { length, colorName };
}

function variantOptions(variant: ProductVariant): { name: string; value: string }[] {
  const source = variant.options?.some((option) => option.name.toLowerCase() !== "title")
    ? variant.options
    : [
        { name: "Kleur", value: variant.colorName },
        ...(parseLengthMeters(variant.length) ? [{ name: "Lengte", value: variant.length }] : []),
      ];
  return source.map((option) =>
    /kleur|color|colour/i.test(option.name) ? { ...option, value: labelColour(option.value) } : option,
  );
}

/** Rewrite stored colour codes to "Name (CODE)" without a catalog resync. */
export function applyColourLabels(product: Product): Product {
  let changed = false;
  const variants = product.variants.map((variant) => {
    const colorName = labelColour(variant.colorName);
    let options = variant.options;
    if (options?.length) {
      let optionsChanged = false;
      const nextOptions = options.map((option) => {
        if (!/kleur|color|colour/i.test(option.name)) return option;
        const value = labelColour(option.value);
        if (value === option.value) return option;
        optionsChanged = true;
        return { ...option, value };
      });
      if (optionsChanged) options = nextOptions;
    }
    const colour = resolveColour(colorName, product.name);
    const family = colour.family;
    const hex =
      (variant.colorFamily === "overig" && family !== "overig") ||
      variant.hex.toLowerCase() === UNKNOWN_COLOUR_HEX.toLowerCase()
        ? colour.hex
        : variant.hex;
    if (colorName === variant.colorName && options === variant.options && family === variant.colorFamily && hex === variant.hex) {
      return variant;
    }
    changed = true;
    return {
      ...variant,
      colorName,
      options,
      colorFamily: family,
      hex,
      sampleId: sampleId(product.brandSlug, colorName),
    };
  });
  if (!changed) return product;

  const colors: ProductColor[] = [];
  for (const variant of variants) {
    if (colors.some((color) => color.name === variant.colorName)) continue;
    colors.push({
      name: variant.colorName,
      hex: variant.hex,
      ral: variant.ral,
      popular: variant.popular,
      family: variant.colorFamily,
      sampleId: variant.sampleId,
    });
  }
  return {
    ...product,
    variants,
    colors,
    palette: colors.map((color) => color.hex),
  };
}

export const HPL_SHEET_SIZE = "3050 × 1300 mm";

export function enrichProduct(product: Product): Product {
  const sheet = product.category === "hpl-platen" || product.saleUnit === "sheet";
  const name = withoutTrespa(product.name);
  const workingWidthMm = sheet ? undefined : parseWorkingWidthMm(name, product.specs);
  const profileType = sheet
    ? "overig"
    : product.profileType && product.profileType !== "overig"
      ? product.profileType
      : inferProfileType(name, product.productType);
  const productGroup = sheet ? undefined : inferProductGroup(name, product.productType);
  const facade = sheet
    ? false
    : isFacadePanel({
        category: product.category,
        name,
        workingWidthMm,
        profileType,
      });
  const sampleable = sheet ? true : facade;

  let anyAssumed = false;
  const variants: ProductVariant[] = product.variants.map((variant) => {
    const resolved = variantLength(variant, name);
    let length = resolved.length;
    let colorName = withoutTrespa(resolved.colorName);
    let ral = variant.ral;
    let assumed = false;
    if (sheet) {
      const genericColor = /^(standaard|default title|hpl plaat)$/i.test(colorName);
      const parsed = extractHplColor(
        `${name} ${genericColor ? "" : colorName} ${(variant.options ?? []).map((option) => option.value).join(" ")}`,
      );
      if (!ral && parsed.ral) ral = parsed.ral;
      if (genericColor) {
        colorName = parsed.colorName || parsed.ral || colorName;
      }
      length = HPL_SHEET_SIZE;
    } else {
      if (!isRealListedLength(length)) {
        length = initialLength(name, length === "stuk" ? undefined : length);
      }
      if (!isRealListedLength(length) && facade) {
        length = "6 m";
        assumed = true;
        anyAssumed = true;
      }
      if (!isRealListedLength(length)) length = "stuk";
    }
    const meters = sheet ? undefined : parseLengthMeters(length);
    const colour = resolveColour(colorName, name);
    const family = colour.family;
    if (colour.name !== colorName) colorName = colour.name;
    const hex = product.source === "shopify" || colour.name !== variant.colorName ? colour.hex : variant.hex;
    const next: ProductVariant = {
      ...variant,
      colorName,
      hex,
      ral,
      length,
      lengthAssumed: assumed || Boolean(variant.lengthAssumed && isRealListedLength(length)),
      colorFamily: family,
      panelsPerM2: sheet || !workingWidthMm || !meters ? undefined : Number(panelsPerM2(workingWidthMm, meters).toFixed(2)),
      sampleId: sampleId(product.brandSlug, colorName),
    };
    return {
      ...next,
      options: variantOptions(next),
    };
  });

  const colors: ProductColor[] = [];
  for (const variant of variants) {
    if (colors.some((color) => color.name === variant.colorName)) continue;
    colors.push({
      name: variant.colorName,
      hex: variant.hex,
      ral: variant.ral,
      popular: variant.popular,
      family: variant.colorFamily,
      sampleId: variant.sampleId,
    });
  }

  const defaultCoverage = sheet
    ? undefined
    : (variants.find((variant) => parseLengthMeters(variant.length) === 6)?.panelsPerM2 ??
      variants.find((variant) => variant.panelsPerM2)?.panelsPerM2);

  const uniqueLengths = [...new Set(variants.map((variant) => variant.length))];
  const uniqueColors = [...new Set(variants.map((variant) => variant.colorName))];
  const lengthLabel = uniqueLengths.length === 1 ? uniqueLengths[0] : uniqueLengths.join(" / ");

  return applyColourLabels({
    ...product,
    name,
    description: withoutTrespa(product.description),
    workingWidthMm,
    profileType,
    productGroup,
    sampleable,
    saleUnit: sheet ? "sheet" : product.saleUnit,
    sheetM2: sheet ? HPL_SHEET_M2 : undefined,
    variants,
    colors,
    palette: colors.map((color) => color.hex),
    panelsPerM2: defaultCoverage,
    lengthAssumed: sheet ? false : anyAssumed,
    length: lengthLabel,
    meta:
      uniqueColors.length > 1
        ? `${lengthLabel} · ${uniqueColors.length} kleuren`
        : `${lengthLabel} · ${variants.length} ${variants.length === 1 ? "variant" : "varianten"}`,
  });
}

export function listSampleColors(products: Product[]): SampleColor[] {
  const byId = new Map<string, SampleColor>();
  for (const product of products) {
    if (!product.sampleable) continue;
    for (const color of product.colors) {
      if (byId.has(color.sampleId)) continue;
      byId.set(color.sampleId, {
        id: color.sampleId,
        brandSlug: product.brandSlug,
        brandName: product.brand,
        colorName: color.name,
        hex: color.hex,
        ral: color.ral,
      });
    }
  }
  return [...byId.values()];
}

export function uniqueLengths(product: Product) {
  return [...new Set(product.variants.map((variant) => variant.length))];
}

export function variantsForColor(product: Product, colorName: string) {
  return product.variants.filter((variant) => variant.colorName === colorName);
}

export function findVariant(product: Product, colorName: string, length?: string) {
  return (
    product.variants.find(
      (variant) => variant.colorName === colorName && (!length || variant.length === length),
    ) ?? product.variants.find((variant) => variant.colorName === colorName)
  );
}

export function neededPanels(
  widthM: number,
  heightM: number,
  coverage: number,
  openingsM2 = 0,
) {
  const result = facadeOrder({
    widthM,
    heightM,
    openingsM2,
    panelsPerM2: coverage,
  });
  return result.ok ? result.panels : 0;
}
