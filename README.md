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
- `/gevelbekleding`, `/dakranden`, `/kozijnafwerking` — categorieën
- `/producten/[slug]` — productdetail
- `/merken`, `/merken/[slug]` — merken
- `/winkelwagen`, `/afrekenen` — checkout in drie stappen
- `/zoeken` — productzoeken
- `/zakelijk`, `/over-ons`, `/projecten`, `/offerte`, `/contact`
- `/api/health` — health check voor Render

Het offerteformulier valideert op de server. Er is nog geen e-mailkoppeling: aanvragen worden gelogd en de bezoeker krijgt een referentie plus prijsindicatie. De winkelwagen is lokaal (browser); betaling is nog geen live koppeling.

## Design tokens

Tokens staan in `src/styles/tokens/` (kleur, type, spacing). Componenten: `src/components/brand/`. Logo-assets: `public/brand/`.

## Render

`render.yaml` definieert een Node web service (`kunststofgevel-website`) in Frankfurt, plan free.

1. Open de Blueprint: [Render Blueprint](https://dashboard.render.com/blueprint/new?repo=https://github.com/RubenPouw/kunststof-gevel-website).
2. Koppel GitHub als Render daarom vraagt, kies deze repo, en klik Apply.

Health check: `GET /api/health`.
