import rows from "../../../data/seo/redirects.json" with { type: "json" };

import { preserveClickSearch } from "../tracking/clicks";

export type RedirectRow = {
  from: string;
  to: string;
  status: "200" | "301";
  reason: string;
};

export const redirectRows = rows as RedirectRow[];

const byFrom = new Map(redirectRows.map((row) => [row.from, row]));

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

function brandOf(value: string) {
  const text = value.toLowerCase();
  if (text.includes("duafort") || text.includes("canexel")) return "profex";
  return PUBLIC_BRANDS.find((brand) => text.includes(brand));
}

/** Patterns for old URLs that were not in the crawled sitemap. */
export function fallbackTarget(path: string) {
  if (path.startsWith("/product/")) {
    const slug = path.slice("/product/".length);
    const brand = brandOf(slug);
    if (slug.includes("hpl") && !slug.includes("reiniger")) return "/hpl-platen";
    if (slug.includes("dakrand") || slug.includes("boei")) {
      return brand ? `/dakranden?merk=${brand}` : "/dakranden";
    }
    if (slug.includes("vensterbank")) return "/kunststof-vensterbank";
    if (slug.includes("plafond")) return "/merken/florence";
    if (brand) return `/merken/${brand}`;
    return "/gevelbekleding";
  }
  if (path.startsWith("/product-categorie/")) {
    const brand = brandOf(path);
    if (path.includes("hpl") && !path.includes("reiniger")) return "/hpl-platen";
    if (path.includes("dakrand") || path.includes("boei")) {
      return brand ? `/dakranden?merk=${brand}` : "/dakranden";
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
    return (PUBLIC_BRANDS as readonly string[]).includes(slug) ? `/merken/${slug}` : "/merken";
  }
  if (path.startsWith("/wp-content/")) return "/gevelbekleding";
  return null;
}

export function lookupRedirect(pathname: string): RedirectRow {
  const path = normalizePath(pathname);
  const known = byFrom.get(path);
  if (known) return known;
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
  const row = lookupRedirect(input.pathname);
  const target = splitTarget(row.to);
  const normalized = normalizePath(input.pathname);
  const apex = hostname === "kunststof-gevel.nl";
  const slash = input.pathname.length > 1 && input.pathname.endsWith("/");
  const pathChanged = target.pathname !== normalized;
  if (!apex && !pathChanged && !slash && !target.search) {
    return { action: "next", noindex };
  }
  return {
    action: "redirect",
    pathname: target.pathname,
    search: preserveClickSearch(target.search || (pathChanged ? "" : input.search), input.search),
    host: apex ? "www.kunststof-gevel.nl" : null,
    noindex,
  };
}
