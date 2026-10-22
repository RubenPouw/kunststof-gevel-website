import { isLandingSlug, landingMatches, type LandingSlug } from "@/data/seo/landings";

import { listProducts } from "./index";

export async function productsForLanding(slug: LandingSlug) {
  const products = await listProducts();
  return products.filter((product) => landingMatches(slug, product));
}

export async function productsForLandingSlug(slug: string) {
  if (!isLandingSlug(slug)) return [];
  return productsForLanding(slug);
}
