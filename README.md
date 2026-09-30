# kunststof-gevel.nl

Webshop voor **kunststof-gevel.nl** (onderdeel van Cavemen BV): kunststof gevelbekleding, dakranden en kozijnafwerking.

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
- `/winkelwagen`, `/afrekenen` — checkout in drie stappen (nog geen live betaling)
- `/zoeken` — zoeken op naam, merk, SKU
- `/zakelijk`, `/over-ons`, `/projecten`, `/offerte`, `/contact`
- `/blog`, `/blog/[slug]` — kennisartikelen (prijs, merken, montage, stalen)
- `/inloggen`, `/registreren`, `/account` — klantaccount in de browser (geen serverwachtwoord)
- `/api/health` — health check voor Render

Het offerteformulier valideert op de server. Zonder ActiveCampaign-sleutels worden aanvragen gelogd en krijgt de bezoeker een referentie plus prijsindicatie (materiaal € 65–120/m² of inclusief montage € 95–140/m²). Kleurstalen gaan via `/stalen` (max. 4). Beide flows schrijven, als de sleutels gezet zijn, een contact naar ActiveCampaign. De winkelwagen is lokaal (browser, `kg-cart-v2`); het klantaccount ook (`kg-account-v1`, wachtwoord blijft in de browser). Betaling is nog geen live koppeling.

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

# Optioneel. Zonder API-key blijft de statische Google-regel (4,9 · 120) staan.
GOOGLE_PLACES_API_KEY=your-places-api-key
GOOGLE_PLACE_ID=ChIJpTqzqNL_hy8RDIC8CeY0l9g
```

`ACTIVECAMPAIGN_API_URL` is het accountadres zonder `/api/3`. `ACTIVECAMPAIGN_LIST_ID` is het numerieke lijst-id; leeg laten mag. De API-key komt uit ActiveCampaign → Settings → Developer. Zet de drie keys op Render met sync vanuit het dashboard (`render.yaml` declareert ze als `sync: false`). Commit de waarden niet.

`GOOGLE_PLACES_API_KEY` komt uit Google Cloud (Places API New). Zonder key bouwt de site gewoon en toont de homepage de vaste regel 4,9 · 120 beoordelingen plus de statische klantcitaten. Met de key komen rating, aantal en reviews van Places, twee uur gecachet. `GOOGLE_PLACE_ID` staat al op Kunststof-gevel.nl; alleen overschrijven als het vestigings-id wijzigt. De WebwinkelKeur-shop `1214873` is openbaar en staat in `src/lib/site.ts`, geen env var.

`render.yaml` declareert deze variabelen (`sync: false` voor domain en token, zodat het geheim in het Dashboard blijft). Na een Blueprint-apply of op de bestaande web service de waarden invullen en opnieuw deployen.

Dit is alleen voor de **Onrender-preview / development webshop**. Geen productie-DNS, geen custom domain en geen live betalingen in deze koppeling.

## Design tokens

Tokens staan in `src/styles/tokens/` (kleur, type, spacing). Componenten: `src/components/brand/`. Logo-assets: `public/brand/`.

## Render

`render.yaml` definieert een Node web service (`kunststofgevel-website`) in Frankfurt, plan free.

1. Open de Blueprint: [Render Blueprint](https://dashboard.render.com/blueprint/new?repo=https://github.com/RubenPouw/kunststof-gevel-website).
2. Koppel GitHub als Render daarom vraagt, kies deze repo, en klik Apply.
3. Vul `SHOPIFY_STORE_DOMAIN` en `SHOPIFY_STOREFRONT_ACCESS_TOKEN` in bij Environment. Laat `SHOPIFY_API_VERSION` op `2025-01` tenzij Shopify een nieuwere Storefront-versie vereist. ActiveCampaign-keys zijn optioneel; zonder keys blijft de site aanvragen loggen.

Health check: `GET /api/health`.
