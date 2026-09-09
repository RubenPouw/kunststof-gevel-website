# kunststof-gevel.nl

Webshop voor **kunststof-gevel.nl** (onderdeel van Cavemen BV): kunststof gevelbekleding, dakranden en kozijnafwerking.

De huisstijl volgt het designsystem: Luminous Blue als merk, Energy Orange alleen voor actie, Barlow + Barlow Condensed, radius 0, prijzen zonder euroteken.

## Lokaal draaien

```bash
npm install
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
- `/zoeken` — productzoeken
- `/zakelijk`, `/over-ons`, `/projecten`, `/offerte`, `/contact`
- `/api/health` — health check voor Render

Het offerteformulier valideert op de server. Er is nog geen e-mailkoppeling: aanvragen worden gelogd en de bezoeker krijgt een referentie plus prijsindicatie. De winkelwagen is lokaal (browser, `kg-cart-v2`); betaling is nog geen live koppeling.

Catalogusdata staat in `data/catalog/` (JSON). Shopify-importkolommen: `data/shopify-import.csv` (Barcode/EAN leeg tot leveranciers ze aanleveren). Vernieuw de CSV met `node scripts/export-shopify-csv.mjs`.

## Design tokens

Tokens staan in `src/styles/tokens/` (kleur, type, spacing). Componenten: `src/components/brand/`. Logo-assets: `public/brand/`.

## Render

`render.yaml` definieert een Node web service (`kunststofgevel-website`) in Frankfurt, plan free.

1. Open de Blueprint: [Render Blueprint](https://dashboard.render.com/blueprint/new?repo=https://github.com/RubenPouw/kunststof-gevel-website).
2. Koppel GitHub als Render daarom vraagt, kies deze repo, en klik Apply.

Health check: `GET /api/health`.
