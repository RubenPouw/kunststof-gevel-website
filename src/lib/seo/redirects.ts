import { categoryRedirectTarget } from "@/data/seo/category-pages";
import rows from "../../../data/seo/redirects.json" with { type: "json" };

import { preserveClickSearch } from "../tracking/clicks";

export type RedirectRow = {
  from: string;
  to: string;
  status: "200" | "301" | "308";
  reason: string;
};

export const redirectRows = rows as RedirectRow[];

type QueryRule = { params: Array<[string, string]>; row: RedirectRow };

function splitRule(from: string) {
  const index = from.indexOf("?");
  const path = normalizePath(index === -1 ? from : from.slice(0, index));
  if (index === -1) return { path, params: [] as Array<[string, string]> };
  return { path, params: [...new URLSearchParams(from.slice(index + 1)).entries()] };
}

const byFrom = new Map<string, RedirectRow>();
const queryByPath = new Map<string, QueryRule[]>();
for (const row of redirectRows) {
  const rule = splitRule(row.from);
  if (rule.params.length) {
    const list = queryByPath.get(rule.path) ?? [];
    list.push({ params: rule.params, row });
    queryByPath.set(rule.path, list);
    continue;
  }
  byFrom.set(rule.path, row);
}

function searchParamsOf(search: string) {
  const text = search.startsWith("?") ? search.slice(1) : search;
  return new URLSearchParams(text);
}

/** Path plus the attribute in the approved map. Other parameters do not block the match. */
function matchQuery(path: string, search: string): RedirectRow | null {
  const rules = queryByPath.get(path);
  if (!rules?.length || !search) return null;
  const incoming = searchParamsOf(search);
  const hits = rules.filter((rule) => rule.params.every(([key, value]) => incoming.get(key) === value));
  if (!hits.length) return null;
  hits.sort((a, b) => b.params.length - a.params.length);
  return hits[0].row;
}

const PUBLIC_BRANDS = [
  "milinboard",
  "vinyplus",
  "kerrafront",
  "eurotexx",
  "keralit",
  "milexx",
  "unipanel",
  "florence",
  "zierer",
  "profex",
] as const;

export function normalizePath(pathname: string) {
  let path = pathname || "/";
  try {
    path = decodeURIComponent(path);
  } catch {
    // Leave an invalid escape as-is.
  }
  if (!path.startsWith("/")) path = `/${path}`;
  if (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1);
  return path;
}

function dakrandFallback(brand: string | undefined) {
  if (brand === "keralit" || brand === "vinyplus" || brand === "milexx") return `/boeidelen/${brand}`;
  return brand ? `/boeidelen?merk=${brand}` : "/boeidelen";
}

function brandOf(value: string) {
  const text = value.toLowerCase();
  if (text.includes("duafort") || text.includes("canexel")) return "profex";
  return PUBLIC_BRANDS.find((brand) => text.includes(brand));
}

/** Patterns for old URLs that were not in the crawled sitemap. */
export function fallbackTarget(path: string) {
  // Duafort is not a brand page. The proposal sends both old URLs to gevelbekleding.
  if (path === "/duafort-gevelbekleding" || path === "/merk/duafort" || path === "/merk/canexel") {
    return "/gevelbekleding";
  }
  if (path.startsWith("/product/")) {
    const slug = path.slice("/product/".length);
    const brand = brandOf(slug);
    if (slug.includes("hpl") && !slug.includes("reiniger")) return "/hpl-plaat";
    if (slug.includes("dakrand") || slug.includes("boei")) {
      return dakrandFallback(brand);
    }
    if (slug.includes("vensterbank")) return "/kunststof-vensterbank";
    if (slug.includes("plafond")) return "/merken/florence";
    if (brand) return `/merken/${brand}`;
    return "/gevelbekleding";
  }
  if (path.startsWith("/product-categorie/")) {
    const brand = brandOf(path);
    if (path.includes("hpl") && !path.includes("reiniger")) return "/hpl-plaat";
    if (path.includes("dakrand") || path.includes("boei")) {
      return dakrandFallback(brand);
    }
    if (path.includes("plaatmateriaal")) return "/kozijnafwerking";
    if (path.includes("vensterbank")) return "/kunststof-vensterbank";
    if (path.includes("plafond") || path.includes("overstek")) return "/merken/florence";
    if (path.includes("montage")) return brand ? `/montage?merk=${brand}` : "/montage";
    if (brand) return `/merken/${brand}`;
    return "/gevelbekleding";
  }
  if (path.startsWith("/merk/")) {
    const slug = path.slice("/merk/".length);
    if (slug === "duafort" || slug === "canexel") return "/gevelbekleding";
    return (PUBLIC_BRANDS as readonly string[]).includes(slug) ? `/merken/${slug}` : "/merken";
  }
  if (path.startsWith("/wp-content/")) return "/gevelbekleding";
  return null;
}

