import { ProductCard } from "@/components/brand/product-card";
import { SegmentBar } from "@/components/brand/segment-bar";
import type { Product } from "@/lib/catalog";

export function CategoryPage({
  kicker,
  title,
  intro,
  products,
}: {
  kicker: string;
  title: string;
  intro: string;
  products: Product[];
}) {
  return (
    <div className="container-kg py-12 sm:py-16">
      <p className="kicker">{kicker}</p>
      <h1 className="mt-2 max-w-3xl">{title}</h1>
      <p className="mt-4 max-w-2xl text-[var(--color-text-soft)]">{intro}</p>
      <SegmentBar size={28} className="mt-8 max-w-xs" />
      {products.length === 0 ? (
        <p className="mt-10 border border-[var(--color-border)] bg-surface px-6 py-12 text-center text-[var(--color-text-muted)]">
          Nog geen producten in deze categorie.
        </p>
      ) : (
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
