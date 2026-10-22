/**
 * Leveranciersgegevens. Alleen importeren vanuit servermodules.
 * Deze namen horen niet in de clientbundel en niet in HTML.
 */

export const SUPPLIER = {
  name: "EKO",
  /** TODO(leverancier): niet als bron op de site gebruiken. */
  site: "https://eko4u.com",
} as const;

/**
 * TODO(leverancier): pas op true zetten als de data het voor dit profiel bevestigt.
 * Tot die tijd geen van deze namen in klanttekst, schema of de configurator.
 */
export const CLAIMS = {
  rc2: false,
  pkvw: false,
  skg: false,
  komo: false,
} as const;
