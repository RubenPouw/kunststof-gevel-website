import type { Metadata } from "next";

import { CategoryListing } from "@/components/catalog/category-listing";
import { getCategory } from "@/lib/catalog";

const category = getCategory("gevelbekleding")!;

export const metadata: Metadata = {
  title: category.name,
  description: category.summary,
};

export default function GevelbekledingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <CategoryListing slug="gevelbekleding" searchParams={searchParams} />;
}
