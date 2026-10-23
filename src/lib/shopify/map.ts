import { resolveColour } from "@/lib/catalog/colours";
import { enrichProduct, inferProfileType } from "@/lib/catalog/derive";
import { correctVariantImages } from "@/lib/catalog/variant-images";
import {
  DISTRIBUTOR_BRAND_SLUGS,
  isHplSheetText,
  matchHplLine,
  matchProductLine,
  sanitizeDescription,
  withoutTrespa,
} from "@/lib/catalog/text-rules";
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

const GENERIC_VENDORS = new Set(["mijn winkel", "my store", "shop", "", "aj fust", "ajfust"]);

const EXCLUDED_HANDLE = /^(verzendkosten|pakketservice)(-|$)/i;
const EXCLUDED_TITLE = /verzendkosten|pakketservice/i;

export const CATEGORY_COLLECTION_HANDLES: Record<CategorySlug, string[]> = {
  gevelbekleding: ["gevelbekleding", "rabatdelen", "sponningdelen", "wandpanelen"],
  dakranden: ["dakranden", "dakrand"],
  kozijnafwerking: ["kozijnafwerking"],
  montage: ["montage", "kunststof-profielen", "kunststof-profiel"],
  "hpl-platen": ["hpl-platen", "hpl-plaat", "hpl platen"],
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
  "hpl plaat": "hpl-platen",
  "hpl platen": "hpl-platen",
  "hpl-plaat": "hpl-platen",
};

