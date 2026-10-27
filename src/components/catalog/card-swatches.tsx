"use client";

import Link from "next/link";

import { ColourName } from "@/components/catalog/colour-name";
import { ColourSwatch } from "@/components/catalog/colour-swatch";
import type { ListingCardModel } from "@/lib/catalog/listing";
import { visibleCardSwatches } from "@/lib/catalog/swatches";

/** At most six round swatches, then +N. Hover previews, click keeps the colour. */
export function CardSwatches({
  card,
  activeIndex,
  onHover,
  onPick,
  name,
}: {
  card: ListingCardModel;
  activeIndex: number;
  onHover: (index: number | null) => void;
  onPick: (index: number) => void;
  name: string;
}) {
  if (card.swatches.length <= 1) {
    const only = card.swatches[0];
    if (!only) return null;
    return <ColourName value={only.name} className="font-mono text-[12px] text-kg-text-2" />;
  }

  const visible = visibleCardSwatches(card.swatches, activeIndex);
  const hidden = card.swatches.length - visible.length;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {visible.map(({ swatch, index }) => (
        <button
          key={swatch.sampleId || `${swatch.name}-${index}`}
          type="button"
          onMouseEnter={() => onHover(index)}
          onMouseLeave={() => onHover(null)}
          onFocus={() => onHover(index)}
          onBlur={() => onHover(null)}
          onClick={() => {
            onPick(index);
            onHover(null);
          }}
          className="grid size-7 place-items-center bg-transparent p-0"
          style={{ borderRadius: 9999 }}
          aria-label={swatch.name}
          aria-pressed={index === activeIndex}
        >
          <ColourSwatch name={swatch.name} hex={swatch.hex} family={swatch.family} size={22} active={index === activeIndex} />
        </button>
      ))}
      {hidden > 0 ? (
        <Link
          href={`/producten/${card.slug}`}
          className="font-mono text-[12px] text-kg-navy no-underline hover:underline"
        >
          +{hidden}
        </Link>
      ) : null}
      <ColourName value={name} className="font-mono text-[12px] text-kg-text-2" />
    </div>
  );
}
