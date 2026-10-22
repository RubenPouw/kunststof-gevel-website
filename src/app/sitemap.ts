import type { MetadataRoute } from "next";

import { blogPosts } from "@/data/blog/posts";
import { projects } from "@/data/projects";
import { articles } from "@/lib/kozijnen/kennis";
import { allLayouts, GROUPS, layoutPath } from "@/lib/kozijnen/layouts";
import { staticBrands } from "@/lib/catalog/static";
import { getCatalog } from "@/lib/catalog";
import { CONTENT_UPDATED } from "@/lib/seo/dates";

export const revalidate = 3600;

const base = "https://www.kunststof-gevel.nl";
const contentDate = new Date(CONTENT_UPDATED);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const catalog = await getCatalog();
  const paths = [
    "",
    "/gevelbekleding",
    "/keralit-gevelbekleding",
    "/zierer-steenstrips",
    "/kunststof-vensterbank",
    "/hpl-platen",
    "/dakranden",
    "/kozijnafwerking",
    "/kunststof-kozijnen",
    "/montage",
    "/merken",
    "/stalen",
    "/staalaanvraag",
    "/offerte",
    "/contact",
    "/zakelijk",
    "/projecten",
    "/reviews",
    "/over-ons",
    "/blog",
    "/privacy",
    "/algemene-voorwaarden",
    "/herroepingsrecht",
    "/verzenden-retour",
    "/klachtenprocedure",
  ];

  const stocked = new Set(catalog.products.map((product) => product.brandSlug));
  const brands = new Map<string, { slug: string }>();
  for (const brand of [...staticBrands, ...catalog.brands]) {
    if (brand.slug === "overig") continue;
    // New lines stay out of the sitemap until a product exists. Empty legacy brands stay.
    if (!stocked.has(brand.slug) && brand.slug.startsWith("hpl")) continue;
    if (!stocked.has(brand.slug) && (brand.slug === "renolit" || brand.slug === "abet")) continue;
    brands.set(brand.slug, brand);
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
    ...projects.map((project) => ({
      url: `${base}/projecten/${project.slug}`,
      lastModified: new Date(project.date),
    })),
    ...GROUPS.map((group) => ({
      url: `${base}${group.href}`,
      lastModified: contentDate,
    })),
    ...allLayouts().map((layout) => ({
      url: `${base}${layoutPath(layout)}`,
      lastModified: contentDate,
    })),
    {
      url: `${base}/kunststof-kozijnen/kennisbank`,
      lastModified: contentDate,
    },
    ...articles.map((article) => ({
      url: `${base}/kunststof-kozijnen/kennisbank/${article.slug}`,
      lastModified: contentDate,
    })),
    {
      url: `${base}/kunststof-kozijnen/kennisbank/hoe-moet-je-meten/formulier`,
      lastModified: contentDate,
    },
  ];
}
