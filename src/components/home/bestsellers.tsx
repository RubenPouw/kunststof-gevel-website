import Link from "next/link";

import { Bevel, SectionHead } from "@/components/brand/section-head";
import { SampleAddButton } from "@/components/samples/sample-add-button";
import { buttonVariants } from "@/components/ui/button";
import type { Product } from "@/lib/catalog/types";
import { exclVat, formatPrice } from "@/lib/format";
import { weekNow, stockLabel } from "@/lib/week";
import { cn } from "@/lib/utils";

export function Bestsellers({ products }: { products: Product[] }) {
  const week = weekNow();

  return (
    <section className="container-kg section-kg">
      <SectionHead title="Deze week leverbaar" aside="Meest besteld · prijzen excl. btw" />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {products.slice(0, 4).map((product) => {
          const variant = product.variants[0];
          const status = stockLabel(product.inStock, week, product.stockText);
          const color = product.colors[0];
          return (
            <article key={product.slug} className="flex flex-col border border-kg-lijn bg-white">
              <Link href={`/producten/${product.slug}`} className="block p-3 no-underline hover:no-underline">
                <Bevel size={16} className="aspect-[4/3]" style={{ background: color?.hex ?? "#C9C4B8" }} />
              </Link>
              <div className="flex flex-1 flex-col gap-2 px-3.5 pb-3.5">
                <div className="font-mono text-[13px] text-kg-text-2">
                  Art. {variant?.sku.replace(/-3M$/, "") ?? product.slug}
                </div>
                <h3 className="min-h-11 text-[17px] leading-[1.3] font-medium">
                  <Link href={`/producten/${product.slug}`} className="text-inherit no-underline hover:no-underline">
                    {product.name}
                  </Link>
                </h3>
                <div className="mt-auto flex justify-between border-t border-kg-lijn pt-2.5 font-mono text-[14px] tabular-nums">
                  <span style={{ color: status.color }}>{status.text}</span>
                  <span>{formatPrice(exclVat(variant?.price ?? product.price))}</span>
                </div>
                <div className="mt-1 flex gap-2">
                  <Link
                    href={`/producten/${product.slug}`}
                    className={cn(buttonVariants({ variant: "primary", size: "sm" }), "flex-1 no-underline hover:no-underline")}
                  >
                    In bestelling
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
                      label="Staal"
                    />
                  ) : null}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
