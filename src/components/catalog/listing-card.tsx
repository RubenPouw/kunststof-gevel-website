"use client";

import Link from "next/link";
import { useState } from "react";

import { CardSwatches } from "@/components/catalog/card-swatches";
import { ProductPhoto } from "@/components/brand/product-photo";
import { VatPrice } from "@/components/brand/vat-price";
import { SquareMetrePrice } from "@/components/catalog/square-metre-price";
import { SampleAddButton } from "@/components/samples/sample-add-button";
import { buttonVariants } from "@/components/ui/button";
import type { ListingCardModel } from "@/lib/catalog/listing";
import { describeMeasure } from "@/lib/catalog/measures";
import { pricePerSquareMetre } from "@/lib/catalog/square-metre";
import { confirmedLeadTimeWeeks, leadTimeLabel } from "@/lib/lead-time";
import { productAlt } from "@/lib/seo/alt";
import { cn } from "@/lib/utils";
import { stockLabel } from "@/lib/week";

function measureLine(card: ListingCardModel, length: string) {
  const measure = describeMeasure(card.name, length, card.workingWidthMm);
  if (measure.text === "Stuk") return "Per stuk";
  if (measure.label === "Lengte" && card.workingWidthMm) return `${measure.text} · ${card.workingWidthMm} mm werkend`;
  if (measure.label === "Lengte") return measure.text;
  if (measure.label === "Werkende breedte") return `${measure.text} werkend`;
  return `${measure.label} ${measure.text}`;
}

export function ListingCard({ card }: { card: ListingCardModel }) {
  const [index, setIndex] = useState(card.activeIndex);
  const [hover, setHover] = useState<number | null>(null);
  const shown = hover ?? index;
  const selected = card.swatches[shown] ?? card.swatches[0];
  const status = stockLabel(selected?.inStock ?? false, selected?.stockText);
  const delivery = leadTimeLabel(
    selected?.inStock ? null : confirmedLeadTimeWeeks(card.category, card.slug),
    status.text,
  );
  const incl = selected?.price ?? 0;
  const sku = (selected?.sku ?? card.slug).replace(/-3M$/, "");
  const priced = card.hasPrice && (selected?.price ?? 0) > 0;
  const perM2 = pricePerSquareMetre({
    priceIncl: incl,
    workingWidthMm: card.saleUnit === "sheet" ? undefined : card.workingWidthMm,
    length: card.saleUnit === "sheet" ? undefined : selected?.length,
    sheetM2: card.saleUnit === "sheet" ? card.sheetM2 : undefined,
  });

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
            : measureLine(card, selected?.length ?? "")}
        </p>
        {card.swatches.length > 0 ? (
          <p className="mt-2 font-mono text-[12px] text-kg-text-2">
            {card.swatches.length} {card.swatches.length === 1 ? "kleur" : "kleuren"}
          </p>
        ) : null}
        {card.swatches.length > 0 ? (
          <div className="mt-3">
            <CardSwatches
              card={card}
              activeIndex={index}
              onHover={setHover}
              onPick={setIndex}
              name={selected?.name ?? ""}
            />
          </div>
        ) : null}
        <div className="mt-3 flex items-baseline justify-between border-t border-kg-lijn pt-2.5 font-mono text-[14px]">
          <span className="whitespace-nowrap" style={{ color: status.color }}>
            {delivery}
          </span>
          <span className="text-right">
            {priced ? (
              <>
                <VatPrice incl={incl} suffix={card.saleUnit === "sheet" ? " /plaat" : ""} />
                <SquareMetrePrice incl={perM2} />
              </>
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
