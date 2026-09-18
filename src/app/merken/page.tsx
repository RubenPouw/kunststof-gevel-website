import type { Metadata } from "next";
import Link from "next/link";

import { listBrands, listProducts } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Merken",
  description: "Keralit, VinyPlus, Eurotexx en de overige merken uit de shop.",
};

export default async function MerkenPage() {
  const [brands, products] = await Promise.all([listBrands(), listProducts()]);

  return (
    <div className="container-kg py-12 sm:py-16">
      <p className="kicker">Merken</p>
      <h1 className="display-plp mt-2">Alle merken uit voorraad</h1>
      <p className="mt-4 max-w-2xl text-[var(--color-text-soft)]">
        Kies een merk. U ziet daarna profiel, kleur en werkende breedte. Zelfde garantie,
        dezelfde hulpstukken erbij.
      </p>
      <div className="mt-10 grid gap-px bg-[var(--color-border)] sm:grid-cols-2">
        {brands.map((brand) => {
          const count = products.filter((product) => product.brandSlug === brand.slug).length;
          return (
            <Link
              key={brand.slug}
              href={`/merken/${brand.slug}`}
              className="bg-surface p-6 text-inherit no-underline transition-colors duration-150 hover:bg-tint hover:text-inherit"
            >
              <p className="kicker">{count} producten</p>
              <h2 className="mt-2 font-heading text-[28px] font-bold uppercase">{brand.name}</h2>
              <p className="mt-2 text-[15px] text-[var(--color-text-muted)]">{brand.summary}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
