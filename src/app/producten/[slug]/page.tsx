import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";

import { ProductDetail } from "@/app/producten/[slug]/product-detail";
import { ReviewScoreStrip } from "@/components/reviews/score-strip";
import { JsonLd } from "@/components/seo/json-ld";
import { getCategory, getProduct, getRelatedProducts, listProducts } from "@/lib/catalog";
import { breadcrumbJsonLd, productJsonLd, productMetaTitle } from "@/lib/seo/schema";
import { getReviewSnapshot } from "@/lib/reviews/read";
import { staalTarget } from "@/lib/staal/tree";

type Props = { params: Promise<{ slug: string }> };

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  const products = await listProducts();
  // A full Shopify copy is cached on the first request (revalidate). Baking
  // every product into the Render build kept that build from finishing.
  if (products.length > 80) return [];
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Product" };
  const description = product.description.replace(/\s+/g, " ").trim().slice(0, 160);
  const products = await listProducts();
  const duplicate = products.some((item) => item.slug !== product.slug && item.name === product.name);
  const extra = duplicate ? product.colors[0]?.name || product.variants[0]?.sku : undefined;
  const title = productMetaTitle(product.name, extra);
  return {
    title,
    description,
    alternates: { canonical: `/producten/${product.slug}` },
    openGraph: {
      title,
      description,
      url: `/producten/${product.slug}`,
      type: "website",
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();
  if (product.slug !== slug) permanentRedirect(`/producten/${product.slug}`);
  const related = await getRelatedProducts(product);
  const category = await getCategory(product.category);

  const categoryPath = product.category === "hpl-platen" ? "/hpl-plaat" : `/${product.category}`;
  const categoryName = category?.name ?? product.category;
  const staal = staalTarget(product);
  const staalHref = staal ? `/staalaanvraag?groep=${staal.groupId}&product=${product.slug}` : undefined;
  const reviews = await getReviewSnapshot();
  return (
    <>
      <JsonLd data={productJsonLd(product, categoryName)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: categoryName, path: categoryPath },
          { name: product.name, path: `/producten/${product.slug}` },
        ])}
      />
      <ReviewScoreStrip snapshot={reviews} />
      <ProductDetail product={product} related={related} categoryName={categoryName} staalHref={staalHref} />
    </>
  );
}
