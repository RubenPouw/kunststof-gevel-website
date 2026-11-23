import type { Metadata } from "next";

import { AssortmentGrid } from "@/components/home/assortment-grid";
import { Bestsellers } from "@/components/home/bestsellers";
import { BrandMarquee } from "@/components/home/brand-marquee";
import { BusinessBand } from "@/components/home/business-band";
import { FaqReviews } from "@/components/home/faq-reviews";
import { HomeGuides } from "@/components/seo/home-guides";
import { HomeHero } from "@/components/home/home-hero";
import { ProjectMosaic } from "@/components/home/project-mosaic";
import { HomeQuotes } from "@/components/reviews/home-quotes";
import { ReviewBar } from "@/components/reviews/review-bar";
import { SamplesSection } from "@/components/home/samples-section";
import { JsonLd } from "@/components/seo/json-ld";
import { getFeaturedProducts, listBrands, listCategories, listProducts } from "@/lib/catalog";
import { faqJsonLd } from "@/lib/seo/schema";
import { getReviewSnapshot } from "@/lib/reviews/read";
import { faqs } from "@/lib/site";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export const revalidate = 3600;

export default async function HomePage() {
  const [featured, brands, categories, products] = await Promise.all([
    getFeaturedProducts(),
    listBrands(),
    listCategories(),
    listProducts(),
  ]);
  const counts = Object.fromEntries(
    categories.map((category) => [
      category.slug,
      products.filter((product) => product.category === category.slug).length,
    ]),
  );
  const reviews = await getReviewSnapshot();

  return (
    <div className="pb-8">
      <JsonLd data={faqJsonLd(faqs)} />
      <ReviewBar />
      <HomeHero />
      <AssortmentGrid counts={counts} total={products.length} />
      <BrandMarquee brands={brands} />
      <Bestsellers products={featured} />
      <SamplesSection />
      <ProjectMosaic />
      <HomeQuotes reviews={reviews.reviews} />
      <BusinessBand />
      <HomeGuides />
      <FaqReviews />
    </div>
  );
}
