"use client";

import { useMemo, useState } from "react";

import { ColourName } from "@/components/catalog/colour-name";
import { ColourSwatch } from "@/components/catalog/colour-swatch";
import { colourFilterMatches } from "@/lib/catalog/colours";
import {
  listingHref,
  selectedBrands,
  selectedColorSlugs,
  selectedGroups,
  selectedProfileTypes,
  toggleValue,
  type ListingFilterPatch,
} from "@/lib/catalog/helpers";
import type { ListingFacets, ListingPresentation } from "@/lib/catalog/listing";
import {
  colorFamilies,
  colorFamilyLabels,
  productGroupLabels,
  profileTypeLabels,
  type Brand,
  type ColorFamily,
  type ListingFilters,
} from "@/lib/catalog/types";
import { cn } from "@/lib/utils";

export function ActiveFilterChips({
  filters,
  facets,
  brands,
  basePath,
  presentation,
  onFilter,
  onClear,
}: {
  filters: ListingFilters;
  facets: ListingFacets;
  brands: Brand[];
  basePath: string;
  presentation: ListingPresentation;
  onFilter: (event: React.MouseEvent<HTMLAnchorElement>, patch: ListingFilterPatch) => void;
  onClear: (event: React.MouseEvent<HTMLAnchorElement>) => void;
}) {
  const chips: { key: string; label: string; href: string; patch: ListingFilterPatch }[] = [];
  const brandNames = new Map(brands.map((brand) => [brand.slug, brand.name]));

  for (const slug of selectedBrands(filters)) {
    chips.push({
      key: `merk-${slug}`,
      label: brandNames.get(slug) ?? slug,
      href: listingHref(basePath, filters, { brandSlugs: toggleValue(selectedBrands(filters), slug) }, presentation),
      patch: { brandSlugs: toggleValue(selectedBrands(filters), slug) },
    });
  }
  if (filters.inStockOnly) {
    chips.push({
      key: "voorraad",
      label: "Op voorraad",
      href: listingHref(basePath, filters, { inStockOnly: false }, presentation),
      patch: { inStockOnly: false },
    });
  }
  for (const slug of selectedGroups(filters)) {
    chips.push({
      key: `groep-${slug}`,
      label: productGroupLabels[slug],
      href: listingHref(basePath, filters, { productGroups: toggleValue(selectedGroups(filters), slug) }, presentation),
      patch: { productGroups: toggleValue(selectedGroups(filters), slug) },
    });
  }
  for (const slug of selectedProfileTypes(filters)) {
    chips.push({
      key: `type-${slug}`,
      label: profileTypeLabels[slug],
      href: listingHref(basePath, filters, { profileTypes: toggleValue(selectedProfileTypes(filters), slug) }, presentation),
      patch: { profileTypes: toggleValue(selectedProfileTypes(filters), slug) },
    });
  }
  if (filters.colorFamily) {
    chips.push({
      key: `familie-${filters.colorFamily}`,
      label: colorFamilyLabels[filters.colorFamily],
      href: listingHref(basePath, filters, { colorFamily: "" }, presentation),
      patch: { colorFamily: "" },
    });
  }
  for (const slug of selectedColorSlugs(filters)) {
    const color = facets.sheetColors.find((item) => item.slug === slug)?.name ?? slug;
    chips.push({
      key: `kleur-${slug}`,
      label: color,
      href: listingHref(basePath, filters, { colorSlugs: toggleValue(selectedColorSlugs(filters), slug) }, presentation),
      patch: { colorSlugs: toggleValue(selectedColorSlugs(filters), slug) },
    });
  }
  if (filters.ral) {
    chips.push({
      key: `ral-${filters.ral}`,
      label: `RAL ${filters.ral}`,
      href: listingHref(basePath, filters, { ral: "" }, presentation),
      patch: { ral: "" },
    });
  }
  if (filters.workingWidthMm) {
    chips.push({
      key: `breedte-${filters.workingWidthMm}`,
      label: `${filters.workingWidthMm} mm`,
      href: listingHref(basePath, filters, { workingWidthMm: undefined }, presentation),
      patch: { workingWidthMm: undefined },
    });
  }

  if (!chips.length) return null;
  const clearHref = listingHref(
    basePath,
    filters,
    {
      brandSlugs: null,
      inStockOnly: false,
      productGroups: null,
      profileTypes: null,
      colorFamily: "",
      colorSlugs: null,
      ral: "",
      workingWidthMm: undefined,
    },
    presentation,
  );

  return (
    <div className="mb-3 flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <a
          key={chip.key}
          rel="nofollow" href={chip.href}
          onClick={(event) => onFilter(event, chip.patch)}
          className="inline-flex h-9 items-center gap-2 border border-kg-navy bg-white px-2.5 font-mono text-[13px] text-kg-navy no-underline hover:no-underline"
        >
          {chip.label}
          <span aria-hidden>×</span>
          <span className="sr-only">Verwijder filter {chip.label}</span>
        </a>
      ))}
      <a
        rel="nofollow" href={clearHref}
        onClick={onClear}
        className="inline-flex h-9 items-center px-1 font-mono text-[13px] text-kg-navy underline underline-offset-4"
      >
        Wis alles
      </a>
    </div>
  );
}

