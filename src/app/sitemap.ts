import type { MetadataRoute } from "next";

import { blogPosts } from "@/data/blog/posts";
import { getCatalog } from "@/lib/catalog";

const base = "https://kunststof-gevel.nl";

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
    "/assortiment",
  ];

  return [
    ...paths.map((path) => ({
      url: `${base}${path || "/"}`,
      lastModified: new Date(),
    })),
    ...catalog.brands.map((brand) => ({
      url: `${base}/merken/${brand.slug}`,
      lastModified: new Date(),
    })),
    ...catalog.products.map((product) => ({
      url: `${base}/producten/${product.slug}`,
      lastModified: new Date(),
    })),
    ...blogPosts.map((post) => ({
      url: `${base}/blog/${post.slug}`,
      lastModified: new Date(post.date),
    })),
  ];
}
