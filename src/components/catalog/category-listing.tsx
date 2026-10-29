import Link from "next/link";

import { CategoryPage } from "@/components/catalog/category-page";
import { SeoArticle } from "@/components/seo/article";
import { getCategoryStory } from "@/data/seo/categories";
import { site } from "@/lib/site";
import { brandsInProducts, getCategory, getProductsByCategory, type CategorySlug } from "@/lib/catalog";
import { CATEGORY_PAGE_SIZE, DEFAULT_PRESENTATION, prepareListing, type ListingPresentation } from "@/lib/catalog/listing";
import { categoryStaalGroup } from "@/lib/staal/tree";
import type { ListingFilters } from "@/lib/catalog/types";

export async function CategoryListing({
  slug,
  filters,
  page,
  presentation = DEFAULT_PRESENTATION,
}: {
  slug: CategorySlug;
  filters: ListingFilters;
  page: number;
  presentation?: ListingPresentation;
}) {
  const category = await getCategory(slug);
  if (!category) return null;
  const all = await getProductsByCategory(slug);
  const view = prepareListing(all, filters, page, CATEGORY_PAGE_SIZE, presentation.sort);
  const story = getCategoryStory(slug);
  const staalGroep = categoryStaalGroup(slug);

  return (
    <>
      <CategoryPage
        kicker="Assortiment"
        title={
          slug === "gevelbekleding"
            ? "Kunststof gevelbekleding"
            : slug === "dakranden"
              ? "Kunststof dakranden en boeidelen"
              : slug === "montage"
                ? "Montagemateriaal kunststof gevelbekleding"
                : category.name
        }
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
        presentation={presentation}
        showStockChip
        sheetCalculator={slug === "hpl-platen"}
        sampleHref={staalGroep ? `/staalaanvraag?groep=${staalGroep}` : undefined}
        belowIntro={
          slug === "hpl-platen" ? (
            <p className="mt-4">
              <Link href="/hpl-plaat">Kleur en structuur</Link>
            </p>
          ) : null
        }
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
