import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CategoryPage } from "@/components/catalog/category-page";
import { brands, getBrand, getProductsByBrand } from "@/lib/catalog";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return brands.map((brand) => ({ slug: brand.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const brand = getBrand(slug);
  if (!brand) return { title: "Merk" };
  return { title: brand.name, description: brand.summary };
}

export default async function BrandPage({ params }: Props) {
  const { slug } = await params;
  const brand = getBrand(slug);
  if (!brand) notFound();
  return (
    <CategoryPage
      kicker="Merken"
      title={brand.name}
      intro={brand.summary}
      products={getProductsByBrand(brand.slug)}
    />
  );
}
