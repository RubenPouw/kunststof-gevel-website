import Image from "next/image";

import { ProductVisual, visualVariantFor } from "@/components/brand/product-visual";
import type { Product } from "@/lib/catalog/types";
import { cn } from "@/lib/utils";

export function ProductMedia({
  product,
  className,
}: {
  product: Product;
  className?: string;
}) {
  const image = product.images[0];
  if (image) {
    return (
      <div className={cn("relative aspect-[4/3] overflow-hidden bg-[#e9e7e1]", className)}>
        <Image
          src={image.url}
          alt={image.alt || product.name}
          fill
          sizes="(min-width: 1024px) 480px, 100vw"
          className="object-contain"
        />
      </div>
    );
  }

  return (
    <ProductVisual
      palette={product.palette}
      variant={visualVariantFor(product.name)}
      className={className}
    />
  );
}
