import Link from "next/link";

import { CategoryPage } from "@/components/catalog/category-page";
import { KozijnPassenBlock } from "@/components/kozijn-passen-block";
import { JsonLd } from "@/components/seo/json-ld";
import { SeoArticle } from "@/components/seo/article";
import { categoryPageSeo, categoryPath } from "@/data/seo/category-pages";
import type { SeoFaq, SeoLink, SeoSection } from "@/data/seo/brands";
import { getCategoryStory } from "@/data/seo/categories";
import { site } from "@/lib/site";
import { brandsInProducts, getCategory, getProductsByCategory, type CategorySlug } from "@/lib/catalog";
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
}: {
  slug: CategorySlug;
  filters: ListingFilters;
  page: number;
  presentation?: ListingPresentation;
  heading?: { h1: string; path: string; description: string; intro: string };
  article?: { sections: SeoSection[]; faqs: SeoFaq[]; links: SeoLink[] };
}) {
  const category = await getCategory(slug);
  if (!category) return null;
  const all = await getProductsByCategory(slug);
  const view = prepareListing(all, filters, page, CATEGORY_PAGE_SIZE, presentation.sort);
  const story = article ?? getCategoryStory(slug);
  const seo = categoryPageSeo[slug];
  const path = heading?.path ?? categoryPath(slug);
  const h1 = heading?.h1 ?? seo.h1;
  const description = heading?.description ?? seo.description;
  const staalGroep = categoryStaalGroup(slug);

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: h1, path },
        ])}
      />
      <JsonLd data={collectionPageJsonLd({ name: h1, description, path })} />
      <CategoryPage
        kicker="Assortiment"
        title={h1}
        intro={heading?.intro ?? category.summary}
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
        sheetCalculator={slug === "hpl-platen"}
        sampleHref={staalGroep ? `/staalaanvraag?groep=${staalGroep}` : undefined}
        belowIntro={
          slug === "hpl-platen" ? (
            <p className="mt-4">
              <Link href="/hpl-plaat">Kleur en structuur</Link>
            </p>
          ) : slug === "montage" && (filters.brandSlug === "zierer" || filters.brandSlugs?.includes("zierer")) ? (
            <p className="mt-4">
              <Link href={ZIERER_MANUAL.href}>{ZIERER_MANUAL.label} (PDF)</Link>
            </p>
          ) : null
        }
        emptyMessage={
          slug === "hpl-platen" && all.length === 0
            ? (
                <>
                  De HPL platen komen uit de shopcollectie. Ziet u ze nog niet, bel{" "}
                  <a href={site.phoneHref}>{site.phone}</a>. Een plaat is 3050 × 1300 × 6 mm, hele plaat, 3,965 m².
                </>
              )
            : undefined
        }
      />
      {slug === "gevelbekleding" ? <KozijnPassenBlock /> : null}
      {story ? <SeoArticle sections={story.sections} faqs={story.faqs} links={story.links} /> : null}
    </>
  );
}
