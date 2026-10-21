# kunststof-gevel.nl

Webshop voor **kunststof-gevel.nl** (Pouw Online Group B.V.): kunststof gevelbekleding, dakranden en kozijnafwerking.

De huisstijl volgt het designsystem: Luminous Blue als merk, Energy Orange alleen voor actie, Barlow + Barlow Condensed, radius 0, prijzen zonder euroteken.

## Lokaal draaien

```bash
npm install
cp .env.example .env.local   # optioneel, zie Shopify hieronder
npm run dev
```

De ontwikkelserver luistert op `http://127.0.0.1:43147`.

Productie lokaal:

```bash
npm run build
npm start
```

`npm start` bindt op `0.0.0.0` en gebruikt de `PORT`-omgevingsvariabele (Render zet die automatisch).

## Pagina's

- `/` — home (hero, merkenmarquee, assortiment, kleurstalen, bestsellers, projecten)
- `/gevelbekleding`, `/dakranden`, `/kozijnafwerking`, `/montage` — categorieën (filters `?merk=`, `?type=`, `?kleur=`, `?breedte=`, `?voorraad=1`)
- `/producten/[slug]` — productdetail (kleur, lengte-SKU, calculator, stalen)
- `/merken`, `/merken/[slug]` — merken (PLP met sidebarfilters)
- `/stalen` — aanvraag gratis kleurstalen
- `/winkelwagen`, `/afrekenen`: winkelwagen, daarna Shopify-checkout (Storefront cart, of een conceptbestelling als het Admin-token gezet is)
- `/zoeken` — zoeken op naam, merk, SKU
- `/zakelijk`, `/over-ons`, `/projecten`, `/offerte`, `/contact`
- `/blog`, `/blog/[slug]` — kennisartikelen (prijs, merken, montage, stalen)
- `/inloggen`, `/registreren`, `/account` — klantaccount in de browser (geen serverwachtwoord)
- `/api/health` — health check voor Render

Het offerteformulier valideert op de server. Een aanvraag is pas gelukt als de mailprovider of ActiveCampaign de lead heeft aangenomen. Zonder beide kanalen ziet de bezoeker een fout met het telefoonnummer. Kleurstalen gaan via `/stalen` (max. 4). De winkelwagen is lokaal (browser, `kg-cart-v2`). Afrekenen maakt een Shopify-checkout. Er is geen succespagina zonder betaallink.

`npm test` dekt redirects, de m²-calculator, checkout-weigeringen en leads. `CHECK_BASE=http://127.0.0.1:43147 node scripts/check-redirects.mjs` controleert elke oude URL uit `data/seo/redirects.csv` tegen een draaiende server.

De productpagina rekent een gevelvlak om naar panelen: breedte × hoogte, minus openingen, plus 10% snijverlies. Merkpagina’s en categorieën hebben SEO-tekst; `/blog` bundelt de uitleg. Deze repo wijzigt de oude WordPress-site op kunststof-gevel.nl niet.

## Catalogus

Zonder Shopify-omgevingsvariabelen gebruikt de site de statische JSON in `src/data/catalog/`. Dat is de fallback zodat `npm run build` lokaal en in CI niet stukgaat.

Als `SHOPIFY_STORE_DOMAIN` en `SHOPIFY_STOREFRONT_ACCESS_TOKEN` gezet zijn, is de **Shopify Storefront API** de bron voor productlisting, categorieën, productdetail, zoeken en merken/filters. De shop `ajfust-8f.myshopify.com` is gekoppeld op de Render-ontwikkelomgeving (`*.onrender.com`), niet op het live domein kunststof-gevel.nl.

Routes mappen op Shopify-collecties en `productType` waar die bestaan:

| Site-route | Shopify collectie-handle / product type |
|---|---|
| `/gevelbekleding` | Gevelbekleding, Rabatdelen, Sponningdelen, Wandpanelen |
| `/dakranden` | Dakrand, Dakranden |
| `/kozijnafwerking` | Kozijnafwerking |
| `/montage` | Kunststof profielen, Montage |

Merken komen uit Shopify `vendor`, anders uit de producttitel (Milin, Heering, VinyPlus, …). Productdetail toont titel, varianten (kleur/lengte), prijs in EUR, SKU, leverancier en afbeeldingen als Shopify die heeft.

