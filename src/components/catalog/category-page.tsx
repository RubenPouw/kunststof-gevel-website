import Link from "next/link";

import { ProductCard } from "@/components/brand/product-card";
import { SegmentBar } from "@/components/brand/segment-bar";
import type { Brand, Product } from "@/lib/catalog";
import { cn } from "@/lib/utils";

export function CategoryPage({
  kicker,
  title,
  intro,
  products,
  brandOptions = [],
  basePath,
  activeBrand,
  inStockOnly = false,
}: {
  kicker: string;
  title: string;
  intro: string;
  products: Product[];
  brandOptions?: Brand[];
  basePath?: string;
  activeBrand?: string;
  inStockOnly?: boolean;
}) {
  const showFilters = Boolean(basePath && (brandOptions.length > 1 || products.length > 0));

  function hrefFor(next: { merk?: string; voorraad?: boolean }) {
    const params = new URLSearchParams();
    const merk = next.merk === undefined ? activeBrand : next.merk;
    const voorraad = next.voorraad === undefined ? inStockOnly : next.voorraad;
    if (merk) params.set("merk", merk);
    if (voorraad) params.set("voorraad", "1");
    const query = params.toString();
    return query ? `${basePath}?${query}` : (basePath ?? ".");
  }

  return (
    <div className="container-kg py-12 sm:py-16">
      <p className="kicker">{kicker}</p>
      <h1 className="mt-2 max-w-3xl">{title}</h1>
      <p className="mt-4 max-w-2xl text-[var(--color-text-soft)]">{intro}</p>
      <SegmentBar size={28} className="mt-8 max-w-xs" />

      {showFilters ? (
        <div className="mt-8 flex flex-col gap-3">
          {brandOptions.length > 1 ? (
            <div className="flex flex-wrap gap-2">
              <FilterChip href={hrefFor({ merk: "" })} active={!activeBrand}>
                Alle merken
              </FilterChip>
              {brandOptions.map((brand) => (
                <FilterChip
                  key={brand.slug}
                  href={hrefFor({ merk: brand.slug })}
                  active={activeBrand === brand.slug}
                >
                  {brand.name}
                </FilterChip>
              ))}
            </div>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <FilterChip href={hrefFor({ voorraad: false })} active={!inStockOnly}>
              Alles
            </FilterChip>
            <FilterChip href={hrefFor({ voorraad: true })} active={inStockOnly}>
              Op voorraad
            </FilterChip>
          </div>
        </div>
      ) : null}

      {products.length === 0 ? (
        <p className="mt-10 border border-[var(--color-border)] bg-surface px-6 py-12 text-center text-[var(--color-text-muted)]">
          Geen producten met deze filters.
        </p>
      ) : (
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      )}
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
        "inline-flex min-h-11 items-center px-3 text-[13px] font-semibold no-underline",
        active
          ? "bg-kg-ink text-white"
          : "border border-[var(--color-border-strong)] bg-surface text-kg-ink hover:bg-tint",
      )}
    >
      {children}
    </Link>
  );
}
