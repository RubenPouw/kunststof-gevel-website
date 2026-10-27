"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { ColourName } from "@/components/catalog/colour-name";
import { ListingCard } from "@/components/catalog/listing-card";
import { ListingRow } from "@/components/catalog/listing-row";
import { buttonVariants } from "@/components/ui/button";
import { listingHref, parseListingPresentation, parseListingSearchParams } from "@/lib/catalog/helpers";
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
import type { ListingFilters } from "@/lib/catalog/types";
import { colorFamilyLabels, productGroupLabels, profileTypeLabels, type ProductGroup } from "@/lib/catalog/types";
import { cn } from "@/lib/utils";

const COLOUR_PREVIEW = 8;

export function ProductListing({
  cards: initialCards,
  total: initialTotal,
  totalUnfiltered,
  facets,
  page,
  pageSize,
  filters: initialFilters,
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

  function onFilter(
    event: React.MouseEvent<HTMLAnchorElement>,
    patch: Omit<Partial<ListingFilters>, "productGroup" | "brandSlug"> & {
      brandSlug?: string | "";
      productGroup?: ProductGroup | null;
    },
  ) {
    if (!plainClick(event)) return;
    event.preventDefault();
    const next: ListingFilters = {
      ...filters,
      ...patch,
      brandSlug: patch.brandSlug === "" ? undefined : (patch.brandSlug ?? filters.brandSlug),
      productGroup: patch.productGroup === null ? undefined : (patch.productGroup ?? filters.productGroup),
    };
    void replaceFromApi(next, 1, presentation, true);
  }

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
  const colourPreview = facets.sheetColors.slice(0, COLOUR_PREVIEW);
  const colourRest = facets.sheetColors.slice(COLOUR_PREVIEW);
  const showFilters =
    showStockChip ||
    facets.groups.length > 1 ||
    facets.profileTypes.filter((item) => item.slug !== "overig").length > 1 ||
    facets.colorFamilies.length > 1 ||
    facets.sheetColors.length > 1 ||
    facets.rals.length > 1 ||
    facets.widths.length > 1;

  return (
    <div className="mt-8 grid gap-10 lg:grid-cols-[3fr_9fr] lg:gap-5">
      <aside className="order-2 h-fit lg:sticky lg:top-[128px] lg:order-none">
        {showFilters ? (
          <div className="kg-soft-card p-5">
            <p className="font-mono text-[13px] text-kg-navy">Filters</p>
            <div className="mt-2">
        {showStockChip ? (
          <FilterSection title="Voorraad">
            <FilterCheck
              href={listingHref(basePath, filters, { inStockOnly: !filters.inStockOnly }, presentation)}
              active={Boolean(filters.inStockOnly)}
              label="Op voorraad"
              onClick={(event) => onFilter(event, { inStockOnly: !filters.inStockOnly })}
            />
          </FilterSection>
        ) : null}
        {facets.groups.length > 1 ? (
          <FilterSection title="Producttype">
            {facets.groups.map((item) => {
              const active = filters.productGroup === item.slug;
              return (
                <FilterCheck
                  key={item.slug}
                  href={listingHref(
                    basePath,
                    filters,
                    { productGroup: active ? null : item.slug, profileType: undefined },
                    presentation,
                  )}
                  active={active}
                  label={productGroupLabels[item.slug]}
                  count={item.count}
                  onClick={(event) =>
                    onFilter(event, { productGroup: active ? null : item.slug, profileType: undefined })
                  }
                />
              );
            })}
          </FilterSection>
        ) : facets.profileTypes.filter((item) => item.slug !== "overig").length > 1 ? (
          <FilterSection title="Producttype">
            {facets.profileTypes
              .filter((item) => item.slug !== "overig")
              .map((item) => {
                const active = filters.profileType === item.slug;
                return (
                  <FilterCheck
                    key={item.slug}
                    href={listingHref(basePath, filters, { profileType: active ? undefined : item.slug }, presentation)}
                    active={active}
                    label={profileTypeLabels[item.slug]}
                    count={item.count}
                    onClick={(event) => onFilter(event, { profileType: active ? undefined : item.slug })}
                  />
                );
              })}
          </FilterSection>
        ) : null}
        {facets.colorFamilies.length > 1 ? (
          <FilterSection title="Kleurfamilie">
            {facets.colorFamilies.map((item) => {
              const active = filters.colorFamily === item.slug;
              return (
                <a
                  key={item.slug}
                  href={listingHref(basePath, filters, { colorFamily: active ? undefined : item.slug }, presentation)}
                  onClick={(event) => onFilter(event, { colorFamily: active ? undefined : item.slug })}
                  className="flex min-h-11 items-center gap-3 text-[15px] text-kg-navy no-underline hover:no-underline"
                >
                  <span
                    className={cn(
                      "size-4 border border-kg-lijn",
                      active && "outline outline-2 outline-offset-1 outline-kg-navy",
                    )}
                    style={{ background: item.hex }}
                  />
                  {colorFamilyLabels[item.slug]}
                  <span className="ml-auto font-mono text-[12px] text-kg-text-2">{item.count}</span>
                </a>
              );
            })}
          </FilterSection>
        ) : null}
        {facets.sheetColors.length > 1 ? (
          <FilterSection title="Kleurnaam">
            {colourPreview.map((item) => (
              <ColourLink
                key={item.slug}
                item={item}
                active={filters.colorSlug === item.slug}
                href={listingHref(
                  basePath,
                  filters,
                  { colorSlug: filters.colorSlug === item.slug ? "" : item.slug },
                  presentation,
                )}
                onClick={(event) => onFilter(event, { colorSlug: filters.colorSlug === item.slug ? "" : item.slug })}
              />
            ))}
            {colourRest.length > 0 ? (
              <details className="group">
                <summary className="flex min-h-11 cursor-pointer list-none items-center font-mono text-[13px] text-kg-navy [&::-webkit-details-marker]:hidden">
                  <span className="group-open:hidden">Toon meer</span>
                  <span className="hidden group-open:inline">Toon minder</span>
                </summary>
                {colourRest.map((item) => (
                  <ColourLink
                    key={item.slug}
                    item={item}
                    active={filters.colorSlug === item.slug}
                    href={listingHref(
                      basePath,
                      filters,
                      { colorSlug: filters.colorSlug === item.slug ? "" : item.slug },
                      presentation,
                    )}
                    onClick={(event) =>
                      onFilter(event, { colorSlug: filters.colorSlug === item.slug ? "" : item.slug })
                    }
                  />
                ))}
              </details>
            ) : null}
          </FilterSection>
        ) : null}
        {facets.rals.length > 1 ? (
          <FilterSection title="RAL">
            <div className="flex max-h-64 flex-wrap gap-2 overflow-auto">
              {facets.rals.map((item) => {
                const active = filters.ral === item.code;
                return (
                  <a
                    key={item.code}
                    href={listingHref(basePath, filters, { ral: active ? "" : item.code }, presentation)}
                    onClick={(event) => onFilter(event, { ral: active ? "" : item.code })}
                    className={cn(
                      "inline-flex h-10 min-h-10 items-center border px-3 font-mono text-[13px] no-underline hover:no-underline",
                      active
                        ? "border-kg-navy bg-kg-navy text-kg-kalk"
                        : "border-kg-lijn bg-white text-kg-navy hover:bg-kg-kalk",
                    )}
                  >
                    RAL {item.code}
                  </a>
                );
              })}
            </div>
          </FilterSection>
        ) : null}
        {facets.widths.length > 1 ? (
          <FilterSection title="Werkende breedte">
            <div className="flex flex-wrap gap-2">
              {facets.widths.map((item) => {
                const active = filters.workingWidthMm === item.mm;
                return (
                  <a
                    key={item.mm}
                    href={listingHref(
                      basePath,
                      filters,
                      { workingWidthMm: active ? undefined : item.mm },
                      presentation,
                    )}
                    onClick={(event) => onFilter(event, { workingWidthMm: active ? undefined : item.mm })}
                    className={cn(
                      "inline-flex h-10 min-h-10 items-center border px-3 font-mono text-[13px] no-underline hover:no-underline",
                      active
                        ? "border-kg-navy bg-white text-kg-navy"
                        : "border-kg-lijn bg-white text-kg-navy hover:bg-kg-kalk",
                    )}
                  >
                    {item.mm} mm
                  </a>
                );
              })}
            </div>
          </FilterSection>
        ) : null}
            </div>
          </div>
        ) : null}
      </aside>

      <div className="order-1 lg:order-none">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2.5">
          <p className="font-mono text-[14px] text-kg-text-2">
            {total === 0
              ? totalUnfiltered === 0
                ? "Geen artikelen"
                : "Geen producten met deze filters."
              : `${rangeStart} - ${rangeEnd} van ${total} ${total === 1 ? "product" : "producten"}`}
          </p>
          <div className="flex items-center gap-2">
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

function ColourLink({
  item,
  active,
  href,
  onClick,
}: {
  item: { slug: string; name: string; hex: string; count: number };
  active: boolean;
  href: string;
  onClick: (event: React.MouseEvent<HTMLAnchorElement>) => void;
}) {
  return (
    <a
      href={href}
      onClick={onClick}
      className="flex min-h-11 items-center gap-3 text-[15px] text-kg-navy no-underline hover:no-underline"
    >
      <span
        className={cn("size-4 shrink-0 border border-kg-lijn", active && "outline outline-2 outline-offset-1 outline-kg-navy")}
        style={{ background: item.hex }}
      />
      <ColourName value={item.name} className="min-w-0 flex-1" />
      <span className="font-mono text-[12px] text-kg-text-2">{item.count}</span>
    </a>
  );
}

function FilterCheck({
  href,
  active,
  label,
  count,
  onClick,
}: {
  href: string;
  active: boolean;
  label: string;
  count?: number;
  onClick: (event: React.MouseEvent<HTMLAnchorElement>) => void;
}) {
  return (
    <label className="flex min-h-11 items-center gap-3">
      <a
        href={href}
        onClick={onClick}
        className={cn(
          "grid size-4 place-items-center border border-kg-navy text-[10px] text-white no-underline hover:no-underline",
          active && "bg-kg-navy",
        )}
      >
        {active ? "✓" : ""}
      </a>
      <a
        href={href}
        onClick={onClick}
        className="flex flex-1 items-baseline justify-between gap-2 text-[15px] text-kg-navy no-underline hover:no-underline"
      >
        {label}
        {typeof count === "number" ? <span className="font-mono text-[12px] text-kg-text-2">{count}</span> : null}
      </a>
    </label>
  );
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-6 last:mb-0">
      <p className="border-b border-kg-lijn pb-2 font-mono text-[13px] text-kg-navy">{title}</p>
      <div className="mt-3">{children}</div>
    </section>
  );
}
