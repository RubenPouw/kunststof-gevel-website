import { CategoryListing } from "@/components/catalog/category-listing";
import { categoryRouteMetadata } from "@/data/seo/categories";

export const revalidate = 3600;

export function generateMetadata() {
  return categoryRouteMetadata("gevelbekleding");
}

export default function GevelbekledingPage() {
  return <CategoryListing slug="gevelbekleding" filters={{}} page={1} />;
}
