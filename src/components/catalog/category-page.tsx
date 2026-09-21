import Link from "next/link";

import { ProductListing } from "@/components/catalog/product-listing";
import { listingHref } from "@/lib/catalog/helpers";
import type { Brand, ListingFilters, Product } from "@/lib/catalog/types";
import { cn } from "@/lib/utils";

export function CategoryPage({
  kicker,
  title,
  intro,
  products,
  allProducts,
  brandOptions = [],
  basePath,
  filters,
}: {
  kicker: string;
  title: string;
  intro: string;
  products: Product[];
  allProducts: Product[];
  brandOptions?: Brand[];
  basePath?: string;
  filters: ListingFilters;
}) {
  const path = basePath ?? ".";

  return (
    <div className="container-kg py-10 sm:py-12">
      <p className="font-mono text-[13px] text-kg-text-2">{kicker}</p>
      <h1 className="display-plp mt-2 max-w-3xl">{title}</h1>
      <p className="mt-4 max-w-2xl text-kg-text-2">{intro}</p>

      {brandOptions.length > 1 ? (
        <div className="mt-8 flex flex-wrap gap-2">
          <FilterChip href={listingHref(path, filters, { brandSlug: "" })} active={!filters.brandSlug}>
            Alle merken
          </FilterChip>
          {brandOptions.map((brand) => (
            <FilterChip
              key={brand.slug}
              href={listingHref(path, filters, {
                brandSlug: filters.brandSlug === brand.slug ? "" : brand.slug,
              })}
              active={filters.brandSlug === brand.slug}
            >
              {brand.name}
            </FilterChip>
          ))}
        </div>
      ) : null}

      <ProductListing
        products={products}
        allProducts={allProducts}
        basePath={path}
        filters={filters}
        totalUnfiltered={allProducts.length}
      />
    </div>
  );
}

function FilterChip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex h-10 min-h-10 items-center px-3 font-mono text-[13px] no-underline hover:no-underline",
        active
          ? "bg-kg-navy text-kg-kalk"
          : "border border-kg-lijn bg-white text-kg-navy hover:bg-kg-kalk",
      )}
    >
      {children}
    </Link>
  );
}
