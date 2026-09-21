import { AssortmentGrid } from "@/components/home/assortment-grid";
import { Bestsellers } from "@/components/home/bestsellers";
import { BrandMarquee } from "@/components/home/brand-marquee";
import { BusinessBand } from "@/components/home/business-band";
import { FaqReviews } from "@/components/home/faq-reviews";
import { HomeHero } from "@/components/home/home-hero";
import { ProjectMosaic } from "@/components/home/project-mosaic";
import { SamplesSection } from "@/components/home/samples-section";
import {
  getFeaturedProducts,
  listBrands,
  listCategories,
  listProducts,
} from "@/lib/catalog";
import { listSampleColors } from "@/lib/catalog/derive";

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
  const samples = listSampleColors(products).slice(0, 12);

  return (
    <div className="pb-8">
      <HomeHero />
      <AssortmentGrid counts={counts} total={products.length} />
      <BrandMarquee brands={brands} />
      <Bestsellers products={featured} />
      <SamplesSection colors={samples} />
      <ProjectMosaic />
      <BusinessBand />
      <FaqReviews />
    </div>
  );
}
