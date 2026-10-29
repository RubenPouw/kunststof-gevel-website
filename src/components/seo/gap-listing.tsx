import Link from "next/link";

import { AssortmentSlice } from "@/components/catalog/assortment-slice";
import { SeoArticle } from "@/components/seo/article";
import { JsonLd } from "@/components/seo/json-ld";
import type { SeoLink, SeoSection } from "@/data/seo/brands";
import { listProducts } from "@/lib/catalog";
import type { Product } from "@/lib/catalog/types";
import { breadcrumbJsonLd } from "@/lib/seo/schema";

type Gap = {
  path: string;
  title: string;
  h1: string;
  intro: string;
  kicker: string;
  parentHref: string;
  parentLabel: string;
  listing: boolean;
  match?: (product: Product) => boolean;
  sections?: SeoSection[];
  links?: SeoLink[];
};

const hplSheet =
  "Een plaat in de shop is 3050 × 1300 × 6 mm, 3,965 m², en gaat er heel uit. Wij zagen niet op maat.";

export const gapPages = {
  overzet: {
    path: "/overzet-vensterbank",
    title: "Overzet vensterbank",
    h1: "Overzet vensterbank",
    intro:
      "Een overzet vensterbank dekt een bestaande bank als de maat het toelaat. De diepte en de lengte staan op het artikel. Is de oude bank rot of sterk scheef, dan is overzetten geen goed idee.",
    kicker: "Vensterbank",
    parentHref: "/kunststof-vensterbank",
    parentLabel: "Vensterbanken",
    listing: true,
    match: (product) => /overzet/i.test(`${product.name} ${product.slug}`),
    links: [
      { href: "/kunststof-vensterbank", label: "Alle vensterbanken" },
      { href: "/blog/overzet-vensterbank-meten", label: "Meten en monteren" },
    ],
  },
  boeidelen: {
    path: "/boeidelen",
    title: "Kunststof boeidelen",
    h1: "Kunststof boeidelen",
    intro:
      "Boeideel, boeiboord en dakrandpaneel zijn hier dezelfde familie. De hoogte dekt de bestaande rand. Hoeken en eindprofielen horen bij hetzelfde merk.",
    kicker: "Dakrand",
    parentHref: "/dakranden",
    parentLabel: "Dakranden",
    listing: true,
    match: (product) => product.category === "dakranden" || /boei|dakrand/i.test(product.name),
    links: [
      { href: "/dakranden/keralit", label: "Keralit dakranden" },
      { href: "/dakranden", label: "Alle dakranden" },
    ],
  },
  boeiboord: {
    path: "/boeiboord",
    title: "Kunststof boeiboord",
    h1: "Kunststof boeiboord",
    intro:
      "Een boeiboord is de plank aan de dakrand. In deze shop bestelt u die als dakrandpaneel, met een montageprofiel dat bij het merk hoort. Het boeiboordmontageprofiel staat bij de Keralit dakranden als dat artikel in de collectie zit.",
    kicker: "Dakrand",
    parentHref: "/dakranden",
    parentLabel: "Dakranden",
    listing: true,
    match: (product) => /boeiboord|dakrand|boei/i.test(`${product.name} ${product.slug}`),
    links: [{ href: "/boeidelen", label: "Boeidelen" }],
  },
  schroten: {
    path: "/schroten",
    title: "Kunststof schroten",
    h1: "Kunststof schroten",
    intro:
      "Schroten uit de shopcollectie, waaronder vlakwerkende schroot en sponningschroot als die artikelen geladen zijn. De maat staat op het artikel, niet in deze inleiding.",
    kicker: "Plafond en wand",
    parentHref: "/kunststof-plafond",
    parentLabel: "Plafond",
    listing: true,
    match: (product) => /schroot/i.test(`${product.name} ${product.slug}`),
    links: [{ href: "/kunststof-plafond", label: "Plafondpanelen" }],
  },
  plafond: {
    path: "/kunststof-plafond",
    title: "Kunststof plafond",
    h1: "Kunststof plafond",
    intro:
      "Florence binnen- en buitenplafond, plafondplinten en plafondtegels, als ze in de shop staan. Een binnenpaneel is geen buitenpaneel. De maat staat op het artikel.",
    kicker: "Plafond",
    parentHref: "/merken/florence",
    parentLabel: "Florence",
    listing: true,
    match: (product) => /plafond|florence|wonderboard/i.test(`${product.name} ${product.slug} ${product.brandSlug}`),
    links: [
      { href: "/merken/florence", label: "Florence" },
      { href: "/badkamerplafond", label: "Badkamerplafond" },
    ],
  },
  badkamer: {
    path: "/badkamerplafond",
    title: "Kunststof badkamerplafond",
    h1: "Kunststof plafond voor de badkamer",
    intro:
      "Voor een badkamer hoort een binnenplafondpaneel, niet een buitenpaneel voor het overstek. Hier staan de binnenpanelen en tegels uit de shop. Buitenpanelen laat u in het plafondoverzicht.",
    kicker: "Plafond",
    parentHref: "/kunststof-plafond",
    parentLabel: "Plafond",
    listing: true,
    match: (product) => /binnenplafond|plafondtegel|wonderboard/i.test(`${product.name} ${product.slug}`),
    links: [{ href: "/merken/florence", label: "Florence binnenplafond" }],
  },
  hpl6: {
    path: "/hpl-plaat/6-mm",
    title: "HPL plaat 6 mm",
    h1: "HPL plaat 6 mm",
    intro: `De shop voert HPL als hele plaat van 6 mm. ${hplSheet}`,
    kicker: "HPL",
    parentHref: "/hpl-plaat",
    parentLabel: "HPL plaat",
    listing: true,
    match: (product) => product.category === "hpl-platen",
    links: [{ href: "/hpl-plaat", label: "Kleur en structuur" }],
  },
  hplBoei: {
    path: "/hpl-plaat/boeiboord",
    title: "HPL plaat voor boeiboord",
    h1: "HPL plaat voor een boeiboord",
    intro: `Een HPL plaat dekt een boeiboord als één vlak, zonder de naad van een rabat. ${hplSheet}`,
    kicker: "HPL",
    parentHref: "/hpl-plaat",
    parentLabel: "HPL plaat",
    listing: true,
    match: (product) => product.category === "hpl-platen",
    sections: [
      {
        heading: "Plaat, geen dakrandpaneel",
        paragraphs: [
          "Een Keralit of VinyPlus dakrandpaneel is een kliksysteem. Een HPL plaat schroeft of lijmt u op een geventileerd regelwerk. Achter de plaat moet lucht kunnen. Een plaat direct tegen nat hout sluit vocht in.",
        ],
      },
    ],
    links: [
      { href: "/boeiboord", label: "Kunststof boeiboord" },
      { href: "/blog/hpl-plaat", label: "HPL monteren" },
    ],
  },
  hplOverstek: {
    path: "/hpl-plaat/dakoverstek",
    title: "HPL plaat voor dakoverstek",
    h1: "HPL plaat voor een dakoverstek",
    intro: `Het overstek is een vlak plafond onder de dakrand. ${hplSheet} Voor een kant-en-klaar buitenplafond staat Florence apart.`,
    kicker: "HPL",
    parentHref: "/hpl-plaat",
    parentLabel: "HPL plaat",
    listing: true,
    match: (product) => product.category === "hpl-platen",
    links: [
      { href: "/kunststof-plafond", label: "Plafondpanelen" },
      { href: "/blog/hpl-plaat", label: "HPL monteren" },
    ],
  },
  hplGevel: {
    path: "/hpl-plaat/gevel",
    title: "HPL plaat voor de gevel",
    h1: "HPL plaat voor de gevel",
    intro: `HPL op de gevel is een vlakke plaat, geen rabat of sponning. ${hplSheet} De plaat hoort op een geventileerd regelwerk.`,
    kicker: "HPL",
    parentHref: "/hpl-plaat",
    parentLabel: "HPL plaat",
    listing: true,
    match: (product) => product.category === "hpl-platen",
    links: [
      { href: "/gevelbekleding", label: "Gevelpanelen" },
      { href: "/blog/hpl-plaat", label: "HPL of rabat" },
    ],
  },
  hplBalkon: {
    path: "/hpl-plaat/balkon",
    title: "HPL plaat voor balkon",
    h1: "HPL plaat voor een balkon",
    intro: `Een balkonafwerking met HPL is dezelfde hele plaat als op de gevel. ${hplSheet} De plaat hoort op een geventileerde achterconstructie.`,
    kicker: "HPL",
    parentHref: "/hpl-plaat",
    parentLabel: "HPL plaat",
    listing: true,
    match: (product) => product.category === "hpl-platen",
    links: [{ href: "/hpl-plaat/gevel", label: "HPL op de gevel" }],
  },
  trespa: {
    path: "/hpl-vs-trespa",
    title: "HPL of Trespa",
    h1: "HPL plaat, niet Trespa",
    intro:
      "In deze shop koopt u HPL als hele plaat van 6 mm. Trespa voeren wij niet.",
    kicker: "HPL",
    parentHref: "/hpl-plaat",
    parentLabel: "HPL plaat",
    listing: false,
    sections: [
      {
        heading: "Wat u hier wel bestelt",
        paragraphs: [
          `${hplSheet} De kleur kiest u op de HPL-pagina. Wij zagen niet op maat.`,
        ],
      },
    ],
    links: [{ href: "/hpl-plaat", label: "HPL plaat op kleur" }],
  },
} satisfies Record<string, Gap>;

