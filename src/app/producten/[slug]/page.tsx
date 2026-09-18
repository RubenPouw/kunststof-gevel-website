import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProductDetail } from "@/app/producten/[slug]/product-detail";
import { getCategory, getProduct, getRelatedProducts, listProducts } from "@/lib/catalog";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Product" };
  return {
    title: product.name,
    description: product.description,
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();
  const related = await getRelatedProducts(product);
  const category = await getCategory(product.category);
  const others = (await listProducts())
    .filter((item) => item.slug !== product.slug && item.category === product.category)
    .slice(0, 4);

  return (
    <ProductDetail
      product={product}
      related={related}
      others={others}
      categoryName={category?.name ?? product.category}
    />
  );
}
