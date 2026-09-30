import { AssortmentGrid } from "@/components/home/assortment-grid";
import { Bestsellers } from "@/components/home/bestsellers";
import { BrandMarquee } from "@/components/home/brand-marquee";
import { BusinessBand } from "@/components/home/business-band";
import { FaqReviews } from "@/components/home/faq-reviews";
import { HomeGuides } from "@/components/seo/home-guides";
import { HomeHero } from "@/components/home/home-hero";
import { ProjectMosaic } from "@/components/home/project-mosaic";
import { SamplesSection } from "@/components/home/samples-section";
import { TrustStrip } from "@/components/home/trust-strip";
import {
  getFeaturedProducts,
  listBrands,
  listCategories,
  listProducts,
} from "@/lib/catalog";
import { listSampleColors } from "@/lib/catalog/derive";
import { getGooglePlace, googleRatingLabel, googleStarValue } from "@/lib/google-places";
import { site } from "@/lib/site";

export default async function HomePage() {
  const [featured, brands, categories, products, googlePlace] = await Promise.all([
    getFeaturedProducts(),
    listBrands(),
    listCategories(),
    listProducts(),
    getGooglePlace(),
  ]);
  const scoreLabel = googleRatingLabel(googlePlace);
  const counts = Object.fromEntries(
    categories.map((category) => [
      category.slug,
      products.filter((product) => product.category === category.slug).length,
    ]),
  );
  const samples = listSampleColors(products).slice(0, 12);

  return (
    <div className="pb-8">
      <HomeHero />
      <TrustStrip
        label={scoreLabel}
        mapsUrl={googlePlace?.mapsUri ?? site.googleMapsUrl}
        rating={googleStarValue(googlePlace)}
      />
      <AssortmentGrid counts={counts} total={products.length} />
      <BrandMarquee brands={brands} />
      <Bestsellers products={featured} />
      <SamplesSection colors={samples} />
      <ProjectMosaic />
      <BusinessBand />
      <HomeGuides />
      <FaqReviews
        reviews={googlePlace && googlePlace.reviews.length > 0 ? googlePlace.reviews : undefined}
        scoreLabel={scoreLabel}
        mapsUrl={googlePlace?.mapsUri ?? site.googleMapsUrl}
      />
    </div>
  );
}
