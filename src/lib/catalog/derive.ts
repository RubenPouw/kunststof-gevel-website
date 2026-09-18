import type {
  ColorFamily,
  Product,
  ProductColor,
  ProductVariant,
  ProfileType,
  SampleColor,
  Spec,
} from "./types";

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

export function parseWorkingWidthMm(name: string, specs: Spec[] = []): number | undefined {
  const labelled = specs.find((spec) => /werkende breedte|werkend/i.test(spec.label));
  const fromSpec = labelled?.value.match(/(\d+(?:[.,]\d+)?)\s*mm/i);
  if (fromSpec) return Number(fromSpec[1].replace(",", "."));

  const fromName = name.match(/(\d+)\s*mm/i);
  if (fromName) return Number(fromName[1]);
  return undefined;
}

export function inferProfileType(name: string, productType?: string): ProfileType {
  const t = `${name} ${productType ?? ""}`.toLowerCase();
  if (/steenstrip|wildverband/.test(t)) return "steenstrip";
  if (/sponning/.test(t)) return "sponning";
  if (/potdeksel/.test(t)) return "potdeksel";
  if (/rondkant/.test(t)) return "rondkant";
  if (/quattro/.test(t)) return "quattro";
  if (/\brabat\b|duafort/.test(t)) return "rabat";
  if (/dakrand|boeideel/.test(t)) return "dakrand";
  if (/vensterbank|overzet/.test(t)) return "vensterbank";
  if (/profiel|schroef|clip|verbind|startpr|eindkap|ventilatie|kit/.test(t)) return "profiel";
  return "overig";
}

export function colorFamilyFromName(colorName: string): ColorFamily {
  const t = colorName.toLowerCase();
  if (/eiken|oak|meranti|noten|houtlook|golden/.test(t)) return "houtlook";
  if (/wit|creme|crème|zand|beige|ivoor/.test(t)) return "licht";
  if (/antraciet|zwart|grijs|gray|grey|diepzwart/.test(t)) return "donker";
  return "overig";
}

export function parseLengthMeters(length: string): number | undefined {
  const match = length.trim().toLowerCase().match(/^(\d+(?:[.,]\d+)?)\s*(m|meter|mtr)\b/);
  if (!match) return undefined;
  return Number(match[1].replace(",", "."));
}

export function panelsPerM2(workingWidthMm: number, lengthMeters: number) {
  return 1 / ((workingWidthMm / 1000) * lengthMeters);
}

export function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

export function isFacadePanel(product: Pick<Product, "category" | "name" | "workingWidthMm" | "profileType">) {
  if (product.category !== "gevelbekleding" || !product.workingWidthMm) return false;
  if (/hoekstuk|schroef|wildverband|steenstrip/i.test(product.name)) return false;
  return ["sponning", "potdeksel", "rabat", "rondkant", "quattro"].includes(product.profileType);
}

function variantOptions(variant: ProductVariant): { name: string; value: string }[] {
  if (variant.options?.some((option) => option.name.toLowerCase() !== "title")) {
    return variant.options;
  }
  const options = [{ name: "Kleur", value: variant.colorName }];
  if (parseLengthMeters(variant.length)) {
    options.push({ name: "Lengte", value: variant.length });
  }
  return options;
}

export function enrichProduct(product: Product): Product {
  const workingWidthMm = product.workingWidthMm ?? parseWorkingWidthMm(product.name, product.specs);
  const profileType = product.profileType || inferProfileType(product.name, product.productType);
  const sampleable = isFacadePanel({
    category: product.category,
    name: product.name,
    workingWidthMm,
    profileType,
  });

  const variants: ProductVariant[] = product.variants.map((variant) => {
    const meters = parseLengthMeters(variant.length);
    const family = colorFamilyFromName(variant.colorName);
    return {
      ...variant,
      colorFamily: family,
      panelsPerM2:
        workingWidthMm && meters ? Number(panelsPerM2(workingWidthMm, meters).toFixed(2)) : undefined,
      sampleId: sampleId(product.brandSlug, variant.colorName),
      options: variantOptions({ ...variant, colorFamily: family, sampleId: "" }),
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

  const defaultCoverage =
    variants.find((variant) => parseLengthMeters(variant.length) === 6)?.panelsPerM2 ??
    variants.find((variant) => variant.panelsPerM2)?.panelsPerM2;

  const uniqueLengths = [...new Set(variants.map((variant) => variant.length))];
  const uniqueColors = [...new Set(variants.map((variant) => variant.colorName))];
  const lengthLabel = uniqueLengths.length === 1 ? uniqueLengths[0] : uniqueLengths.join(" / ");

  return {
    ...product,
    workingWidthMm,
    profileType,
    sampleable,
    variants,
    colors,
    palette: colors.map((color) => color.hex),
    panelsPerM2: defaultCoverage,
    length: lengthLabel,
    meta:
      uniqueColors.length > 1
        ? `${lengthLabel} · ${uniqueColors.length} kleuren`
        : `${lengthLabel} · ${variants.length} ${variants.length === 1 ? "variant" : "varianten"}`,
  };
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

export function neededPanels(widthM: number, heightM: number, coverage: number) {
  return Math.ceil(widthM * heightM * coverage * 1.1);
}
