"use client";

import Image from "next/image";
import { useRef } from "react";

import { listingHref, selectedBrands, toggleValue, type ListingFilterPatch } from "@/lib/catalog/helpers";
import { brandLogoSrc } from "@/lib/catalog/brand-logos";
import type { ListingPresentation } from "@/lib/catalog/listing";
import type { Brand, ListingFilters } from "@/lib/catalog/types";

function Arrow({ direction }: { direction: "left" | "right" }) {
  const left = direction === "left";
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
      <path
        d={left ? "M14 5 L7 12 L14 19" : "M10 5 L17 12 L10 19"}
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="miter"
      />
    </svg>
  );
}

export function BrandRow({
  brands,
  basePath,
  filters,
  presentation,
  onFilter,
}: {
  brands: Brand[];
  basePath: string;
  filters: ListingFilters;
  presentation: ListingPresentation;
  onFilter?: (event: React.MouseEvent<HTMLAnchorElement>, patch: ListingFilterPatch) => void;
}) {
  const scroller = useRef<HTMLDivElement>(null);
  const tiles = brands
    .filter((brand) => brand.slug !== "overig")
    .sort((a, b) => a.name.localeCompare(b.name, "nl"));
  if (tiles.length < 2) return null;

  function scroll(direction: -1 | 1) {
    scroller.current?.scrollBy({ left: direction * 320, behavior: "smooth" });
  }

  return (
    <section className="mt-8" aria-labelledby="onze-merken">
      <h2 id="onze-merken" className="font-mono text-[13px] text-kg-navy">
        Onze merken
      </h2>
      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          className="kg-soft-card grid size-11 shrink-0 place-items-center text-kg-navy"
          aria-label="Vorige merken"
          onClick={() => scroll(-1)}
        >
          <Arrow direction="left" />
        </button>
        <div
          ref={scroller}
          className="flex min-w-0 flex-1 gap-3 overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {tiles.map((brand) => {
            const selected = selectedBrands(filters);
            const active = selected.includes(brand.slug);
            const next = toggleValue(selected, brand.slug);
            const href = listingHref(basePath, filters, { brandSlugs: next }, presentation);
            const logo = brandLogoSrc(brand.slug);
            return (
              <a
                key={brand.slug}
                href={href}
                rel="nofollow"
                aria-current={active ? "true" : undefined}
                onClick={(event) => onFilter?.(event, { brandSlugs: next })}
                className="kg-soft-card flex h-[76px] w-[148px] shrink-0 items-center justify-center px-3 no-underline hover:no-underline"
              >
                {logo ? (
                  <Image
                    src={logo}
                    alt={brand.name}
                    width={120}
                    height={40}
                    unoptimized
                    className="max-h-10 w-auto max-w-[7.5rem] object-contain"
                  />
                ) : (
                  <span className="text-center text-[15px] leading-tight font-bold text-kg-navy">{brand.name}</span>
                )}
              </a>
            );
          })}
        </div>
        <button
          type="button"
          className="kg-soft-card grid size-11 shrink-0 place-items-center text-kg-navy"
          aria-label="Volgende merken"
          onClick={() => scroll(1)}
        >
          <Arrow direction="right" />
        </button>
      </div>
    </section>
  );
}
