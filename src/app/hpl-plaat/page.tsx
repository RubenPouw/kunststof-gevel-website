import { CategoryListing } from "@/components/catalog/category-listing";
import { categoryRouteMetadata } from "@/data/seo/categories";
import { hasHplHubFilters, parseHplHubSearch } from "@/lib/catalog/hpl-hub";

export const revalidate = 3600;

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ searchParams }: Props) {
  const query = parseHplHubSearch(await searchParams);
  const base = await categoryRouteMetadata("hpl-platen");
  if (hasHplHubFilters(query)) return { ...base, robots: { index: false, follow: true } };
  return base;
}

export default function Page({ searchParams }: Props) {
  return <CategoryListing slug="hpl-platen" filters={{}} page={1} searchParams={searchParams} />;
}
