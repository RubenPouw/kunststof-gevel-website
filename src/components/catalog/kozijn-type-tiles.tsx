"use client";

import { ProductPhoto } from "@/components/brand/product-photo";
import { listingHref, selectedEindkapSystems, selectedKozijnTypes, type ListingFilterPatch } from "@/lib/catalog/helpers";
import { kozijnTypeLabels } from "@/lib/catalog/kozijn-types";
import type { ListingFacets, ListingPresentation } from "@/lib/catalog/listing";
import type { ListingFilters } from "@/lib/catalog/types";
import { cn } from "@/lib/utils";

export function KozijnTypeTiles({
  facets,
  filters,
  basePath,
  presentation,
  onFilter,
}: {
  facets: ListingFacets;
  filters: ListingFilters;
  basePath: string;
  presentation: ListingPresentation;
  onFilter: (event: React.MouseEvent<HTMLAnchorElement>, patch: ListingFilterPatch) => void;
}) {
  if (basePath.split("?")[0] !== "/kozijnafwerking") return null;
  const tiles = facets.kozijnTypes.filter((item) => item.image?.url);
  if (tiles.length < 2) return null;
  const selected = selectedKozijnTypes(filters);
  const system = selectedEindkapSystems(filters);

  return (
    <div className="mb-8">
      <p className="font-mono text-[13px] text-kg-navy">Producttype</p>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {tiles.map((item) => {
          const active = selected[0] === item.slug || (item.slug === "eindkap" && system.length > 0 && selected.length === 0);
          const next = selected[0] === item.slug && system.length === 0 ? [] : [item.slug];
          const patch: ListingFilterPatch = {
            kozijnTypes: next,
            eindkapSystems: [],
          };
          return (
            <a
              key={item.slug}
              href={listingHref(basePath, filters, patch, presentation)}
              onClick={(event) => onFilter(event, patch)}
              aria-current={active ? "true" : undefined}
              className={cn(
                "kg-soft-card flex flex-col gap-2 p-2 text-inherit no-underline hover:no-underline",
                active && "border-kg-navy",
              )}
            >
              <ProductPhoto
                image={item.image}
                alt={kozijnTypeLabels[item.slug]}
                sizes="(min-width: 1024px) 220px, 45vw"
                fit="contain"
                className="aspect-[4/3]"
                imageClassName="p-2"
              />
              <span className="px-1 text-[15px] leading-snug font-medium text-kg-navy">{kozijnTypeLabels[item.slug]}</span>
              <span className="px-1 pb-1 font-mono text-[13px] text-kg-text-2">{item.count}</span>
            </a>
          );
        })}
      </div>
    </div>
  );
}
