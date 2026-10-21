import { CategoryPage } from "@/components/catalog/category-page";
import { SeoArticle } from "@/components/seo/article";
import { getCategoryStory } from "@/data/seo/categories";
import { site } from "@/lib/site";
import {
  applyListingFilters,
  brandsInProducts,
  getCategory,
  getProductsByCategory,
  parseListingSearchParams,
  type CategorySlug,
} from "@/lib/catalog";

export async function CategoryListing({
  slug,
  searchParams,
}: {
  slug: CategorySlug;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const category = await getCategory(slug);
  if (!category) return null;
  const filters = parseListingSearchParams(await searchParams);
  const all = await getProductsByCategory(slug);
  const products = applyListingFilters(all, filters);

  const story = getCategoryStory(slug);

  return (
    <>
      <CategoryPage
        kicker="Assortiment"
        title={category.name}
        intro={category.summary}
        products={products}
        allProducts={all}
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
