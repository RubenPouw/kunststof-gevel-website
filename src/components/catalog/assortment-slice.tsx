import Link from "next/link";

import { CategoryPage } from "@/components/catalog/category-page";
import { JsonLd } from "@/components/seo/json-ld";
import { brandsInProducts } from "@/lib/catalog";
import { CATEGORY_PAGE_SIZE, prepareListing } from "@/lib/catalog/listing";
import type { Product } from "@/lib/catalog/types";
import { breadcrumbJsonLd } from "@/lib/seo/schema";
import { site } from "@/lib/site";

export async function AssortmentSlice({
  kicker,
  title,
  intro,
  products,
  basePath,
  parentHref,
  parentLabel,
}: {
  kicker: string;
  title: string;
  intro: string;
  products: Product[];
  basePath: string;
  parentHref: string;
  parentLabel: string;
}) {
  const view = prepareListing(products, {}, 1, CATEGORY_PAGE_SIZE);
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: parentLabel, path: parentHref },
          { name: title, path: basePath },
        ])}
      />
      <CategoryPage
        kicker={kicker}
        title={title}
        intro={intro}
        cards={view.cards}
        total={view.total}
        totalUnfiltered={view.totalUnfiltered}
        facets={view.facets}
        page={view.page}
        pageSize={view.pageSize}
        brandOptions={await brandsInProducts(products)}
        basePath={basePath}
        filters={{}}
        showStockChip
        sampleHref="/stalen"
        emptyMessage={`Geen artikel in deze selectie in de shopcollectie. Bel ${site.phone}.`}
        belowIntro={
          <p className="mt-3">
            <Link href={parentHref}>{parentLabel}</Link>
          </p>
        }
      />
    </>
  );
}
