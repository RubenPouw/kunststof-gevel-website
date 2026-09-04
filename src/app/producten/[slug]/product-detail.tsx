"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { ProductVisual, visualVariantFor } from "@/components/brand/product-visual";
import { buttonVariants } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import type { Product } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

export function ProductDetail({ product }: { product: Product }) {
  const popular = product.colors.find((color) => color.popular) ?? product.colors[0];
  const [colorName, setColorName] = useState(popular.name);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const { add } = useCart();

  const selected = useMemo(
    () => product.colors.find((color) => color.name === colorName) ?? popular,
    [colorName, popular, product.colors],
  );

  function onAdd() {
    add({ productSlug: product.slug, colorName: selected.name, qty });
    setAdded(true);
  }

  return (
    <div className="container-kg py-8 sm:py-12">
      <p className="text-[13px] text-[var(--color-text-muted)]">
        <Link href={`/${product.category}`} className="no-underline">
          {product.category}
        </Link>
        {" / "}
        {product.brand}
      </p>

      <div className="mt-4 grid gap-8 lg:grid-cols-2">
        <ProductVisual
          palette={[selected.hex, ...product.palette]}
          variant={visualVariantFor(product.name)}
          className="min-h-[280px]"
        />

        <div>
          <p className="kicker">{product.brand}</p>
          <h1 className="mt-2">{product.name}</h1>
          <div className="mt-4 flex items-baseline gap-2">
            <p className="price">{formatPrice(product.price)}</p>
            <p className="text-[13px] text-[var(--color-text-muted)]">
              incl. btw · per lengte van {product.length}
            </p>
          </div>

          <p className="mt-5 text-[var(--color-text-soft)]">{product.description}</p>

          <fieldset className="mt-8">
            <legend className="text-[13px] font-semibold">Kies je kleur</legend>
            <div className="mt-3 flex flex-wrap gap-3">
              {product.colors.map((color) => {
                const active = color.name === selected.name;
                return (
                  <button
                    key={color.name}
                    type="button"
                    onClick={() => setColorName(color.name)}
                    className={cn("size-11", active && "outline outline-2 outline-offset-2 outline-brand")}
                    style={{ background: color.hex }}
                    aria-pressed={active}
                    aria-label={color.name}
                  />
                );
              })}
            </div>
            <p className="mt-3 text-[13px] text-[var(--color-text-soft)]">
              {selected.name}
              {selected.ral ? ` · ${selected.ral}` : null}
              {selected.popular ? " · meest gekozen" : null}
            </p>
          </fieldset>

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
            <button type="button" onClick={onAdd} className={buttonVariants({ variant: "primary" })}>
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
