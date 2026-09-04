import type { Metadata } from "next";
import Link from "next/link";

import { brands, getProductsByBrand } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Merken",
  description: "Keralit, VinyPlus, Eurotexx en Wooddesign. Kies het merk dat u wilt.",
};

export default function MerkenPage() {
  return (
    <div className="container-kg py-12 sm:py-16">
      <p className="kicker">Merken</p>
      <h1 className="mt-2">Kies hieronder het merk dat u wilt</h1>
      <p className="mt-4 max-w-2xl text-[var(--color-text-soft)]">
        Vier merken die we kennen. Zelfde garantie, zelfde montagevoorschriften.
        Geen exotische kleuren die zes weken op zich laten wachten.
      </p>
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {brands.map((brand) => (
          <Link
            key={brand.slug}
            href={`/merken/${brand.slug}`}
            className="border border-[var(--color-border)] bg-surface p-6 text-inherit no-underline hover:text-inherit hover:bg-tint"
          >
            <p className="kicker">{getProductsByBrand(brand.slug).length} producten</p>
            <h2 className="mt-2">{brand.name}</h2>
            <p className="mt-2 text-[15px] text-[var(--color-text-muted)]">{brand.summary}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
