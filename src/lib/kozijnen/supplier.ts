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

/**
 * Deurkaart NL7000_D_IN_BP, 09-07-2024, alleen naar binnen en zonder drempel.
 * Die uitvoering verkopen we niet: de configurator heeft een lage dorpel of een
 * doorlopend kader, en een tuindeur draait standaard naar buiten.
 * Daarom staan deze maxima niet in de typebestanden.
 * 1 vleugel 1200 x 2460, 2 vleugels 2000 x 2490, 3 vleugels 1800 x 2490.
 * Samengestelde deuren: niet bepaald.
 */