Collecties moeten op het **Storefront / Headless**-kanaal gepubliceerd staan, anders valt de mapping terug op `productType`, tags en titel. Verzendartikelen (`verzendkosten`, `pakketservice`) worden uitgefilterd.

Shopify-importkolommen voor de statische catalogus: `data/shopify-import.csv` (Barcode/EAN leeg tot leveranciers ze aanleveren). Vernieuw de CSV met `node scripts/export-shopify-csv.mjs`.

## Shopify-omgevingsvariabelen

Kopieer `.env.example` naar `.env.local` voor lokaal. Zet **dezelfde keys** op Render (Dashboard → service → Environment). Commit nooit het echte Storefront-token; `.env*` staat in `.gitignore`.

```
SHOPIFY_STORE_DOMAIN=your-shop.myshopify.com
SHOPIFY_STOREFRONT_ACCESS_TOKEN=your-storefront-access-token
SHOPIFY_API_VERSION=2025-01

# Optioneel. Zonder deze twee keys blijven offerte en stalen werken (log + referentie).
ACTIVECAMPAIGN_API_URL=https://jouwaccount.api-us1.com
ACTIVECAMPAIGN_API_KEY=your-activecampaign-api-key
ACTIVECAMPAIGN_LIST_ID=

LEAD_EMAIL_TO=info@kunststof-gevel.nl
LEAD_EMAIL_FROM=info@kunststof-gevel.nl
LEAD_EMAIL_PROVIDER=smtp
RESEND_API_KEY=
MAILERSEND_API_KEY=
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=info@kunststof-gevel.nl
SMTP_PASS=
SHOPIFY_ADMIN_ACCESS_TOKEN=
NEXT_PUBLIC_GTM_ID=GTM-N3DQ6G5
NOINDEX=
```

`ACTIVECAMPAIGN_API_URL` is het accountadres zonder `/api/3`. `ACTIVECAMPAIGN_LIST_ID` is het numerieke lijst-id; leeg laten mag. De API-key komt uit ActiveCampaign → Settings → Developer. Zet de drie keys op Render met sync vanuit het dashboard (`render.yaml` declareert ze als `sync: false`). Commit de waarden niet.

Offerte- en staalmail gaat via Google Workspace. `SMTP_HOST` is `smtp.gmail.com`, poort `587` (STARTTLS) of `465` (TLS). Afzender en ontvanger zijn allebei `info@kunststof-gevel.nl`. `SMTP_PASS` is een Google-appwachtwoord en blijft `sync: false`. Zonder dat wachtwoord én zonder ActiveCampaign toont het formulier een fout. `RESEND_API_KEY` en `MAILERSEND_API_KEY` zijn alleen nodig als `LEAD_EMAIL_PROVIDER` op `resend` of `mailersend` staat.

`render.yaml` declareert deze variabelen (`sync: false` voor domain en token, zodat het geheim in het Dashboard blijft). Na een Blueprint-apply of op de bestaande web service de waarden invullen en opnieuw deployen.

Dit is alleen voor de **Onrender-preview / development webshop**. Geen productie-DNS, geen custom domain en geen live betalingen in deze koppeling.

## Design tokens

Tokens staan in `src/styles/tokens/` (kleur, type, spacing). Componenten: `src/components/brand/`. Logo-assets: `public/brand/`.

## Render

`render.yaml` definieert een Node web service (`kunststofgevel-website`) in Frankfurt, plan free.

1. Open de Blueprint: [Render Blueprint](https://dashboard.render.com/blueprint/new?repo=https://github.com/RubenPouw/kunststof-gevel-website).
2. Koppel GitHub als Render daarom vraagt, kies deze repo, en klik Apply.
3. Vul `SHOPIFY_STORE_DOMAIN` en `SHOPIFY_STOREFRONT_ACCESS_TOKEN` in bij Environment. Laat `SHOPIFY_API_VERSION` op `2025-01` tenzij Shopify een nieuwere Storefront-versie vereist. Zet `SMTP_PASS` (Google-appwachtwoord voor `info@kunststof-gevel.nl`). ActiveCampaign blijft optioneel.

Health check: `GET /api/health`.
