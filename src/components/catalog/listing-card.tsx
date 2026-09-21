"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { Bevel } from "@/components/brand/section-head";
import { SampleAddButton } from "@/components/samples/sample-add-button";
import { buttonVariants } from "@/components/ui/button";
import { getDefaultVariant } from "@/lib/catalog/helpers";
import type { Product } from "@/lib/catalog/types";
import { exclVat, formatLengthMm, formatPrice } from "@/lib/format";
import { weekNow, stockLabel } from "@/lib/week";
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
  const status = stockLabel(selected.inStock, weekNow(), selected.stockText);
  const sku = selected.sku.replace(/-3M$/, "");

  return (
    <article className="grid gap-4 border border-kg-lijn bg-white p-3.5 sm:grid-cols-[170px_1fr]">
      <Link href={`/producten/${product.slug}`} className="relative block text-inherit no-underline hover:no-underline">
        <Bevel size={16} className="aspect-square" style={{ background: selected.hex }} />
      </Link>
      <div className="flex min-w-0 flex-col">
        <p className="font-mono text-[13px] text-kg-text-2">Art. {sku}</p>
        <h3 className="mt-1 text-[17px] leading-[1.3] font-medium">
          <Link href={`/producten/${product.slug}`} className="text-inherit no-underline hover:no-underline">
            {product.name}
          </Link>
        </h3>
        <p className="mt-1 font-mono text-[13px] text-kg-text-2">
          {formatLengthMm(selected.length)}
          {product.workingWidthMm ? ` · ${product.workingWidthMm} mm werkend` : ""}
        </p>
        {colors.length > 1 ? (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {colors.map((color) => {
              const active = color.name === selected.colorName;
              return (
                <button
                  key={color.sampleId}
                  type="button"
                  onClick={() => setColorName(color.name)}
                  className={cn("size-5", active && "outline outline-2 outline-offset-1 outline-kg-navy")}
                  style={{ background: color.hex }}
                  aria-label={color.name}
                  aria-pressed={active}
                />
              );
            })}
            <span className="font-mono text-[12px] text-kg-text-2">{selected.colorName}</span>
          </div>
        ) : null}
        <div className="mt-3 flex items-baseline justify-between border-t border-kg-lijn pt-2.5 font-mono text-[14px]">
          <span className="whitespace-nowrap" style={{ color: status.color }}>
            {status.text}
          </span>
          <span>{formatPrice(exclVat(selected.price))}</span>
        </div>
        <div className="mt-auto flex flex-wrap gap-2 pt-3">
          <Link
            href={`/producten/${product.slug}`}
            className={cn(buttonVariants({ variant: "primary", size: "sm" }), "h-10 no-underline hover:no-underline")}
          >
            In bestelling
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
              label="Staal"
            />
          ) : null}
        </div>
      </div>
    </article>
  );
}
