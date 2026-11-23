"use client";

import Link from "next/link";
import { useState } from "react";

import { CardSwatches } from "@/components/catalog/card-swatches";
import { ProductPhoto } from "@/components/brand/product-photo";
import { SquareMetrePrice } from "@/components/catalog/square-metre-price";
import { buttonVariants } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import type { ListingCardModel, ListingLengthOption, ListingSwatch } from "@/lib/catalog/listing";
import { describeMeasure, isRealListedLength } from "@/lib/catalog/measures";
import { pricePerSquareMetre } from "@/lib/catalog/square-metre";
import { exclVat, formatLengthMm, formatPrice } from "@/lib/format";
import { confirmedLeadTimeWeeks, leadTimeLabel } from "@/lib/lead-time";
import { productAlt } from "@/lib/seo/alt";
import { cn } from "@/lib/utils";
import { stockLabel } from "@/lib/week";

function firstRealLength(swatch: ListingSwatch | undefined) {
  return swatch?.lengths.find((item) => isRealListedLength(item.length))?.length ?? swatch?.lengths[0]?.length ?? "";
}

function selectedLength(swatch: ListingSwatch | undefined, length: string): ListingLengthOption | undefined {
  return swatch?.lengths.find((item) => item.length === length) ?? swatch?.lengths[0];
}

