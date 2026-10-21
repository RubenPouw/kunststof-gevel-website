import { CategoryListing } from "@/components/catalog/category-listing";
import { categoryRouteMetadata } from "@/data/seo/categories";

export const revalidate = 3600;

export function generateMetadata() {
  return categoryRouteMetadata("montage");
}

export default function MontagePage() {
  return <CategoryListing slug="montage" filters={{}} page={1} />;
}
