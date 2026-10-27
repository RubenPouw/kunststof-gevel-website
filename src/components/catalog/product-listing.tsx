"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { BrandRow } from "@/components/catalog/brand-row";
import { ListingCard } from "@/components/catalog/listing-card";
import { ActiveFilterChips, ListingFiltersPanel } from "@/components/catalog/listing-filters";
import { ListingRow } from "@/components/catalog/listing-row";
import { buttonVariants } from "@/components/ui/button";
import {
  hasActiveFilters,
  mergeListingFilters,
  parseListingPresentation,
  parseListingSearchParams,
  type ListingFilterPatch,
} from "@/lib/catalog/helpers";
import {
  catalogusQuery,
  DEFAULT_PRESENTATION,
  listingPageHref,
  type ListingCardModel,
  type ListingFacets,
  type ListingPresentation,
  type ListingSort,
  type ListingView,
} from "@/lib/catalog/listing";
import type { Brand, ListingFilters } from "@/lib/catalog/types";
import { cn } from "@/lib/utils";

export function ProductListing({
  cards: initialCards,
  total: initialTotal,
  totalUnfiltered,
  facets,
  page,
  pageSize,
  filters: initialFilters,
  brands = [],
  basePath,
  view: initialView = DEFAULT_PRESENTATION.view,
  sort: initialSort = DEFAULT_PRESENTATION.sort,
  showStockChip = false,
  emptyMessage,
}: {
  cards: ListingCardModel[];
  total: number;
  totalUnfiltered: number;
  facets: ListingFacets;
  page: number;
  pageSize: number;
  filters: ListingFilters;
  brands?: Brand[];
  basePath: string;
  view?: ListingView;
  sort?: ListingSort;
  showStockChip?: boolean;
  emptyMessage?: string;
}) {
  const [cards, setCards] = useState(initialCards);
  const [total, setTotal] = useState(initialTotal);
  const [filters, setFilters] = useState(initialFilters);
  const [view, setView] = useState(initialView);
  const [sort, setSort] = useState(initialSort);
  const [originPage, setOriginPage] = useState(page);
  const [nextPagina, setNextPagina] = useState(page + 1);
  const busy = useRef(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const presentation: ListingPresentation = { view, sort };

  const replaceFromApi = useCallback(
    async (nextFilters: ListingFilters, pagina: number, nextPresentation: ListingPresentation, push: boolean) => {
      const response = await fetch(catalogusQuery(basePath, nextFilters, pagina, nextPresentation));
      if (!response.ok) {
        if (push) window.location.assign(listingPageHref(basePath, nextFilters, pagina, nextPresentation));
        return;
      }
      const body = (await response.json()) as {
        cards: ListingCardModel[];
        total: number;
        page: number;
      };
      setCards(body.cards);
      setTotal(body.total);
      setFilters(nextFilters);
      setView(nextPresentation.view);
      setSort(nextPresentation.sort);
      setOriginPage(body.page);
      setNextPagina(body.page + 1);
      if (push) {
        window.history.pushState(null, "", listingPageHref(basePath, nextFilters, body.page, nextPresentation));
      }
    },
    [basePath],
  );

  useEffect(() => {
    function onPop() {
      const current = new URLSearchParams(window.location.search);
      const nextFilters = parseListingSearchParams(Object.fromEntries(current.entries()));
      const nextPresentation = parseListingPresentation(current);
      const pagina = Number(current.get("pagina") || "1");
      void replaceFromApi(nextFilters, Number.isFinite(pagina) && pagina > 0 ? pagina : 1, nextPresentation, false);
    }
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [replaceFromApi]);

  function plainClick(event: React.MouseEvent) {
    return event.button === 0 && !event.metaKey && !event.altKey && !event.ctrlKey && !event.shiftKey;
  }

  function onFilter(event: React.MouseEvent<HTMLAnchorElement>, patch: ListingFilterPatch) {
    if (!plainClick(event)) return;
    event.preventDefault();
    void replaceFromApi(mergeListingFilters(filters, patch), 1, presentation, true);
  }

  function clearFilters(event: React.MouseEvent<HTMLAnchorElement>) {
    if (!plainClick(event)) return;
    event.preventDefault();
    void replaceFromApi({}, 1, presentation, true);
  }

  useEffect(() => {
    if (!filtersOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setFiltersOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [filtersOpen]);

  async function showMore(event: React.MouseEvent<HTMLAnchorElement>) {
    if (!plainClick(event)) return;
    event.preventDefault();
    if (busy.current) return;
    busy.current = true;
    try {
      const response = await fetch(catalogusQuery(basePath, filters, nextPagina, presentation));
      if (!response.ok) {
        window.location.assign(listingPageHref(basePath, filters, nextPagina, presentation));
        return;
      }
      const body = (await response.json()) as { cards: ListingCardModel[]; total: number; page: number };
      setCards((current) => {
        const seen = new Set(current.map((card) => card.slug));
        return [...current, ...body.cards.filter((card) => !seen.has(card.slug))];
      });
      setTotal(body.total);
      setNextPagina(body.page + 1);
    } finally {
      busy.current = false;
    }
  }

  function onSort(nextSort: ListingSort) {
    const next = { view, sort: nextSort };
    void replaceFromApi(filters, 1, next, true);
  }

  const rangeStart = total === 0 ? 0 : (originPage - 1) * pageSize + 1;
  const rangeEnd = total === 0 ? 0 : rangeStart + cards.length - 1;
  const remaining = Math.max(0, total - rangeEnd);
  const nextHref = listingPageHref(basePath, filters, nextPagina, presentation);
  const prevHref = originPage > 1 ? listingPageHref(basePath, filters, originPage - 1, presentation) : null;
  const showFilters =
    showStockChip ||
    facets.groups.length > 1 ||
    facets.profileTypes.filter((item) => item.slug !== "overig").length > 1 ||
    facets.colorFamilies.length > 1 ||
    facets.sheetColors.length > 1 ||
    facets.rals.length > 1 ||
    facets.widths.length > 1;

  const filterPanel = showFilters ? (
    <ListingFiltersPanel
      facets={facets}
      filters={filters}
      basePath={basePath}
      presentation={presentation}
      showStockChip={showStockChip}
      onFilter={onFilter}
    />
  ) : null;
  const productWord = total === 1 ? "product" : "producten";

  return (
    <div>
      <BrandRow
        brands={brands}
        basePath={basePath}
        filters={filters}
        presentation={presentation}
        onFilter={onFilter}
      />
      <div className="mt-8 grid gap-10 lg:grid-cols-[3fr_9fr] lg:gap-5">
        <aside className="hidden h-fit lg:sticky lg:top-[128px] lg:block">
          {showFilters ? (
            <div className="kg-soft-card p-5">
              <p className="font-mono text-[13px] text-kg-navy">Filters</p>
              {filterPanel}
            </div>
          ) : null}
        </aside>

        <div className="lg:order-none pb-24 lg:pb-0">
          <ActiveFilterChips
            filters={filters}
            facets={facets}
            brands={brands}
            basePath={basePath}
            presentation={presentation}
            onFilter={onFilter}
            onClear={clearFilters}
          />
          <div className="flex flex-wrap items-center justify-between gap-3 pb-2.5">
            <p className="font-mono text-[14px] text-kg-text-2">
              {total === 0
                ? totalUnfiltered === 0
                  ? "Geen artikelen"
                  : "Geen producten met deze filters."
                : `${rangeStart} - ${rangeEnd} van ${total} ${productWord}`}
            </p>
            <div className="flex items-center gap-2">
              {showFilters ? (
                <button
                  type="button"
                  className="h-11 border border-kg-navy bg-white px-3 font-mono text-[13px] text-kg-navy lg:hidden"
                  onClick={() => setFiltersOpen(true)}
                >
                  Filters{hasActiveFilters(filters) ? " · aan" : ""}
                </button>
              ) : null}
              <label className="block">
                <span className="sr-only">Sorteren</span>
                <select
                  value={sort}
                  onChange={(event) => onSort(event.target.value as ListingSort)}
                  className="h-11 border border-kg-navy bg-white px-2 font-mono text-[13px] text-kg-navy"
                >
                  <option value="relevantie">Relevantie</option>
                  <option value="naam">Naam</option>
                  <option value="prijs-op">Prijs laag-hoog</option>
                  <option value="prijs-af">Prijs hoog-laag</option>
                </select>
              </label>
              <ViewToggle
                view={view}
                listHref={listingPageHref(basePath, filters, 1, { view: "lijst", sort })}
                gridHref={listingPageHref(basePath, filters, 1, { view: "raster", sort })}
              />
            </div>
          </div>
          {cards.length === 0 ? (
            <p className="kg-soft-card mt-4 px-6 py-12 text-center text-kg-text-2">
              {emptyMessage ?? "Geen producten met deze filters."}
            </p>
          ) : view === "raster" ? (
            <div className="mt-4 grid gap-3 lg:grid-cols-2">
              {cards.map((card) => (
                <ListingCard key={card.slug} card={card} />
              ))}
            </div>
          ) : (
            <div className="mt-4 flex flex-col gap-3">
              {cards.map((card) => (
                <ListingRow key={card.slug} card={card} />
              ))}
            </div>
          )}
          {prevHref ? (
            <a href={prevHref} rel="prev" className="sr-only">
              Vorige pagina
            </a>
          ) : null}
          {remaining > 0 ? (
            <a
              href={nextHref}
              rel="next"
              onClick={showMore}
              className={cn(buttonVariants({ variant: "outline" }), "mt-8 no-underline hover:no-underline")}
            >
              Toon de volgende {Math.min(pageSize, remaining)}
            </a>
          ) : null}
        </div>
      </div>

      {showFilters && !filtersOpen ? (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-kg-lijn bg-white p-3 pr-24 lg:hidden">
          <button
            type="button"
            onClick={() => setFiltersOpen(true)}
            className={cn(buttonVariants({ variant: "primary", block: true }), "w-full")}
          >
            Toon {total} {productWord}
          </button>
        </div>
      ) : null}

      {filtersOpen && showFilters ? (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <button type="button" className="absolute inset-0 bg-kg-navy/40" aria-label="Sluit filters" onClick={() => setFiltersOpen(false)} />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Filters"
            className="absolute inset-x-0 bottom-0 top-12 flex flex-col bg-kg-kalk"
          >
            <div className="flex items-center justify-between border-b border-kg-lijn bg-white px-4 py-3">
              <p className="font-mono text-[13px] text-kg-navy">Filters</p>
              <button type="button" className="h-11 px-3 font-mono text-[13px] text-kg-navy" onClick={() => setFiltersOpen(false)}>
                Sluiten
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-auto px-4 py-4">
              <div className="kg-soft-card p-5">{filterPanel}</div>
            </div>
            <div className="border-t border-kg-lijn bg-white p-4">
              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                className={cn(buttonVariants({ variant: "primary", block: true }), "w-full")}
              >
                Toon {total} {productWord}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ViewToggle({ view, listHref, gridHref }: { view: ListingView; listHref: string; gridHref: string }) {
  return (
    <div className="flex border border-kg-navy">
      <a
        href={listHref}
        aria-current={view === "lijst" ? "page" : undefined}
        className={cn(
          "grid h-11 min-w-11 place-items-center px-2 no-underline hover:no-underline",
          view === "lijst" ? "bg-kg-navy text-kg-kalk" : "bg-white text-kg-navy",
        )}
      >
        <span className="sr-only">Lijst</span>
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
          <path d="M4 6h16M4 12h16M4 18h16" fill="none" stroke="currentColor" strokeWidth="3" />
        </svg>
      </a>
      <a
        href={gridHref}
        aria-current={view === "raster" ? "page" : undefined}
        className={cn(
          "grid h-11 min-w-11 place-items-center border-l border-kg-navy px-2 no-underline hover:no-underline",
          view === "raster" ? "bg-kg-navy text-kg-kalk" : "bg-white text-kg-navy",
        )}
      >
        <span className="sr-only">Raster</span>
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
          <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" fill="currentColor" />
        </svg>
      </a>
    </div>
  );
}
