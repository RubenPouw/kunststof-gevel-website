import { HplHub } from "@/components/catalog/hpl-hub";
import { SheetCalculator } from "@/components/catalog/sheet-calculator";
import { listProducts } from "@/lib/catalog";
import { hplColorCards, hplRelatedProducts, parseHplHubSearch } from "@/lib/catalog/hpl-hub";
import { toListingCard } from "@/lib/catalog/listing";
import { site } from "@/lib/site";

export async function HplHubPage({
  basePath,
  searchParams,
}: {
  basePath: string;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = parseHplHubSearch(await searchParams);
  const products = await listProducts();
  const plates = hplColorCards(products);
  const related = hplRelatedProducts(products).map(toListingCard);
  const onPlates = query.onderdeel !== "overig";

  return (
    <>
      <HplHub plates={plates} related={related} query={query} basePath={basePath} />
      {onPlates ? (
        <section className="container-kg border-t border-kg-lijn py-14">
          <h2 className="text-[22px] font-bold tracking-[-0.03em]">Hele plaat</h2>
          <p className="mt-3 max-w-2xl text-[16px] leading-[1.5] text-kg-text-2">
            Een plaat is 3050 × 1300 mm en 6 mm dik. Dat is 3,965 m². U bestelt hele platen. Wij zagen niet op maat. Een
            reststuk blijft van u.
          </p>
          <div className="mt-8 max-w-3xl">
            <SheetCalculator />
          </div>
          {plates.length === 0 ? (
            <p className="mt-6 text-kg-text-2">Ziet u de platen nog niet, bel {site.phone}.</p>
          ) : null}
        </section>
      ) : null}
    </>
  );
}
