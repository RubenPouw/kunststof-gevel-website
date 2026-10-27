/**
 * Official marks where the file is in the repo.
 * Keralit, Florence, Heering and Unipanel use a name wordmark in the same tile.
 * The publisher mark is not in this repo.
 */
export const brandLogoFile: Record<string, string> = {
  eurotexx: "/brand/merken/eurotexx.svg",
  florence: "/brand/merken/florence.svg",
  fronto: "/brand/merken/fronto.svg",
  heering: "/brand/merken/heering.svg",
  keralit: "/brand/merken/keralit.svg",
  kerrafront: "/brand/merken/kerrafront.svg",
  linerio: "/brand/merken/linerio.svg",
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
