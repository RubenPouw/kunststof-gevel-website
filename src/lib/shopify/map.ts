import type {
  Brand,
  CategorySlug,
  Product,
  ProductImage,
  ProductVariant,
  Spec,
} from "@/lib/catalog/types";
import { categorySlugs } from "@/lib/catalog/types";

import type { ShopifyImage, ShopifyProduct, ShopifyVariant } from "./types";

const GENERIC_VENDORS = new Set(["mijn winkel", "my store", "shop", ""]);

const EXCLUDED_HANDLE = /^(verzendkosten|pakketservice)(-|$)/i;
const EXCLUDED_TITLE = /verzendkosten|pakketservice/i;

export const CATEGORY_COLLECTION_HANDLES: Record<CategorySlug, string[]> = {
  gevelbekleding: ["gevelbekleding", "rabatdelen", "sponningdelen", "wandpanelen"],
  dakranden: ["dakranden", "dakrand"],
  kozijnafwerking: ["kozijnafwerking"],
  montage: ["montage", "kunststof-profielen", "kunststof-profiel"],
};

export const PRODUCT_TYPE_TO_CATEGORY: Record<string, CategorySlug> = {
  gevelbekleding: "gevelbekleding",
  rabatdelen: "gevelbekleding",
  rabatdeel: "gevelbekleding",
  sponningdelen: "gevelbekleding",
  sponningdeel: "gevelbekleding",
  wandpanelen: "gevelbekleding",
  wandpaneel: "gevelbekleding",
  dakrand: "dakranden",
  dakranden: "dakranden",
  kozijnafwerking: "kozijnafwerking",
  "kunststof profielen": "montage",
  "kunststof profiel": "montage",
  montage: "montage",
};

const KNOWN_BRANDS: Brand[] = [
  { slug: "milin", name: "Milin", summary: "Kunststof gevel- en afwerkproducten van Milin." },
  { slug: "heering", name: "Heering", summary: "Kunststof gevelbekleding en profielen van Heering." },
  { slug: "milinboard", name: "Milinboard", summary: "Kunststof vensterbanken en overzetbanken, inclusief eindkappen." },
  { slug: "vinyplus", name: "VinyPlus", summary: "Gevelpanelen en dakranden, uit voorraad in veelgebruikte kleuren." },
  { slug: "vinytherm", name: "VinyTherm", summary: "Kunststof gevelpanelen in de VinyTherm-lijn." },
  { slug: "keralit", name: "Keralit", summary: "Stijve houtlook gevel- en dakranddelen met 10 jaar kleurvastheid." },
  { slug: "eurotexx", name: "Eurotexx", summary: "Potdeksel, rabat en bijpassende hulpstukken voor renovatie." },
  { slug: "kerrafront", name: "Kerrafront", summary: "Brede sponningdelen, onder andere 332 mm multi en dubbel." },
  { slug: "zierer", name: "Zierer", summary: "Steenstrips en hoekstukken voor plint, aanbouw en latei." },
  { slug: "profex", name: "Profex", summary: "Duafort rabat als Canexel-vervanger, licht en onderhoudsarm." },
  { slug: "milexx", name: "Milexx", summary: "Volschuim dakranden en hoeken, passend bij kunststof overstek." },
  { slug: "linerio", name: "Linerio", summary: "Wandpanelen en binnenafwerking." },
  { slug: "fronto", name: "Fronto", summary: "Kunststof gevel- en afwerkprofielen." },
  { slug: "werzalit", name: "Werzalit", summary: "Vensterbanken en plaatmateriaal." },
  { slug: "thomdeck", name: "ThomDeck", summary: "Kunststof dek- en afwerkproducten." },
  { slug: "multitexx", name: "Multitexx", summary: "Gevelpanelen voor renovatie en nieuwbouw." },
];

const COLOR_HEX: Record<string, string> = {
  antraciet: "#3A3D41",
  zwart: "#1A1A1A",
  wit: "#F4F1EA",
  creme: "#E8DCC8",
  crème: "#E8DCC8",
  eiken: "#7A4E2E",
  meranti: "#5C2E22",
  "vergrijsd eiken": "#A39480",
  grijs: "#6B6E72",
  antracietgrijs: "#3A3D41",
  terracotta: "#A24B32",
  groen: "#3F5344",
  blauw: "#2457FF",
  bruin: "#6B3828",
  beige: "#C4B6A2",
  steen: "#8A7A6A",
};

