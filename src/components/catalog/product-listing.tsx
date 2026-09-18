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
    <div className="mt-12 grid gap-10 lg:grid-cols-[260px_1fr] lg:gap-10">
      <aside className="lg:sticky lg:top-[130px] h-fit">
        {facets.profileTypes.length > 1 ? (
          <FilterSection title="Producttype">
            {facets.profileTypes.map((item) => {
              const active = filters.profileType === item.slug;
              return (
                <label key={item.slug} className="flex min-h-11 items-center gap-3">
                  <Link
                    href={listingHref(basePath, filters, { profileType: active ? undefined : item.slug })}
                    className={cn(
                      "grid size-[18px] place-items-center border-[1.5px] border-kg-ink text-[11px] text-white no-underline",
                      active && "bg-brand border-brand",
                    )}
                    aria-pressed={active}
                  >
                    {active ? "✓" : ""}
                  </Link>
                  <Link
                    href={listingHref(basePath, filters, { profileType: active ? undefined : item.slug })}
                    className="flex flex-1 items-baseline justify-between gap-2 text-[15px] text-kg-ink no-underline hover:text-kg-ink"
                  >
                    {profileTypeLabels[item.slug]}
                    <span className="text-[12px] text-[var(--color-text-muted)]">{item.count}</span>
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
                  className="flex min-h-11 items-center gap-3 text-[15px] text-kg-ink no-underline hover:text-kg-ink"
                >
                  <span
                    className={cn(
                      "size-[18px] border border-[var(--color-border)]",
                      active && "outline outline-[1.5px] outline-brand outline-offset-1",
                    )}
                    style={{ background: item.hex }}
                  />
                  {colorFamilyLabels[item.slug]}
                  <span className="ml-auto text-[12px] text-[var(--color-text-muted)]">{item.count}</span>
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
                      "inline-flex min-h-11 items-center border px-3 text-[13px] font-medium no-underline",
                      active
                        ? "border-brand bg-tint text-kg-ink"
                        : "border-[var(--color-border-strong)] text-kg-ink hover:bg-tint",
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
        <p className="text-[13px] text-[var(--color-text-muted)]">
          {products.length === 0
            ? "Geen producten met deze filters."
            : `1 – ${shown.length} van ${products.length} producten`}
          {totalUnfiltered !== products.length ? ` (van ${totalUnfiltered})` : null}
        </p>
        {products.length === 0 ? (
          <p className="mt-8 border border-[var(--color-border)] bg-surface px-6 py-12 text-center text-[var(--color-text-muted)]">
            Geen producten met deze filters.
          </p>
        ) : (
          <div className="mt-6 grid gap-4">
            {shown.map((product) => (
              <ListingCard key={product.slug} product={product} />
            ))}
          </div>
        )}
        {visible < products.length ? (
          <button
            type="button"
            onClick={() => setVisible((value) => value + PAGE_SIZE)}
            className={cn(buttonVariants({ variant: "tertiary" }), "mt-8")}
          >
            Toon de volgende {Math.min(PAGE_SIZE, products.length - visible)} producten
          </button>
        ) : null}
      </div>
    </div>
  );
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <p className="kicker">{title}</p>
      <div className="mt-3">{children}</div>
    </section>
  );
}
