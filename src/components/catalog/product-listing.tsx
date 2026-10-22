"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { ListingCard } from "@/components/catalog/listing-card";
import { buttonVariants } from "@/components/ui/button";
import { listingHref, parseListingSearchParams } from "@/lib/catalog/helpers";
import {
  catalogusQuery,
  listingPageHref,
  type ListingCardModel,
  type ListingFacets,
} from "@/lib/catalog/listing";
import type { Brand, ListingFilters } from "@/lib/catalog/types";
import { colorFamilyLabels, profileTypeLabels } from "@/lib/catalog/types";
import { cn } from "@/lib/utils";

export function ProductListing({
  cards: initialCards,
  total: initialTotal,
  totalUnfiltered,
  facets,
  page,
  pageSize,
  filters: initialFilters,
  basePath,
  brandOptions = [],
  showBrandChips = false,
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
  brandOptions?: Brand[];
  showBrandChips?: boolean;
  showStockChip?: boolean;
  emptyMessage?: string;
}) {
  const [cards, setCards] = useState(initialCards);
  const [total, setTotal] = useState(initialTotal);
  const [filters, setFilters] = useState(initialFilters);
  const [originPage, setOriginPage] = useState(page);
  const [nextPagina, setNextPagina] = useState(page + 1);
  const busy = useRef(false);

  const replaceFromApi = useCallback(
    async (nextFilters: ListingFilters, pagina: number, push: boolean) => {
      const response = await fetch(catalogusQuery(basePath, nextFilters, pagina));
      if (!response.ok) {
        if (push) window.location.assign(listingPageHref(basePath, nextFilters, pagina));
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
      setOriginPage(body.page);
      setNextPagina(body.page + 1);
      if (push) window.history.pushState(null, "", listingPageHref(basePath, nextFilters, body.page));
    },
    [basePath],
  );

  useEffect(() => {
    function onPop() {
      const current = new URLSearchParams(window.location.search);
      const nextFilters = parseListingSearchParams(Object.fromEntries(current.entries()));
      const pagina = Number(current.get("pagina") || "1");
      void replaceFromApi(nextFilters, Number.isFinite(pagina) && pagina > 0 ? pagina : 1, false);
    }
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [replaceFromApi]);

  function plainClick(event: React.MouseEvent) {
    return event.button === 0 && !event.metaKey && !event.altKey && !event.ctrlKey && !event.shiftKey;
  }

  function onFilter(event: React.MouseEvent<HTMLAnchorElement>, patch: Partial<ListingFilters> & { brandSlug?: string | "" }) {
    if (!plainClick(event)) return;
    event.preventDefault();
    const next: ListingFilters = { ...filters, ...patch };
    if (patch.brandSlug === "") next.brandSlug = undefined;
    void replaceFromApi(next, 1, true);
  }

  async function showMore(event: React.MouseEvent<HTMLAnchorElement>) {
    if (!plainClick(event)) return;
    event.preventDefault();
    if (busy.current) return;
    busy.current = true;
    try {
      const response = await fetch(catalogusQuery(basePath, filters, nextPagina));
      if (!response.ok) {
        window.location.assign(listingPageHref(basePath, filters, nextPagina));
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

  const rangeStart = total === 0 ? 0 : (originPage - 1) * pageSize + 1;
  const rangeEnd = total === 0 ? 0 : rangeStart + cards.length - 1;
  const remaining = Math.max(0, total - rangeEnd);
  const nextHref = listingPageHref(basePath, filters, nextPagina);
  const prevHref = originPage > 1 ? listingPageHref(basePath, filters, originPage - 1) : null;

  return (
    <>
      {showBrandChips && brandOptions.length > 1 ? (
        <div className="mt-8 flex flex-wrap gap-2">
          <FilterChip
            href={listingHref(basePath, filters, { brandSlug: "" })}
            active={!filters.brandSlug}
            onClick={(event) => onFilter(event, { brandSlug: "" })}
          >
            Alle merken
          </FilterChip>
          {brandOptions.map((brand) => (
            <FilterChip
              key={brand.slug}
              href={listingHref(basePath, filters, {
                brandSlug: filters.brandSlug === brand.slug ? "" : brand.slug,
              })}
              active={filters.brandSlug === brand.slug}
              onClick={(event) =>
                onFilter(event, { brandSlug: filters.brandSlug === brand.slug ? "" : brand.slug })
              }
            >
              {brand.name}
            </FilterChip>
          ))}
        </div>
      ) : null}
      {showStockChip ? (
        <div className="mt-3">
          <FilterChip
            href={listingHref(basePath, filters, { inStockOnly: !filters.inStockOnly })}
            active={Boolean(filters.inStockOnly)}
            onClick={(event) => onFilter(event, { inStockOnly: !filters.inStockOnly })}
          >
            Op voorraad
          </FilterChip>
        </div>
      ) : null}
      <div className="mt-10 grid gap-10 lg:grid-cols-[3fr_9fr] lg:gap-5">
        <aside className="h-fit lg:sticky lg:top-[130px]">
          {facets.profileTypes.length > 1 ? (
            <FilterSection title="Producttype">
              {facets.profileTypes.map((item) => {
                const active = filters.profileType === item.slug;
                const href = listingHref(basePath, filters, { profileType: active ? undefined : item.slug });
                return (
                  <label key={item.slug} className="flex min-h-11 items-center gap-3">
                    <a
                      href={href}
                      onClick={(event) => onFilter(event, { profileType: active ? undefined : item.slug })}
                      className={cn(
                        "grid size-4 place-items-center border border-kg-navy text-[10px] text-white no-underline hover:no-underline",
                        active && "bg-kg-navy",
                      )}
                    >
                      {active ? "✓" : ""}
                    </a>
                    <a
                      href={href}
                      onClick={(event) => onFilter(event, { profileType: active ? undefined : item.slug })}
                      className="flex flex-1 items-baseline justify-between gap-2 text-[15px] text-kg-navy no-underline hover:no-underline"
                    >
                      {profileTypeLabels[item.slug]}
                      <span className="font-mono text-[12px] text-kg-text-2">{item.count}</span>
                    </a>
                  </label>
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
                    href={listingHref(basePath, filters, { colorFamily: active ? undefined : item.slug })}
                    onClick={(event) => onFilter(event, { colorFamily: active ? undefined : item.slug })}
                    className="flex min-h-11 items-center gap-3 text-[15px] text-kg-navy no-underline hover:no-underline"
                  >
                    <span
                      className={cn("size-4", active && "outline outline-2 outline-offset-1 outline-kg-navy")}
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
            <FilterSection title="Kleur">
              <div className="max-h-64 space-y-1 overflow-auto">
                {facets.sheetColors.map((item) => {
                  const active = filters.colorSlug === item.slug;
                  return (
                    <a
                      key={item.slug}
                      href={listingHref(basePath, filters, { colorSlug: active ? "" : item.slug })}
                      onClick={(event) => onFilter(event, { colorSlug: active ? "" : item.slug })}
                      className="flex min-h-11 items-center gap-3 text-[15px] text-kg-navy no-underline hover:no-underline"
                    >
                      <span
                        className={cn("size-4 shrink-0", active && "outline outline-2 outline-offset-1 outline-kg-navy")}
                        style={{ background: item.hex }}
                      />
                      <span className="min-w-0 flex-1">{item.name}</span>
                      <span className="font-mono text-[12px] text-kg-text-2">{item.count}</span>
                    </a>
                  );
                })}
              </div>
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
                      href={listingHref(basePath, filters, { ral: active ? "" : item.code })}
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
                      href={listingHref(basePath, filters, { workingWidthMm: active ? undefined : item.mm })}
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
        </aside>

        <div>
          <p className="border-b border-kg-navy pb-2.5 font-mono text-[14px] text-kg-text-2">
            {total === 0
              ? totalUnfiltered === 0
                ? "Geen artikelen"
                : "Geen producten met deze filters."
              : `${rangeStart} – ${rangeEnd} van ${total} · `}
            {total > 0 ? (
              <span className="kg-vat">
                <span className="kg-vat-incl">prijzen incl. btw</span>
                <span className="kg-vat-excl">prijzen excl. btw</span>
              </span>
            ) : null}
            {totalUnfiltered !== total ? ` (van ${totalUnfiltered})` : null}
          </p>
          {cards.length === 0 ? (
            <p className="mt-8 border border-kg-lijn bg-white px-6 py-12 text-center text-kg-text-2">
              {emptyMessage ?? "Geen producten met deze filters."}
            </p>
          ) : (
            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              {cards.map((card) => (
                <ListingCard key={card.slug} card={card} />
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
    </>
  );
}

function FilterChip({
  href,
  active,
  onClick,
  children,
}: {
  href: string;
  active: boolean;
  onClick: (event: React.MouseEvent<HTMLAnchorElement>) => void;
  children: string;
}) {
  return (
    <a
      href={href}
      onClick={onClick}
      className={cn(
        "inline-flex h-10 min-h-10 items-center px-3 font-mono text-[13px] no-underline hover:no-underline",
        active ? "bg-kg-navy text-kg-kalk" : "border border-kg-lijn bg-white text-kg-navy hover:bg-kg-kalk",
      )}
    >
      {children}
    </a>
  );
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <p className="border-b border-kg-navy pb-2 font-mono text-[13px] text-kg-navy">{title}</p>
      <div className="mt-3">{children}</div>
    </section>
  );
}
