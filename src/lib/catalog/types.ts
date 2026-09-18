export const categorySlugs = [
  "gevelbekleding",
  "dakranden",
  "kozijnafwerking",
  "montage",
] as const;

export type CategorySlug = (typeof categorySlugs)[number];

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
};
