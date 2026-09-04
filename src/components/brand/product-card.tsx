import Link from "next/link";

import { ProductVisual, visualVariantFor } from "@/components/brand/product-visual";
import { Tag } from "@/components/brand/tag";
import { buttonVariants } from "@/components/ui/button";
import type { Product } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="flex flex-col border border-[var(--color-border)] bg-surface">
      <Link href={`/producten/${product.slug}`} className="relative block text-inherit no-underline hover:text-inherit">
        <ProductVisual
          palette={product.palette}
          variant={visualVariantFor(product.name)}
        />
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
          <p className="font-heading text-2xl leading-none font-bold">{formatPrice(product.price)}</p>
          <p className="text-[11px] text-[var(--color-text-muted)]">incl. btw</p>
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
        <Link
          href={`/producten/${product.slug}`}
          className={cn(buttonVariants({ variant: "primary", block: true }), "mt-1 text-[14px]")}
        >
          Opties selecteren
        </Link>
      </div>
    </article>
  );
}
