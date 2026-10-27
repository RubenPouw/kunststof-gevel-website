"use client";

import Link from "next/link";
import { useState } from "react";

import { ColourName } from "@/components/catalog/colour-name";
import { ProductPhoto } from "@/components/brand/product-photo";
import { VatPrice } from "@/components/brand/vat-price";
import { SampleAddButton } from "@/components/samples/sample-add-button";
import { buttonVariants } from "@/components/ui/button";
import type { ListingCardModel } from "@/lib/catalog/listing";
import { formatLengthMm } from "@/lib/format";
import { confirmedLeadTimeWeeks, leadTimeLabel } from "@/lib/lead-time";
import { productAlt } from "@/lib/seo/alt";
import { cn } from "@/lib/utils";
import { stockLabel } from "@/lib/week";

export function ListingCard({ card }: { card: ListingCardModel }) {
  const [index, setIndex] = useState(card.activeIndex);
  const selected = card.swatches[index] ?? card.swatches[0];
  const status = stockLabel(selected?.inStock ?? false, selected?.stockText);
  const delivery = leadTimeLabel(
    selected?.inStock ? null : confirmedLeadTimeWeeks(card.category, card.slug),
    status.text,
  );
  const incl = selected?.price ?? 0;
  const sku = (selected?.sku ?? card.slug).replace(/-3M$/, "");
  const priced = card.hasPrice && (selected?.price ?? 0) > 0;

  return (
    <article className="kg-soft-card grid gap-4 p-3.5 sm:grid-cols-[170px_1fr]">
      <Link href={`/producten/${card.slug}`} className="relative block text-inherit no-underline hover:no-underline">
        <ProductPhoto
          image={selected?.image}
          alt={productAlt(card, selected?.name)}
          sizes="(min-width: 640px) 170px, 100vw"
          fallback={selected?.hex}
          className="aspect-square"
          imageClassName="p-1"
        />
      </Link>
      <div className="flex min-w-0 flex-col">
        <p className="font-mono text-[13px] text-kg-text-2">Art. {sku}</p>
        <h3 className="mt-1 text-[17px] leading-[1.3] font-medium">
          <Link href={`/producten/${card.slug}`} className="text-inherit no-underline hover:no-underline">
            {card.name}
          </Link>
        </h3>
        <p className="mt-1 font-mono text-[13px] text-kg-text-2">
          {card.saleUnit === "sheet"
            ? `3050 × 1300 mm · hele plaat${selected?.ral ? ` · ${selected.ral}` : ""}`
            : `${formatLengthMm(selected?.length ?? "")}${card.workingWidthMm ? ` · ${card.workingWidthMm} mm werkend` : ""}`}
        </p>
        {card.swatches.length > 0 ? (
          <p className="mt-2 font-mono text-[12px] text-kg-text-2">
            {card.swatches.length} {card.swatches.length === 1 ? "kleur" : "kleuren"}
          </p>
        ) : null}
        {card.swatches.length > 1 ? (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {card.swatches.map((color, colorIndex) => {
              const active = colorIndex === index;
              return (
                <button
                  key={color.sampleId || color.name}
                  type="button"
                  onClick={() => setIndex(colorIndex)}
                  className={cn("size-5", active && "outline outline-2 outline-offset-1 outline-kg-navy")}
                  style={{ background: color.hex }}
                  aria-label={color.name}
                  aria-pressed={active}
                />
              );
            })}
            <ColourName value={selected?.name ?? ""} className="font-mono text-[12px] text-kg-text-2" />
          </div>
        ) : null}
        <div className="mt-3 flex items-baseline justify-between border-t border-kg-lijn pt-2.5 font-mono text-[14px]">
          <span className="whitespace-nowrap" style={{ color: status.color }}>
            {delivery}
          </span>
          <span className="text-right">
            {priced ? (
              <VatPrice incl={incl} suffix={card.saleUnit === "sheet" ? " /plaat" : ""} />
            ) : (
              "Prijs op aanvraag"
            )}
          </span>
        </div>
        <div className="mt-auto flex flex-wrap gap-2 pt-3">
          <Link
            href={`/producten/${card.slug}`}
            className={cn(buttonVariants({ variant: "primary", size: "sm" }), "h-10 no-underline hover:no-underline")}
          >
            {priced ? "In bestelling" : "Bekijk"}
          </Link>
          {card.sampleable && selected ? (
            <SampleAddButton
              sample={{
                id: selected.sampleId,
                brandSlug: card.brandSlug,
                brandName: card.brand,
                colorName: selected.name,
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
