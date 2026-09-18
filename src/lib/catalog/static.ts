import brandsJson from "../../data/catalog/brands.json";
import categoriesJson from "../../data/catalog/categories.json";
import palettesJson from "../../data/catalog/palettes.json";
import productsJson from "../../data/catalog/products.json";

import {
  enrichProduct,
  inferProfileType,
  parseWorkingWidthMm,
  roundMoney,
  THREE_M_PRICE_RATIO,
} from "./derive";
import type {
  Brand,
  Category,
  CategorySlug,
  Product,
  ProductBadge,
  ProductVariant,
  Spec,
} from "./types";
import { categorySlugs } from "./types";

type PaletteColor = {
  skuSuffix: string;
  colorName: string;
  ral?: string;
  hex: string;
  popular?: boolean;
};

type RawVariant = {
  sku: string;
  ean?: string;
  colorName: string;
  ral?: string;
  hex: string;
  length: string;
  price: number;
  inStock: boolean;
  stockText?: string;
  popular?: boolean;
};

type RawProduct = {
  slug: string;
  name: string;
  vendor: string;
  brandSlug: string;
  category: CategorySlug;
  badge?: ProductBadge;
  description: string;
  specs: Spec[];
  relatedSlugs: string[];
  paletteId?: string;
  skuPrefix?: string;
  length?: string;
  price?: number;
  inStock?: boolean;
  stockText?: string;
  variants?: RawVariant[];
};

const palettes = palettesJson as Record<string, PaletteColor[]>;

export const staticBrands: Brand[] = brandsJson;

export const staticCategories: Category[] = categoriesJson as Category[];

function isCategorySlug(value: string): value is CategorySlug {
  return (categorySlugs as readonly string[]).includes(value);
}

function asVariant(raw: RawVariant): ProductVariant {
  return {
    sku: raw.sku,
    ean: raw.ean ?? "",
    colorName: raw.colorName,
    ral: raw.ral,
    hex: raw.hex,
    length: raw.length,
    price: raw.price,
    inStock: raw.inStock,
    stockText: raw.stockText,
    popular: raw.popular,
    colorFamily: "overig",
    sampleId: "",
    options: [
      { name: "Kleur", value: raw.colorName },
      { name: "Lengte", value: raw.length },
    ],
  };
}

function expandColorVariants(raw: RawProduct): ProductVariant[] {
  if (raw.variants?.length) {
    return raw.variants.map(asVariant);
  }

  const palette = raw.paletteId ? palettes[raw.paletteId] : undefined;
  if (!palette?.length || !raw.skuPrefix || raw.price === undefined) {
    throw new Error(`Catalogusproduct ${raw.slug} mist varianten of palette.`);
  }

  return palette.map((color) =>
    asVariant({
      sku: `${raw.skuPrefix}-${color.skuSuffix}`,
      ean: "",
      colorName: color.colorName,
      ral: color.ral,
      hex: color.hex,
      length: raw.length ?? "6 m",
      price: raw.price as number,
      inStock: raw.inStock ?? true,
      stockText: raw.stockText,
      popular: color.popular,
    }),
  );
}

function threeMeterPrice(slug: string, sixMeterPrice: number) {
  if (slug === "keralit-sponning-143") return 46.9;
  return roundMoney(sixMeterPrice * THREE_M_PRICE_RATIO);
}

function expandLengthVariants(raw: RawProduct, variants: ProductVariant[]): ProductVariant[] {
  const workingWidthMm = parseWorkingWidthMm(raw.name, raw.specs);
  const profileType = inferProfileType(raw.name);
  const facade =
    raw.category === "gevelbekleding" &&
    Boolean(workingWidthMm) &&
    ["sponning", "potdeksel", "rabat", "rondkant", "quattro"].includes(profileType);
  const lengths = new Set(variants.map((variant) => variant.length));
  if (!facade || !lengths.has("6 m") || lengths.has("3 m")) return variants;

  const extra = variants
    .filter((variant) => variant.length === "6 m")
    .map((variant) => ({
      ...variant,
      sku: `${variant.sku}-3M`,
      length: "3 m",
      price: threeMeterPrice(raw.slug, variant.price),
      popular: false,
      options: [
        { name: "Kleur", value: variant.colorName },
        { name: "Lengte", value: "3 m" },
      ],
    }));

  return [...variants, ...extra];
}

