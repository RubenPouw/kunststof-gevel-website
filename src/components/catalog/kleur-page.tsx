import Link from "next/link";

import { ColourSwatch } from "@/components/catalog/colour-swatch";
import { ListingCard } from "@/components/catalog/listing-card";
import { JsonLd } from "@/components/seo/json-ld";
import { listProducts } from "@/lib/catalog";
import { slugKey } from "@/lib/catalog/derive";
import { toListingCard } from "@/lib/catalog/listing";
import { resolveColour } from "@/lib/catalog/colours";
import type { Product } from "@/lib/catalog/types";
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

function tokenHit(key: string, nameSlug: string) {
  const parts = key.split("-").filter(Boolean);
  const wanted = nameSlug.split("-").filter(Boolean);
  if (!wanted.length) return false;
  for (let i = 0; i <= parts.length - wanted.length; i += 1) {
    if (wanted.every((part, index) => parts[i + index] === part)) return true;
  }
  return false;
}

function matchesKleur(colorName: string, ral: string | undefined, slug: string, loose = false) {
  const wantedRal = slug.match(/ral-(\d{4})/i)?.[1];
  const nameSlug = slug.replace(/-ral-\d{4}$/i, "");
  const key = slugKey(colorName);
  const digits = ral?.replace(/\D/g, "");
  if (wantedRal) return digits === wantedRal && (key === nameSlug || key.includes(nameSlug) || nameSlug.includes(key));
  if (key === nameSlug) return true;
  return loose && tokenHit(key, nameSlug);
}

export async function KleurPage({
  slug,
  brandSlug,
  brandLabel,
  parentHref,
  parentLabel,
  canonical,
  heading,
  intro,
  loose = false,
  productFilter,
}: {
  slug: string;
  brandSlug?: string;
  brandLabel: string;
  parentHref: string;
  parentLabel: string;
  canonical: string;
  heading?: string;
  intro?: string;
  loose?: boolean;
  productFilter?: (product: Product) => boolean;
}) {
  const label = kleurLabel(slug);
  const colour = resolveColour(label);
  const products = (await listProducts()).filter((product) => {
    if (productFilter && !productFilter(product)) return false;
    if (brandSlug && product.brandSlug !== brandSlug) return false;
    return product.colors.some((color) => matchesKleur(color.name, color.ral, slug, loose));
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
          <h1 className="display-plp">{heading ?? label}</h1>
        </div>
        <p className="mt-4 max-w-2xl text-kg-text-2">
          {intro ??
            `${brandLabel}. Artikelen in deze kleur uit het assortiment. Een staal legt u buiten tegen de gevel, niet alleen op een scherm.`}
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
