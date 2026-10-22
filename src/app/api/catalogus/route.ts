import { NextResponse } from "next/server";

import { getProductsByBrand, getProductsByCategory, parseListingSearchParams, searchProducts } from "@/lib/catalog";
import { parseListingPresentation } from "@/lib/catalog/helpers";
import { CATEGORY_PAGE_SIZE, PAGE_SIZE, prepareListing } from "@/lib/catalog/listing";
import { isCategorySlug, parseBasis } from "@/lib/catalog/paths";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const basis = parseBasis(url.searchParams.get("basis") ?? "");
  if (!basis) return NextResponse.json({ error: "Onbekende lijst" }, { status: 400 });
  if (basis.kind === "categorie" && !isCategorySlug(basis.slug)) {
    return NextResponse.json({ error: "Onbekende lijst" }, { status: 400 });
  }

  const filters = parseListingSearchParams(Object.fromEntries(url.searchParams.entries()));
  const presentation = parseListingPresentation(url.searchParams);
  const pagina = Number(url.searchParams.get("pagina") || "1");
  const query = url.searchParams.get("q") ?? "";
  const all =
    basis.kind === "zoeken"
      ? await searchProducts(query)
      : basis.kind === "categorie" && isCategorySlug(basis.slug)
        ? await getProductsByCategory(basis.slug)
        : await getProductsByBrand(basis.slug);
  const pageSize = basis.kind === "categorie" ? CATEGORY_PAGE_SIZE : PAGE_SIZE;
  const view = prepareListing(all, filters, Number.isFinite(pagina) ? pagina : 1, pageSize, presentation.sort);

  return NextResponse.json(
    {
      cards: view.cards,
      total: view.total,
      totalUnfiltered: view.totalUnfiltered,
      page: view.page,
      pages: view.pages,
    },
    { headers: { "cache-control": "private, no-store" } },
  );
}
