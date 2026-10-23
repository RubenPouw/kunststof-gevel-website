export const VAT_COOKIE = "kg_btw";
export const VAT_STORAGE = "kg-btw";
export const VAT_MAX_AGE = 60 * 60 * 24 * 365;

export type VatMode = "incl" | "excl";

export function readVatMode(cookieHeader: string | null | undefined): VatMode {
  const match = (cookieHeader ?? "").match(/(?:^|;\s*)kg_btw=(incl|excl)(?:;|$)/);
  return match?.[1] === "excl" ? "excl" : "incl";
}

/** Runs in the document head, before the first paint. Cookie wins. localStorage fills a missing cookie. Default is incl. */
export const VAT_BOOT_SCRIPT = `(function(){try{var m=document.cookie.match(/(?:^|;\\s*)kg_btw=(incl|excl)(?:;|$)/);var mode=m?m[1]:null;if(!mode){var stored=localStorage.getItem("${VAT_STORAGE}");if(stored==="incl"||stored==="excl"){mode=stored;document.cookie="${VAT_COOKIE}="+mode+"; Path=/; Max-Age=${VAT_MAX_AGE}; SameSite=Lax";}}document.documentElement.dataset.btw=mode==="excl"?"excl":"incl";}catch(e){document.documentElement.dataset.btw="incl";}})();`;

export function setVatMode(mode: VatMode) {
  document.documentElement.dataset.btw = mode;
  document.cookie = `${VAT_COOKIE}=${mode}; Path=/; Max-Age=${VAT_MAX_AGE}; SameSite=Lax`;
  try {
    localStorage.setItem(VAT_STORAGE, mode);
  } catch {
    /* private mode */
  }
}
