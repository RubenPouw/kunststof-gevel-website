import { CategoryListing } from "@/components/catalog/category-listing";
import { categoryRouteMetadata } from "@/data/seo/categories";

export const revalidate = 3600;

export function generateMetadata() {
  return categoryRouteMetadata("vensterbanken");
}

export default function VensterbankenPage() {
  return <CategoryListing slug="vensterbanken" filters={{}} page={1} />;
}
