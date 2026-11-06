import type { Metadata } from "next";

import { CategoryListing } from "@/components/catalog/category-listing";
import { pageSeo } from "@/data/seo/category-pages";

export const revalidate = 3600;

const page = pageSeo.plafondBadkamer;

export const metadata: Metadata = {
  title: { absolute: page.title },
  description: page.description,
  alternates: { canonical: page.path },
};

export default function PlafondBadkamerPage() {
  return (
    <CategoryListing
      slug="plafondpanelen"
      filters={{ ceilingPlace: "binnen" }}
      page={1}
      heading={{ h1: page.h1, path: page.path, description: page.description, intro: page.description }}
    />
  );
}
