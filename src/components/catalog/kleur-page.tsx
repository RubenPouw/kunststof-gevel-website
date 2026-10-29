import Link from "next/link";

import { ColourSwatch } from "@/components/catalog/colour-swatch";
import { ListingCard } from "@/components/catalog/listing-card";
import { JsonLd } from "@/components/seo/json-ld";
import { listProducts } from "@/lib/catalog";
import { slugKey } from "@/lib/catalog/derive";
import { toListingCard } from "@/lib/catalog/listing";
import { resolveColour } from "@/lib/catalog/colours";
import { breadcrumbJsonLd } from "@/lib/seo/schema";
import { site } from "@/lib/site";

export function kleurLabel(slug: string) {
  const ral = slug.match(/ral-(\d{4})/i);
  const name = slug
    .replace(/-ral-\d{4}$/i, "")
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
  return ral ? `${name} RAL ${ral[1]}` : name;
}

function matchesKleur(colorName: string, ral: string | undefined, slug: string) {
  const wantedRal = slug.match(/ral-(\d{4})/i)?.[1];
  const nameSlug = slug.replace(/-ral-\d{4}$/i, "");
  const key = slugKey(colorName);
  const digits = ral?.replace(/\D/g, "");
  if (wantedRal) return digits === wantedRal && (key === nameSlug || key.includes(nameSlug) || nameSlug.includes(key));
  return key === nameSlug;
}

export async function KleurPage({
  slug,
  brandSlug,
  brandLabel,
  parentHref,
  parentLabel,
  canonical,
}: {
  slug: string;
  brandSlug?: string;
  brandLabel: string;
  parentHref: string;
  parentLabel: string;
  canonical: string;
}) {
  const label = kleurLabel(slug);
  const colour = resolveColour(label);
  const products = (await listProducts()).filter((product) => {
    if (brandSlug && product.brandSlug !== brandSlug) return false;
    return product.colors.some((color) => matchesKleur(color.name, color.ral, slug));
  });
  const cards = products.map(toListingCard);

  return (
    <div className="bg-kg-kalk">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: parentLabel, path: parentHref },
          { name: label, path: canonical },
        ])}
      />
      <div className="container-kg py-10 sm:py-12">
        <p className="font-mono text-[13px] text-kg-text-2">
          <Link href={parentHref}>{parentLabel}</Link>
        </p>
        <div className="mt-4 flex items-center gap-3">
          <ColourSwatch name={label} hex={colour.hex} family={colour.family} size={36} />
          <h1 className="display-plp">{label}</h1>
        </div>
        <p className="mt-4 max-w-2xl text-kg-text-2">
          {brandLabel}. Artikelen in deze kleur uit het assortiment. Een staal legt u buiten tegen de gevel, niet alleen
          op een scherm.
        </p>
        <p className="mt-4">
          <Link href="/stalen">Gratis kleurstalen aanvragen</Link>
        </p>
        {cards.length === 0 ? (
          <p className="kg-soft-card mt-8 px-6 py-12 text-center text-kg-text-2">
            Geen artikel in deze kleur in de shopcollectie. Bel {site.phone}.
          </p>
        ) : (
          <ul className="mt-8 grid list-none gap-3 lg:grid-cols-2">
            {cards.map((card) => (
              <li key={card.slug}>
                <ListingCard card={card} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export function kleurMetadata(label: string, canonical: string) {
  return {
    title: label,
    description: `${label}. Artikelen in deze kleur, met een kleurstaal op aanvraag.`,
    alternates: { canonical },
  };
}
