import Link from "next/link";

import type { SeoFaq, SeoLink, SeoSection } from "@/data/seo/brands";

export function SeoArticle({
  sections,
  faqs = [],
  links = [],
}: {
  sections: SeoSection[];
  faqs?: SeoFaq[];
  links?: SeoLink[];
}) {
  return (
    <section className="container-kg border-t border-kg-lijn py-14">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,42rem)_minmax(0,22rem)]">
        <div className="space-y-8">
          {sections.map((section) => (
            <div key={section.heading}>
              <h2 className="text-[22px] font-bold tracking-[-0.03em]">{section.heading}</h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph} className="mt-3 text-[16px] leading-[1.5] text-kg-text-2">
                  {paragraph}
                </p>
              ))}
            </div>
          ))}
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
                <dd className="mt-2 text-[14px] leading-[1.5] text-kg-text-2">{faq.a}</dd>
              </div>
            ))}
          </dl>
        ) : null}
      </div>
    </section>
  );
}
