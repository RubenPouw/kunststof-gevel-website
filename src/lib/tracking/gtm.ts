/** Container op de live WordPress-site. Zelfde id op dit domein zodra DNS hierheen wijst. */
export const GTM_PRODUCTION_ID = "GTM-N3DQ6G5";

/**
 * Preview-CSP. Blokkeert het GTM-script en het noscript-iframe.
 * Andere bronnen (Shopify-plaatjes, eigen scripts) blijven toegestaan.
 */
export const PREVIEW_GTM_CSP = "script-src 'self' 'unsafe-inline'; frame-src 'self'; object-src 'none'";

export function hostnameOf(host: string) {
  return host.split(",")[0]?.trim().split(":")[0]?.toLowerCase() ?? "";
}

export function isPreviewHost(host: string) {
  const hostname = hostnameOf(host);
  return hostname === "onrender.com" || hostname.endsWith(".onrender.com");
}

export function isProductionHost(host: string) {
  const hostname = hostnameOf(host);
  return hostname === "kunststof-gevel.nl" || hostname === "www.kunststof-gevel.nl";
}

/** `null` = domeinregel. `"uit"` = overal uit. Een GTM-id = die container, nooit op preview. */
export function gtmEnvOverride(raw: string | undefined): string | null {
  const value = (raw ?? "").trim();
  if (!value) return null;
  if (/^(uit|off|false|0)$/i.test(value)) return "uit";
  if (/^GTM-[A-Z0-9]+$/.test(value)) return value;
  return null;
}

export function resolveGtmId(host: string, configured: string | undefined): string | null {
  if (isPreviewHost(host)) return null;
  const override = gtmEnvOverride(configured);
  if (override === "uit") return null;
  if (override) return override;
  if (isProductionHost(host)) return GTM_PRODUCTION_ID;
  return null;
}

export function gtmDataLayerScript() {
  return `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('consent', 'default', {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied',
  wait_for_update: 500
});
gtag('set', 'ads_data_redaction', true);
try {
  if (localStorage.getItem('kg-consent') === 'granted') {
    gtag('consent', 'update', {
      ad_storage: 'granted',
      ad_user_data: 'granted',
      ad_personalization: 'granted',
      analytics_storage: 'granted'
    });
  }
} catch (e) {}`;
}

export function gtmLoaderScript(configured: string | undefined) {
  const override = gtmEnvOverride(configured);
  const force = JSON.stringify(override);
  return `(function(w,d,s,l,i){
var host=(location.hostname||"").toLowerCase();
if(host==="onrender.com"||host.endsWith(".onrender.com"))return;
var force=${force};
if(force==="uit")return;
if(force)i=force;
else if(host!=="kunststof-gevel.nl"&&host!=="www.kunststof-gevel.nl")return;
w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});
var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';
j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_PRODUCTION_ID}');`;
}

export function gtmNoscriptHtml(id: string) {
  return `<iframe src="https://www.googletagmanager.com/ns.html?id=${id}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`;
}

/** Id in de statische HTML. Preview haalt hem alsnog niet op (script-return + CSP). */
export function gtmMarkupId(configured: string | undefined) {
  const override = gtmEnvOverride(configured);
  if (override === "uit") return null;
  if (override) return override;
  return GTM_PRODUCTION_ID;
}
