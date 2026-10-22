import type { Metadata } from "next";

import { CategoryPage } from "@/components/catalog/category-page";
import { parseListingSearchParams, searchProducts } from "@/lib/catalog";
import { parseListingPresentation } from "@/lib/catalog/helpers";
import { prepareListing } from "@/lib/catalog/listing";

export const metadata: Metadata = {
  title: "Zoeken",
  robots: { index: false, follow: false },
  alternates: { canonical: "/zoeken" },
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const raw = params.q;
  const query = (Array.isArray(raw) ? raw[0] : raw) ?? "";
  const results = await searchProducts(query);
  const filters = parseListingSearchParams(params);
  const presentation = parseListingPresentation(params);
  const paginaRaw = Array.isArray(params.pagina) ? params.pagina[0] : params.pagina;
  const pagina = Number(paginaRaw || "1");
  const view = prepareListing(results, filters, Number.isFinite(pagina) ? pagina : 1, undefined, presentation.sort);

  return (
    <CategoryPage
      kicker="Zoeken"
      title={query ? `Resultaten voor “${query}”` : "Zoek op product of artikelnummer"}
      intro={
        query
          ? `${results.length} product${results.length === 1 ? "" : "en"} gevonden.`
          : "Typ een merk, profiel of artikel in de zoekbalk."
      }
      cards={view.cards}
      total={view.total}
      totalUnfiltered={view.totalUnfiltered}
      facets={view.facets}
      page={view.page}
      pageSize={view.pageSize}
      filters={filters}
      presentation={presentation}
      basePath={query ? `/zoeken?q=${encodeURIComponent(query)}` : "/zoeken"}
    />
  );
}
