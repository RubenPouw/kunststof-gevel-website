import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { KozijnConfigurator } from "@/components/kozijnen/configurator";
import { KozijnFaqs, KozijnLinks } from "@/components/kozijnen/links";
import { JsonLd } from "@/components/seo/json-ld";
import { layoutCopy } from "@/lib/kozijnen/content";
import { GROUPS, allLayouts, getLayout, layoutPath } from "@/lib/kozijnen/layouts";
import { kozijnProductJsonLd } from "@/lib/kozijnen/schema";
import { breadcrumbJsonLd, faqJsonLd } from "@/lib/seo/schema";

export const revalidate = 3600;

type Props = { params: Promise<{ group: string; slug: string }> };

export function generateStaticParams() {
  return allLayouts().map((layout) => ({ group: layout.group, slug: layout.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { group, slug } = await params;
  const layout = getLayout(group, slug);
  if (!layout) return { title: "Kozijn" };
  const copy = layoutCopy(layout);
  const description = copy?.paragraphs[0] ?? layout.summary;
  return {
    title: `${layout.title} op maat`,
    description,
    alternates: { canonical: layoutPath(layout) },
  };
}

export default async function KozijnLayoutPage({ params }: Props) {
  const { group, slug } = await params;
  const layout = getLayout(group, slug);
  if (!layout) notFound();
  const copy = layoutCopy(layout);
  if (!copy) notFound();
  const groupTitle = GROUPS.find((item) => item.id === layout.group)?.title ?? "Kozijnen";
  const pricesActive = process.env.KOZIJNEN_PRIJZEN_ACTIEF === "true";

  return (
    <>
      <JsonLd data={kozijnProductJsonLd(layout, copy.paragraphs[0])} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Kunststof kozijnen", path: "/kunststof-kozijnen" },
          { name: groupTitle, path: `/kunststof-kozijnen/${layout.group}` },
          { name: layout.title, path: layoutPath(layout) },
        ])}
      />
      <JsonLd data={faqJsonLd(copy.faqs)} />
      <header className="container-kg pt-10 pb-6">
        <p className="font-mono text-[13px] text-kg-text-2">
          <Link href="/kunststof-kozijnen" className="underline underline-offset-[3px]">
            Kozijnen
          </Link>
          {" / "}
          <Link href={`/kunststof-kozijnen/${layout.group}`} className="underline underline-offset-[3px]">
            {groupTitle}
          </Link>
          {` / ${layout.title}`}
        </p>
        <h1 className="display-pdp mt-4 max-w-3xl">{layout.title} op maat</h1>
        <p className="mt-3 max-w-2xl text-[16px] leading-normal text-kg-text-2">{layout.summary} EKO NL Profiel. Geen merkkeuze.</p>
      </header>
      <KozijnConfigurator layout={layout} pricesActive={pricesActive} />
      <section className="container-kg grid gap-10 border-t border-kg-lijn py-14 lg:grid-cols-[minmax(0,40rem)_minmax(0,22rem)]">
        <div className="space-y-4">
          <h2 className="text-[22px] font-bold tracking-[-0.03em]">Over dit kozijn</h2>
          {copy.paragraphs.map((paragraph) => (
            <p key={paragraph} className="text-[16px] leading-normal text-kg-text-2">
              {paragraph}
            </p>
          ))}
          <p>
            <Link href="/kunststof-kozijnen/kennisbank/hoe-moet-je-meten">Meetinstructie</Link>
          </p>
        </div>
        <KozijnFaqs faqs={copy.faqs} />
      </section>
      <KozijnLinks />
    </>
  );
}