export function ListingFiltersPanel({
  facets,
  filters,
  basePath,
  presentation,
  showStockChip,
  onFilter,
}: {
  facets: ListingFacets;
  filters: ListingFilters;
  basePath: string;
  presentation: ListingPresentation;
  showStockChip: boolean;
  onFilter: (event: React.MouseEvent<HTMLAnchorElement>, patch: ListingFilterPatch) => void;
}) {
  const groups = selectedGroups(filters);
  const types = selectedProfileTypes(filters);
  const colorSlugs = selectedColorSlugs(filters);
  const showGroups = facets.groups.length > 1;
  const profileChoices = facets.profileTypes.filter((item) => item.slug !== "overig");

  return (
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
      {showGroups ? (
        <FilterSection title="Producttype">
          {facets.groups.map((item) => {
            const active = groups.includes(item.slug);
            const next = toggleValue(groups, item.slug);
            return (
              <FilterCheck
                key={item.slug}
                href={listingHref(basePath, filters, { productGroups: next }, presentation)}
                active={active}
                label={productGroupLabels[item.slug]}
                count={item.count}
                onClick={(event) => onFilter(event, { productGroups: next })}
              />
            );
          })}
        </FilterSection>
      ) : profileChoices.length > 1 ? (
        <FilterSection title="Producttype">
          {profileChoices.map((item) => {
            const active = types.includes(item.slug);
            const next = toggleValue(types, item.slug);
            return (
              <FilterCheck
                key={item.slug}
                href={listingHref(basePath, filters, { profileTypes: next }, presentation)}
                active={active}
                label={profileTypeLabels[item.slug]}
                count={item.count}
                onClick={(event) => onFilter(event, { profileTypes: next })}
              />
            );
          })}
        </FilterSection>
      ) : null}
      {facets.sheetColors.length > 1 ? (
        <ColourFilter
          facets={facets}
          filters={filters}
          basePath={basePath}
          presentation={presentation}
          selected={colorSlugs}
          onFilter={onFilter}
        />
      ) : null}
      {facets.rals.length > 1 ? (
        <FilterSection title="RAL">
          <div className="flex max-h-64 flex-wrap gap-2 overflow-auto">
            {facets.rals.map((item) => {
              const active = filters.ral === item.code;
              return (
                <a
                  key={item.code}
                  rel="nofollow" href={listingHref(basePath, filters, { ral: active ? "" : item.code }, presentation)}
                  onClick={(event) => onFilter(event, { ral: active ? "" : item.code })}
                  className={cn(
                    "inline-flex h-10 min-h-10 items-center border px-3 font-mono text-[13px] no-underline hover:no-underline",
                    active ? "border-kg-navy bg-kg-navy text-kg-kalk" : "border-kg-lijn bg-white text-kg-navy hover:bg-kg-kalk",
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
                  rel="nofollow" href={listingHref(basePath, filters, { workingWidthMm: active ? undefined : item.mm }, presentation)}
                  onClick={(event) => onFilter(event, { workingWidthMm: active ? undefined : item.mm })}
                  className={cn(
                    "inline-flex h-10 min-h-10 items-center border px-3 font-mono text-[13px] no-underline hover:no-underline",
                    active ? "border-kg-navy bg-white text-kg-navy" : "border-kg-lijn bg-white text-kg-navy hover:bg-kg-kalk",
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
  );
}

function ColourFilter({
  facets,
  filters,
  basePath,
  presentation,
  selected,
  onFilter,
}: {
  facets: ListingFacets;
  filters: ListingFilters;
  basePath: string;
  presentation: ListingPresentation;
  selected: string[];
  onFilter: (event: React.MouseEvent<HTMLAnchorElement>, patch: ListingFilterPatch) => void;
}) {
  const [query, setQuery] = useState("");
  const needle = query.trim().toLowerCase();
  const grouped = useMemo(() => {
    const buckets = new Map<ColorFamily, ListingFacets["sheetColors"]>();
    for (const family of colorFamilies) buckets.set(family, []);
    for (const color of facets.sheetColors) {
      if (needle && !colourFilterMatches(color.name, color.slug, needle)) continue;
      buckets.get(color.family)?.push(color);
    }
    return colorFamilies
      .map((family) => ({ family, colors: buckets.get(family) ?? [] }))
      .filter((group) => group.colors.length > 0);
  }, [facets.sheetColors, needle]);

  return (
    <FilterSection title="Kleur">
      <label className="mb-3 block">
        <span className="sr-only">Zoek een kleur</span>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Naam of code, bijvoorbeeld antraciet of A24"
          autoComplete="off"
          className="h-11 w-full border border-kg-navy bg-white px-3 text-[15px] text-kg-navy outline-none placeholder:text-kg-text-2"
        />
      </label>
      <div className="max-h-80 overflow-auto pr-1">
        {grouped.length === 0 ? (
          <p className="py-2 text-[14px] text-kg-text-2">Geen kleur met die naam.</p>
        ) : (
          grouped.map((group) => (
            <div key={group.family} className="mb-4 last:mb-0">
              <p className="font-mono text-[12px] text-kg-text-2">{colorFamilyLabels[group.family]}</p>
              <div className="mt-1">
                {group.colors.map((item) => {
                  const active = selected.includes(item.slug);
                  const next = toggleValue(selected, item.slug);
                  return (
                    <a
                      key={item.slug}
                      rel="nofollow" href={listingHref(basePath, filters, { colorSlugs: next }, presentation)}
                      onClick={(event) => onFilter(event, { colorSlugs: next })}
                      className="flex min-h-11 items-center gap-3 text-[15px] text-kg-navy no-underline hover:no-underline"
                    >
                      <ColourSwatch name={item.name} hex={item.hex} family={item.family} active={active} />
                      <ColourName value={item.name} className="min-w-0 flex-1" />
                      <span className="font-mono text-[12px] text-kg-text-2">{item.count}</span>
                    </a>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </FilterSection>
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
        rel="nofollow" href={href}
        onClick={onClick}
        className={cn(
          "grid size-4 place-items-center border border-kg-navy text-[10px] text-white no-underline hover:no-underline",
          active && "bg-kg-navy",
        )}
      >
        {active ? "✓" : ""}
      </a>
      <a
        rel="nofollow" href={href}
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
