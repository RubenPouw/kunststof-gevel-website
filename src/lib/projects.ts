import type { Project } from "@/data/projects";
import type { Product } from "@/lib/catalog/types";
import { staalTarget } from "@/lib/staal/tree";

const ACCESSORY = /schroef|eindkap|eindprofiel|startprofiel|hoekprofiel|verbind|stift|reiniger|dakrand|afwatering|montageprofiel/;

export function findProjectProduct(products: Product[], hint: Project["product"]) {
  if (!hint) return undefined;
  const hits = products.filter((product) => {
    if (product.category !== "gevelbekleding") return false;
    if (product.brandSlug !== hint.brandSlug) return false;
    const name = product.name.toLowerCase();
    if (ACCESSORY.test(name)) return false;
    return hint.includes.every((part) => name.includes(part.toLowerCase()));
  });
  hits.sort((a, b) => a.name.length - b.name.length);
  return hits[0];
}

export function projectStaalHref(product: Product | undefined) {
  if (product && staalTarget(product)) {
    return `/staalaanvraag?groep=gevel&product=${encodeURIComponent(product.slug)}`;
  }
  return "/staalaanvraag?groep=gevel";
}
