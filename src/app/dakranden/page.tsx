import type { Metadata } from "next";

import { CategoryListing } from "@/components/catalog/category-listing";
import { categoryMetadata } from "@/data/seo/categories";

export const metadata: Metadata = categoryMetadata("dakranden");

export default function DakrandenPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <CategoryListing slug="dakranden" searchParams={searchParams} />;
}
