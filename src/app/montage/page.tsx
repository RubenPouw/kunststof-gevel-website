import type { Metadata } from "next";

import { CategoryListing } from "@/components/catalog/category-listing";
import { categoryMetadata } from "@/data/seo/categories";

export const metadata: Metadata = categoryMetadata("montage");

export default function MontagePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <CategoryListing slug="montage" searchParams={searchParams} />;
}
