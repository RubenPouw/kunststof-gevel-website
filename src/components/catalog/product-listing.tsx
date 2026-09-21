"use client";

import { useState } from "react";
import Link from "next/link";

import { ListingCard } from "@/components/catalog/listing-card";
import { buttonVariants } from "@/components/ui/button";
import { listingFacets, listingHref } from "@/lib/catalog/helpers";
import type { ListingFilters, Product } from "@/lib/catalog/types";
import { colorFamilyLabels, profileTypeLabels } from "@/lib/catalog/types";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 10;

export function ProductListing({
  products,
  allProducts,
  basePath,
  filters,
  totalUnfiltered,
}: {
  products: Product[];
  allProducts: Product[];
  basePath: string;
  filters: ListingFilters;
  totalUnfiltered: number;
}) {
  const [visible, setVisible] = useState(Math.min(PAGE_SIZE, products.length));
  const facets = listingFacets(allProducts);
  const shown = products.slice(0, visible);

  return (
    <div className="mt-10 grid gap-10 lg:grid-cols-[3fr_9fr] lg:gap-5">
      <aside className="h-fit lg:sticky lg:top-[130px]">
        {facets.profileTypes.length > 1 ? (
          <FilterSection title="Producttype">
            {facets.profileTypes.map((item) => {
              const active = filters.profileType === item.slug;
              return (
                <label key={item.slug} className="flex min-h-11 items-center gap-3">
                  <Link
                    href={listingHref(basePath, filters, { profileType: active ? undefined : item.slug })}
                    className={cn(
                      "grid size-4 place-items-center border border-kg-navy text-[10px] text-white no-underline hover:no-underline",
                      active && "bg-kg-navy",
                    )}
                    aria-pressed={active}
                  >
                    {active ? "✓" : ""}
                  </Link>
                  <Link
                    href={listingHref(basePath, filters, { profileType: active ? undefined : item.slug })}
                    className="flex flex-1 items-baseline justify-between gap-2 text-[15px] text-kg-navy no-underline hover:no-underline"
                  >
                    {profileTypeLabels[item.slug]}
                    <span className="font-mono text-[12px] text-kg-text-2">{item.count}</span>
                  </Link>
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
                <Link
                  key={item.slug}
                  href={listingHref(basePath, filters, { colorFamily: active ? undefined : item.slug })}
                  className="flex min-h-11 items-center gap-3 text-[15px] text-kg-navy no-underline hover:no-underline"
                >
                  <span
                    className={cn("size-4", active && "outline outline-2 outline-offset-1 outline-kg-navy")}
                    style={{ background: item.hex }}
                  />
                  {colorFamilyLabels[item.slug]}
                  <span className="ml-auto font-mono text-[12px] text-kg-text-2">{item.count}</span>
                </Link>
              );
            })}
          </FilterSection>
        ) : null}
        {facets.widths.length > 1 ? (
          <FilterSection title="Werkende breedte">
            <div className="flex flex-wrap gap-2">
              {facets.widths.map((item) => {
                const active = filters.workingWidthMm === item.mm;
                return (
                  <Link
                    key={item.mm}
                    href={listingHref(basePath, filters, { workingWidthMm: active ? undefined : item.mm })}
                    className={cn(
                      "inline-flex h-10 min-h-10 items-center border px-3 font-mono text-[13px] no-underline hover:no-underline",
                      active
                        ? "border-kg-navy bg-white text-kg-navy"
                        : "border-kg-lijn bg-white text-kg-navy hover:bg-kg-kalk",
                    )}
                  >
                    {item.mm} mm
                  </Link>
                );
              })}
            </div>
          </FilterSection>
        ) : null}
      </aside>

      <div>
        <p className="border-b border-kg-navy pb-2.5 font-mono text-[14px] text-kg-text-2">
          {products.length === 0
            ? "Geen producten met deze filters."
            : `1 – ${shown.length} van ${products.length} · prijzen excl. btw`}
          {totalUnfiltered !== products.length ? ` (van ${totalUnfiltered})` : null}
        </p>
        {products.length === 0 ? (
          <p className="mt-8 border border-kg-lijn bg-white px-6 py-12 text-center text-kg-text-2">
            Geen producten met deze filters.
          </p>
        ) : (
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            {shown.map((product) => (
              <ListingCard key={product.slug} product={product} />
            ))}
          </div>
        )}
        {visible < products.length ? (
          <button
            type="button"
            onClick={() => setVisible((value) => value + PAGE_SIZE)}
            className={cn(buttonVariants({ variant: "outline" }), "mt-8")}
          >
            Toon de volgende {Math.min(PAGE_SIZE, products.length - visible)}
          </button>
        ) : null}
      </div>
    </div>
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
