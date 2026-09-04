import Link from "next/link";

import { ProductCard } from "@/components/brand/product-card";
import { ProductVisual } from "@/components/brand/product-visual";
import { buttonVariants } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { brands, featuredProductSlugs, products } from "@/lib/catalog";
import { faqs, site, steps } from "@/lib/site";

export default function HomePage() {
  const featured = featuredProductSlugs
    .map((slug) => products.find((product) => product.slug === slug))
    .filter((product): product is NonNullable<typeof product> => Boolean(product));

  return (
    <div>
      <section className="container-kg py-6">
        <div className="grid min-h-[380px] border border-[var(--color-border)] lg:grid-cols-2">
          <div
            className="relative flex flex-col justify-center gap-4 overflow-hidden p-8 text-white sm:p-12"
            style={{ background: "var(--gradient-brand)" }}
          >
            <div
              className="pointer-events-none absolute -right-[90px] -bottom-[120px] size-[340px]"
              style={{ background: "var(--glow-orange)" }}
            />
            <p className="kicker relative text-[var(--kg-blue-100)]">Kunststof gevelbekleding</p>
            <h1 className="relative text-white">{site.tagline}</h1>
            <p className="relative m-0 max-w-lg opacity-85">
              Nooit meer schilderen, vervang hout door kunststof. Eenvoudig zelf
              te monteren of wij regelen de plaatsing voor je.
            </p>
            <div className="relative flex flex-wrap items-center gap-3.5">
              <Link href="/gevelbekleding" className={buttonVariants({ variant: "primary" })}>
                Bekijk alle producten
              </Link>
              <Link href="/offerte" className="text-white underline hover:text-[var(--kg-blue-100)]">
                Of vraag offerte aan voor je project
              </Link>
            </div>
            <p className="relative text-[13px] text-[var(--kg-blue-100)]">
              Snelle levering, uit voorraad leverbaar!
            </p>
          </div>
          <ProductVisual
            palette={["#7A4E2E", "#8C5A36", "#6E4326", "#9A6840"]}
            className="min-h-[240px] lg:min-h-full"
          />
        </div>

        <div className="flex flex-col items-start justify-between gap-4 border-b border-[var(--color-border)] py-[18px] sm:flex-row sm:items-center">
          <p className="text-[13px]">Kies hieronder het merk dat je wilt</p>
          <div className="flex flex-wrap gap-3">
            {brands.map((brand) => (
              <Link
                key={brand.slug}
                href={`/merken/${brand.slug}`}
                className="grid h-9 w-[120px] place-items-center border border-[var(--color-border)] text-[13px] font-medium text-kg-ink no-underline hover:bg-tint hover:text-kg-ink"
              >
                {brand.name}
              </Link>
            ))}
          </div>
        </div>

        <h2 className="mt-8 mb-4">Meest verkochte producten</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </section>

      <section className="container-kg py-16">
        <p className="kicker">Werkwijze</p>
        <h2 className="mt-2">Van keuze tot oplevering.</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <div key={step.n} className="border border-[var(--color-border)] bg-surface p-5">
              <p className="font-heading text-[28px] font-bold text-brand">{step.n}</p>
              <h3 className="mt-3">{step.title}</h3>
              <p className="mt-2 text-[13px] text-[var(--color-text-muted)]">{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-kg max-w-3xl pb-16">
        <h2>Veelgestelde vragen</h2>
        <Accordion className="mt-6">
          {faqs.map((item, index) => (
            <AccordionItem key={item.q} value={`faq-${index}`}>
              <AccordionTrigger className="py-4 text-base">{item.q}</AccordionTrigger>
              <AccordionContent className="text-[var(--color-text-muted)]">{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </div>
  );
}
