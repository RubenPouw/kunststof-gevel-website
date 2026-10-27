"use client";

import Link from "next/link";
import { useState } from "react";

import { compareColourLabels, colourOptionText } from "@/components/catalog/colour-name";
import { ProductPhoto } from "@/components/brand/product-photo";
import { buttonVariants } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import type { ListingCardModel, ListingLengthOption, ListingSwatch } from "@/lib/catalog/listing";
import { exclVat, formatLengthMm, formatPrice } from "@/lib/format";
import { confirmedLeadTimeWeeks, leadTimeLabel } from "@/lib/lead-time";
import { productAlt } from "@/lib/seo/alt";
import { cn } from "@/lib/utils";
import { stockLabel } from "@/lib/week";

function selectedLength(swatch: ListingSwatch | undefined, length: string): ListingLengthOption | undefined {
  return swatch?.lengths.find((item) => item.length === length) ?? swatch?.lengths[0];
}

export function ListingRow({ card }: { card: ListingCardModel }) {
  const cart = useCart();
  const initial = card.swatches[card.activeIndex] ?? card.swatches[0];
  const [colour, setColour] = useState(initial?.name ?? "");
  const [length, setLength] = useState(initial?.length ?? "");
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const swatch = card.swatches.find((item) => item.name === colour) ?? initial;
  const variant = selectedLength(swatch, length);
  const incl = variant?.price ?? 0;
  const priced = card.hasPrice && incl > 0;
  const status = stockLabel(variant?.inStock ?? false, variant?.stockText);
  const delivery = leadTimeLabel(
    variant?.inStock ? null : confirmedLeadTimeWeeks(card.category, card.slug),
    status.text,
  );
  const sku = (variant?.sku ?? card.slug).replace(/-3M$/, "");
  const image = variant?.image ?? swatch?.image;

  function onColour(next: string) {
    setColour(next);
    const match = card.swatches.find((item) => item.name === next);
    if (match && !match.lengths.some((item) => item.length === length)) {
      setLength(match.lengths[0]?.length ?? "");
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

  return (
    <article className="kg-soft-card flex flex-col gap-3 p-4 lg:flex-row lg:items-center lg:gap-3">
      <div className="flex min-w-0 gap-3 lg:contents">
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
        <div className="min-w-0 flex-1 lg:w-[220px] lg:flex-1">
          <p className="font-mono text-[13px] text-kg-text-2">Art. {sku}</p>
          <h3 className="mt-0.5 text-[16px] leading-snug font-medium">
            <Link href={`/producten/${card.slug}`} className="text-inherit no-underline hover:no-underline">
              {card.name}
            </Link>
          </h3>
          <p className="mt-1 font-mono text-[13px] whitespace-nowrap" style={{ color: status.color }}>
            {delivery}
          </p>
        </div>
      </div>

      {card.swatches.length > 0 ? (
        <label className="block w-full lg:w-[148px] lg:shrink-0">
          <span className="sr-only">Kleur</span>
          <select
            value={swatch?.name ?? ""}
            onChange={(event) => onColour(event.target.value)}
            className="h-11 w-full border border-kg-navy bg-white px-2 text-[14px] text-kg-navy"
          >
            {[...card.swatches]
              .sort((a, b) => compareColourLabels(a.name, b.name))
              .map((item) => (
                <option key={item.sampleId || item.name} value={item.name}>
                  {colourOptionText(item.name)}
                </option>
              ))}
          </select>
        </label>
      ) : null}

      <label className="block w-full lg:w-[112px] lg:shrink-0">
        <span className="sr-only">Lengte</span>
        <select
          value={variant?.length ?? ""}
          onChange={(event) => setLength(event.target.value)}
          className="h-11 w-full border border-kg-navy bg-white px-2 font-mono text-[13px] text-kg-navy"
        >
          {(swatch?.lengths.length ? swatch.lengths : [{ length: card.swatches[0]?.length || "" }]).map((item) => (
            <option key={item.length} value={item.length}>
              {item.length ? formatLengthMm(item.length) : "Stuk"}
            </option>
          ))}
        </select>
      </label>

      <div className="flex h-11 w-full items-stretch border border-kg-navy lg:w-[124px] lg:shrink-0">
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

      <div className="font-mono lg:w-[132px] lg:shrink-0 lg:text-right">
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
      </div>

      {priced ? (
        <button
          type="button"
          onClick={add}
          className={cn(buttonVariants({ variant: "primary", size: "sm" }), "h-11 min-w-[9.5rem] lg:shrink-0")}
        >
          {added ? "Toegevoegd" : "In winkelwagen"}
        </button>
      ) : (
        <Link
          href={`/producten/${card.slug}`}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "h-11 no-underline hover:no-underline lg:shrink-0")}
        >
          Bekijk
        </Link>
      )}
    </article>
  );
}
