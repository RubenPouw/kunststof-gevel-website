import type { Metadata } from "next";

import { CategoryPage } from "@/components/catalog/category-page";
import { searchProducts } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Zoeken",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const raw = params.q;
  const query = (Array.isArray(raw) ? raw[0] : raw) ?? "";
  const results = searchProducts(query);

  return (
    <CategoryPage
      kicker="Zoeken"
      title={query ? `Resultaten voor “${query}”` : "Zoek op product of artikelnummer"}
      intro={
        query
          ? `${results.length} product${results.length === 1 ? "" : "en"} gevonden.`
          : "Typ een merk, profiel of artikel in de zoekbalk."
      }
      products={results}
    />
  );
}
