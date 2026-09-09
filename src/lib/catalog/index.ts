import brandsJson from "../../data/catalog/brands.json";
import categoriesJson from "../../data/catalog/categories.json";
import palettesJson from "../../data/catalog/palettes.json";
import productsJson from "../../data/catalog/products.json";

import type {
  Brand,
  Category,
  CategorySlug,
  Product,
  ProductBadge,
  ProductColor,
  ProductVariant,
  Spec,
} from "./types";
import { categorySlugs } from "./types";

export type { Brand, Category, CategorySlug, Product, ProductBadge, ProductColor, ProductVariant, Spec };
export { categorySlugs };

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

export const brands: Brand[] = brandsJson;
export const categories: Category[] = categoriesJson as Category[];

function isCategorySlug(value: string): value is CategorySlug {
  return (categorySlugs as readonly string[]).includes(value);
}

function expandVariants(raw: RawProduct): ProductVariant[] {
  if (raw.variants?.length) {
    return raw.variants.map((variant) => ({
      sku: variant.sku,
      ean: variant.ean ?? "",
      colorName: variant.colorName,
      ral: variant.ral,
      hex: variant.hex,
      length: variant.length,
      price: variant.price,
      inStock: variant.inStock,
      stockText: variant.stockText,
      popular: variant.popular,
    }));
  }

  const palette = raw.paletteId ? palettes[raw.paletteId] : undefined;
  if (!palette?.length || !raw.skuPrefix || raw.price === undefined) {
    throw new Error(`Catalogusproduct ${raw.slug} mist varianten of palette.`);
  }

  return palette.map((color) => ({
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
  }));
}

function hydrate(raw: RawProduct): Product {
  if (!isCategorySlug(raw.category)) {
    throw new Error(`Onbekende categorie: ${raw.category}`);
  }
  const brand = brands.find((item) => item.slug === raw.brandSlug);
  if (!brand) {
    throw new Error(`Onbekend merk: ${raw.brandSlug}`);
  }

  const variants = expandVariants(raw);
  const prices = variants.map((variant) => variant.price);
  const price = Math.min(...prices);
  const inStock = variants.some((variant) => variant.inStock);
  const uniqueLengths = [...new Set(variants.map((variant) => variant.length))];
  const length = uniqueLengths.length === 1 ? uniqueLengths[0] : uniqueLengths.join(" / ");
  const outOfStock = variants.find((variant) => !variant.inStock && variant.stockText);

  return {
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
    colors: variants.map((variant) => ({
      name: variant.colorName,
      hex: variant.hex,
      ral: variant.ral,
      popular: variant.popular,
    })),
    length,
  };
}

export const products: Product[] = (productsJson.items as RawProduct[]).map(hydrate);

export const featuredProductSlugs = productsJson.featuredSlugs as readonly string[];

export function getProduct(slug: string) {
  return products.find((product) => product.slug === slug);
}

export function getVariant(product: Product, sku: string) {
  return product.variants.find((variant) => variant.sku === sku);
}

export function getVariantBySku(sku: string) {
  for (const product of products) {
    const variant = getVariant(product, sku);
    if (variant) return { product, variant };
  }
  return undefined;
}

export function getDefaultVariant(product: Product) {
  return product.variants.find((variant) => variant.popular) ?? product.variants[0];
}

export function getProductsByCategory(category: CategorySlug) {
  return products.filter((product) => product.category === category);
}

export function getProductsByBrand(brandSlug: string) {
  return products.filter((product) => product.brandSlug === brandSlug);
}

export function getRelatedProducts(product: Product) {
  return product.relatedSlugs
    .map((slug) => getProduct(slug))
    .filter((item): item is Product => Boolean(item));
}

export function searchProducts(query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return products;
  return products.filter((product) => {
    const haystack = [
      product.name,
      product.brand,
      product.vendor,
      product.meta,
      product.category,
      product.slug,
      ...product.variants.flatMap((variant) => [variant.sku, variant.ean, variant.colorName]),
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });
}

export function applyListingFilters(
  list: Product[],
  filters: { brandSlug?: string; inStockOnly?: boolean },
) {
  return list.filter((product) => {
    if (filters.brandSlug && product.brandSlug !== filters.brandSlug) return false;
    if (filters.inStockOnly && !product.inStock) return false;
    return true;
  });
}

export function brandsInProducts(list: Product[]) {
  const slugs = [...new Set(list.map((product) => product.brandSlug))];
  return slugs
    .map((slug) => brands.find((brand) => brand.slug === slug))
    .filter((brand): brand is Brand => Boolean(brand));
}

export function getCategory(slug: string) {
  return categories.find((category) => category.slug === slug);
}

export function getBrand(slug: string) {
  return brands.find((brand) => brand.slug === slug);
}

export function parseListingSearchParams(searchParams: Record<string, string | string[] | undefined>) {
  const merkRaw = searchParams.merk;
  const voorraadRaw = searchParams.voorraad;
  const brandSlug = Array.isArray(merkRaw) ? merkRaw[0] : merkRaw;
  const voorraad = Array.isArray(voorraadRaw) ? voorraadRaw[0] : voorraadRaw;
  return {
    brandSlug: brandSlug || undefined,
    inStockOnly: voorraad === "1",
  };
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
    "Variant SKU",
    "Variant Barcode",
    "Variant Price",
    "Variant Grams",
    "Variant Inventory Qty",
    "Status",
  ];
  const rows = [header];
  for (const product of products) {
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
