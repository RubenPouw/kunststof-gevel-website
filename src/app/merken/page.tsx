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
      <p className="font-mono text-[13px] text-kg-text-2">Merken</p>
      <h1 className="display-plp mt-2">Alle merken uit voorraad</h1>
      <p className="mt-4 max-w-2xl text-kg-text-2">
        Kies een merk. U ziet daarna profiel, kleur en werkende breedte. Zelfde garantie,
        dezelfde hulpstukken erbij.
      </p>
      <div className="mt-10 grid grid-cols-2 border-y border-kg-lijn sm:grid-cols-4">
        {brands.map((brand) => {
          const count = products.filter((product) => product.brandSlug === brand.slug).length;
          return (
            <Link
              key={brand.slug}
              href={`/merken/${brand.slug}`}
              className="border-kg-lijn p-6 text-inherit no-underline transition-colors duration-150 hover:bg-kg-kalk hover:no-underline sm:border-r"
            >
              <p className="font-mono text-[13px] text-kg-text-2">{count} producten</p>
              <h2 className="mt-2 text-[20px] font-bold tracking-[-0.02em]">{brand.name}</h2>
              <p className="mt-2 text-[14px] text-kg-text-2">{brand.summary}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
