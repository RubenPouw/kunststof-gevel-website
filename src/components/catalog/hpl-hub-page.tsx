import { HplHub } from "@/components/catalog/hpl-hub";
import { SheetCalculator } from "@/components/catalog/sheet-calculator";
import { JsonLd } from "@/components/seo/json-ld";
import { SeoArticle } from "@/components/seo/article";
import { getCategoryStory } from "@/data/seo/categories";
import { resolveSprintLink, SPRINT_DELIVERY_SENTENCE, SPRINT_SAMPLE_SENTENCE } from "@/data/seo/product-sprint";
import { listProducts } from "@/lib/catalog";
import { hplColorCards, hplRelatedProducts, parseHplHubSearch } from "@/lib/catalog/hpl-hub";
import { toListingCard } from "@/lib/catalog/listing";
import { breadcrumbJsonLd, collectionPageJsonLd } from "@/lib/seo/schema";
import { site } from "@/lib/site";
import { categoryPageSeo } from "@/data/seo/category-pages";

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
  const story = getCategoryStory("hpl-platen");
  const seo = categoryPageSeo["hpl-platen"];
  const sections = [
    ...(story?.sections ?? []),
    {
      heading: "Deze pagina en de losse plaat",
      paragraphs: [
        "HPL plaat is de term van deze pagina. De plaat van 3050 x 1300 x 6 mm heeft een eigen product-URL. Filter op kleur blijft op deze hub, zonder een tweede HPL-pagina.",
        SPRINT_DELIVERY_SENTENCE,
        SPRINT_SAMPLE_SENTENCE,
      ],
    },
  ];
  const faqs = [
    ...(story?.faqs ?? []),
    {
      q: "Waar hoort de zoekterm HPL plaat?",
      a: "Op deze pagina. Een losse maat, zoals 3050 x 1300 x 6 mm, staat op de productpagina van die plaat.",
    },
  ];

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "HPL plaat", path: "/hpl-plaat" },
        ])}
      />
      <JsonLd data={collectionPageJsonLd({ name: seo.h1, description: seo.description, path: "/hpl-plaat" })} />
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
            <p className="mt-6 text-kg-text-2">Ziet u de platen nog niet, bel <a href={site.phoneHref}>{site.phone}</a>.</p>
          ) : null}
        </section>
      ) : null}
      {onPlates && story ? (
        <SeoArticle
          sections={sections}
          faqs={faqs}
          links={[
            ...(() => {
              const plate = resolveSprintLink(
                {
                  label: "HPL plaat 3050 x 1300 x 6 mm",
                  slugs: [
                    "milyt-hpl-plaat-3050-x-1300-x-6-mm-2",
                    "milyt-hpl-plaat-3050-x-1300-x-6-mm-1",
                    "milyt-hpl-plaat-3050-x-1300-x-6-mm",
                  ],
                },
                products,
              );
              return plate ? [plate] : [];
            })(),
            ...(story.links ?? []),
          ]}
        />
      ) : null}
    </>
  );
}
