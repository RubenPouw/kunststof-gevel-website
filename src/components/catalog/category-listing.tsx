import Link from "next/link";

import { CategoryBrandStrip } from "@/components/catalog/category-brand-strip";
import { CategoryPage } from "@/components/catalog/category-page";
import { HplHubPage } from "@/components/catalog/hpl-hub-page";
import { KozijnPassenBlock } from "@/components/kozijn-passen-block";
import { JsonLd } from "@/components/seo/json-ld";
import { SeoArticle } from "@/components/seo/article";
import { ReviewBar } from "@/components/reviews/review-bar";
import { categoryPageSeo, categoryPath } from "@/data/seo/category-pages";
import type { SeoFaq, SeoLink, SeoSection } from "@/data/seo/brands";
import { getCategoryStory } from "@/data/seo/categories";
import { brandsInProducts, getCategory, getProductsByCategory, type CategorySlug } from "@/lib/catalog";
import { selectedBrands } from "@/lib/catalog/helpers";
import { CATEGORY_PAGE_SIZE, DEFAULT_PRESENTATION, prepareListing, type ListingPresentation } from "@/lib/catalog/listing";
import { breadcrumbJsonLd, collectionPageJsonLd } from "@/lib/seo/schema";
import { ZIERER_MANUAL } from "@/lib/catalog/manuals";
import { categoryStaalGroup } from "@/lib/staal/tree";
import type { ListingFilters } from "@/lib/catalog/types";

export async function CategoryListing({
  slug,
  filters,
  page,
  presentation = DEFAULT_PRESENTATION,
  heading,
  article,
  searchParams,
}: {
  slug: CategorySlug;
  filters: ListingFilters;
  page: number;
  presentation?: ListingPresentation;
  heading?: { h1: string; path: string; description: string; intro: string };
  article?: { sections: SeoSection[]; faqs: SeoFaq[]; links: SeoLink[] };
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const category = await getCategory(slug);
  if (!category) return null;
  const story = article ?? getCategoryStory(slug);
  const seo = categoryPageSeo[slug];
  const path = heading?.path ?? categoryPath(slug);
  const h1 = heading?.h1 ?? seo.h1;
  const description = heading?.description ?? seo.description;
  const intro = heading?.intro ?? category.summary;
  const staalGroep = categoryStaalGroup(slug);
  const sampleHref = staalGroep ? `/staalaanvraag?groep=${staalGroep}` : undefined;

  const schema = (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: h1, path },
        ])}
      />
      <JsonLd data={collectionPageJsonLd({ name: h1, description, path })} />
    </>
  );

  if (slug === "hpl-platen") {
    return (
      <>
        {schema}
        <div className="bg-kg-kalk">
          <div className="container-kg pt-10 pb-8 sm:pt-12 sm:pb-10">
            <p className="font-mono text-[13px] text-kg-text-2">Assortiment</p>
            <h1 className="display-plp mt-2 max-w-3xl">{h1}</h1>
            <p className="mt-4 max-w-2xl text-kg-text-2">{intro}</p>
            {sampleHref ? (
              <p className="mt-4">
                <Link href={sampleHref}>Gratis kleurstalen aanvragen</Link>
              </p>
            ) : null}
            <CategoryBrandStrip brands={await brandsInProducts(await getProductsByCategory("hpl-platen"))} />
          </div>
        </div>
        <HplHubPage
          basePath={path}
          searchParams={searchParams ?? Promise.resolve({})}
          embedded
        />
        <ReviewBar />
        {story ? (
          <SeoArticle sections={story.sections} faqs={story.faqs} links={story.links} faqAccordion />
        ) : null}
      </>
    );
  }

  const all = await getProductsByCategory(slug);
  const view = prepareListing(all, filters, page, CATEGORY_PAGE_SIZE, presentation.sort);

  return (
    <>
      {schema}
      <CategoryPage
        kicker="Assortiment"
        title={h1}
        intro={intro}
        cards={view.cards}
        total={view.total}
        totalUnfiltered={view.totalUnfiltered}
        facets={view.facets}
        page={view.page}
        pageSize={view.pageSize}
        brandOptions={await brandsInProducts(all)}
        basePath={path}
        filters={filters}
        presentation={presentation}
        showStockChip
        sampleHref={sampleHref}
        belowIntro={
          slug === "montage" && selectedBrands(filters)[0] === "zierer" ? (
            <p className="mt-4">
              <Link href={ZIERER_MANUAL.href}>{ZIERER_MANUAL.label} (PDF)</Link>
            </p>
          ) : null
        }
      />
      {slug === "gevelbekleding" ? <KozijnPassenBlock /> : null}
      {story ? <SeoArticle sections={story.sections} faqs={story.faqs} links={story.links} /> : null}
    </>
  );
}
