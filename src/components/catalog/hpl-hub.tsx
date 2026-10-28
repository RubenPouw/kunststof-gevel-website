import Link from "next/link";

import { ProductPhoto } from "@/components/brand/product-photo";
import { VatPrice } from "@/components/brand/vat-price";
import { ColourName } from "@/components/catalog/colour-name";
import { ColourSwatch } from "@/components/catalog/colour-swatch";
import { ListingCard } from "@/components/catalog/listing-card";
import { SquareMetrePrice } from "@/components/catalog/square-metre-price";
import {
  filterHplCards,
  hplColorTokenLabel,
  hplHubHref,
  hplLineLabel,
  hplLineOrder,
  type HplCard,
  type HplHubQuery,
} from "@/lib/catalog/hpl-hub";
import type { ListingCardModel } from "@/lib/catalog/listing";
import { pricePerSquareMetre } from "@/lib/catalog/square-metre";
import { colorFamilies, colorFamilyLabels } from "@/lib/catalog/types";
import { cn } from "@/lib/utils";

function toggle(list: string[], value: string) {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

function Chip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "true" : undefined}
      className={cn(
        "inline-flex h-10 min-h-10 items-center gap-2 border px-3 font-mono text-[13px] no-underline hover:no-underline",
        active ? "border-kg-navy bg-kg-navy text-kg-kalk" : "border-kg-lijn bg-white text-kg-navy hover:bg-kg-kalk",
      )}
    >
      {children}
    </Link>
  );
}

function lineChoices(cards: HplCard[]) {
  const rank = new Map<string, number>(hplLineOrder.map((id, index) => [id, index]));
  const ids = [...new Set(cards.map((card) => card.line))];
  return ids.sort((a, b) => (rank.get(a) ?? 99) - (rank.get(b) ?? 99) || a.localeCompare(b, "nl"));
}

function familyChoices(cards: HplCard[]) {
  const present = new Set(cards.map((card) => card.family));
  return colorFamilies.filter((family) => present.has(family));
}

