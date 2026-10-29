import { CategoryPage } from "@/components/catalog/category-page";
import { SeoArticle } from "@/components/seo/article";
import { getLandingStory, isLandingSlug } from "@/data/seo/landings";
import { brandsInProducts } from "@/lib/catalog";
import { productsForLanding } from "@/lib/catalog/landing-products";
import { CATEGORY_PAGE_SIZE, DEFAULT_PRESENTATION, prepareListing, type ListingPresentation } from "@/lib/catalog/listing";
import type { ListingFilters } from "@/lib/catalog/types";
import { KERALIT_CANONICAL } from "@/lib/seo/migratie";
import { site } from "@/lib/site";

export async function LandingListing({
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
  if (!isLandingSlug(slug)) return null;
  const story = getLandingStory(slug);
  if (!story) return null;
  const all = await productsForLanding(slug);
  const view = prepareListing(all, filters, page, CATEGORY_PAGE_SIZE, presentation.sort);

  return (
    <>
      <CategoryPage
        kicker={story.kicker}
        title={story.title}
        intro={story.intro}
        cards={view.cards}
        total={view.total}
        totalUnfiltered={view.totalUnfiltered}
        facets={view.facets}
        page={view.page}
        pageSize={view.pageSize}
        brandOptions={await brandsInProducts(all)}
        basePath={slug === "keralit-gevelbekleding" ? KERALIT_CANONICAL : `/${slug}`}
        filters={filters}
        presentation={presentation}
        showStockChip
        sampleHref={story.sampleHref}
        emptyMessage={
          all.length === 0
            ? `Deze artikelen komen uit de shopcollectie. Ziet u ze nog niet, bel ${site.phone}.`
            : undefined
        }
      />
      <SeoArticle sections={story.sections} faqs={story.faqs} links={story.links} />
    </>
  );
}
