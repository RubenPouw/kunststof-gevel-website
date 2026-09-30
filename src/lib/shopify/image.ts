import type { ImageLoaderProps } from "next/image";

export function isShopifyImage(src: string) {
  return src.startsWith("https://cdn.shopify.com/");
}

/** Shopify's CDN resizes and serves WebP/AVIF itself, so Next.js does not have to proxy these. */
export function shopifyImageLoader({ src, width }: ImageLoaderProps) {
  const url = new URL(src);
  url.searchParams.set("width", String(width));
  return url.toString();
}