/** Linerio is off the shop. Wonderboard stays in Shopify for the other site. */
const RETIRED_KG = /linerio|wonderboard/i;

export function retiredKgTarget(path: string): string | null {
  if (RETIRED_KG.test(path)) return "/gevelbekleding";
  return null;
}

/** Oude WP-permalink → blog op Render. Eén hop, ook met slash via normalizePath. */
const blogPostRedirects: Record<string, string> = {
  "/steenlook-vensterbank": "/blog/steenlook-vensterbank",
  "/keralit-kleuren": "/blog/keralit-kleuren",
  "/kunststof-rabatdelen-monteren": "/blog/kunststof-rabatdelen-monteren",
  "/vensterbank-vervangen": "/blog/vensterbank-vervangen",
  "/kunststof-gevelbekleding-kiezen": "/blog/kunststof-gevelbekleding-kiezen",
  "/kunststof-gevel-schoonmaken-onderhoud": "/blog/kunststof-gevel-schoonmaken-onderhoud",
  "/kosten-kunststof-gevelbekleding": "/blog/wat-kost-kunststof-gevelbekleding",
};

export function lookupRedirect(pathname: string, search = ""): RedirectRow {
  let pathInput = pathname || "/";
  let searchInput = search || "";
  const embedded = pathInput.indexOf("?");
  if (embedded !== -1) {
    const extra = pathInput.slice(embedded + 1);
    pathInput = pathInput.slice(0, embedded);
    searchInput = searchInput ? `${extra}&${searchInput.replace(/^\?/, "")}` : extra;
  }
  const path = normalizePath(pathInput);
  const retired = retiredKgTarget(path);
  if (retired) {
    return { from: path, to: retired, status: "301", reason: "niet-op-kunststof-gevel" };
  }
  const queried = matchQuery(path, searchInput);
  if (queried) return queried;
  if (path === "/dakkapel-renovatie") {
    return { from: path, to: "/blog/dakkapel-renovatie", status: "308", reason: "blogpost" };
  }
  const blog = blogPostRedirects[path];
  if (blog) return { from: path, to: blog, status: "301", reason: "blogpost" };
  const known = byFrom.get(path);
  if (known) return known;
  const categoryHop = categoryRedirectTarget(path);
  if (categoryHop) {
    return { from: path, to: categoryHop, status: "301", reason: "categorie-slug" };
  }
  const fallback = fallbackTarget(path);
  if (!fallback || fallback === path) {
    return { from: path, to: path, status: "200", reason: "unchanged" };
  }
  return { from: path, to: fallback, status: "301", reason: "fallback" };
}

export type NavDecision =
  | { action: "next"; noindex: boolean }
  | { action: "redirect"; pathname: string; search: string; host: string | null; noindex: boolean };

function splitTarget(target: string) {
  const index = target.indexOf("?");
  if (index === -1) return { pathname: target, search: "" };
  return { pathname: target.slice(0, index) || "/", search: `?${target.slice(index + 1)}` };
}

export function resolveNavigation(
  input: { host: string; pathname: string; search: string },
  env: { noindex?: string } = { noindex: process.env.NOINDEX },
): NavDecision {
  const hostname = input.host.split(":")[0].toLowerCase();
  const noindex = hostname.endsWith(".onrender.com") || env.noindex === "1" || env.noindex === "true";
  const row = lookupRedirect(input.pathname, input.search);
  const target = splitTarget(row.to);
  const normalized = normalizePath(input.pathname);
  const apex = hostname === "kunststof-gevel.nl";
  const slash = input.pathname.length > 1 && input.pathname.endsWith("/");
  const pathChanged = target.pathname !== normalized;
  const carryQuery = row.reason === "categorie-slug" && !target.search;
  if (!apex && !pathChanged && !slash && !target.search) {
    return { action: "next", noindex };
  }
  return {
    action: "redirect",
    pathname: target.pathname,
    search: preserveClickSearch(target.search || (pathChanged && !carryQuery ? "" : input.search), input.search),
    host: apex ? "www.kunststof-gevel.nl" : null,
    noindex,
  };
}
