"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { ColorPanel } from "@/components/brand/color-panel";
import { ProductMedia } from "@/components/brand/product-media";
import { SampleAddButton } from "@/components/samples/sample-add-button";
import { buttonVariants } from "@/components/ui/button";
import { getDefaultVariant } from "@/lib/catalog/helpers";
import type { Product } from "@/lib/catalog/types";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

export function ListingCard({ product }: { product: Product }) {
  const fallback = getDefaultVariant(product);
  const [colorName, setColorName] = useState(fallback.colorName);
  const selected = useMemo(
    () =>
      product.variants.find((variant) => variant.colorName === colorName && variant.length === fallback.length) ??
      product.variants.find((variant) => variant.colorName === colorName) ??
      fallback,
    [colorName, fallback, product.variants],
  );
  const colors = product.colors.slice(0, 8);

  return (
    <article className="grid gap-4 border border-[var(--color-border)] bg-surface p-3.5 sm:grid-cols-[180px_1fr]">
      <Link href={`/producten/${product.slug}`} className="relative block text-inherit no-underline">
        {product.images[0] ? (
          <ProductMedia product={product} className="aspect-square" />
        ) : (
          <ColorPanel hex={selected.hex} className="aspect-square" />
        )}
      </Link>
      <div className="flex min-w-0 flex-col">
        <p className="kicker">
          {product.brand} · art. {selected.sku.replace(/-3M$/, "")}
        </p>
        <h3 className="mt-1 font-heading text-[18px] leading-[1.15] font-semibold">
          <Link href={`/producten/${product.slug}`} className="text-inherit no-underline hover:text-inherit">
            {product.name}
          </Link>
        </h3>
        <p className="mt-1 text-[12px] text-[var(--color-text-muted)]">{product.meta}</p>
        {colors.length > 1 ? (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {colors.map((color) => {
              const active = color.name === selected.colorName;
              return (
                <button
                  key={color.sampleId}
                  type="button"
                  onClick={() => setColorName(color.name)}
                  className={cn("size-[22px] border-2 border-white", active && "outline outline-[1.5px] outline-brand")}
                  style={{ background: color.hex }}
                  aria-label={color.name}
                  aria-pressed={active}
                />
              );
            })}
            <span className="text-[12px] text-[var(--color-text-muted)]">{selected.colorName}</span>
          </div>
        ) : null}
        <div className="mt-3 flex items-baseline gap-1.5">
          <p className="font-heading text-2xl leading-none font-bold">{formatPrice(selected.price)}</p>
          <p className="text-[11px] text-[var(--color-text-muted)]">incl. btw · {selected.length}</p>
        </div>
        <p className={cn("mt-2 text-[12px] font-medium", selected.inStock ? "text-brand" : "text-[var(--color-text-muted)]")}>
          {selected.inStock ? "● Uit voorraad leverbaar" : `○ ${selected.stockText ?? "Niet op voorraad"}`}
        </p>
        <div className="mt-auto flex flex-wrap gap-2 pt-3">
          <Link href={`/producten/${product.slug}`} className={cn(buttonVariants({ variant: "primary" }), "min-h-11")}>
            Opties selecteren
          </Link>
          {product.sampleable ? (
            <SampleAddButton
              sample={{
                id: selected.sampleId,
                brandSlug: product.brandSlug,
                brandName: product.brand,
                colorName: selected.colorName,
                hex: selected.hex,
                ral: selected.ral,
              }}
            />
          ) : null}
        </div>
      </div>
    </article>
  );
}
