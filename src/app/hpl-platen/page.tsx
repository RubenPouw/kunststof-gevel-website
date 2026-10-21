import type { Metadata } from "next";

import { CategoryListing } from "@/components/catalog/category-listing";
import { categoryPageMetadata } from "@/data/seo/categories";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  return categoryPageMetadata("hpl-platen", searchParams);
}

export default function HplPlatenPage({ searchParams }: Props) {
  return <CategoryListing slug="hpl-platen" searchParams={searchParams} />;
}
