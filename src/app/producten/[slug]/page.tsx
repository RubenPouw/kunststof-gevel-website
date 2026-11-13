import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";

import { ProductDetail } from "@/app/producten/[slug]/product-detail";
import { ProductSprintArticle } from "@/components/catalog/product-sprint-article";
import { ReviewScoreStrip } from "@/components/reviews/score-strip";
import { JsonLd } from "@/components/seo/json-ld";
import { categoryPath } from "@/data/seo/category-pages";
import { productQueryRobots, sprintForProduct, sprintSpecRows, SPRINT_DELIVERY_SENTENCE } from "@/data/seo/product-sprint";
import { getCategory, getProduct, getRelatedProducts, listProducts } from "@/lib/catalog";
import { breadcrumbJsonLd, faqJsonLd, productJsonLd } from "@/lib/seo/schema";
import { getReviewSnapshot } from "@/lib/reviews/read";
import { isFacadePanel } from "@/lib/catalog/derive";
import { staalTarget } from "@/lib/staal/tree";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  const products = await listProducts();
  // A full Shopify copy is cached on the first request (revalidate). Baking
  // every product into the Render build kept that build from finishing.
  if (products.length > 80) return [];
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Product" };
  const story = sprintForProduct(product);
  const description = story?.description ?? product.description.replace(/\s+/g, " ").trim().slice(0, 160);
  const title = story?.title ?? product.name;
  const canonical = `/producten/${product.slug}`;
  return {
    title: story ? { absolute: title } : title,
    description,
    alternates: { canonical },
    robots: productQueryRobots(await searchParams),
    openGraph: {
      title: story?.h1 ?? product.name,
      description,
      url: canonical,
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
  const story = sprintForProduct(product);

  const categoryName = category?.name ?? product.category;
  const categoryHref = categoryPath(product.category);
  const staal = isFacadePanel(product) ? staalTarget(product) : null;
  const staalHref = staal ? `/staalaanvraag?product=${encodeURIComponent(product.slug)}` : undefined;
  const reviews = await getReviewSnapshot();
  const crumbs = story
    ? [...story.crumbs, { name: story.h1, path: `/producten/${product.slug}` }]
    : [
        { name: "Home", path: "/" },
        { name: categoryName, path: categoryHref },
        { name: product.name, path: `/producten/${product.slug}` },
      ];
  return (
    <>
      <JsonLd
        data={productJsonLd(product, categoryName, story
          ? {
              name: story.h1,
              description: story.description,
              properties: sprintSpecRows(product, story).map((row) => ({ name: row.label, value: row.value })),
            }
          : undefined)}
      />
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <JsonLd data={story ? faqJsonLd(story.faqs) : null} />
      <ReviewScoreStrip snapshot={reviews} />
      <ProductDetail
        product={product}
        related={related}
        categoryName={categoryName}
        categoryHref={story ? story.crumbs.at(-1)?.path ?? categoryHref : categoryHref}
        crumbs={story ? story.crumbs : undefined}
        heading={story?.h1}
        deliveryNote={story ? SPRINT_DELIVERY_SENTENCE : undefined}
        staalHref={staalHref}
      />
      <ProductSprintArticle product={product} />
    </>
  );
}
