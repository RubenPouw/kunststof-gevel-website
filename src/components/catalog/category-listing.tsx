import { CategoryPage } from "@/components/catalog/category-page";
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

  return (
    <CategoryPage
      kicker="Assortiment"
      title={category.name}
      intro={category.summary}
      products={products}
      allProducts={all}
      brandOptions={await brandsInProducts(all)}
      basePath={`/${slug}`}
      filters={filters}
    />
  );
}
