import Link from "next/link";

import { ProductPhoto } from "@/components/brand/product-photo";
import { VatPrice } from "@/components/brand/vat-price";
import { SquareMetrePrice } from "@/components/catalog/square-metre-price";
import type { ListingCardModel } from "@/lib/catalog/listing";
import { pricePerSquareMetre } from "@/lib/catalog/square-metre";
import { productAlt } from "@/lib/seo/alt";

function shownSwatch(card: ListingCardModel) {
  return card.swatches[card.activeIndex] ?? card.swatches[0];
}

function metaLine(card: ListingCardModel) {
  const swatch = shownSwatch(card);
  if (swatch?.ral) return swatch.ral;
  if (card.saleUnit === "sheet") return "hele plaat";
  return "";
}

function ListingPhotoCard({ card }: { card: ListingCardModel }) {
  const swatch = shownSwatch(card);
  const incl = swatch?.price ?? 0;
  const priced = card.hasPrice && incl > 0;
  const perM2 = pricePerSquareMetre({
    priceIncl: incl,
    workingWidthMm: card.saleUnit === "sheet" ? undefined : card.workingWidthMm,
    length: card.saleUnit === "sheet" ? undefined : swatch?.length,
    sheetM2: card.saleUnit === "sheet" ? card.sheetM2 : undefined,
  });
  const meta = metaLine(card);
  const href = `/producten/${card.slug}`;

  return (
    <article className="kg-soft-card flex h-full min-w-0 flex-col p-3">
      <Link href={href} className="block text-inherit no-underline hover:no-underline">
        <ProductPhoto
          image={swatch?.image}
          alt={productAlt(card, swatch?.name)}
          sizes="(min-width: 1280px) 280px, (min-width: 640px) 30vw, 45vw"
          fallback={swatch?.hex}
          className="aspect-square"
          imageClassName="p-1"
        />
      </Link>
      <p className="mt-3 font-mono text-[12px] text-kg-text-2">{card.brand}</p>
      <h3 className="mt-1 text-[16px] leading-snug font-medium break-words">
        <Link href={href} className="text-inherit no-underline hover:no-underline">
          {card.name}
        </Link>
      </h3>
      {meta ? <p className="mt-1 font-mono text-[12px] text-kg-text-2">{meta}</p> : null}
      {card.swatches.length > 1 ? (
        <p className="mt-1 font-mono text-[12px] text-kg-text-2">{card.swatches.length} kleuren</p>
      ) : null}
      <p className="mt-auto border-t border-kg-lijn pt-2.5 text-right font-mono text-[14px]">
        {priced ? (
          <>
            <VatPrice incl={incl} suffix={card.saleUnit === "sheet" ? " /plaat" : ""} />
            <SquareMetrePrice incl={perM2} />
          </>
        ) : (
          "Prijs op aanvraag"
        )}
      </p>
    </article>
  );
}

/** Square photo cards, same rhythm as the HPL colour wall. */
export function ListingPhotoGrid({ cards }: { cards: ListingCardModel[] }) {
  return (
    <ul className="mt-4 grid list-none grid-cols-2 gap-3 xl:grid-cols-3">
      {cards.map((card) => (
        <li key={card.slug} className="min-w-0">
          <ListingPhotoCard card={card} />
        </li>
      ))}
    </ul>
  );
}
