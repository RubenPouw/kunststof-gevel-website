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

- `/` — home (hero, merken, productgrid)
- `/gevelbekleding`, `/dakranden`, `/kozijnafwerking`, `/montage` — categorieën (filters `?merk=` en `?voorraad=1`)
- `/producten/[slug]` — productdetail (variant/SKU, completeer-systeem)
- `/merken`, `/merken/[slug]` — merken
- `/winkelwagen`, `/afrekenen` — checkout in drie stappen (nog geen live betaling)
- `/zoeken` — zoeken op naam, merk, SKU
- `/zakelijk`, `/over-ons`, `/projecten`, `/offerte`, `/contact`
- `/api/health` — health check voor Render

Het offerteformulier valideert op de server. Er is nog geen e-mailkoppeling: aanvragen worden gelogd en de bezoeker krijgt een referentie plus prijsindicatie. De winkelwagen is lokaal (browser, `kg-cart-v2`); betaling is nog geen live koppeling.

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
```

`render.yaml` declareert deze variabelen (`sync: false` voor domain en token, zodat het geheim in het Dashboard blijft). Na een Blueprint-apply of op de bestaande web service de waarden invullen en opnieuw deployen.

Dit is alleen voor de **Onrender-preview / development webshop**. Geen productie-DNS, geen custom domain en geen live betalingen in deze koppeling.

## Design tokens

Tokens staan in `src/styles/tokens/` (kleur, type, spacing). Componenten: `src/components/brand/`. Logo-assets: `public/brand/`.

## Render

`render.yaml` definieert een Node web service (`kunststofgevel-website`) in Frankfurt, plan free.

1. Open de Blueprint: [Render Blueprint](https://dashboard.render.com/blueprint/new?repo=https://github.com/RubenPouw/kunststof-gevel-website).
2. Koppel GitHub als Render daarom vraagt, kies deze repo, en klik Apply.
3. Vul `SHOPIFY_STORE_DOMAIN` en `SHOPIFY_STOREFRONT_ACCESS_TOKEN` in bij Environment. Laat `SHOPIFY_API_VERSION` op `2025-01` tenzij Shopify een nieuwere Storefront-versie vereist.

Health check: `GET /api/health`.