function hydrate(raw: RawProduct): Product {
  if (!isCategorySlug(raw.category)) {
    throw new Error(`Onbekende categorie: ${raw.category}`);
  }
  const brand = staticBrands.find((item) => item.slug === raw.brandSlug);
  if (!brand) {
    throw new Error(`Onbekend merk: ${raw.brandSlug}`);
  }

  const variants = expandLengthVariants(raw, expandColorVariants(raw));
  const prices = variants.map((variant) => variant.price);
  const price = Math.min(...prices);
  const inStock = variants.some((variant) => variant.inStock);
  const uniqueLengths = [...new Set(variants.map((variant) => variant.length))];
  const length = uniqueLengths.length === 1 ? uniqueLengths[0] : uniqueLengths.join(" / ");
  const outOfStock = variants.find((variant) => !variant.inStock && variant.stockText);

  return enrichProduct({
    slug: raw.slug,
    name: raw.name,
    vendor: raw.vendor,
    brand: brand.name,
    brandSlug: brand.slug,
    category: raw.category,
    description: raw.description,
    specs: raw.specs,
    relatedSlugs: raw.relatedSlugs,
    badge: raw.badge,
    variants,
    price,
    inStock,
    stockText: inStock ? undefined : outOfStock?.stockText ?? "Levertijd 5 werkdagen",
    meta: `${length} · ${variants.length} ${variants.length === 1 ? "variant" : "kleuren"}`,
    palette: variants.map((variant) => variant.hex),
    colors: [],
    length,
    images: [],
    source: "static",
    profileType: inferProfileType(raw.name),
    sampleable: false,
  });
}

export const staticProducts: Product[] = (productsJson.items as RawProduct[]).map(hydrate);

export const featuredProductSlugs = productsJson.featuredSlugs as readonly string[];

export function getStaticProduct(slug: string) {
  return staticProducts.find((product) => product.slug === slug);
}

export function getStaticBrand(slug: string) {
  return staticBrands.find((brand) => brand.slug === slug);
}

export function getStaticCategory(slug: string) {
  return staticCategories.find((category) => category.slug === slug);
}

export function shopifyCsvRows() {
  const header = [
    "Handle",
    "Title",
    "Body (HTML)",
    "Vendor",
    "Type",
    "Tags",
    "Published",
    "Option1 Name",
    "Option1 Value",
    "Option2 Name",
    "Option2 Value",
    "Variant SKU",
    "Variant Barcode",
    "Variant Price",
    "Variant Grams",
    "Variant Inventory Qty",
    "Status",
  ];
  const rows = [header];
  for (const product of staticProducts) {
    product.variants.forEach((variant, index) => {
      rows.push([
        product.slug,
        index === 0 ? product.name : "",
        index === 0 ? product.description : "",
        index === 0 ? product.vendor : "",
        index === 0 ? product.category : "",
        index === 0 ? product.brandSlug : "",
        index === 0 ? "TRUE" : "",
        "Kleur",
        variant.colorName,
        "Lengte",
        variant.length,
        variant.sku,
        variant.ean,
        variant.price.toFixed(2),
        "",
        variant.inStock ? "10" : "0",
        index === 0 ? "active" : "",
      ]);
    });
  }
  return rows;
}

export function shopifyCsv() {
  return shopifyCsvRows()
    .map((row) =>
      row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","),
    )
    .join("\n");
}

/** @deprecated Use getStaticProduct. Kept so existing client cart lines still resolve. */
export const products = staticProducts;
export const brands = staticBrands;
export const categories = staticCategories;

export function getProduct(slug: string) {
  return getStaticProduct(slug);
}