export type GapId = keyof typeof gapPages;

export function gapPaths() {
  return Object.values(gapPages).map((page) => page.path);
}

export async function GapListing({ id }: { id: GapId }) {
  const page = gapPages[id];
  const products = page.listing && page.match ? (await listProducts()).filter(page.match) : [];
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: page.parentLabel, path: page.parentHref },
          { name: page.h1, path: page.path },
        ])}
      />
      {page.listing ? (
        <AssortmentSlice
          kicker={page.kicker}
          title={page.h1}
          intro={page.intro}
          products={products}
          basePath={page.path}
          parentHref={page.parentHref}
          parentLabel={page.parentLabel}
        />
      ) : (
        <header className="container-kg pt-10 pb-4">
          <p className="font-mono text-[13px] text-kg-text-2">
            <Link href={page.parentHref}>{page.parentLabel}</Link>
          </p>
          <h1 className="display-plp mt-2 max-w-3xl">{page.h1}</h1>
          <p className="mt-4 max-w-2xl text-kg-text-2">{page.intro}</p>
        </header>
      )}
      {"sections" in page && page.sections.length > 0 ? (
        <SeoArticle sections={page.sections} links={page.links ?? []} />
      ) : page.links && page.links.length > 0 ? (
        <p className="container-kg flex flex-wrap gap-4 pb-12">
          {page.links.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </p>
      ) : null}
    </>
  );
}

export function gapMetadata(id: GapId) {
  const page = gapPages[id];
  return {
    title: page.title,
    description: page.intro,
    alternates: { canonical: page.path },
  };
}
