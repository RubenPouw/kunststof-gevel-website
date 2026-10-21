import { CategoryListing } from "@/components/catalog/category-listing";
import { categoryRouteMetadata } from "@/data/seo/categories";

export const revalidate = 3600;

export function generateMetadata() {
  return categoryRouteMetadata("dakranden");
}

export default function DakrandenPage() {
  return <CategoryListing slug="dakranden" filters={{}} page={1} />;
}
