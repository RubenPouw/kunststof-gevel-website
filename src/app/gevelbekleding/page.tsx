import type { Metadata } from "next";

import { CategoryListing } from "@/components/catalog/category-listing";
import { categoryMetadata } from "@/data/seo/categories";

export const metadata: Metadata = categoryMetadata("gevelbekleding");

export default function GevelbekledingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <CategoryListing slug="gevelbekleding" searchParams={searchParams} />;
}
