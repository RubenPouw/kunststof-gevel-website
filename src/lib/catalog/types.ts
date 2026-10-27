export const categorySlugs = [
  "gevelbekleding",
  "dakranden",
  "kozijnafwerking",
  "montage",
  "hpl-platen",
] as const;

export type CategorySlug = (typeof categorySlugs)[number];

export const profileTypes = [
  "sponning",
  "potdeksel",
  "rabat",
  "rondkant",
  "quattro",
  "steenstrip",
  "dakrand",
  "vensterbank",
  "profiel",
  "overig",
] as const;

export type ProfileType = (typeof profileTypes)[number];

/** Listing groups. The fine profile type stays for existing type= links. */
export const productGroups = ["gevelpaneel", "afwerkprofiel", "toebehoren"] as const;

export type ProductGroup = (typeof productGroups)[number];

export const productGroupLabels: Record<ProductGroup, string> = {
  gevelpaneel: "Gevelpanelen",
  afwerkprofiel: "Afwerkprofielen",
  toebehoren: "Toebehoren",
};

export const colorFamilies = [
  "donker",
  "licht",
  "houtlook",
  "groen",
  "blauw",
  "rood",
  "bruin",
  "geel",
  "metaal",
  "steen",
  "overig",
] as const;

export type ColorFamily = (typeof colorFamilies)[number];

export const profileTypeLabels: Record<ProfileType, string> = {
  sponning: "Sponning",
  potdeksel: "Potdeksel",
  rabat: "Rabat",
  rondkant: "Rondkant",
  quattro: "Quattro",
  steenstrip: "Steenstrip",
  dakrand: "Dakrand",
  vensterbank: "Vensterbank",
  profiel: "Profiel",
  overig: "Overig",
};

export const colorFamilyLabels: Record<ColorFamily, string> = {
  donker: "Donker",
  licht: "Licht",
  houtlook: "Houtlook",
  groen: "Groen",
  blauw: "Blauw",
  rood: "Rood",
  bruin: "Bruin",
  geel: "Geel",
  metaal: "Metaal",
  steen: "Steen",
  overig: "Overig",
};

export type ProductBadge = "Bestseller" | "Nieuw" | "Actie";

export type Spec = {
  label: string;
  value: string;
};

export type ProductColor = {
  name: string;
  hex: string;
  ral?: string;
  popular?: boolean;
  family: ColorFamily;
  skuSuffix?: string;
  sampleId: string;
};

export type ProductVariant = {
  sku: string;
  ean: string;
  colorName: string;
  ral?: string;
  hex: string;
  length: string;
  price: number;
  inStock: boolean;
  stockText?: string;
  popular?: boolean;
  options?: { name: string; value: string }[];
  colorFamily: ColorFamily;
  panelsPerM2?: number;
  /** True when the length was not in the article data and we used 6 m. */
  lengthAssumed?: boolean;
  sampleId: string;
  image?: ProductImage;
  shopifyVariantId?: string;
};

export type ProductImage = {
  url: string;
  alt: string;
};

export type Brand = {
  slug: string;
  name: string;
  summary: string;
};

export type Category = {
  slug: CategorySlug;
  name: string;
  summary: string;
};

export type Product = {
  slug: string;
  name: string;
  vendor: string;
  brand: string;
  brandSlug: string;
  category: CategorySlug;
  description: string;
  specs: Spec[];
  relatedSlugs: string[];
  badge?: ProductBadge;
  variants: ProductVariant[];
  price: number;
  inStock: boolean;
  stockText?: string;
  meta: string;
  palette: string[];
  colors: ProductColor[];
  length: string;
  images: ProductImage[];
  productType?: string;
  source?: "static" | "shopify";
  workingWidthMm?: number;
  /** Front-end group for the product-type filter and the default sort. */
  productGroup?: ProductGroup;
  profileType: ProfileType;
  sampleable: boolean;
  /** Whole HPL sheet. The gevel calculator does not apply. */
  saleUnit?: "sheet";
  /** Square metres of one whole sheet. */
  sheetM2?: number;
  panelsPerM2?: number;
  /** Other Shopify handles that are the same article. Not written back to Shopify. */
  aliasSlugs?: string[];
  lengthAssumed?: boolean;
  /** Shopify product.updatedAt when the catalog comes from the Storefront API. */
  updatedAt?: string;
  /** Real files only. Empty means the downloads block stays quiet. */
  downloads?: { label: string; href: string }[];
};

export type SampleColor = {
  id: string;
  brandSlug: string;
  brandName: string;
  colorName: string;
  hex: string;
  ral?: string;
};

export type ListingFilters = {
  /** One brand. A single `merk` value stays this field. */
  brandSlug?: string;
  /** Two or more brands. Same `merk` param, comma-separated. */
  brandSlugs?: string[];
  inStockOnly?: boolean;
  profileType?: ProfileType;
  profileTypes?: ProfileType[];
  productGroup?: ProductGroup;
  productGroups?: ProductGroup[];
  colorFamily?: ColorFamily;
  workingWidthMm?: number;
  /** Exact colour name, slugified. One `kleurnaam` value. */
  colorSlug?: string;
  /** Two or more colour names. Same `kleurnaam` param, comma-separated. */
  colorSlugs?: string[];
  /** RAL digits, for example 7016. */
  ral?: string;
};
