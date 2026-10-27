import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { KozijnDrawing } from "@/components/kozijnen/drawing";
import { KozijnFaqs, KozijnLinks } from "@/components/kozijnen/links";
import { JsonLd } from "@/components/seo/json-ld";
import { groupCopy } from "@/lib/kozijnen/content";
import { GROUPS, layoutsIn, layoutPath, type KozijnGroup } from "@/lib/kozijnen/layouts";
import { defaultConfig } from "@/lib/kozijnen/model";
import { breadcrumbJsonLd, faqJsonLd } from "@/lib/seo/schema";

export const revalidate = 3600;

const IDS = new Set<KozijnGroup>(["ramen", "schuifpuien", "deuren"]);

type Props = { params: Promise<{ group: string }> };

export function generateStaticParams() {
  return GROUPS.map((group) => ({ group: group.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { group } = await params;
  if (!IDS.has(group as KozijnGroup)) return { title: "Kozijnen" };
  const copy = groupCopy[group as KozijnGroup];
  return {
    title: copy.title,
    description: copy.description,
    alternates: { canonical: `/kunststof-kozijnen/${group}` },
  };
}

export default async function KozijnGroupPage({ params }: Props) {
  const { group } = await params;
  if (!IDS.has(group as KozijnGroup)) notFound();
  const id = group as KozijnGroup;
  const copy = groupCopy[id];
  const layouts = layoutsIn(id);
  const label = GROUPS.find((item) => item.id === id)?.title ?? "Kozijnen";

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Kunststof kozijnen", path: "/kunststof-kozijnen" },
          { name: label, path: `/kunststof-kozijnen/${id}` },
        ])}
      />
      <JsonLd data={faqJsonLd(copy.faqs)} />
      <header className="container-kg pt-10 pb-6">
        <p className="font-mono text-[13px] text-kg-text-2">
          <Link href="/kunststof-kozijnen" className="underline underline-offset-[3px]">
            Kozijnen
          </Link>
          {` / ${label}`}
        </p>
        <h1 className="display-plp mt-4 max-w-3xl">{copy.title}</h1>
        <p className="mt-4 max-w-2xl text-[17px] leading-normal text-kg-text-2">{copy.lead}</p>
      </header>
      <ul className="container-kg grid gap-4 pb-12 sm:grid-cols-2">
        {layouts.map((layout) => (
          <li key={layout.slug}>
            <Link href={layoutPath(layout)} className="block border border-kg-lijn bg-kg-kalk p-4 no-underline hover:no-underline">
              <KozijnDrawing layout={layout} config={defaultConfig(layout)} caption={false} />
              <p className="mt-3 font-medium text-kg-navy">{layout.title}</p>
              <p className="mt-1 text-[14px] text-kg-text-2">{layout.summary}</p>
            </Link>
          </li>
        ))}
      </ul>
      <section className="container-kg grid gap-10 border-t border-kg-lijn py-14 lg:grid-cols-[minmax(0,40rem)_minmax(0,22rem)]">
        <div className="space-y-8">
          {copy.sections.map((section) => (
            <div key={section.heading}>
              <h2 className="text-[22px] font-bold tracking-[-0.03em]">{section.heading}</h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph} className="mt-3 text-[16px] leading-normal text-kg-text-2">
                  {paragraph}
                </p>
              ))}
            </div>
          ))}
          <p>
            <Link href="/kunststof-kozijnen/kennisbank">Kennisbank</Link>
          </p>
        </div>
        <KozijnFaqs faqs={copy.faqs} />
      </section>
      <KozijnLinks />
    </>
  );
}