export function HplHub({
  plates,
  related,
  query,
  basePath,
}: {
  plates: HplCard[];
  related: ListingCardModel[];
  query: HplHubQuery;
  basePath: string;
}) {
  const showRelatedTab = related.length > 0;
  const onPlates = query.onderdeel !== "overig";
  const visible = onPlates ? filterHplCards(plates, query) : [];
  const lines = lineChoices(plates);
  const families = familyChoices(plates);
  const decorCount = plates.filter((card) => card.afwerking === "decor").length;
  const ralCount = plates.filter((card) => card.afwerking === "ral").length;
  const showAfwerking = decorCount > 0 && ralCount > 0;
  const filtered = Boolean(query.colors.length || query.lines.length || query.afwerking);
  const clearHref = hplHubHref(basePath, { colors: [], lines: [], onderdeel: "platen" });

  return (
    <div className="bg-kg-kalk">
      <div className="container-kg py-10 sm:py-12">
        <p className="font-mono text-[13px] text-kg-text-2">Assortiment</p>
        <h1 className="display-plp mt-2 max-w-3xl">{onPlates ? "HPL plaat op kleur" : "Sandwich en reiniger"}</h1>
        <p className="mt-4 max-w-2xl text-kg-text-2">
          {onPlates
            ? "Compact Exterieur, Renolit eenzijdig en Milyt. Hele plaat, 3050 × 1300 × 6 mm, 3,965 m². U kiest een kleur of een decor. Wij zagen niet op maat."
            : "Sandwichpanelen, HPL-reiniger en de Milyt-plaat van 2 mm. De kleurwand is de plaat van 6 mm."}
        </p>
        <p className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
          <Link href="/staalaanvraag?groep=hpl">Gratis kleurstalen aanvragen</Link>
          <Link href="/hpl-platen">Lijst met filters</Link>
        </p>

        {showRelatedTab ? (
          <div className="mt-8 flex flex-wrap gap-2" role="tablist" aria-label="HPL assortiment">
            <Chip href={hplHubHref(basePath, { ...query, onderdeel: "platen" })} active={onPlates}>
              Platen 6 mm
            </Chip>
            <Chip
              href={hplHubHref(basePath, { colors: [], lines: [], onderdeel: "overig" })}
              active={!onPlates}
            >
              Sandwich en reiniger
            </Chip>
          </div>
        ) : null}

        {onPlates ? (
          <>
            {lines.length > 1 ? (
              <FilterRow title="Lijn">
                {lines.map((id) => {
                  const active = query.lines.includes(id);
                  const count = plates.filter((card) => card.line === id).length;
                  return (
                    <Chip
                      key={id}
                      href={hplHubHref(basePath, { ...query, onderdeel: "platen", lines: toggle(query.lines, id) })}
                      active={active}
                    >
                      {hplLineLabel(id)}
                      <span className={active ? "text-kg-kalk" : "text-kg-text-2"}>{count}</span>
                    </Chip>
                  );
                })}
              </FilterRow>
            ) : null}

            {showAfwerking ? (
              <FilterRow title="Afwerking">
                <Chip
                  href={hplHubHref(basePath, {
                    ...query,
                    onderdeel: "platen",
                    afwerking: query.afwerking === "ral" ? undefined : "ral",
                  })}
                  active={query.afwerking === "ral"}
                >
                  RAL
                  <span className={query.afwerking === "ral" ? "text-kg-kalk" : "text-kg-text-2"}>{ralCount}</span>
                </Chip>
                <Chip
                  href={hplHubHref(basePath, {
                    ...query,
                    onderdeel: "platen",
                    afwerking: query.afwerking === "decor" ? undefined : "decor",
                  })}
                  active={query.afwerking === "decor"}
                >
                  Decor
                  <span className={query.afwerking === "decor" ? "text-kg-kalk" : "text-kg-text-2"}>{decorCount}</span>
                </Chip>
              </FilterRow>
            ) : null}

            {families.length > 1 ? (
              <FilterRow title="Kleur">
                {families.map((family) => {
                  const active = query.colors.includes(family);
                  const sample = plates.find((card) => card.family === family);
                  return (
                    <Chip
                      key={family}
                      href={hplHubHref(basePath, {
                        ...query,
                        onderdeel: "platen",
                        colors: toggle(query.colors, family),
                      })}
                      active={active}
                    >
                      <ColourSwatch
                        name={colorFamilyLabels[family]}
                        hex={sample?.hex ?? "#C5C1B8"}
                        family={family}
                        size={16}
                      />
                      {colorFamilyLabels[family]}
                    </Chip>
                  );
                })}
                {query.colors
                  .filter((token) => !(colorFamilies as readonly string[]).includes(token))
                  .map((token) => (
                    <Chip
                      key={token}
                      href={hplHubHref(basePath, {
                        ...query,
                        onderdeel: "platen",
                        colors: toggle(query.colors, token),
                      })}
                      active
                    >
                      {hplColorTokenLabel(token)}
                    </Chip>
                  ))}
              </FilterRow>
            ) : null}

            {filtered ? (
              <p className="mt-4">
                <Link href={clearHref}>Wis filters</Link>
              </p>
            ) : null}

            <p className="mt-6 font-mono text-[14px] text-kg-text-2">
              {visible.length === 0
                ? plates.length === 0
                  ? "Geen platen"
                  : "Geen plaat met deze filters."
                : `${visible.length} ${visible.length === 1 ? "kleur" : "kleuren"}`}
            </p>

            {visible.length === 0 ? (
              <p className="kg-soft-card mt-4 px-6 py-12 text-center text-kg-text-2">
                {plates.length === 0
                  ? "De HPL platen komen uit de shopcollectie. Een plaat is 3050 × 1300 × 6 mm, hele plaat, 3,965 m²."
                  : "Geen plaat met deze filters."}
              </p>
            ) : (
              <ul className="mt-4 grid list-none grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {visible.map((card) => (
                  <li key={card.key}>
                    <HplColorCard card={card} />
                  </li>
                ))}
              </ul>
            )}
          </>
        ) : (
          <div className="mt-8 grid gap-3 lg:grid-cols-2">
            {related.map((card) => (
              <ListingCard key={card.slug} card={card} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FilterRow({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-6">
      <p className="font-mono text-[13px] text-kg-navy">{title}</p>
      <div className="mt-2 flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function HplColorCard({ card }: { card: HplCard }) {
  const priced = card.price > 0;
  const perM2 = pricePerSquareMetre({
    priceIncl: card.price,
    sheetM2: card.sheetM2,
  });
  return (
    <article className="kg-soft-card flex h-full flex-col p-3">
      <Link href={card.href} className="block text-inherit no-underline hover:no-underline">
        <ProductPhoto
          image={card.image}
          alt={`${card.colorName}, ${card.lineLabel}`}
          sizes="(min-width: 1024px) 240px, (min-width: 640px) 30vw, 50vw"
          fallback={card.hex}
          className="aspect-square"
          imageClassName="p-1"
        />
      </Link>
      <p className="mt-3 font-mono text-[12px] text-kg-text-2">{card.lineLabel}</p>
      <h2 className="mt-1 text-[16px] leading-snug font-medium">
        <Link href={card.href} className="text-inherit no-underline hover:no-underline">
          <ColourName value={card.colorName} />
        </Link>
      </h2>
      {card.ral ? <p className="mt-1 font-mono text-[12px] text-kg-text-2">{card.ral}</p> : null}
      <p className="mt-auto pt-3 text-right font-mono text-[14px]">
        {priced ? (
          <>
            <VatPrice incl={card.price} suffix=" /plaat" />
            <SquareMetrePrice incl={perM2} />
          </>
        ) : (
          "Prijs op aanvraag"
        )}
      </p>
    </article>
  );
}