export function isExcludedShopifyProduct(product: Pick<ShopifyProduct, "handle" | "title">) {
  return EXCLUDED_HANDLE.test(product.handle) || EXCLUDED_TITLE.test(product.title);
}

export function normalizeTypeKey(value: string) {
  return value.trim().toLowerCase();
}

export function categoryFromProductType(productType: string): CategorySlug | undefined {
  return PRODUCT_TYPE_TO_CATEGORY[normalizeTypeKey(productType)];
}

export function categoryFromCollectionHandle(handle: string): CategorySlug | undefined {
  const normalized = handle.trim().toLowerCase();
  for (const slug of categorySlugs) {
    if (CATEGORY_COLLECTION_HANDLES[slug].includes(normalized) || slug === normalized) {
      return slug;
    }
  }
  return undefined;
}

export function categoryFromTitle(title: string): CategorySlug | undefined {
  const t = title.toLowerCase();
  if (/(vensterbank|overzetbank|kozijn|eindkap)/.test(t)) return "kozijnafwerking";
  if (/(dakrand|boeideel)/.test(t)) return "dakranden";
  if (/(rabat|sponning|gevelpaneel|wandpaneel|potdeksel|steenstrip|leisteen|gevelbekleding)/.test(t)) {
    return "gevelbekleding";
  }
  if (/(profiel|schroef|clip|kit|ventilatie|startpr|verbinding|montage)/.test(t)) return "montage";
  return undefined;
}

