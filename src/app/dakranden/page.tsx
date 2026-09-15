import type { Metadata } from "next";

import { CategoryListing } from "@/components/catalog/category-listing";
import { getStaticCategory } from "@/lib/catalog/static";

const category = getStaticCategory("dakranden")!;

export const metadata: Metadata = {
  title: category.name,
  description: category.summary,
};

export default function DakrandenPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <CategoryListing slug="dakranden" searchParams={searchParams} />;
}
