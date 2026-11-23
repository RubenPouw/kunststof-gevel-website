import Link from "next/link";

import { BrandHero } from "@/components/catalog/brand-hero";
import { ColourSwatch } from "@/components/catalog/colour-swatch";
import { GuaranteeBand } from "@/components/catalog/guarantee-band";
import { ProductListing } from "@/components/catalog/product-listing";
import { SeoArticle } from "@/components/seo/article";
import { getBrandStory } from "@/data/seo/brands";
import { getBrand, getProductsByBrand } from "@/lib/catalog";
import { ZIERER_MANUAL } from "@/lib/catalog/manuals";
import { DEFAULT_PRESENTATION, prepareListing, type ListingPresentation } from "@/lib/catalog/listing";
import type { ListingFilters, ProductColor } from "@/lib/catalog/types";
import { site } from "@/lib/site";

function brandColours(colors: ProductColor[]) {
  const seen = new Set<string>();
  const list: ProductColor[] = [];
  for (const color of colors) {
    if (/^standaard$/i.test(color.name) || seen.has(color.name)) continue;
    seen.add(color.name);
    list.push(color);
  }
  return list;
}

export async function BrandListing({
  slug,
  filters,
  page,
  presentation = DEFAULT_PRESENTATION,
}: {
  slug: string;
  filters: ListingFilters;
  page: number;
  presentation?: ListingPresentation;
}) {
  const brand = await getBrand(slug);
  if (!brand) return null;
  const story = getBrandStory(brand.slug);
  const all = await getProductsByBrand(brand.slug);
  const view = prepareListing(all, filters, page, undefined, presentation.sort);

  const colours = brandColours(all.flatMap((product) => product.colors));

  return (
    <div className="bg-kg-kalk pb-8">
      <BrandHero brand={brand} intro={story?.lead ?? brand.summary} heading={story?.heading} />
      <div className="container-kg">
        {story?.profiles?.length ? (
          <nav className="mb-8 grid grid-cols-2 gap-px border border-kg-lijn bg-kg-lijn lg:grid-cols-4" aria-label={`${brand.name} profielen`}>
            {story.profiles.map((tile) => (
              <Link
                key={tile.href}
                href={tile.href}
                className="bg-white p-4 text-inherit no-underline hover:bg-kg-kalk hover:no-underline"
              >
                <p className="text-[18px] font-bold tracking-[-0.02em] text-kg-navy">{tile.label}</p>
                <p className="mt-1 font-mono text-[13px] text-kg-text-2">{tile.detail}</p>
              </Link>
            ))}
          </nav>
        ) : null}
        {slug === "zierer" ? (
          <p className="mb-6 text-[15px]">
            <Link href={ZIERER_MANUAL.href}>{ZIERER_MANUAL.label} (PDF)</Link>
          </p>
        ) : null}
        <ProductListing
          cards={view.cards}
          total={view.total}
          totalUnfiltered={view.totalUnfiltered}
          facets={view.facets}
          page={view.page}
          pageSize={view.pageSize}
          basePath={`/merken/${brand.slug}`}
          filters={filters}
          view={presentation.view}
          sort={presentation.sort}
          emptyMessage={
            all.length === 0
              ? (
                  <>
                    {brand.name} staat nu niet in de webshopvoorraad. Bel <a href={site.phoneHref}>{site.phone}</a> of
                    vraag een offerte, dan kijken we of we het kunnen leveren.
                  </>
                )
              : undefined
          }
        />
        {colours.length > 0 && story?.profiles?.length ? (
          <section className="mt-10 border-t border-kg-lijn pt-8" aria-labelledby="merk-kleuren">
            <h2 id="merk-kleuren" className="text-[22px] font-bold tracking-[-0.03em]">
              Kleuren
            </h2>
            <ul className="mt-4 flex flex-wrap gap-4">
              {colours.map((color) => (
                <li key={color.name} className="flex items-center gap-2">
                  <ColourSwatch name={color.name} hex={color.hex} family={color.family} />
                  <span className="text-[14px]">
                    {color.name}
                    {color.ral ? <span className="mt-0.5 block font-mono text-[12px] text-kg-text-2">{color.ral}</span> : null}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
      {story ? <SeoArticle sections={story.sections} faqs={story.faqs} links={story.links} /> : null}
      <GuaranteeBand />
    </div>
  );
}
