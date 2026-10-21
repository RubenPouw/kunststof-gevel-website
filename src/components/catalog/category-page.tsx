import Link from "next/link";

import { ProductListing } from "@/components/catalog/product-listing";
import { SheetCalculator } from "@/components/catalog/sheet-calculator";
import type { ListingCardModel, ListingFacets } from "@/lib/catalog/listing";
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
  sheetCalculator?: boolean;
  emptyMessage?: string;
  sampleHref?: string;
}) {
  return (
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

      <ProductListing
        cards={cards}
        total={total}
        totalUnfiltered={totalUnfiltered}
        facets={facets}
        page={page}
        pageSize={pageSize}
        filters={filters}
        basePath={basePath}
        brandOptions={brandOptions}
        showBrandChips
        showStockChip
        emptyMessage={emptyMessage}
      />
    </div>
  );
}
