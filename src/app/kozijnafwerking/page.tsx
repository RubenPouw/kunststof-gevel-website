import type { Metadata } from "next";

import { CategoryListing } from "@/components/catalog/category-listing";
import { categoryPageMetadata } from "@/data/seo/categories";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  return categoryPageMetadata("kozijnafwerking", searchParams);
}

export default function KozijnafwerkingPage({ searchParams }: Props) {
  return <CategoryListing slug="kozijnafwerking" searchParams={searchParams} />;
}