export function inferCategory(
  product: Pick<ShopifyProduct, "productType" | "title" | "tags">,
  collectionHandles: string[] = [],
): CategorySlug {
  const fromType = categoryFromProductType(product.productType);
  if (fromType) return fromType;

  for (const handle of collectionHandles) {
    const fromCollection = categoryFromCollectionHandle(handle);
    if (fromCollection) return fromCollection;
  }

  for (const tag of product.tags) {
    const fromTag = categoryFromProductType(tag) ?? categoryFromCollectionHandle(tag);
    if (fromTag) return fromTag;
  }

  return categoryFromTitle(product.title) ?? "montage";
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function inferBrand(product: Pick<ShopifyProduct, "vendor" | "title" | "tags">): Brand {
  const haystack = [product.vendor, product.title, ...product.tags].join(" ");
  const matched = KNOWN_BRANDS.find((brand) => {
    const re = new RegExp(`\\b${brand.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
    return re.test(haystack);
  });
  if (matched) return matched;

  const vendor = product.vendor.trim();
  if (vendor && !GENERIC_VENDORS.has(vendor.toLowerCase())) {
    return {
      slug: slugify(vendor),
      name: vendor,
      summary: `Producten van ${vendor}.`,
    };
  }

  return {
    slug: "overig",
    name: "Overig",
    summary: "Overige merken en hulpmateriaal.",
  };
}

function optionValue(variant: ShopifyVariant, names: string[]) {
  const match = variant.selectedOptions.find((option) =>
    names.includes(option.name.toLowerCase()),
  );
  return match?.value;
}

function isDefaultOption(name: string, value: string) {
  return name.toLowerCase() === "title" && value.toLowerCase() === "default title";
}

function colorHex(colorName: string) {
  const key = colorName.trim().toLowerCase();
  if (COLOR_HEX[key]) return COLOR_HEX[key];
  let hash = 0;
  for (const char of key) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  const palette = ["#3A3D41", "#7A4E2E", "#5C2E22", "#6B6E72", "#A39480", "#4C5055"];
  return palette[hash % palette.length];
}

function lengthFromTitle(title: string) {
  const match = title.match(/(\d+(?:[.,]\d+)?\s?(?:mm|cm|mtr|m)\b)/i);
  return match?.[1]?.replace("mtr", "m");
}

function mapImage(image: ShopifyImage | null | undefined, fallbackAlt: string): ProductImage | undefined {
  if (!image?.url) return undefined;
  return { url: image.url, alt: image.altText || fallbackAlt };
}

function mapVariant(product: ShopifyProduct, variant: ShopifyVariant, index: number): ProductVariant {
  const color =
    optionValue(variant, ["kleur", "color", "colour"]) ??
    variant.selectedOptions.find((option) => !isDefaultOption(option.name, option.value) && !/lengte|length|maat|size/.test(option.name.toLowerCase()))
      ?.value ??
    (variant.title !== "Default Title" ? variant.title : "Standaard");
  const length =
    optionValue(variant, ["lengte", "length", "maat", "size"]) ??
    lengthFromTitle(product.title) ??
    "stuk";
  const sku =
    variant.sku?.trim() ||
    `${product.handle}-${index + 1}`.toUpperCase().replace(/[^A-Z0-9-]+/g, "-");

  return {
    sku,
    ean: "",
    colorName: color,
    hex: colorHex(color),
    length,
    price: Number.parseFloat(variant.price.amount) || 0,
    inStock: variant.availableForSale,
    stockText: variant.availableForSale ? undefined : "Niet op voorraad",
    options: variant.selectedOptions,
  };
}

function specsFor(product: ShopifyProduct, brand: Brand, category: CategorySlug, variants: ProductVariant[]): Spec[] {
  const specs: Spec[] = [
    { label: "Merk", value: brand.name },
    { label: "Leverancier", value: product.vendor || brand.name },
  ];
  if (product.productType) specs.push({ label: "Type", value: product.productType });
  specs.push({ label: "Categorie", value: category });
  const lengths = [...new Set(variants.map((variant) => variant.length))];
  if (lengths.length === 1) specs.push({ label: "Lengte", value: lengths[0] });
  const sku = variants.find((variant) => variant.sku)?.sku;
  if (sku) specs.push({ label: "SKU", value: sku });
  return specs;
}

export function mapShopifyProduct(
  product: ShopifyProduct,
  collectionHandles: string[] = [],
): Product | null {
  if (isExcludedShopifyProduct(product)) return null;

  const brand = inferBrand(product);
  const category = inferCategory(product, collectionHandles);
  const variants = product.variants.nodes.map((variant, index) => mapVariant(product, variant, index));
  if (!variants.length) return null;

  const prices = variants.map((variant) => variant.price);
  const price = Math.min(...prices);
  const inStock = variants.some((variant) => variant.inStock);
  const uniqueLengths = [...new Set(variants.map((variant) => variant.length))];
  const length = uniqueLengths.length === 1 ? uniqueLengths[0] : uniqueLengths.join(" / ");
  const images = [
    mapImage(product.featuredImage, product.title),
    ...product.images.nodes.map((image) => mapImage(image, product.title)),
  ].filter((image, index, list): image is ProductImage => {
    return Boolean(image) && list.findIndex((item) => item?.url === image?.url) === index;
  });

  return {
    slug: product.handle,
    name: product.title,
    vendor: product.vendor || brand.name,
    brand: brand.name,
    brandSlug: brand.slug,
    category,
    description: product.description || `${product.title} van ${brand.name}.`,
    specs: specsFor(product, brand, category, variants),
    relatedSlugs: [],
    variants,
    price,
    inStock,
    stockText: inStock ? undefined : "Niet op voorraad",
    meta: `${length} · ${variants.length} ${variants.length === 1 ? "variant" : "varianten"}`,
    palette: variants.map((variant) => variant.hex),
    colors: variants.map((variant) => ({
      name: variant.colorName,
      hex: variant.hex,
    })),
    length,
    images,
    productType: product.productType || undefined,
    source: "shopify",
  };
}

export function brandsFromProducts(products: Product[], extras: Brand[] = []): Brand[] {
  const bySlug = new Map<string, Brand>();
  for (const brand of [...KNOWN_BRANDS, ...extras]) {
    bySlug.set(brand.slug, brand);
  }
  for (const product of products) {
    if (!bySlug.has(product.brandSlug)) {
      bySlug.set(product.brandSlug, {
        slug: product.brandSlug,
        name: product.brand,
        summary: `Producten van ${product.brand}.`,
      });
    }
  }
  const used = new Set(products.map((product) => product.brandSlug));
  return [...bySlug.values()].filter((brand) => used.has(brand.slug));
}

export { KNOWN_BRANDS };
