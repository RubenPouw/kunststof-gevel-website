"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { ColorPanel } from "@/components/brand/color-panel";
import { ProductCard } from "@/components/brand/product-card";
import { ProductMedia } from "@/components/brand/product-media";
import { SampleAddButton } from "@/components/samples/sample-add-button";
import { buttonVariants } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { findVariant, neededPanels, uniqueLengths } from "@/lib/catalog/derive";
import { getDefaultVariant } from "@/lib/catalog/helpers";
import type { Product, ProductVariant } from "@/lib/catalog/types";
import { formatPrice } from "@/lib/format";
import { paymentMethods } from "@/lib/site";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "omschrijving", label: "Omschrijving" },
  { id: "montage", label: "Montage" },
  { id: "garantie", label: "Garantie" },
  { id: "downloads", label: "Downloads" },
] as const;

export function ProductDetail({
  product,
  related,
  categoryName,
  others,
}: {
  product: Product;
  related: Product[];
  categoryName: string;
  others: Product[];
}) {
  const fallback = getDefaultVariant(product);
  const lengths = uniqueLengths(product).filter(Boolean);
  const showLength = lengths.length > 1;
  const [colorName, setColorName] = useState(fallback.colorName);
  const [length, setLength] = useState(fallback.length);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("omschrijving");
  const [width, setWidth] = useState("8");
  const [height, setHeight] = useState("2.6");
  const { add } = useCart();

  const selected: ProductVariant = useMemo(
    () => findVariant(product, colorName, length) ?? fallback,
    [colorName, fallback, length, product],
  );

  const coverage = selected.panelsPerM2;
  const area = Number(width.replace(",", ".")) * Number(height.replace(",", "."));
  const panels =
    coverage && Number.isFinite(area) && area > 0 ? neededPanels(Number(width.replace(",", ".")), Number(height.replace(",", ".")), coverage) : 0;
  const calcTotal = panels * selected.price;
  const priceExcl = selected.price / 1.21;
  const priceM2 = coverage ? selected.price * coverage : undefined;

  function onAdd(count = qty) {
    add({
      productSlug: product.slug,
      variantSku: selected.sku,
      qty: count,
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
        <Link href="/" className="no-underline">
          Home
        </Link>
        {" / "}
        <Link href={`/${product.category}`} className="no-underline">
          {categoryName}
        </Link>
        {" / "}
        {product.brand}
      </p>

      <div className="mt-6 grid gap-12 lg:grid-cols-[1fr_460px]">
        <div>
          <div className="relative aspect-square border border-[var(--color-border)]">
            {product.images[0] ? (
              <ProductMedia product={product} className="aspect-square h-full" />
            ) : (
              <ColorPanel hex={selected.hex} className="absolute inset-0" />
            )}
            <span className="absolute top-4 left-4 bg-white px-2 py-1 text-[12px] font-medium">
              Kleur: {selected.colorName}
              {selected.ral ? ` · ${selected.ral}` : ""}
            </span>
          </div>
          <div className="mt-2 grid grid-cols-5 gap-2">
            {product.colors.slice(0, 5).map((color) => (
              <button
                key={color.sampleId}
                type="button"
                onClick={() => setColorName(color.name)}
                className={cn(
                  "relative aspect-square",
                  color.name === selected.colorName && "outline outline-2 outline-brand",
                )}
                aria-label={color.name}
              >
                <ColorPanel hex={color.hex} className="absolute inset-0" />
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-[18px]">
          <p className="kicker">
            {product.brand} · art. {selected.sku.replace(/-3M$/, "")}
          </p>
          <h1 className="display-pdp">{product.name}</h1>
          <p className="text-[14px] text-[var(--color-text-muted)]">
            {selected.length} per lengte
            {product.workingWidthMm ? ` · ${product.workingWidthMm} mm werkend` : ""}
            {coverage ? ` · ${coverage.toLocaleString("nl-NL")} panelen per m²` : ""}
          </p>
          <div>
            <p className="font-heading text-[40px] leading-none font-bold">{formatPrice(selected.price)}</p>
            <p className="mt-1 text-[11px] text-[var(--color-text-muted)]">
              incl. btw {unitLabel} · {formatPrice(priceExcl)} excl.
              {priceM2 ? ` · ${formatPrice(priceM2)} per m²` : ""}
            </p>
          </div>
          <p className={cn("text-[13px] font-medium", selected.inStock ? "text-brand" : "text-[var(--color-text-muted)]")}>
            {selected.inStock
              ? "● Uit voorraad leverbaar – vandaag besteld, binnen 2 werkdagen geleverd"
              : `○ ${selected.stockText ?? "Niet op voorraad"}`}
          </p>

          {product.colors.length > 1 ? (
            <fieldset className="border-t border-[var(--color-border)] pt-4">
              <legend className="flex w-full items-baseline justify-between font-heading text-[18px] font-semibold">
                Kies je kleur
                <span className="text-[13px] font-medium text-[var(--color-text-muted)]">
                  {selected.colorName}
                  {selected.ral ? ` · ${selected.ral}` : ""}
                </span>
              </legend>
              <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-8">
                {product.colors.map((color) => (
                  <button
                    key={color.sampleId}
                    type="button"
                    onClick={() => setColorName(color.name)}
                    className={cn(
                      "relative aspect-square",
                      color.name === selected.colorName && "outline outline-2 outline-brand",
                    )}
                    aria-label={color.name}
                    aria-pressed={color.name === selected.colorName}
                  >
                    <ColorPanel hex={color.hex} className="absolute inset-0" />
                  </button>
                ))}
              </div>
            </fieldset>
          ) : null}

          {showLength ? (
            <fieldset>
              <legend className="font-heading text-[18px] font-semibold">Lengte</legend>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {lengths.map((value) => {
                  const variant = findVariant(product, colorName, value);
                  const active = selected.length === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setLength(value)}
                      className={cn(
                        "min-h-11 border-[1.5px] px-3 text-[14px] font-semibold",
                        active ? "border-brand bg-tint" : "border-[var(--color-border-strong)]",
                      )}
                    >
                      {value}
                      {variant ? ` (${formatPrice(variant.price)})` : ""}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          ) : null}

          {coverage ? (
            <div className="border border-[var(--color-border)] bg-surface px-5 py-[18px]">
              <div className="flex items-baseline justify-between gap-3">
                <p className="font-heading text-[18px] font-semibold">Hoeveel panelen heb ik nodig?</p>
                <p className="text-[12px] text-[var(--color-text-muted)]">incl. 10% zaagverlies</p>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <label className="text-[13px] font-semibold">
                  Breedte gevel (m)
                  <input
                    value={width}
                    onChange={(event) => setWidth(event.target.value)}
                    inputMode="decimal"
                    className="mt-1 min-h-11 w-full border border-[var(--color-border-strong)] px-3 text-[15px] font-normal"
                  />
                </label>
                <label className="text-[13px] font-semibold">
                  Hoogte gevel (m)
                  <input
                    value={height}
                    onChange={(event) => setHeight(event.target.value)}
                    inputMode="decimal"
                    className="mt-1 min-h-11 w-full border border-[var(--color-border-strong)] px-3 text-[15px] font-normal"
                  />
                </label>
              </div>
              {panels > 0 ? (
                <p className="mt-4 text-[14px]">
                  {area.toLocaleString("nl-NL", { maximumFractionDigits: 1 })} m² → {panels} panelen van{" "}
                  {selected.length} · {formatPrice(calcTotal)} incl. btw
                </p>
              ) : null}
              <button
                type="button"
                onClick={() => panels > 0 && setQty(panels)}
                disabled={panels < 1}
                className={cn(buttonVariants({ variant: "outline" }), "mt-4")}
              >
                Neem over
              </button>
            </div>
          ) : null}

          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="flex h-11 w-[120px] items-stretch border border-[var(--color-border-strong)]">
              <button type="button" className="grid w-11 place-items-center" onClick={() => setQty((n) => Math.max(1, n - 1))} aria-label="Minder">
                −
              </button>
              <input
                value={qty}
                onChange={(event) => setQty(Math.max(1, Number(event.target.value) || 1))}
                className="min-w-0 flex-1 border-x border-[var(--color-border-strong)] text-center text-[15px]"
                aria-label="Aantal"
              />
              <button type="button" className="grid w-11 place-items-center" onClick={() => setQty((n) => n + 1)} aria-label="Meer">
                +
              </button>
            </div>
            <button
              type="button"
              onClick={() => onAdd()}
              disabled={!selected.inStock}
              className={cn(buttonVariants({ variant: "primary" }), "min-h-11 flex-1")}
            >
              In winkelwagen · {formatPrice(selected.price * qty)}
            </button>
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
                label="Gratis staal"
              />
            ) : null}
          </div>
          {added ? (
            <p className="text-[13px] text-brand">
              Toegevoegd. <Link href="/winkelwagen">Naar winkelwagen</Link>
            </p>
          ) : (
            <p className="text-[13px] text-[var(--color-text-muted)]">
              Standaard 10 jaar garantie. Altijd binnen 24 uur bericht.
            </p>
          )}
          <p className="text-[11px] tracking-[0.04em] text-[var(--color-text-muted)] uppercase">
            {paymentMethods.join(" · ")}
          </p>
        </div>
      </div>

      <section className="mt-16">
        <div className="flex gap-6 border-b border-[var(--color-border)]">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={cn(
                "min-h-11 text-[15px] font-semibold",
                tab === item.id
                  ? "border-b-2 border-brand text-kg-ink"
                  : "text-[var(--color-text-muted)]",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="mt-8 grid gap-10 lg:grid-cols-2">
          <div className="text-[15px] leading-[1.65] text-[var(--color-text-soft)]">
            {tab === "omschrijving" ? <p>{product.description}</p> : null}
            {tab === "montage" ? (
              <p>
                Monteer op een vlak, ventilerend regelwerk. Houd dilatatie aan de uiteinden aan. Bij twijfel
                over ondergrond of windbelasting plaatsen wij het systeem.
              </p>
            ) : null}
            {tab === "garantie" ? (
              <p>
                Standaard 10 jaar kleurvastheid op de folie, mits gemonteerd volgens voorschrift. Panelen rotten
                niet en hoeven niet geschilderd te worden.
              </p>
            ) : null}
            {tab === "downloads" ? (
              <p>Montagehandleiding en productblad sturen we mee met de orderbevestiging, of op verzoek via chat.</p>
            ) : null}
          </div>
          <dl className="divide-y divide-[var(--color-border)] border border-[var(--color-border)] bg-surface">
            {product.specs.map((spec) => (
              <div key={spec.label} className="grid grid-cols-2 gap-4 px-4 py-3 text-[14px]">
                <dt className="text-[var(--color-text-muted)]">{spec.label}</dt>
                <dd className="font-medium">{spec.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {related.length > 0 ? (
        <section className="mt-16">
          <h2 className="font-heading text-[36px] font-bold uppercase">Completeer dit systeem</h2>
          <p className="mt-2 max-w-2xl text-[var(--color-text-soft)]">
            Hulpstukken die bij dit artikel horen. Zelfde merk, zelfde kleurserie.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {related.slice(0, 4).map((item) => (
              <ProductCard key={item.slug} product={item} />
            ))}
          </div>
        </section>
      ) : null}

      {others.length > 0 ? (
        <section className="mt-16 mb-8">
          <h2 className="font-heading text-[36px] font-bold uppercase">Anderen bekeken ook</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {others.slice(0, 4).map((item) => (
              <ProductCard key={item.slug} product={item} showSample={item.sampleable} />
            ))}
          </div>
        </section>
      ) : null}

      <div className="sticky bottom-0 z-30 -mx-6 mt-10 border-t border-[var(--color-border)] bg-surface px-6 py-3 lg:hidden">
        <div className="flex items-center gap-3">
          <div className="flex h-11 items-stretch border border-[var(--color-border-strong)]">
            <button type="button" className="w-10" onClick={() => setQty((n) => Math.max(1, n - 1))}>
              −
            </button>
            <span className="grid min-w-8 place-items-center text-[14px]">{qty}</span>
            <button type="button" className="w-10" onClick={() => setQty((n) => n + 1)}>
              +
            </button>
          </div>
          <button
            type="button"
            onClick={() => onAdd()}
            disabled={!selected.inStock}
            className={cn(buttonVariants({ variant: "primary", block: true }))}
          >
            In winkelwagen
          </button>
        </div>
      </div>
    </div>
  );
}
