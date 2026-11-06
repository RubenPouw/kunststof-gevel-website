import Image from "next/image";
import Link from "next/link";

import { Bevel } from "@/components/brand/section-head";
import { buttonVariants } from "@/components/ui/button";
import { hero } from "@/lib/site";
import { cn } from "@/lib/utils";

const HERO_PHOTO = {
  src: "/home/vinyplus-rondkant-turners-eiken-shadow.webp",
  alt: "Overstek en gevel in VinyPlus rondkantpaneel Turners eiken shadow, met downlight in het plafond",
};

export function HomeHero() {
  return (
    <section className="container-kg pt-10 pb-4 lg:pt-14">
      <div className="grid items-end gap-5 lg:grid-cols-[7fr_5fr]">
        <div>
          <h1 className="display-home text-balance">
            {hero.title}
            <br />
            {hero.subtitle}
          </h1>
          <p className="mt-5 max-w-[560px] text-[17px] text-kg-text-2">{hero.body}</p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link href="/gevelbekleding" className={cn(buttonVariants({ variant: "primary" }))}>
              {hero.cta}
            </Link>
            <a href="#stalen" className={cn(buttonVariants({ variant: "outline" }), "no-underline hover:no-underline")}>
              {hero.samples}
            </a>
            <span className="ml-2 font-mono text-[13px] text-kg-text-2">{hero.micro}</span>
          </div>
        </div>
        <Bevel size={24} className="relative h-[240px] bg-kg-navy lg:h-[380px]">
          <Image
            src={HERO_PHOTO.src}
            alt={HERO_PHOTO.alt}
            fill
            priority
            sizes="(min-width: 1024px) 40vw, 100vw"
            className="object-cover object-[center_40%]"
          />
          <div className="absolute top-0 left-0 z-10 bg-kg-navy px-[18px] py-3.5 font-mono text-[13px] leading-[1.5] text-kg-kalk">
            VinyPlus rondkant Turners eiken shadow
            <br />
            <span className="text-[22px] font-medium tracking-[-0.02em] sm:text-[26px]">
              levertijd in overleg
            </span>
          </div>
        </Bevel>
      </div>
    </section>
  );
}
