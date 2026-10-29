import { BrandHero } from "@/components/catalog/brand-hero";
import { GuaranteeBand } from "@/components/catalog/guarantee-band";
import { ProductListing } from "@/components/catalog/product-listing";
import { SeoArticle } from "@/components/seo/article";
import { JsonLd } from "@/components/seo/json-ld";
import { getBrandStory } from "@/data/seo/brands";
import { getBrand, getProductsByBrand } from "@/lib/catalog";
import { DEFAULT_PRESENTATION, prepareListing, type ListingPresentation } from "@/lib/catalog/listing";
import type { ListingFilters } from "@/lib/catalog/types";
import { breadcrumbJsonLd, collectionJsonLd } from "@/lib/seo/schema";
import { site } from "@/lib/site";

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
  const path = `/merken/${brand.slug}`;

  return (
    <div className="bg-kg-kalk pb-8">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Merken", path: "/merken" },
          { name: brand.name, path },
        ])}
      />
      <JsonLd
        data={collectionJsonLd(
          brand.name,
          path,
          view.cards.map((card) => ({ name: card.name, path: `/producten/${card.slug}` })),
        )}
      />
      <BrandHero brand={brand} intro={story?.lead ?? brand.summary} />
      <div className="container-kg">
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
              ? `${brand.name} staat nu niet in de webshopvoorraad. Bel ${site.phone} of vraag een offerte, dan kijken we of we het kunnen leveren.`
              : undefined
          }
        />
      </div>
      {story ? <SeoArticle sections={story.sections} faqs={story.faqs} links={story.links} /> : null}
      <GuaranteeBand />
    </div>
  );
}
