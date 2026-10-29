import type { Metadata } from "next";

import { AssortmentGrid } from "@/components/home/assortment-grid";
import { Bestsellers } from "@/components/home/bestsellers";
import { BrandMarquee } from "@/components/home/brand-marquee";
import { BusinessBand } from "@/components/home/business-band";
import { FaqReviews } from "@/components/home/faq-reviews";
import { HomeGuides } from "@/components/seo/home-guides";
import { HomeHero } from "@/components/home/home-hero";
import { HomePrice } from "@/components/home/home-price";
import { ProjectMosaic } from "@/components/home/project-mosaic";
import { HomeQuotes } from "@/components/reviews/home-quotes";
import { ReviewScoreStrip } from "@/components/reviews/score-strip";
import { SamplesSection } from "@/components/home/samples-section";
import { JsonLd } from "@/components/seo/json-ld";
import { localBusinessJsonLd } from "@/lib/seo/schema";
import {
  getCategoryImages,
  getFeaturedProducts,
  listBrands,
  listCategories,
  listProducts,
} from "@/lib/catalog";
import { listSampleColors } from "@/lib/catalog/derive";
import { faqJsonLd } from "@/lib/seo/schema";
import { getReviewSnapshot } from "@/lib/reviews/read";
import { faqs } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: "Kunststof gevelbekleding kopen | Heldere prijzen per plank" },
  description:
    "Kunststof gevelbekleding met de prijs per plank. Keralit, VinyPlus, Eurotexx en Kerrafront. Showroom op afspraak in Hedel.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Kunststof gevelbekleding kopen | Heldere prijzen per plank",
    description:
      "Kunststof gevelbekleding met de prijs per plank. Keralit, VinyPlus, Eurotexx en Kerrafront. Showroom op afspraak in Hedel.",
    url: "/",
  },
};

export const revalidate = 3600;

export default async function HomePage() {
  const [featured, brands, categories, products, categoryImages] = await Promise.all([
    getFeaturedProducts(),
    listBrands(),
    listCategories(),
    listProducts(),
    getCategoryImages(),
  ]);
  const counts = Object.fromEntries(
    categories.map((category) => [
      category.slug,
      products.filter((product) => product.category === category.slug).length,
    ]),
  );
  const samples = listSampleColors(products).slice(0, 12);
  const reviews = await getReviewSnapshot();

  return (
    <div className="pb-8">
      <JsonLd data={faqJsonLd(faqs)} />
      <JsonLd data={localBusinessJsonLd()} />
      <ReviewScoreStrip snapshot={reviews} />
      <HomeHero />
      <HomePrice />
      <AssortmentGrid counts={counts} total={products.length} images={categoryImages} />
      <BrandMarquee brands={brands} />
      <Bestsellers products={featured} />
      <SamplesSection colors={samples} />
      <ProjectMosaic />
      <HomeQuotes reviews={reviews.reviews} />
      <BusinessBand />
      <HomeGuides />
      <FaqReviews />
    </div>
  );
}
