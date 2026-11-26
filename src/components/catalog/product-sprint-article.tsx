import Link from "next/link";

import {
  resolveSprintLink,
  sprintForProduct,
  sprintIntro,
  sprintSpecRows,
  type SprintLink,
} from "@/data/seo/product-sprint";
import { listProducts } from "@/lib/catalog";
import type { Product } from "@/lib/catalog/types";

function LinkList({ links, products }: { links: SprintLink[]; products: Product[] }) {
  if (!links.length) return null;
  return (
    <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-[15px]">
      {links.map((link) => {
        const resolved = resolveSprintLink(link, products);
        if (!resolved) return null;
        return (
          <li key={`${resolved.href}-${resolved.label}`}>
            <Link href={resolved.href}>{resolved.label}</Link>
          </li>
        );
      })}
    </ul>
  );
}

export async function ProductSprintArticle({ product }: { product: Product }) {
  const story = sprintForProduct(product);
  if (!story) return null;
  const products = await listProducts();
  const intro = sprintIntro(story, product.slug);
  const specs = sprintSpecRows(product, story);

  return (
    <section className="container-kg border-t border-kg-lijn py-14">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,42rem)_minmax(0,22rem)]">
        <div className="space-y-8">
          <div>
            {intro.map((paragraph) => (
              <p key={paragraph} className="mt-3 text-[16px] leading-[1.5] text-kg-text-2 first:mt-0">
                {paragraph}
              </p>
            ))}
          </div>
          <div>
            <h2 className="text-[22px] font-bold tracking-[-0.03em]">Specificaties</h2>
            <p className="mt-3 text-[16px] leading-[1.5] text-kg-text-2">
              De prijs staat bij de gekozen kleur en komt uit de shop.
            </p>
            <dl className="mt-4 border border-kg-lijn bg-white font-mono text-[14px]">
              {specs.map((row) => (
                <div key={row.label} className="grid grid-cols-[minmax(8rem,14rem)_1fr] gap-3 border-b border-kg-lijn px-4 py-2 last:border-b-0">
                  <dt className="text-kg-text-2">{row.label}</dt>
                  <dd>{row.value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div>
            <h2 className="text-[22px] font-bold tracking-[-0.03em]">Dit heb je erbij nodig</h2>
            <p className="mt-3 text-[16px] leading-[1.5] text-kg-text-2">{story.needIntro}</p>
            <LinkList links={story.need} products={products} />
          </div>
          <div>
            <h2 className="text-[22px] font-bold tracking-[-0.03em]">Montage</h2>
            {story.montage.map((paragraph) => (
              <p key={paragraph} className="mt-3 text-[16px] leading-[1.5] text-kg-text-2">
                {paragraph}
              </p>
            ))}
            <LinkList links={story.montageLinks} products={products} />
          </div>
          <LinkList links={story.links} products={products} />
        </div>
        <div>
          <h2 className="text-[22px] font-bold tracking-[-0.03em]">Veelgestelde vragen</h2>
          <dl className="mt-4 space-y-4">
            {story.faqs.map((faq) => (
              <div key={faq.q} className="border border-kg-lijn bg-white p-4">
                <dt className="font-medium">{faq.q}</dt>
                <dd className="mt-2 text-[14px] leading-[1.5] text-kg-text-2">{faq.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
