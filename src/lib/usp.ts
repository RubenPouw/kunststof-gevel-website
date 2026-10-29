export type UspItem = { k: string; v: string };

/** Header-USP per deel van de site. Kozijnen: geen montage, geen kleurgarantie, geen voorraad. Alles is op maat. */
export const uspBySection = {
  site: [
    { k: "Showroom", v: "op afspraak in Hedel" },
    { k: "Levering", v: "max. 4 werkdagen" },
    { k: "10 jaar", v: "garantie op kleur" },
    { k: "Montage", v: "via offerte" },
  ],
  kozijnen: [
    { k: "Aluplast", v: "kozijnen op maat" },
    { k: "Werktekening", v: "met maten" },
    { k: "Meerdere kozijnen", v: "in één offertemand" },
    { k: "Duidelijke", v: "meetinstructie" },
  ],
} as const satisfies Record<string, readonly UspItem[]>;

export const siteUsp = uspBySection.site;

const KOZIJN_ROOTS = ["/kunststof-kozijnen", "/kozijnen", "/ramen", "/schuifpuien", "/deuren", "/kennisbank"];

export function isKozijnSection(pathname: string) {
  const path = (pathname.split("?")[0] || "/").replace(/\/+$/, "") || "/";
  return KOZIJN_ROOTS.some((root) => path === root || path.startsWith(`${root}/`));
}

export function uspForPath(pathname: string): readonly UspItem[] {
  return isKozijnSection(pathname) ? uspBySection.kozijnen : uspBySection.site;
}
