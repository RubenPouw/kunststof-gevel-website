import handles from "../../../data/seo/catalog-handles.json" with { type: "json" };
import duplicatePublicSlugs from "../../../data/seo/duplicate-public-slugs.json" with { type: "json" };

const PRODUCT_SLUGS = new Set<string>([
  ...(handles as string[]),
  ...Object.values(duplicatePublicSlugs as Record<string, string>),
]);

const MONTAGE_BRANDS = new Set([
  "keralit",
  "vinyplus",
  "eurotexx",
  "kerrafront",
  "milexx",
  "profex",
  "unipanel",
  "zierer",
]);

const DAKRAND_BRANDS = new Set(["keralit", "vinyplus", "milexx", "unipanel"]);

const GEVEL_TYPES = new Set(["rabat", "sponning", "potdeksel"]);

/**
 * Live canonical (www, 29 okt 2026): `/keralit-gevelbekleding/` 301s to the
 * product-category URL, which is self-canonical. The short slug must not be the target.
 */
export const KERALIT_CANONICAL = "/product-categorie/kunststof-gevelbekleding/keralit-gevelbekleding";

/** One hop. A path that itself redirects must not be used as a target. */
const COLLAPSE: Record<string, string> = {
  "/hpl-platen": "/hpl-plaat",
  "/merken/hpl": "/hpl-plaat",
  "/keralit-gevelbekleding": KERALIT_CANONICAL,
  "/merken/keralit": KERALIT_CANONICAL,
  "/merken/zierer": "/zierer-steenstrips",
  "/staalaanvraag": "/stalen",
  "/kozijnen": "/kunststof-kozijnen",
  "/assortiment": "/gevelbekleding",
  "/rabatdelen": "/gevelbekleding/rabat",
  "/keralit-boeideel-dakrand-afwerken": "/blog/keralit-boeideel-dakrand-afwerken",
  "/kunststof-gevel-schoonmaken-onderhoud": "/blog/kunststof-gevel-schoonmaken",
};

const COLOR_BASE: Record<string, string> = {
  "keralit-kleuren": "/merken/keralit/kleuren",
  "kleur-eurotexx": "/merken/eurotexx/kleuren",
  "kerrafront-kleuren": "/merken/kerrafront/kleuren",
  "trend-kleur": "/merken/kerrafront/kleuren",
  "kleur-deel": "/gevelbekleding/kleuren",
  "steenlook-kleuren": "/kunststof-vensterbank/kleuren",
  "kleur-type-b": "/kunststof-vensterbank/kleuren",
  "kleur-novaboard": "/kunststof-vensterbank/kleuren",
  "kleur-wildverband": "/zierer-steenstrips/kleuren",
  "kleur-steenstrip-grof": "/zierer-steenstrips/kleuren",
  "milexx-dakrand-kleur": "/merken/milexx/kleuren",
  "kleur-platpaneel": "/merken/milexx/kleuren",
  "glad-houtnerf": "/hpl-plaat",
};

const PLAIN_BASE: Record<string, string> = {
  "hoogte-van-het-paneel": "/dakranden/milexx",
  "afmeting-platpaneel": "/dakranden/milexx",
  "diepte-vensterbank": "/kunststof-vensterbank",
  "lengte-vensterbank": "/kunststof-vensterbank",
  "links-rechts": "/kunststof-vensterbank",
  "torx-maten": "/montage",
  "soort-epdm": "/montage",
};

const NOINDEX_EXACT = new Set([
  "/zoeken",
  "/kunststof-kozijnen/offertemand",
  "/hpl-plaat/kleur-structuur",
  "/merken/overig",
  "/account",
  "/inloggen",
  "/registreren",
  "/winkelwagen",
  "/afrekenen",
  "/stalen/bedankt",
  "/offerte/bedankt",
  "/afrekenen/bedankt",
]);

const FILTER_KEYS = new Set([
  "merk",
  "type",
  "kleur",
  "groep",
  "kleurnaam",
  "ral",
  "voorraad",
  "breedte",
  "weergave",
  "sorteer",
  "color",
  "lijn",
  "afwerking",
  "onderdeel",
]);

export function forcedRedirect(path: string) {
  return COLLAPSE[path] ?? null;
}

export function collapseIndexable(target: string) {
  const hash = target.indexOf("#");
  const bare = hash === -1 ? target : target.slice(0, hash);
  const q = bare.indexOf("?");
  const path = q === -1 ? bare : bare.slice(0, q);
  const search = q === -1 ? "" : bare.slice(q + 1);
  const params = new URLSearchParams(search);
  let next = path || "/";
  if (params.get("merk") && (next === "/montage" || next === "/dakranden")) {
    const merk = params.get("merk") ?? "";
    if (next === "/montage" && MONTAGE_BRANDS.has(merk)) next = `/montage/${merk}`;
    else if (next === "/dakranden" && DAKRAND_BRANDS.has(merk)) next = `/dakranden/${merk}`;
    else next = next === "/dakranden" ? "/dakranden" : "/montage";
  } else if (params.get("type") && next === "/gevelbekleding") {
    const type = params.get("type") ?? "";
    next = GEVEL_TYPES.has(type) ? `/gevelbekleding/${type}` : "/gevelbekleding";
  } else if ([...params.keys()].some((key) => FILTER_KEYS.has(key))) {
    next = COLLAPSE[next] ?? next;
  }
  return COLLAPSE[next] ?? next;
}

