import { CategoryListing } from "@/components/catalog/category-listing";
import { categoryRouteMetadata } from "@/data/seo/categories";

export const revalidate = 3600;

export function generateMetadata() {
  return categoryRouteMetadata("hpl-platen");
}

export default function HplPlatenPage() {
  return <CategoryListing slug="hpl-platen" filters={{}} page={1} />;
}