export function ListingRow({ card }: { card: ListingCardModel }) {
  const cart = useCart();
  const initial = card.swatches[card.activeIndex] ?? card.swatches[0];
  const [index, setIndex] = useState(card.activeIndex);
  const [hover, setHover] = useState<number | null>(null);
  const [length, setLength] = useState(firstRealLength(initial));
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const shown = hover ?? index;
  const swatch = card.swatches[shown] ?? initial;
  const variant = selectedLength(swatch, length);
  const incl = variant?.price ?? 0;
  const priced = card.hasPrice && incl > 0;
  const status = stockLabel(variant?.inStock ?? false, variant?.stockText);
  const delivery = leadTimeLabel(
    variant?.inStock ? null : confirmedLeadTimeWeeks(card.category, card.slug),
    status.text,
  );
  const sku = (variant?.sku ?? card.slug).replace(/-3M$/, "");
  const perM2 = pricePerSquareMetre({
    priceIncl: incl,
    workingWidthMm: card.saleUnit === "sheet" ? undefined : card.workingWidthMm,
    length: card.saleUnit === "sheet" ? undefined : variant?.length,
    sheetM2: card.saleUnit === "sheet" ? card.sheetM2 : undefined,
  });
  const image = variant?.image ?? swatch?.image;
  const lengthChoices = (swatch?.lengths ?? []).filter((item) => isRealListedLength(item.length));
  const measure = describeMeasure(card.name, lengthChoices.length ? (variant?.length ?? "") : "stuk", card.workingWidthMm);

  function pickColour(nextIndex: number) {
    const match = card.swatches[nextIndex];
    setIndex(nextIndex);
    if (match && !match.lengths.some((item) => item.length === length && isRealListedLength(item.length))) {
      setLength(firstRealLength(match));
    }
  }

  function add() {
    if (!priced || !variant || !swatch) return;
    cart.add({
      productSlug: card.slug,
      variantSku: variant.sku,
      qty,
      name: card.name,
      brand: card.brand,
      colorName: swatch.name,
      price: variant.price,
      shopifyVariantId: variant.shopifyVariantId,
      hex: swatch.hex,
      image: image?.url,
      length: variant.length,
      skuLabel: sku,
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1600);
  }

  const measureText =
    measure.text === "Stuk"
      ? "Per stuk"
      : measure.label === "Werkende breedte"
        ? `${measure.text} werkend`
        : `${measure.label} ${measure.text}`;

  return (
    <article className="@container kg-soft-card flex w-full min-w-0 flex-col gap-3 p-4">
      <div className="flex min-w-0 gap-3">
        <Link href={`/producten/${card.slug}`} className="shrink-0 text-inherit no-underline hover:no-underline">
          <ProductPhoto
            image={image}
            alt={productAlt(card, swatch?.name)}
            sizes="72px"
            fallback={swatch?.hex}
            bevel={8}
            className="size-[72px]"
            imageClassName="p-1"
          />
        </Link>
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[13px] break-words text-kg-text-2">Art. {sku}</p>
          <h3 className="mt-0.5 text-[16px] leading-snug font-medium break-words">
            <Link href={`/producten/${card.slug}`} className="text-inherit no-underline hover:no-underline">
              {card.name}
            </Link>
          </h3>
          {lengthChoices.length > 0 && card.workingWidthMm ? (
            <p className="mt-1 font-mono text-[13px] text-kg-text-2">{card.workingWidthMm} mm werkend</p>
          ) : null}
          <p className="mt-1 font-mono text-[13px]" style={{ color: status.color }}>
            {delivery}
          </p>
          {card.swatches.length > 0 ? (
            <div className="mt-3 min-w-0">
              <CardSwatches card={card} activeIndex={index} onHover={setHover} onPick={pickColour} name={swatch?.name ?? ""} />
            </div>
          ) : null}
        </div>
      </div>

      <div className="grid min-w-0 grid-cols-1 items-center gap-3 @min-[420px]:grid-cols-2 @min-[640px]:grid-cols-[minmax(7.5rem,1fr)_7.5rem_8.5rem_10.5rem]">
      {lengthChoices.length > 0 ? (
        <label className="block min-w-0">
          <span className="sr-only">Lengte</span>
          <select
            value={lengthChoices.some((item) => item.length === variant?.length) ? variant?.length : lengthChoices[0]?.length}
            onChange={(event) => setLength(event.target.value)}
            className="h-11 w-full min-w-0 border border-kg-navy bg-white px-2 font-mono text-[13px] text-kg-navy"
          >
            {lengthChoices.map((item) => (
              <option key={item.length} value={item.length}>
                {formatLengthMm(item.length)}
              </option>
            ))}
          </select>
        </label>
      ) : (
        <p className="flex h-11 min-w-0 items-center border border-kg-navy bg-white px-2 font-mono text-[13px] leading-tight text-kg-navy">
          <span className="sr-only">{measure.label}</span>
          {measureText}
        </p>
      )}

      <div className="flex h-11 min-w-0 items-stretch border border-kg-navy">
        <button
          type="button"
          className="grid w-11 place-items-center text-[18px] text-kg-navy"
          aria-label="Minder"
          onClick={() => setQty((current) => Math.max(1, current - 1))}
        >
          −
        </button>
        <input
          value={qty}
          inputMode="numeric"
          aria-label="Aantal"
          onChange={(event) => {
            const next = Number.parseInt(event.target.value.replace(/\D/g, ""), 10);
            setQty(Number.isFinite(next) && next > 0 ? next : 1);
          }}
          className="w-full border-x border-kg-navy bg-white text-center font-mono text-[14px] text-kg-navy outline-none"
        />
        <button
          type="button"
          className="grid w-11 place-items-center text-[18px] text-kg-navy"
          aria-label="Meer"
          onClick={() => setQty((current) => current + 1)}
        >
          +
        </button>
      </div>

      <div className="min-w-0 text-right font-mono">
        {priced ? (
          <span className="kg-price">
            <span className="kg-price-incl block">
              <span className="block text-[18px] leading-none font-medium text-kg-navy">{formatPrice(incl)}</span>
              <span className="mt-1 block text-[12px] text-kg-text-2">{formatPrice(exclVat(incl))} excl. btw per stuk</span>
            </span>
            <span className="kg-price-excl block">
              <span className="block text-[18px] leading-none font-medium text-kg-navy">{formatPrice(exclVat(incl))}</span>
              <span className="mt-1 block text-[12px] text-kg-text-2">{formatPrice(incl)} incl. btw per stuk</span>
            </span>
          </span>
        ) : (
          <span className="text-[14px] text-kg-text-2">Prijs op aanvraag</span>
        )}
        {priced ? <SquareMetrePrice incl={perM2} /> : null}
      </div>

      {priced ? (
        <button
          type="button"
          onClick={add}
          className={cn(buttonVariants({ variant: "primary", size: "sm" }), "h-11 w-full min-w-0 px-2 whitespace-normal text-center leading-tight")}
        >
          {added ? "Toegevoegd" : "In winkelwagen"}
        </button>
      ) : (
        <Link
          href={`/producten/${card.slug}`}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "h-11 w-full min-w-0 px-2 whitespace-normal text-center leading-tight no-underline hover:no-underline")}
        >
          Bekijk
        </Link>
      )}
      </div>
    </article>
  );
}