const KNOWN_BRANDS: Brand[] = [
  { slug: "milin", name: "Milin", summary: "Kunststof gevel- en afwerkproducten van Milin." },
  { slug: "novicell", name: "Novicell", summary: "Houtlook gevelpanelen van Novicell, in fijne en grove nerf." },
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
  { slug: "unipanel", name: "Unipanel", summary: "Bouwpanelen en afwerking voor overstek en wand." },
  { slug: "florence", name: "Florence", summary: "Plafondpanelen voor binnen en buiten, met bijpassende profielen." },
  { slug: "hpl", name: "HPL", summary: "Compacte HPL plaat van 6 mm, geleverd als hele plaat van 3050 × 1300 mm." },
  {
    slug: "hpl-compact-exterieur",
    name: "HPL Compact Exterieur",
    summary: "HPL plaat voor buiten. Hele plaat, 3050 × 1300 × 6 mm.",
  },
  {
    slug: "hpl-fr",
    name: "FR brandvertragend",
    summary: "Brandvertragende HPL plaat in dezelfde plaatmaat van 3050 × 1300 × 6 mm.",
  },
  {
    slug: "renolit",
    name: "Renolit eenzijdig",
    summary: "HPL plaat met een decorlaag aan één kant. Hele plaat van 3,965 m².",
  },
  { slug: "abet", name: "Abet", summary: "HPL decorlijn. Hele plaat van 3050 × 1300 × 6 mm, te filteren op kleur en RAL." },
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
  if (isHplSheetText(t)) return "hpl-platen";
  if (/(vensterbank|overzetbank|overzetvensterbank)/.test(t)) return "kozijnafwerking";
  if (/(dakrand|boeideel)/.test(t)) return "dakranden";
  if (
    /(rabat|sponning|gevelpaneel|wandpaneel|potdeksel|steenstrip|leisteen|gevelbekleding|rondkant|quattro|vario|gevel)/.test(
      t,
    )
  ) {
    return "gevelbekleding";
  }
  if (/(eindkap|kozijn)/.test(t)) return "kozijnafwerking";
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

function brandBySlug(slug: string) {
  return KNOWN_BRANDS.find((brand) => brand.slug === slug);
}

export function inferBrand(
  product: Pick<ShopifyProduct, "vendor" | "title" | "tags" | "handle" | "productType">,
): Brand {
  const blob = `${product.title} ${product.handle.replace(/-/g, " ")} ${product.productType ?? ""} ${product.tags.join(" ")}`;
  if (/\bhpl\b/i.test(blob) && !/sandwich|reiniger/i.test(blob)) {
    const line = matchHplLine(blob);
    const hplBrand = brandBySlug(line ?? "hpl");
    if (hplBrand) return hplBrand;
  }

  const fromTitle = matchProductLine(`${product.title} ${product.handle.replace(/-/g, " ")}`);
  if (fromTitle && !DISTRIBUTOR_BRAND_SLUGS.has(fromTitle)) {
    const brand = brandBySlug(fromTitle);
    if (brand) return brand;
  }

  const fromTags = matchProductLine(product.tags.join(" "));
  if (fromTags && !DISTRIBUTOR_BRAND_SLUGS.has(fromTags)) {
    const brand = brandBySlug(fromTags);
    if (brand) return brand;
  }

  if (fromTitle) {
    const brand = brandBySlug(fromTitle);
    if (brand) return brand;
  }

  const matched = brandBySlug(matchProductLine(product.vendor) ?? "");
  if (matched) return matched;

  const vendor = withoutTrespa(product.vendor.trim());
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

function colorHex(colorName: string, context = "") {
  const key = colorName.trim().toLowerCase();
  if (COLOR_HEX[key]) return COLOR_HEX[key];
  return resolveColour(colorName, context).hex;
}

function lengthFromTitle(title: string) {
  const match = title.match(/(\d+(?:[.,]\d+)?\s?(?:mm|cm|mtr|m)\b)/i);
  return match?.[1]?.replace("mtr", "m");
}

function usableAlt(alt: string | null | undefined, fallback: string) {
  const value = alt?.trim() ?? "";
  if (value.length < 3) return fallback;
  if (/^(img|image|foto|screenshot|schermafbeelding|dsc|img_)/i.test(value)) return fallback;
  if (/\.(jpe?g|png|webp|gif)$/i.test(value)) return fallback;
  return withoutTrespa(value);
}

function mapImage(image: ShopifyImage | null | undefined, fallbackAlt: string): ProductImage | undefined {
  if (!image?.url) return undefined;
  return { url: image.url, alt: usableAlt(image.altText, fallbackAlt) };
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
    hex: colorHex(color, product.title),
    length,
    price: Number.parseFloat(variant.price.amount) || 0,
    inStock: variant.availableForSale,
    stockText: variant.availableForSale ? undefined : "Niet op voorraad",
    options: variant.selectedOptions,
    colorFamily: "overig",
    sampleId: "",
    shopifyVariantId: variant.id,
    image: mapImage(variant.image, `${product.title}, ${color}`),
  };
}

function specsFor(product: ShopifyProduct, brand: Brand, category: CategorySlug, variants: ProductVariant[]): Spec[] {
  const specs: Spec[] = [{ label: "Merk", value: brand.name }];
  const width = product.title.match(/(\d+(?:[.,]\d+)?)\s*mm/i);
  if (width) specs.push({ label: "Maat", value: `${width[1].replace(".", ",")} mm` });
  const lengths = [...new Set(variants.map((variant) => variant.length).filter((value) => value && value !== "stuk"))];
  if (lengths.length === 1) specs.push({ label: "Lengte", value: lengths[0] });
  const sku = variants.find((variant) => variant.sku)?.sku;
  if (sku) specs.push({ label: "Artikelnummer", value: sku });
  return specs;
}

export function mapShopifyProduct(
  product: ShopifyProduct,
  collectionHandles: string[] = [],
): Product | null {
  if (isExcludedShopifyProduct(product)) return null;

  const brand = inferBrand(product);
  const category = inferCategory(product, collectionHandles);
  const profileType = inferProfileType(product.title, product.productType);
  const variants = product.variants.nodes.map((variant, index) => mapVariant(product, variant, index));
  if (!variants.length) return null;

  const prices = variants.map((variant) => variant.price);
  const price = Math.min(...prices);
  const inStock = variants.some((variant) => variant.inStock);
  const uniqueLengths = [...new Set(variants.map((variant) => variant.length))];
  const length = uniqueLengths.length === 1 ? uniqueLengths[0] : uniqueLengths.join(" / ");
  const alt = withoutTrespa(`${brand.name} ${product.title}`);
  const images = [
    mapImage(product.featuredImage, alt),
    ...product.images.nodes.map((image) => mapImage(image, alt)),
    ...variants.map((variant) => variant.image),
  ].filter((image, index, list): image is ProductImage => {
    return Boolean(image) && list.findIndex((item) => item?.url === image?.url) === index;
  });

  return correctVariantImages(enrichProduct({
    slug: product.handle,
    name: withoutTrespa(product.title),
    vendor: product.vendor && !GENERIC_VENDORS.has(product.vendor.toLowerCase())
      ? product.vendor
      : brand.name,
    brand: brand.name,
    brandSlug: brand.slug,
    category,
    description: sanitizeDescription(product.description, product.title),
    specs: specsFor(product, brand, category, variants),
    relatedSlugs: [],
    variants,
    price,
    inStock,
    stockText: inStock ? undefined : "Niet op voorraad",
    meta: `${length} · ${variants.length} ${variants.length === 1 ? "variant" : "varianten"}`,
    palette: variants.map((variant) => variant.hex),
    colors: [],
    length,
    images,
    productType: product.productType || undefined,
    source: "shopify",
    profileType,
    sampleable: false,
    updatedAt: product.updatedAt,
  }));
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
