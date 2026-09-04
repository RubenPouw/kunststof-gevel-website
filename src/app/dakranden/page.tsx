import type { Metadata } from "next";

import { CategoryPage } from "@/components/catalog/category-page";
import { getCategory, getProductsByCategory } from "@/lib/catalog";

const category = getCategory("dakranden")!;

export const metadata: Metadata = {
  title: category.name,
  description: category.summary,
};

export default function DakrandenPage() {
  return (
    <CategoryPage
      kicker="Assortiment"
      title={category.name}
      intro={category.summary}
      products={getProductsByCategory("dakranden")}
    />
  );
}
