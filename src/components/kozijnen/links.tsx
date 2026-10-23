import Link from "next/link";

const LINKS = [
  { href: "/gevelbekleding", label: "Gevelbekleding", note: "Panelen in dezelfde kleurlijn" },
  { href: "/dakranden", label: "Dakranden", note: "Boei, hoek en daktrim" },
  { href: "/kozijnafwerking", label: "Vensterbanken", note: "Bank en eindkappen" },
  { href: "/staalaanvraag", label: "Kleurstalen", note: "Gevelstaal naast het kozijn" },
] as const;

export function KozijnLinks() {
  return (
    <section className="border-t border-kg-lijn bg-kg-kalk">
      <div className="container-kg py-12">
        <h2 className="text-[22px] font-bold tracking-[-0.03em]">Kozijn en gevel samen</h2>
        <p className="mt-3 max-w-2xl text-[16px] leading-normal text-kg-text-2">
          Het kozijn staat niet los van de gevel. Leg een staal van de bekleding naast de kleur van het kader, en bestel de bank en de dakrand in dezelfde ronde.
        </p>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {LINKS.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="block border border-kg-lijn bg-white p-4 no-underline hover:no-underline">
                <span className="block font-medium text-kg-navy">{item.label}</span>
                <span className="mt-1 block font-mono text-[13px] text-kg-text-2">{item.note}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function KozijnFaqs({ faqs }: { faqs: { q: string; a: string }[] }) {
  return (
    <dl className="grid gap-3">
      {faqs.map((faq) => (
        <div key={faq.q} className="border border-kg-lijn bg-white p-4">
          <dt className="font-medium">{faq.q}</dt>
          <dd className="mt-2 text-[15px] leading-normal text-kg-text-2">{faq.a}</dd>
        </div>
      ))}
    </dl>
  );
}
