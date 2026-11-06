import { CategoryListing } from "@/components/catalog/category-listing";
import { categoryRouteMetadata } from "@/data/seo/categories";

export const revalidate = 3600;

export function generateMetadata() {
  return categoryRouteMetadata("plafondpanelen");
}

export default function PlafondpanelenPage() {
  return <CategoryListing slug="plafondpanelen" filters={{}} page={1} />;
}
