/**
 * Official marks published by the brand or its supplier.
 * Tiles without a file show the brand name, not a drawn stand-in.
 */
export const brandLogoFile: Record<string, string> = {
  eurotexx: "/brand/merken/eurotexx.svg",
  fronto: "/brand/merken/fronto.svg",
  kerrafront: "/brand/merken/kerrafront.svg",
  linerio: "/brand/merken/linerio.svg",
  milexx: "/brand/merken/milexx.svg",
  milin: "/brand/merken/milin.svg",
  milinboard: "/brand/merken/milinboard.svg",
  multitexx: "/brand/merken/multitexx.svg",
  renolit: "/brand/merken/renolit.svg",
  thomdeck: "/brand/merken/thomdeck.svg",
  vinyplus: "/brand/merken/vinyplus.svg",
  vinytherm: "/brand/merken/vinytherm.svg",
  zierer: "/brand/merken/zierer.svg",
};

export function brandLogoSrc(slug: string) {
  return brandLogoFile[slug];
}
