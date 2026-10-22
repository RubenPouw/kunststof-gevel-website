import { categorySlugs, type CategorySlug } from "@/lib/catalog/types";

const CATEGORY_PATHS = new Set(categorySlugs.map((slug) => `/${slug}`));

export const LISTING_QUERY_KEYS = [
  "merk",
  "voorraad",
  "type",
  "kleur",
  "breedte",
  "kleurnaam",
  "ral",
  "pagina",
  "weergave",
  "sorteer",
] as const;

const ACTIVE_SORTS = new Set(["naam", "prijs-op", "prijs-af"]);

export function listingQueryActive(search: URLSearchParams) {
  for (const key of LISTING_QUERY_KEYS) {
    const value = search.get(key);
    if (!value) continue;
    if (key === "pagina" && (value === "1" || !/^\d+$/.test(value))) continue;
    if (key === "weergave" && value !== "raster") continue;
    if (key === "sorteer" && !ACTIVE_SORTS.has(value)) continue;
    return true;
  }
  return false;
}

export function listingRewriteTarget(pathname: string, search: URLSearchParams) {
  if (!listingQueryActive(search)) return null;
  if (CATEGORY_PATHS.has(pathname)) {
    return encodeListingPath("categorie", pathname.slice(1), search);
  }
  const brand = pathname.match(/^\/merken\/([^/]+)$/);
  if (!brand) return null;
  return encodeListingPath("merk", decodeURIComponent(brand[1]), search);
}

export function encodeListingPath(kind: "categorie" | "merk", slug: string, search: URLSearchParams) {
  const pagina = search.get("pagina");
  const page = pagina && /^[1-9]\d*$/.test(pagina) ? pagina : "1";
  const parts = ["weergave", kind, slug, "p", page];
  for (const key of LISTING_QUERY_KEYS) {
    if (key === "pagina") continue;
    const value = search.get(key);
    if (value) parts.push(key, value);
  }
  return `/${parts.map((part) => encodeURIComponent(part)).join("/")}`;
}

export function decodeListingState(kind: string, slug: string, state: string[]) {
  if ((kind !== "categorie" && kind !== "merk") || !slug) return null;
  if (state[0] !== "p" || !/^[1-9]\d*$/.test(state[1] ?? "")) return null;
  const search = new URLSearchParams();
  const pagina = Number(state[1]);
  if (pagina > 1) search.set("pagina", String(pagina));
  for (let index = 2; index < state.length; index += 2) {
    const key = state[index];
    const value = state[index + 1];
    if (!value || !LISTING_QUERY_KEYS.includes(key as (typeof LISTING_QUERY_KEYS)[number]) || key === "pagina") {
      return null;
    }
    search.set(key, value);
  }
  return {
    kind: kind as "categorie" | "merk",
    slug,
    pagina,
    search,
  };
}

export function parseBasis(basis: string): { kind: "categorie" | "merk" | "zoeken"; slug: string } | null {
  const path = basis.split("?")[0] || "";
  if (path === "/zoeken") return { kind: "zoeken", slug: "" };
  const category = path.replace(/^\//, "");
  if ((categorySlugs as readonly string[]).includes(category) && path === `/${category}`) {
    return { kind: "categorie", slug: category };
  }
  const brand = path.match(/^\/merken\/([^/]+)$/);
  if (!brand) return null;
  return { kind: "merk", slug: decodeURIComponent(brand[1]) };
}

export function isCategorySlug(slug: string): slug is CategorySlug {
  return (categorySlugs as readonly string[]).includes(slug);
}