function productMatch(slug: string) {
  if (PRODUCT_SLUGS.has(slug)) return `/producten/${slug}`;
  const starts = [...PRODUCT_SLUGS].filter((handle) => handle.startsWith(`${slug}-`));
  if (starts.length === 1) return `/producten/${starts[0]}`;
  return null;
}

/** Old archive and product paths that are not in redirects.json. */
export function archiveTarget(path: string): string | null {
  const paged = path.match(/^(.*)\/page\/\d+$/);
  if (paged) {
    const base = paged[1] || "/";
    if (base === "/kunststof-nieuwtjes" || base.startsWith("/laatste-nieuws")) return "/blog";
    return archiveTarget(base) ?? (base === "/" ? "/blog" : base);
  }

  const parts = path.split("/").filter(Boolean);
  const head = parts[0] ?? "";
  const rest = parts.slice(1).join("/");

  if (head && COLOR_BASE[head]) {
    if (!rest) return collapseIndexable(COLOR_BASE[head].replace(/\/kleuren$/, "") || COLOR_BASE[head]);
    const base = COLOR_BASE[head];
    if (base === "/hpl-plaat") return `/hpl-plaat/${rest.split("/")[0]}`;
    return `${base}/${rest.split("/")[0]}`;
  }
  if (head && PLAIN_BASE[head]) return PLAIN_BASE[head];

  if (path.startsWith("/product/")) {
    const slug = path.slice("/product/".length);
    const matched = productMatch(slug);
    if (matched) return matched;
    if (slug.includes("hpl") && !slug.includes("reiniger")) return "/hpl-plaat";
    if (slug.includes("dakrand") || slug.includes("boei")) {
      if (slug.includes("keralit")) return "/dakranden/keralit";
      if (slug.includes("vinyplus")) return "/dakranden/vinyplus";
      if (slug.includes("milexx")) return "/dakranden/milexx";
      if (slug.includes("unipanel")) return "/dakranden/unipanel";
      return "/dakranden";
    }
    if (slug.includes("vensterbank")) return "/kunststof-vensterbank";
    if (slug.includes("plafond")) return "/kunststof-plafond";
    if (slug.includes("keralit") && /profiel|schroef|hoek|eind|montage|verbinding/.test(slug)) return "/montage/keralit";
    if (slug.includes("keralit")) return KERALIT_CANONICAL;
    if (slug.includes("vinyplus")) return "/montage/vinyplus";
    if (slug.includes("eurotexx")) return "/montage/eurotexx";
    if (slug.includes("kerrafront")) return "/montage/kerrafront";
    if (slug.includes("milexx")) return "/montage/milexx";
    if (slug.includes("profex") || slug.includes("duafort")) return "/montage/profex";
    if (slug.includes("unipanel")) return "/montage/unipanel";
    if (slug.includes("zierer")) return "/montage/zierer";
    return "/gevelbekleding";
  }

  if (path.startsWith("/merk/")) {
    const slug = parts[1] ?? "";
    if (slug === "keralit") return KERALIT_CANONICAL;
    if (slug === "zierer") return "/zierer-steenstrips";
    if (slug === "hpl") return "/hpl-plaat";
    return null;
  }

  return null;
}

export function isIndexableDestination(pathname: string, search = "") {
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  for (const key of params.keys()) {
    if (FILTER_KEYS.has(key)) return false;
  }
  if (NOINDEX_EXACT.has(pathname) || pathname.startsWith("/weergave") || pathname.startsWith("/afrekenen")) {
    return false;
  }
  if (pathname === "/" || pathname === "") return true;
  if (PRODUCT_SLUGS.has(pathname.slice("/producten/".length)) && pathname.startsWith("/producten/")) return true;
  if (pathname.startsWith("/blog/")) return true;
  if (pathname.startsWith("/projecten/")) return true;
  if (pathname.startsWith("/merken/") && pathname.includes("/kleuren/")) return true;
  if (pathname.startsWith("/gevelbekleding/kleuren/")) return true;
  if (pathname.startsWith("/kunststof-vensterbank/kleuren/")) return true;
  if (pathname.startsWith("/zierer-steenstrips/kleuren/")) return true;
  if (/^\/gevelbekleding\/(rabat|sponning|potdeksel)$/.test(pathname)) return true;
  if (/^\/dakranden\/(keralit|vinyplus|milexx|unipanel)$/.test(pathname)) return true;
  if (/^\/montage\/(keralit|vinyplus|eurotexx|kerrafront|milexx|profex|unipanel|zierer)$/.test(pathname)) return true;
  if (/^\/hpl-plaat\/[a-z0-9-]+$/.test(pathname) && pathname !== "/hpl-plaat/kleur-structuur") return true;
  if (pathname.startsWith("/kunststof-kozijnen/")) return !pathname.endsWith("/offertemand");
  const staticPaths = new Set([
    "/gevelbekleding",
    "/dakranden",
    "/montage",
    "/kozijnafwerking",
    "/hpl-plaat",
    KERALIT_CANONICAL,
    "/zierer-steenstrips",
    "/kunststof-vensterbank",
    "/kunststof-kozijnen",
    "/merken",
    "/stalen",
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
    "/boeidelen",
    "/boeiboord",
    "/schroten",
    "/badkamerplafond",
    "/kunststof-plafond",
    "/overzet-vensterbank",
    "/hpl-vs-trespa",
    "/rabatdelen",
  ]);
  if (staticPaths.has(pathname)) return true;
  if (/^\/merken\/[a-z0-9-]+$/.test(pathname)) {
    const slug = pathname.slice("/merken/".length);
    return slug !== "overig" && slug !== "keralit" && slug !== "zierer" && slug !== "hpl";
  }
  return false;
}
