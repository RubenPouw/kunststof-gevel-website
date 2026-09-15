"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { ProductCard } from "@/components/brand/product-card";
import { ProductMedia } from "@/components/brand/product-media";
import { buttonVariants } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { getDefaultVariant } from "@/lib/catalog/helpers";
import type { Product } from "@/lib/catalog/types";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

export function ProductDetail({
  product,
  related,
  categoryName,
}: {
  product: Product;
  related: Product[];
  categoryName: string;
}) {
  const fallback = getDefaultVariant(product);
  const [sku, setSku] = useState(fallback.sku);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const { add } = useCart();
  const optionGroups = useMemo(() => meaningfulOptionGroups(product), [product]);
  const showOptionPicker = optionGroups.length > 0 && product.variants.length > 1;

  const selected = useMemo(
    () => product.variants.find((variant) => variant.sku === sku) ?? fallback,
    [fallback, product.variants, sku],
  );

  function onAdd() {
    add({
      productSlug: product.slug,
      variantSku: selected.sku,
      qty,
      name: product.name,
      brand: product.brand,
      colorName: selected.colorName,
      price: selected.price,
    });
    setAdded(true);
  }

  const unitLabel =
    selected.length === "stuk" || selected.length === "doos" || selected.length.startsWith("doos")
      ? selected.length
      : `per ${selected.length}`;

  return (
    <div className="container-kg py-8 sm:py-12">
      <p className="text-[13px] text-[var(--color-text-muted)]">
        <Link href={`/${product.category}`} className="no-underline">
          {categoryName}
        </Link>
        {" / "}
        {product.brand}
      </p>

      <div className="mt-4 grid gap-8 lg:grid-cols-2">
        <ProductMedia product={product} className="min-h-[280px]" />

        <div>
          <p className="kicker">{product.brand}</p>
          <h1 className="mt-2">{product.name}</h1>
          <p className="mt-2 text-[13px] text-[var(--color-text-muted)]">
            Leverancier {product.vendor}
            {product.productType ? ` · ${product.productType}` : null}
          </p>
          <div className="mt-4 flex items-baseline gap-2">
            <p className="price">{formatPrice(selected.price)}</p>
            <p className="text-[13px] text-[var(--color-text-muted)]">
              incl. btw · {unitLabel}
            </p>
          </div>

          <p className="mt-5 text-[var(--color-text-soft)]">{product.description}</p>

          {showOptionPicker ? (
            <div className="mt-8 space-y-6">
              {optionGroups.map((group) => (
                <fieldset key={group.name}>
                  <legend className="text-[13px] font-semibold">{group.label}</legend>
                  <div className="mt-3 flex flex-wrap gap-3">
                    {group.values.map((value) => {
                      const active = selectedOptionValue(selected, group.name) === value;
                      const matchingSku = skuForOption(product, selected, group.name, value);
                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => matchingSku && setSku(matchingSku)}
                          disabled={!matchingSku}
                          className={cn(
                            group.swatch
                              ? "size-11"
                              : "min-h-11 border border-[var(--color-border-strong)] px-3 text-[13px] font-semibold",
                            active && "outline outline-2 outline-offset-2 outline-brand",
                          )}
                          style={group.swatch ? { background: swatchHex(product, group.name, value) } : undefined}
                          aria-pressed={active}
                          aria-label={value}
                        >
                          {group.swatch ? null : value}
                        </button>
                      );
                    })}
                  </div>
                  <p className="mt-3 text-[13px] text-[var(--color-text-soft)]">
                    {selectedOptionValue(selected, group.name) ?? selected.colorName}
                    {selected.ral ? ` · ${selected.ral}` : null}
                    {selected.popular ? " · meest gekozen" : null}
                  </p>
                </fieldset>
              ))}
            </div>
          ) : (
            <p className="mt-6 text-[13px] text-[var(--color-text-soft)]">{selected.colorName}</p>
          )}

          <p className="mt-4 text-[13px] text-[var(--color-text-muted)]">
            SKU {selected.sku}
            {selected.ean ? ` · EAN ${selected.ean}` : null}
          </p>
          <p
            className={cn(
              "mt-2 text-[13px] font-medium",
              selected.inStock ? "text-brand" : "text-[var(--color-text-muted)]",
            )}
          >
            {selected.inStock ? "● Uit voorraad leverbaar" : `○ ${selected.stockText ?? "Niet op voorraad"}`}
          </p>

          <div className="mt-6 hidden items-center gap-3 lg:flex">
            <label className="text-[13px] font-semibold" htmlFor="qty">
              Aantal
            </label>
            <input
              id="qty"
              type="number"
              min={1}
              value={qty}
              onChange={(event) => setQty(Math.max(1, Number(event.target.value) || 1))}
              className="h-11 w-20 border border-[var(--color-border-strong)] bg-surface px-3"
            />
            <button
              type="button"
              onClick={onAdd}
              disabled={!selected.inStock}
              className={buttonVariants({ variant: "primary" })}
            >
              In winkelwagen
            </button>
          </div>
          {added ? (
            <p className="mt-3 hidden text-[13px] text-brand lg:block">
              Toegevoegd.{" "}
              <Link href="/winkelwagen">Naar winkelwagen</Link>
            </p>
          ) : (
            <p className="mt-3 hidden text-[13px] text-[var(--color-text-muted)] lg:block">
              Heb je nog vragen? Wij staan voor je klaar via de chat.
            </p>
          )}

          <p className="mt-6 text-[12px] tracking-[0.04em] text-[var(--color-text-muted)] uppercase">
            iDEAL · VISA · Mastercard · PayPal · Klarna
          </p>

          <ul className="mt-6 space-y-2 text-[15px]">
            {[
              "Standaard 10 jaar garantie",
              "Uit voorraad of binnen 5 werkdagen",
              "Zelf monteren of wij plaatsen",
              "Altijd binnen 24 uur bericht",
            ].map((item) => (
              <li key={item}>
                <span className="mr-2 font-bold text-brand">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <section className="mt-14 max-w-2xl">
        <h2>Specificaties</h2>
        <dl className="mt-4 divide-y divide-[var(--color-border)] border border-[var(--color-border)] bg-surface">
          {product.specs.map((spec) => (
            <div key={spec.label} className="grid grid-cols-2 gap-4 px-4 py-3 text-[14px]">
              <dt className="text-[var(--color-text-muted)]">{spec.label}</dt>
              <dd>{spec.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {related.length > 0 ? (
        <section className="mt-14">
          <h2>Completeer dit systeem</h2>
          <p className="mt-2 max-w-2xl text-[var(--color-text-soft)]">
            Hulpstukken die bij dit artikel horen. Zelfde merk, zelfde kleurserie.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((item) => (
              <ProductCard key={item.slug} product={item} />
            ))}
          </div>
        </section>
      ) : null}

      <div className="sticky bottom-0 z-30 -mx-6 mt-10 border-t border-[var(--color-border)] bg-surface px-6 py-3 lg:hidden">
        <div className="flex items-center gap-3">
          <input
            type="number"
            min={1}
            value={qty}
            onChange={(event) => setQty(Math.max(1, Number(event.target.value) || 1))}
            className="h-11 w-16 border border-[var(--color-border-strong)] bg-surface px-2"
            aria-label="Aantal"
          />
          <button
            type="button"
            onClick={onAdd}
            disabled={!selected.inStock}
            className={cn(buttonVariants({ variant: "primary", block: true }))}
          >
            In winkelwagen
          </button>
        </div>
        <p className="mt-2 text-[12px] text-[var(--color-text-muted)]">
          Heb je nog vragen? Wij staan voor je klaar via de chat.
        </p>
      </div>
    </div>
  );
}

function meaningfulOptionGroups(product: Product) {
  const names = new Map<string, Set<string>>();
  for (const variant of product.variants) {
    for (const option of variant.options ?? []) {
      if (option.name.toLowerCase() === "title" && option.value.toLowerCase() === "default title") {
        continue;
      }
      const values = names.get(option.name) ?? new Set<string>();
      values.add(option.value);
      names.set(option.name, values);
    }
  }

  return [...names.entries()]
    .filter(([, values]) => values.size > 1)
    .map(([name, values]) => ({
      name,
      label: optionLabel(name),
      values: [...values],
      swatch: /kleur|color|colour/i.test(name),
    }));
}

function optionLabel(name: string) {
  const lower = name.toLowerCase();
  if (/kleur|color|colour/.test(lower)) return "Kies je kleur";
  if (/lengte|length/.test(lower)) return "Kies je lengte";
  return name;
}

function selectedOptionValue(variant: Product["variants"][number], name: string) {
  return variant.options?.find((option) => option.name === name)?.value;
}

function skuForOption(
  product: Product,
  current: Product["variants"][number],
  name: string,
  value: string,
) {
  const currentOptions = new Map((current.options ?? []).map((option) => [option.name, option.value]));
  currentOptions.set(name, value);
  const match = product.variants.find((variant) =>
    [...currentOptions.entries()].every(
      ([optionName, optionValue]) =>
        variant.options?.find((option) => option.name === optionName)?.value === optionValue,
    ),
  );
  return match?.sku;
}

function swatchHex(product: Product, name: string, value: string) {
  const variant = product.variants.find(
    (item) => item.options?.some((option) => option.name === name && option.value === value),
  );
  return variant?.hex ?? product.palette[0] ?? "#3A3D41";
}
