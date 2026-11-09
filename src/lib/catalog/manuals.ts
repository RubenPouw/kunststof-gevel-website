import type { Product } from "@/lib/catalog/types";

/** Live handleiding van /zierer-montage/. Eén bestand, geen prijzen. */
export const ZIERER_MANUAL = {
  label: "Montagehandleiding Zierer",
  href: "/downloads/Montagehandleiding_Zierer.pdf",
} as const;

export function withManuals<T extends Pick<Product, "brandSlug" | "downloads">>(product: T): T {
  if (product.brandSlug !== "zierer") return product;
  const downloads = product.downloads ?? [];
  if (downloads.some((file) => file.href === ZIERER_MANUAL.href)) return product;
  return { ...product, downloads: [...downloads, { label: ZIERER_MANUAL.label, href: ZIERER_MANUAL.href }] };
}
