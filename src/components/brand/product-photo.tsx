"use client";

import Image from "next/image";
import type { CSSProperties } from "react";

import { Bevel } from "@/components/brand/section-head";
import type { ProductImage } from "@/lib/catalog/types";
import { isShopifyImage, shopifyImageLoader } from "@/lib/shopify/image";
import { cn } from "@/lib/utils";

/** Product photo on white (Shopify packshots are shot on white), or a flat colour tile without one. */
export function ProductPhoto({
  image,
  alt,
  sizes,
  fallback = "#C9C4B8",
  bevel = 16,
  priority = false,
  className,
  imageClassName,
}: {
  image?: ProductImage;
  alt: string;
  sizes: string;
  fallback?: string;
  bevel?: 8 | 16 | 24 | null;
  priority?: boolean;
  className?: string;
  imageClassName?: string;
}) {
  const style: CSSProperties | undefined = image ? undefined : { background: fallback };
  const content = image ? (
    <Image
      src={image.url}
      alt={image.alt || alt}
      fill
      sizes={sizes}
      priority={priority}
      loader={isShopifyImage(image.url) ? shopifyImageLoader : undefined}
      className={cn("object-contain", imageClassName)}
    />
  ) : null;
  const classes = cn("relative overflow-hidden", image && "bg-white", className);

  if (bevel === null) {
    return (
      <div className={classes} style={style}>
        {content}
      </div>
    );
  }
  return (
    <Bevel size={bevel} className={classes} style={style}>
      {content}
    </Bevel>
  );
}
