import type { Metadata } from "next";

import { CategoryListing } from "@/components/catalog/category-listing";
import { categoryPageMetadata } from "@/data/seo/categories";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  return categoryPageMetadata("montage", searchParams);
}

export default function MontagePage({ searchParams }: Props) {
  return <CategoryListing slug="montage" searchParams={searchParams} />;
}
