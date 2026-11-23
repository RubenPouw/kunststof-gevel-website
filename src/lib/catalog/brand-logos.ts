/**
 * Marks for the catalogue brand row.
 * Keralit, Florence, Heering and Unipanel use a name wordmark in that row.
 * The homepage and /merken use officialBrandLogo, which only lists manufacturer files.
 */
export const brandLogoFile: Record<string, string> = {
  eurotexx: "/brand/merken/eurotexx.svg",
  florence: "/brand/merken/florence.svg",
  fronto: "/brand/merken/fronto.svg",
  heering: "/brand/merken/heering.svg",
  keralit: "/brand/merken/keralit.svg",
  kerrafront: "/brand/merken/kerrafront.svg",
  milexx: "/brand/merken/milexx.svg",
  milin: "/brand/merken/milin.svg",
  milinboard: "/brand/merken/milinboard.svg",
  multitexx: "/brand/merken/multitexx.svg",
  renolit: "/brand/merken/renolit.svg",
  thomdeck: "/brand/merken/thomdeck.svg",
  unipanel: "/brand/merken/unipanel.svg",
  vinyplus: "/brand/merken/vinyplus.svg",
  vinytherm: "/brand/merken/vinytherm.svg",
  zierer: "/brand/merken/zierer.svg",
};

export function brandLogoSrc(slug: string) {
  return brandLogoFile[slug];
}

/**
 * Manufacturer marks for the homepage bar and /merken.
 * Navy wordmarks and reseller files are not in this map.
 * Werzalit, HPL, HPL Compact Exterieur, Overig, Profex and Abet have no official file here.
 */
export const officialBrandLogoFile: Record<string, string> = {
  eurotexx: "/brand/merken/eurotexx.svg",
  florence: "/merken/florence.svg",
  fronto: "/brand/merken/fronto.svg",
  heering: "/merken/heering.svg",
  keralit: "/merken/keralit.svg",
  kerrafront: "/brand/merken/kerrafront.svg",
  milexx: "/brand/merken/milexx.svg",
  milin: "/brand/merken/milin.svg",
  milinboard: "/brand/merken/milinboard.svg",
  multitexx: "/brand/merken/multitexx.svg",
  novicell: "/merken/novicell.svg",
  renolit: "/brand/merken/renolit.svg",
  thomdeck: "/brand/merken/thomdeck.svg",
  unipanel: "/merken/unipanel.svg",
  vinyplus: "/brand/merken/vinyplus.svg",
  vinytherm: "/brand/merken/vinytherm.svg",
  zierer: "/brand/merken/zierer.svg",
};

export function officialBrandLogo(slug: string) {
  return officialBrandLogoFile[slug];
}
