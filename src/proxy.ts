import { NextResponse, type NextRequest } from "next/server";

import { listingRewriteTarget } from "@/lib/catalog/paths";
import { normalizePath, resolveNavigation } from "@/lib/seo/redirects";

export function proxy(request: NextRequest) {
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
