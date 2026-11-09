import { NextResponse, type NextRequest } from "next/server";

import { boeiBrandSlugs, categoryInternalRewrite } from "@/data/seo/category-pages";
import { listingRewriteTarget } from "@/lib/catalog/paths";
import { normalizePath, resolveNavigation } from "@/lib/seo/redirects";

const BOEI_BRANDS = new Set<string>(boeiBrandSlugs);

export function proxy(request: NextRequest) {
  // The public slug is rewritten onto the catalog folder. Middleware runs again
  // on that folder and would 301 back here, so the second pass only renders.
  if (request.headers.get("x-kg-rewrite") === "1") {
    return NextResponse.next();
  }

  const path = normalizePath(request.nextUrl.pathname);
  const merk = request.nextUrl.searchParams.get("merk");
  const onlyBrand =
    merk &&
    BOEI_BRANDS.has(merk) &&
    [...request.nextUrl.searchParams.keys()].every((key) => key === "merk" || key === "pagina");
  if ((path === "/dakranden" || path === "/boeidelen") && onlyBrand) {
    const url = request.nextUrl.clone();
    url.pathname = `/boeidelen/${merk}`;
    url.search = "";
    return NextResponse.redirect(url, 301);
  }

  const decision = resolveNavigation({
    host: request.headers.get("host") ?? "",
    pathname: request.nextUrl.pathname,
    search: request.nextUrl.search,
  });

  if (decision.action === "next") {
    const target = listingRewriteTarget(
      normalizePath(request.nextUrl.pathname),
      request.nextUrl.searchParams,
    );
    if (target) {
      const url = request.nextUrl.clone();
      url.pathname = target;
      url.search = "";
      const response = NextResponse.rewrite(url);
      if (decision.noindex) response.headers.set("X-Robots-Tag", "noindex, nofollow");
      return response;
    }
    const internal = categoryInternalRewrite(normalizePath(request.nextUrl.pathname));
    if (internal) {
      const url = request.nextUrl.clone();
      url.pathname = internal;
      const headers = new Headers(request.headers);
      headers.set("x-kg-rewrite", "1");
      const response = NextResponse.rewrite(url, { request: { headers } });
      if (decision.noindex) response.headers.set("X-Robots-Tag", "noindex, nofollow");
      return response;
    }
    const response = NextResponse.next();
    if (decision.noindex) response.headers.set("X-Robots-Tag", "noindex, nofollow");
    return response;
  }

  const url = new URL(request.url);
  url.pathname = decision.pathname;
  url.search = decision.search;
  if (decision.host) {
    url.protocol = "https:";
    url.hostname = decision.host;
    url.port = "";
  }
  const response = NextResponse.redirect(url, 301);
  if (decision.noindex) response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|api/).*)"],
};
