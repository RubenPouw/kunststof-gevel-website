import { ProductPhoto } from "@/components/brand/product-photo";
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
      <ProductPhoto
        image={image}
        alt={product.name}
        sizes="(min-width: 1024px) 480px, 100vw"
        bevel={null}
        className={cn("aspect-[4/3]", className)}
      />
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
