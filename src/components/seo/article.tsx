import Link from "next/link";
import type { ReactNode } from "react";

import { Bevel } from "@/components/brand/section-head";
import type { SeoFaq, SeoLink, SeoSection } from "@/data/seo/brands";
import { faqJsonLd } from "@/lib/seo/schema";

import { JsonLd } from "./json-ld";

const INLINE_LINK = /\[([^\]]+)\]\((\/[^)\s]+)\)/g;

export function RichText({ text }: { text: string }) {
  const nodes: ReactNode[] = [];
  const pattern = new RegExp(INLINE_LINK.source, "g");
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) nodes.push(text.slice(last, match.index));
    const href = match[2];
    nodes.push(
      <Link key={`${match.index}-${href}`} href={href}>
        {match[1]}
      </Link>,
    );
    last = match.index + match[0].length;
  }
  if (nodes.length === 0) return text;
  if (last < text.length) nodes.push(text.slice(last));
  return <>{nodes}</>;
}

function SectionImage({ image }: { image: NonNullable<SeoSection["image"]> }) {
  return (
    <Bevel size={16} className="mt-4">
      <img src={image.src} alt={image.alt} className="w-full" />
    </Bevel>
  );
}

function Paragraphs({ paragraphs }: { paragraphs: string[] }) {
  return paragraphs.map((paragraph) => (
    <p key={paragraph} className="mt-3 text-[16px] leading-[1.5] text-kg-text-2">
      <RichText text={paragraph} />
    </p>
  ));
}

function SectionList({ list }: { list: NonNullable<SeoSection["list"]> }) {
  const Tag = list.ordered ? "ol" : "ul";
  const marker = list.ordered ? "list-decimal" : "list-disc";
  return (
    <Tag className={`mt-3 space-y-1 pl-5 text-[16px] leading-[1.5] text-kg-text-2 ${marker}`}>
      {list.items.map((item) => (
        <li key={item}>
          <RichText text={item} />
        </li>
      ))}
    </Tag>
  );
}

export function SeoArticle({
  intro,
  sections,
  faqs = [],
  links = [],
  faqSchema = true,
}: {
  intro?: string;
  sections: SeoSection[];
  faqs?: SeoFaq[];
  links?: SeoLink[];
  faqSchema?: boolean;
}) {
  return (
    <section className="container-kg border-t border-kg-lijn py-14">
      {faqSchema ? <JsonLd data={faqJsonLd(faqs)} /> : null}
      <div className="grid gap-10 lg:grid-cols-[minmax(0,42rem)_minmax(0,22rem)]">
        <div className="space-y-8">
          {intro ? (
            <p className="text-[16px] leading-[1.5] text-kg-text-2">
              <RichText text={intro} />
            </p>
          ) : null}
          {sections.map((section) => {
            const HeadingTag = section.level === 3 ? "h3" : "h2";
            return (
              <div key={section.heading}>
                {section.image && section.image.place === "before" ? <SectionImage image={section.image} /> : null}
                <HeadingTag
                  className={
                    section.level === 3
                      ? "text-[18px] font-bold tracking-[-0.02em]"
                      : "text-[22px] font-bold tracking-[-0.03em]"
                  }
                >
                  {section.heading}
                </HeadingTag>
                <Paragraphs paragraphs={section.paragraphs} />
                {section.list ? <SectionList list={section.list} /> : null}
                {section.after ? <Paragraphs paragraphs={section.after} /> : null}
                {section.image && section.image.place !== "before" ? <SectionImage image={section.image} /> : null}
              </div>
            );
          })}
          {links.length > 0 ? (
            <ul className="flex flex-wrap gap-x-4 gap-y-2 text-[15px]">
              {links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        {faqs.length > 0 ? (
          <dl className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.q} className="border border-kg-lijn bg-white p-4">
                <dt className="font-medium">{faq.q}</dt>
                <dd className="mt-2 text-[14px] leading-[1.5] text-kg-text-2">
                  <RichText text={faq.a} />
                </dd>
              </div>
            ))}
          </dl>
        ) : null}
      </div>
    </section>
  );
}
