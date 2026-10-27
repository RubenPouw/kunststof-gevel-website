import Link from "next/link";

import { BrandRow } from "@/components/catalog/brand-row";
import { ProductListing } from "@/components/catalog/product-listing";
import { SheetCalculator } from "@/components/catalog/sheet-calculator";
import { DEFAULT_PRESENTATION, type ListingCardModel, type ListingFacets, type ListingPresentation } from "@/lib/catalog/listing";
import type { Brand, ListingFilters } from "@/lib/catalog/types";

export function CategoryPage({
  kicker,
  title,
  intro,
  cards,
  total,
  totalUnfiltered,
  facets,
  page,
  pageSize,
  brandOptions = [],
  basePath,
  filters,
  presentation = DEFAULT_PRESENTATION,
  showStockChip = false,
  sheetCalculator = false,
  emptyMessage,
  sampleHref,
}: {
  kicker: string;
  title: string;
  intro: string;
  cards: ListingCardModel[];
  total: number;
  totalUnfiltered: number;
  facets: ListingFacets;
  page: number;
  pageSize: number;
  brandOptions?: Brand[];
  basePath: string;
  filters: ListingFilters;
  presentation?: ListingPresentation;
  showStockChip?: boolean;
  sheetCalculator?: boolean;
  emptyMessage?: string;
  sampleHref?: string;
}) {
  return (
    <div className="bg-kg-kalk">
    <div className="container-kg py-10 sm:py-12">
      <p className="font-mono text-[13px] text-kg-text-2">{kicker}</p>
      <h1 className="display-plp mt-2 max-w-3xl">{title}</h1>
      <p className="mt-4 max-w-2xl text-kg-text-2">{intro}</p>
      {sampleHref ? (
        <p className="mt-4">
          <Link href={sampleHref}>Gratis kleurstalen aanvragen</Link>
        </p>
      ) : null}

      {sheetCalculator ? (
        <div className="mt-8 max-w-3xl">
          <SheetCalculator />
        </div>
      ) : null}

      {brandOptions.length > 1 ? (
        <BrandRow brands={brandOptions} basePath={basePath} filters={filters} presentation={presentation} />
      ) : null}

      <ProductListing
        cards={cards}
        total={total}
        totalUnfiltered={totalUnfiltered}
        facets={facets}
        page={page}
        pageSize={pageSize}
        filters={filters}
        basePath={basePath}
        view={presentation.view}
        sort={presentation.sort}
        showStockChip={showStockChip}
        emptyMessage={emptyMessage}
      />
    </div>
    </div>
  );
}
