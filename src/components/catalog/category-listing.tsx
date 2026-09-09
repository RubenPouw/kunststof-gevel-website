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
  const category = getCategory(slug);
  if (!category) return null;
  const filters = parseListingSearchParams(await searchParams);
  const all = getProductsByCategory(slug);
  const products = applyListingFilters(all, filters);

  return (
    <CategoryPage
      kicker="Assortiment"
      title={category.name}
      intro={category.summary}
      products={products}
      brandOptions={brandsInProducts(all)}
      basePath={`/${slug}`}
      activeBrand={filters.brandSlug}
      inStockOnly={filters.inStockOnly}
    />
  );
}
