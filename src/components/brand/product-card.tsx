import Link from "next/link";

import { Bevel } from "@/components/brand/section-head";
import { SampleAddButton } from "@/components/samples/sample-add-button";
import { buttonVariants } from "@/components/ui/button";
import type { Product } from "@/lib/catalog/types";
import { exclVat, formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

export function ProductCard({
  product,
  showSample = false,
}: {
  product: Product;
  showSample?: boolean;
}) {
  const color = product.colors[0];
  const variant = product.variants[0];

  return (
    <article className="flex flex-col border border-kg-lijn bg-white">
      <Link href={`/producten/${product.slug}`} className="relative block p-3 text-inherit no-underline hover:no-underline">
        <Bevel size={16} className="aspect-[4/3]" style={{ background: color?.hex ?? "#C9C4B8" }} />
      </Link>
      <div className="flex flex-1 flex-col gap-1.5 px-3.5 pb-3.5">
        <p className="font-mono text-[13px] text-kg-text-2">{product.brand}</p>
        <h3 className="min-h-11 text-[17px] leading-[1.3] font-medium">
          <Link href={`/producten/${product.slug}`} className="text-inherit no-underline hover:no-underline">
            {product.name}
          </Link>
        </h3>
        <p className="font-mono text-[13px] text-kg-text-2">{product.meta}</p>
        <div className="mt-1 font-mono text-[14px]">
          {formatPrice(exclVat(variant?.price ?? product.price))} excl. btw
        </div>
        <div className={cn("mt-2 flex gap-2", showSample && color ? "flex-col sm:flex-row" : "")}>
          <Link
            href={`/producten/${product.slug}`}
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "no-underline hover:no-underline",
              !showSample && "w-full",
            )}
          >
            Voeg toe
          </Link>
          {showSample && color ? (
            <SampleAddButton
              sample={{
                id: color.sampleId,
                brandSlug: product.brandSlug,
                brandName: product.brand,
                colorName: color.name,
                hex: color.hex,
                ral: color.ral,
              }}
              label="Staal"
            />
          ) : null}
        </div>
      </div>
    </article>
  );
}
