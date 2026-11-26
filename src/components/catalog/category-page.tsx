import Link from "next/link";

import { CategoryBrandStrip } from "@/components/catalog/category-brand-strip";
import { ProductListing } from "@/components/catalog/product-listing";
import { ReviewBar } from "@/components/reviews/review-bar";
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
  photoGrid = false,
  sheetCalculator = false,
  emptyMessage,
  sampleHref,
  belowIntro,
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
  /** HPL shows colour photos in a grid. Other categories keep the list. */
  photoGrid?: boolean;
  sheetCalculator?: boolean;
  emptyMessage?: React.ReactNode;
  sampleHref?: string;
  belowIntro?: React.ReactNode;
}) {
  return (
    <div className="bg-kg-kalk">
    <div className="container-kg pt-10 sm:pt-12">
      <p className="font-mono text-[13px] text-kg-text-2">{kicker}</p>
      <h1 className="display-plp mt-2 max-w-3xl">{title}</h1>
      <p className="mt-4 max-w-2xl text-kg-text-2">{intro}</p>
      {belowIntro}
      {sampleHref ? (
        <p className="mt-4">
          <Link href={sampleHref}>Gratis kleurstalen aanvragen</Link>
        </p>
      ) : null}
      <CategoryBrandStrip brands={brandOptions} />

      {sheetCalculator ? (
        <div className="mt-8 max-w-3xl">
          <SheetCalculator />
        </div>
      ) : null}
    </div>

    <div className="mt-8">
      <ReviewBar />
    </div>

    <div className="container-kg pt-8 pb-10 sm:pb-12">
      <ProductListing
        cards={cards}
        total={total}
        totalUnfiltered={totalUnfiltered}
        facets={facets}
        page={page}
        pageSize={pageSize}
        brands={brandOptions}
        filters={filters}
        basePath={basePath}
        view={presentation.view}
        sort={presentation.sort}
        showStockChip={showStockChip}
        photoGrid={photoGrid}
        emptyMessage={emptyMessage}
      />
    </div>
    </div>
  );
}
