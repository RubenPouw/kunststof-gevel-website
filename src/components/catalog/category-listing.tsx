import { CategoryPage } from "@/components/catalog/category-page";
import { SeoArticle } from "@/components/seo/article";
import { getCategoryStory } from "@/data/seo/categories";
import { site } from "@/lib/site";
import { brandsInProducts, getCategory, getProductsByCategory, type CategorySlug } from "@/lib/catalog";
import { prepareListing } from "@/lib/catalog/listing";
import type { ListingFilters } from "@/lib/catalog/types";

export async function CategoryListing({
  slug,
  filters,
  page,
}: {
  slug: CategorySlug;
  filters: ListingFilters;
  page: number;
}) {
  const category = await getCategory(slug);
  if (!category) return null;
  const all = await getProductsByCategory(slug);
  const view = prepareListing(all, filters, page);
  const story = getCategoryStory(slug);

  return (
    <>
      <CategoryPage
        kicker="Assortiment"
        title={category.name}
        intro={category.summary}
        cards={view.cards}
        total={view.total}
        totalUnfiltered={view.totalUnfiltered}
        facets={view.facets}
        page={view.page}
        pageSize={view.pageSize}
        brandOptions={await brandsInProducts(all)}
        basePath={`/${slug}`}
        filters={filters}
        sheetCalculator={slug === "hpl-platen"}
        emptyMessage={
          slug === "hpl-platen" && all.length === 0
            ? `De HPL platen komen uit de shopcollectie. Ziet u ze nog niet, bel ${site.phone}. Een plaat is 3050 × 1300 × 6 mm, hele plaat, 3,965 m².`
            : undefined
        }
      />
      {story ? <SeoArticle sections={story.sections} faqs={story.faqs} links={story.links} /> : null}
    </>
  );
}
