import { listingHref, type ListingFilterPatch } from "@/lib/catalog/helpers";
import type { ListingPresentation } from "@/lib/catalog/listing";
import type { ListingFilters } from "@/lib/catalog/types";
import { cn } from "@/lib/utils";

const PLACES = [
  { value: "", label: "Alle" },
  { value: "binnen", label: "Binnen" },
  { value: "buiten", label: "Buiten" },
] as const;

export function CeilingPlaceToggle({
  filters,
  basePath,
  presentation,
  onFilter,
}: {
  filters: ListingFilters;
  basePath: string;
  presentation: ListingPresentation;
  onFilter: (event: React.MouseEvent<HTMLAnchorElement>, patch: ListingFilterPatch) => void;
}) {
  const current = filters.ceilingPlace ?? "";

  return (
    <div>
      <p className="font-mono text-[13px] text-kg-navy">Plaats</p>
      <div className="mt-2 flex border border-kg-navy" role="group" aria-label="Binnen of buiten">
        {PLACES.map((place) => {
          const active = current === place.value;
          const patch: ListingFilterPatch = { ceilingPlace: place.value };
          return (
            <a
              key={place.label}
              href={listingHref(basePath, filters, patch, presentation)}
              aria-current={active ? "true" : undefined}
              onClick={(event) => onFilter(event, patch)}
              className={cn(
                "flex h-11 flex-1 items-center justify-center text-[15px] font-medium no-underline hover:no-underline",
                active ? "bg-kg-navy text-kg-kalk" : "bg-white text-kg-navy hover:bg-kg-kalk",
                place.value !== "" && "border-l border-kg-navy",
              )}
            >
              {place.label}
            </a>
          );
        })}
      </div>
    </div>
  );
}
