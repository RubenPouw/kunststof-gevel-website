"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent } from "react";

import { ProductPhoto } from "@/components/brand/product-photo";
import { SectionHead } from "@/components/brand/section-head";
import type { ProductImage } from "@/lib/catalog/types";

/**
 * Packshots from the live catalog (Shopify CDN) or /public.
 * Same 4:3 frame and contain crop on every card.
 */
const CARDS: readonly {
  href: string;
  name: string;
  detail: string;
  slug?: string;
  count?: string;
  image: ProductImage;
}[] = [
  {
    href: "/gevelbekleding",
    name: "Gevelbekleding",
    detail: "rabat · potdeksel · sponning",
    slug: "gevelbekleding",
    image: {
      url: "https://cdn.shopify.com/s/files/1/1091/6698/5554/files/FM6051BI12640_03201660_SZ1.jpg?v=1790596967",
      alt: "Kerrafront Trend gevelpaneel 320 mm structuur",
    },
  },
  {
    href: "/kunststof-kozijnen",
    name: "Kunststof kozijnen",
    detail: "op maat · vrijblijvende offerte",
    count: "configurator",
    image: {
      url: "/kozijnen/doorsnede.webp",
      alt: "Doorsnede van een kunststof kozijn",
    },
  },
  {
    href: "/boeidelen",
    name: "Dakranden",
    detail: "boeidelen · keralit",
    slug: "dakranden",
    image: {
      url: "https://cdn.shopify.com/s/files/1/1091/6698/5554/files/FM5938BI13031_01520160_SZ1.jpg?v=1790595251",
      alt: "Milin Volschuim paneel haakse hoek 175x35 mm",
    },
  },
  {
    href: "/hpl-plaat",
    name: "HPL platen",
    detail: "HPL plaat · kleur",
    slug: "hpl-platen",
    image: {
      url: "https://cdn.shopify.com/s/files/1/1091/6698/5554/files/hpl-compact-exterieur-plaat-6-mm-zwartstaal-decor-1700-3050-x-1300-mm-1.jpg?v=1792562952",
      alt: "HPL Compact Exterieur plaat 6 mm Zwartstaal decor 1700",
    },
  },
  {
    href: "/plafondpanelen",
    name: "Plafondpanelen",
    detail: "binnen · badkamer",
    slug: "plafondpanelen",
    image: {
      url: "https://cdn.shopify.com/s/files/1/1091/6698/5554/files/FM295BI2805_06031306_SZ1.jpg?v=1790595455",
      alt: "Florence Startprofiel 2-dl buitenplafond",
    },
  },
  {
    href: "/montage",
    name: "Bevestiging",
    detail: "schroeven · regels",
    slug: "montage",
    image: {
      url: "/categorie/bevestiging.webp",
      alt: "Torx schroef voor gevelbekleding",
    },
  },
];

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg viewBox="0 0 48 48" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="miter" aria-hidden>
      {dir === "left" ? <path d="M30 8 14 24l16 16" /> : <path d="M18 8l16 16-16 16" />}
    </svg>
  );
}

export function AssortmentGrid({ counts, total }: { counts: Record<string, number>; total: number }) {
  const scroller = useRef<HTMLDivElement>(null);
  const listId = useId();
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const sync = useCallback(() => {
    const el = scroller.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 2);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
  }, []);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    sync();
    el.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    return () => {
      el.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, [sync]);

  function step(dir: -1 | 1) {
    const el = scroller.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-card]");
    const styles = getComputedStyle(el);
    const gap = Number.parseFloat(styles.columnGap || styles.gap || "20") || 20;
    const amount = (card?.offsetWidth ?? 280) + gap;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: dir * amount, behavior: reduce ? "auto" : "smooth" });
  }

  function onKey(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      step(1);
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      step(-1);
    }
  }

  const arrow =
    "grid size-11 shrink-0 place-items-center self-center bg-kg-navy text-kg-kalk focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kg-signal";

  return (
    <section className="container-kg section-kg">
      <SectionHead
        title="Waar gaat u mee aan de slag?"
        aside={
          <Link href="/gevelbekleding" className="font-mono text-[14px] text-kg-text-2 underline-offset-[3px]">
            {total} artikelen
          </Link>
        }
      />
      <div className="flex items-stretch gap-3">
        <button type="button" className={arrow} aria-label="Vorige categorieën" aria-controls={listId} aria-disabled={!canPrev} onClick={() => canPrev && step(-1)}>
          <Chevron dir="left" />
        </button>
        <div
          id={listId}
          ref={scroller}
          tabIndex={0}
          role="region"
          aria-roledescription="carrousel"
          aria-label="Categorieën"
          onKeyDown={onKey}
          className="flex min-w-0 flex-1 snap-x snap-mandatory gap-5 overflow-x-auto scroll-px-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kg-navy [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {CARDS.map((app) => (
            <Link
              key={app.href}
              href={app.href}
              data-card
              className="group flex w-[min(78vw,280px)] shrink-0 snap-start flex-col gap-3 text-inherit no-underline hover:text-inherit hover:no-underline"
            >
              <ProductPhoto
                image={app.image}
                alt={app.name}
                sizes="280px"
                fit="contain"
                className="aspect-[4/3]"
                imageClassName="p-3 transition-transform duration-200 group-hover:scale-[1.03]"
              />
              <div className="text-[17px] font-medium leading-[1.3]">{app.name}</div>
              <div className="flex w-full justify-between font-mono text-[13px] text-kg-text-2">
                <span>{app.detail}</span>
                <span>{app.count ?? counts[app.slug ?? ""] ?? 0}</span>
              </div>
            </Link>
          ))}
        </div>
        <button type="button" className={arrow} aria-label="Volgende categorieën" aria-controls={listId} aria-disabled={!canNext} onClick={() => canNext && step(1)}>
          <Chevron dir="right" />
        </button>
      </div>
    </section>
  );
}
