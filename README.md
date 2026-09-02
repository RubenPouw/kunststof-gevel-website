# Kunststofgevel

Website en webservice voor **Kunststofgevel**: advies, levering en montage van onderhoudsarme kunststof gevelbekleding.

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

- `/` — home
- `/assortiment` — profielen en kleuren
- `/projecten` — recente gevels
- `/over-ons` — werkwijze
- `/offerte` — aanvraag met prijsindicatie
- `/contact` — telefoon, mail, formulier
- `/api/health` — health check voor Render

Het offerteformulier valideert op de server. Er is nog geen e-mailkoppeling: aanvragen worden gelogd en de bezoeker krijgt een referentie plus prijsindicatie.

## Render

`render.yaml` definieert een Node web service (`kunststof-gevel-website`) in Frankfurt, plan free.

1. Open de Blueprint: [Render Blueprint](https://dashboard.render.com/blueprint/new?repo=https://github.com/RubenPouw/kunststof-gevel-website).
2. Koppel GitHub als Render daarom vraagt, en klik Apply.

Health check: `GET /api/health`.
