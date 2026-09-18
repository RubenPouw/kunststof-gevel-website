export const categorySlugs = [
  "gevelbekleding",
  "dakranden",
  "kozijnafwerking",
  "montage",
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

export const colorFamilies = ["donker", "licht", "houtlook", "overig"] as const;

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
  sampleId: string;
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
  profileType: ProfileType;
  sampleable: boolean;
  panelsPerM2?: number;
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
  brandSlug?: string;
  inStockOnly?: boolean;
  profileType?: ProfileType;
  colorFamily?: ColorFamily;
  workingWidthMm?: number;
};
