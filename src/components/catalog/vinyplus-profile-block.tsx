import Link from "next/link";

import { ProductPhoto } from "@/components/brand/product-photo";
import { VatPrice } from "@/components/brand/vat-price";
import { SampleAddButton } from "@/components/samples/sample-add-button";
import { buttonVariants } from "@/components/ui/button";
import {
  VINYPLUS_PROFILE_COPY,
  lengthCaption,
  pickVinyplusProfiles,
  vinyplusLengthOffer,
  widthLabel,
} from "@/lib/catalog/vinyplus-profiles";
import type { Product } from "@/lib/catalog/types";
import { productAlt } from "@/lib/seo/alt";
import { cn } from "@/lib/utils";

export function VinyplusProfileBlock({ products }: { products: Product[] }) {
  const profiles = pickVinyplusProfiles(products);
  if (profiles.length === 0) return null;

  return (
    <section className="my-8" aria-labelledby="vinyplus-profielen-titel">
      <h2 id="vinyplus-profielen-titel" className="text-[22px] font-bold tracking-[-0.03em]">
        {VINYPLUS_PROFILE_COPY.title}
      </h2>
      <p className="mt-1 max-w-2xl text-[15px] text-kg-text-2">{VINYPLUS_PROFILE_COPY.lead}</p>
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {profiles.map((product) => {
          const offer = vinyplusLengthOffer(product);
          const color =
            product.colors.find((item) => item.name === offer?.variant.colorName) ?? product.colors[0];
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
                    VINYPLUS_PROFILE_COPY.onRequest
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
                    {VINYPLUS_PROFILE_COPY.view}
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
                      label={VINYPLUS_PROFILE_COPY.sample}
                      className="w-full"
                    />
                  ) : (
                    <Link
                      href="/staalaanvraag"
                      className={cn(buttonVariants({ variant: "outline", size: "sm" }), "w-full no-underline hover:no-underline")}
                    >
                      {VINYPLUS_PROFILE_COPY.sample}
                    </Link>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
