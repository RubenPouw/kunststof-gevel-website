import { CategoryListing } from "@/components/catalog/category-listing";
import { categoryRouteMetadata } from "@/data/seo/categories";

export const revalidate = 3600;

export function generateMetadata() {
  return categoryRouteMetadata("kozijnafwerking");
}

export default function KozijnafwerkingPage() {
  return <CategoryListing slug="kozijnafwerking" filters={{}} page={1} />;
}
