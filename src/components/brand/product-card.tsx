import Link from "next/link";

import { ProductMedia } from "@/components/brand/product-media";
import { Tag } from "@/components/brand/tag";
import { SampleAddButton } from "@/components/samples/sample-add-button";
import { buttonVariants } from "@/components/ui/button";
import type { Product } from "@/lib/catalog/types";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

export function ProductCard({
  product,
  showSample = false,
}: {
  product: Product;
  showSample?: boolean;
}) {
  const color = product.colors[0];

  return (
    <article className="flex flex-col border border-[var(--color-border)] bg-surface">
      <Link href={`/producten/${product.slug}`} className="relative block text-inherit no-underline hover:text-inherit">
        <ProductMedia product={product} />
        {product.badge ? (
          <Tag className="absolute top-2.5 left-2.5 uppercase text-[10px] tracking-[0.06em]">
            {product.badge}
          </Tag>
        ) : null}
      </Link>
      <div className="flex flex-1 flex-col gap-1.5 p-3.5">
        <p className="kicker">{product.brand}</p>
        <h3 className="font-heading text-[18px] leading-[1.15] font-semibold">
          <Link href={`/producten/${product.slug}`} className="text-inherit no-underline hover:text-inherit">
            {product.name}
          </Link>
        </h3>
        <p className="text-[12px] leading-[1.5] text-[var(--color-text-muted)]">{product.meta}</p>
        <div className="mt-1 flex items-baseline gap-1.5">
          <p className="font-heading text-2xl leading-none font-bold">
            {product.variants.some((variant) => variant.price !== product.price)
              ? `vanaf ${formatPrice(product.price)}`
              : formatPrice(product.price)}
          </p>
          <p className="text-[11px] text-[var(--color-text-muted)]">incl. btw · per paneel</p>
        </div>
        <p
          className={cn(
            "text-[12px] leading-none font-medium",
            product.inStock ? "text-brand" : "text-[var(--color-text-muted)]",
          )}
        >
          {product.inStock ? "● " : "○ "}
          {product.stockText ?? (product.inStock ? "Uit voorraad leverbaar" : "Levertijd 5 werkdagen")}
        </p>
        <div className={cn("mt-1 flex gap-2", showSample && color ? "flex-col sm:flex-row" : "")}>
          <Link
            href={`/producten/${product.slug}`}
            className={cn(buttonVariants({ variant: "primary", block: !showSample }), "min-h-11 text-[14px]")}
          >
            Opties selecteren
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
              className="min-h-11"
            />
          ) : null}
        </div>
      </div>
    </article>
  );
}
