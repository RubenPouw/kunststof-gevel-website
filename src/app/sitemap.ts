import type { MetadataRoute } from "next";

import { blogPosts } from "@/data/blog/posts";
import { staticBrands } from "@/lib/catalog/static";
import { getCatalog } from "@/lib/catalog";
import { CONTENT_UPDATED } from "@/lib/seo/dates";

const base = "https://www.kunststof-gevel.nl";
const contentDate = new Date(CONTENT_UPDATED);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const catalog = await getCatalog();
  const paths = [
    "",
    "/gevelbekleding",
    "/dakranden",
    "/kozijnafwerking",
    "/kozijnen",
    "/montage",
    "/merken",
    "/stalen",
    "/offerte",
    "/contact",
    "/zakelijk",
    "/projecten",
    "/over-ons",
    "/blog",
    "/privacy",
    "/algemene-voorwaarden",
    "/herroepingsrecht",
    "/verzenden-retour",
    "/klachtenprocedure",
  ];

  const brands = new Map<string, { slug: string }>();
  for (const brand of [...staticBrands, ...catalog.brands]) {
    if (brand.slug !== "overig") brands.set(brand.slug, brand);
  }

  return [
    ...paths.map((path) => ({
      url: `${base}${path || "/"}`,
      lastModified: contentDate,
    })),
    ...[...brands.values()].map((brand) => ({
      url: `${base}/merken/${brand.slug}`,
      lastModified: contentDate,
    })),
    ...catalog.products.map((product) => ({
      url: `${base}/producten/${product.slug}`,
      ...(product.updatedAt ? { lastModified: new Date(product.updatedAt) } : {}),
    })),
    ...blogPosts.map((post) => ({
      url: `${base}/blog/${post.slug}`,
      lastModified: new Date(post.date),
    })),
  ];
}
