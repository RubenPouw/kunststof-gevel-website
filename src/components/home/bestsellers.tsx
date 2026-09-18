import Link from "next/link";

import { ProductCard } from "@/components/brand/product-card";
import type { Product } from "@/lib/catalog/types";

export function Bestsellers({ products }: { products: Product[] }) {
  return (
    <section className="container-kg section-kg">
      <p className="kicker">Meest verkocht</p>
      <h2 className="mt-2 font-heading text-[44px] leading-none font-bold uppercase">
        Vandaag besteld, deze week op de bouw
      </h2>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.slug} product={product} showSample={product.sampleable} />
        ))}
      </div>
      <Link href="/gevelbekleding" className="mt-6 inline-block text-[14px] font-medium">
        Alle gevelproducten
      </Link>
    </section>
  );
}
