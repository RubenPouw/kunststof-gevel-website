import Image from "next/image";
import Link from "next/link";

import { ProductPhoto } from "@/components/brand/product-photo";
import { VatPrice } from "@/components/brand/vat-price";
import { SampleAddButton } from "@/components/samples/sample-add-button";
import { buttonVariants } from "@/components/ui/button";
import { officialBrandLogo, brandLogoSrc } from "@/lib/catalog/brand-logos";
import {
  BRAND_PROFILE_COPY,
  lengthCaption,
  lengthOffer,
  pickBrandProfiles,
  widthLabel,
} from "@/lib/catalog/brand-profiles";
import type { Brand, Product } from "@/lib/catalog/types";
import { productAlt } from "@/lib/seo/alt";
import { cn } from "@/lib/utils";

function logoSrc(slug: string) {
  return officialBrandLogo(slug) ?? brandLogoSrc(slug);
}

export function BrandProfileBlock({
  products,
  brand,
  showLogo = true,
}: {
  products: Product[];
  brand: Brand;
  /** Logo, then the title, then the cards. On by default. */
  showLogo?: boolean;
}) {
  const selection = pickBrandProfiles(products, brand);
  if (selection.products.length === 0) return null;
  const logo = showLogo ? logoSrc(brand.slug) : undefined;
  const columns = selection.products.length > 4 ? "sm:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-2 lg:grid-cols-4";

  return (
    <section className="my-8" aria-labelledby="profielblok-titel">
      {showLogo ? (
        <div className="mb-4 flex h-12 items-center">
          {logo ? (
            <Image
              src={logo}
              alt={brand.name}
              width={180}
              height={48}
              unoptimized
              className="h-10 w-auto max-w-[12rem] object-contain object-left"
            />
          ) : (
            <p className="text-[18px] font-bold tracking-[-0.02em] text-kg-navy">{brand.name}</p>
          )}
        </div>
      ) : null}
      <h2 id="profielblok-titel" className="text-[22px] font-bold tracking-[-0.03em]">
        {BRAND_PROFILE_COPY.title}
      </h2>
      <p className="mt-1 max-w-2xl text-[15px] text-kg-text-2">
        {selection.sheets ? BRAND_PROFILE_COPY.sheetLead : BRAND_PROFILE_COPY.lead}
      </p>
      <div className={cn("mt-5 grid grid-cols-1 gap-4", columns)}>
        {selection.products.map((product) => {
          const offer = lengthOffer(product);
          const color = product.colors.find((item) => item.name === offer?.variant.colorName) ?? product.colors[0];
          const width = widthLabel(product);
          const image = offer?.variant.image ?? product.images[0];
          return (
            <article key={product.slug} className="kg-soft-card flex h-full flex-col">
              <Link href={`/producten/${product.slug}`} className="block p-3 text-inherit no-underline hover:no-underline">
                <ProductPhoto
                  image={image}
                  alt={productAlt(product)}
                  sizes="(min-width: 1024px) 240px, 50vw"
                  fallback={color?.hex}
                  className="aspect-square"
                  imageClassName="p-1"
                />
              </Link>
              <div className="flex flex-1 flex-col gap-1 px-3.5 pb-3.5">
                {width ? <p className="font-mono text-[13px] text-kg-text-2">{width}</p> : null}
                <h3 className="text-[17px] leading-[1.3] font-medium">
                  <Link href={`/producten/${product.slug}`} className="text-inherit no-underline hover:no-underline">
                    {product.name}
                  </Link>
                </h3>
                <div className="mt-1 font-mono text-[18px] font-medium">
                  {offer ? (
                    <>
                      <span className="mr-1 text-[13px] font-normal text-kg-text-2">Vanaf</span>
                      <VatPrice incl={offer.incl} labeled={false} />
                    </>
                  ) : (
                    BRAND_PROFILE_COPY.onRequest
                  )}
                </div>
                <p className="kg-vat font-mono text-[13px] text-kg-text-2">
                  <span className="kg-vat-incl">{lengthCaption(offer?.length ?? product.length, "incl")}</span>
                  <span className="kg-vat-excl">{lengthCaption(offer?.length ?? product.length, "excl")}</span>
                </p>
                <div className="mt-3 flex flex-col gap-2">
                  <Link
                    href={`/producten/${product.slug}`}
                    className={cn(buttonVariants({ variant: "primary", size: "sm" }), "w-full no-underline hover:no-underline")}
                  >
                    {BRAND_PROFILE_COPY.view}
                  </Link>
                  {product.sampleable && color ? (
                    <SampleAddButton
                      sample={{
                        id: color.sampleId,
                        brandSlug: product.brandSlug,
                        brandName: product.brand,
                        colorName: color.name,
                        hex: color.hex,
                        ral: color.ral,
                      }}
                      label={BRAND_PROFILE_COPY.sample}
                      className="w-full"
                    />
                  ) : (
                    <Link
                      href="/staalaanvraag"
                      className={cn(buttonVariants({ variant: "outline", size: "sm" }), "w-full no-underline hover:no-underline")}
                    >
                      {BRAND_PROFILE_COPY.sample}
                    </Link>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
      {selection.hasMore ? (
        <p className="mt-4">
          <Link href="#producten" className="font-mono text-[13px] text-kg-navy underline">
            {BRAND_PROFILE_COPY.all}
          </Link>
        </p>
      ) : null}
    </section>
  );
}
