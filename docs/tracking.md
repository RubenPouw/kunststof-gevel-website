# Meting

De site laadt geen script van Google, Tag Manager of een andere meetpartij. De browser stuurt een gebeurtenis naar een eigen adres. Alleen als de bijbehorende vlag aan staat én de bezoeker in de cookiebanner heeft geaccepteerd, stuurt de server die gebeurtenis door naar GA4 (Measurement Protocol) of Google Ads (upload van klikconversies, met gehashte contactgegevens).

Beide vlaggen staan standaard uit. Ontbreekt een geheim terwijl de vlag aan staat, dan slaat de server dat kanaal stil over. Een offerte, staalaanvraag of bestelling mislukt niet als het doorsturen faalt.

## Toestemming

De banner schrijft `granted` of `denied` in `localStorage` onder `kg-consent` en stuurt dezelfde keuze naar `POST /api/tracking/toestemming`. Die route zet twee httpOnly-cookies, `SameSite=Lax`, ongeveer 90 dagen, `Secure` in productie:

| Cookie | Inhoud |
| --- | --- |
| `kg_consent` | `granted` of `denied` |
| `kg_ads` | Willekeurig browserkenmerk, plus `gclid`, `gbraid` of `wbraid` als die er zijn |

Zonder `kg_consent=granted` zet de server geen meetcookie en stuurt hij niets naar Google. De drie conversies hieronder komen niet uit de browser. Het endpoint voor de browser weigert ze, zodat een bezoeker ze niet zelf kan posten.

Tot de keuze blijft een klikcode alleen in `sessionStorage` van dit tabblad (`kg-ads-pending`). Een weigering wist die code. Een inline script op de pagina bewaart de code vóór de configurator de query uit het adres haalt. Bij een redirect blijven alleen geldige klikcodes aan de nieuwe URL hangen.

Bij afrekenen, en alleen na toestemming, gaan het browserkenmerk en de klikcode mee als verborgen Shopify-attributen (`_kg_consent`, `_kg_client`, `_kg_gclid`, `_kg_gbraid`, `_kg_wbraid`). De betaalpagina staat op het domein van Shopify. De order-webhook leest die attributen terug.

## Gebeurtenissen

`type` en `typen` zijn de slug van het kozijn, bijvoorbeeld `draaikiepraam`. Bedragen zijn euro, exclusief btw, afgerond op centen. Een onbekend bedrag gaat niet mee.

| Gebeurtenis | Bron | Parameters | Google Ads |
| --- | --- | --- | --- |
| `configurator_gestart` | Browser, zodra de configurator klaarstaat en er toestemming is | `type` | Nee. Alleen GA4. |
| `configurator_afgerond` | Browser, op de stap Overzicht | `type`, `waarde_excl` als de prijsvlag aan staat en er een bedrag is | Nee. Alleen GA4. |
| `offertemand_verzonden` | Server, na een geslaagde kozijnofferte | `aantal_kozijnen` (nu 1), `typen`, `totaalwaarde` als die bekend is | Ja. Dit is het primaire zakelijke conversiedoel. |
| `staalaanvraag_verzonden` | Server, na een geslaagde staalaanvraag | `aantal_stalen` | Ja. |
| `bestelling` | `POST /api/tracking/shopify`, Shopify-topic `orders/create` | `order_id` (Shopify-ordernummer), `waarde` als `total_price` in EUR is | Ja. Ads gebruikt `order_id` om een herhaalde webhook niet dubbel te tellen. |

Er is nog geen mandje met meerdere kozijnen. `aantal_kozijnen` is daarom 1 en `typen` is de ene slug. Inkoop en marge gaan nergens heen: niet naar de browser, niet naar Google.

## Endpoints

| Pad | Wie |
| --- | --- |
| `POST /api/tracking/toestemming` | De banner. Body: `choice` plus de klikcodes. |
| `POST /api/tracking/gebeurtenis` | Alleen `configurator_gestart` en `configurator_afgerond`. Antwoord `204`. Zonder toestemming gebeurt er niets. |
| `POST /api/tracking/shopify` | Shopify `orders/create`, dezelfde HMAC als `/api/inkomend`. Andere topics krijgen `200` en worden genegeerd. |

De bestelling gaat alleen door als het orderattribuut `_kg_consent` de waarde `granted` heeft. Registreer de webhook zelf in Shopify op `https://www.kunststof-gevel.nl/api/tracking/shopify` (of het Render-adres zolang de site daar draait). Deze repo registreert geen webhooks.

## Omgeving

```
TRACKING_GA4_ACTIEF=false
GA4_MEASUREMENT_ID=
GA4_API_SECRET=
TRACKING_ADS_ACTIEF=false
GOOGLE_ADS_DEVELOPER_TOKEN=
GOOGLE_ADS_CUSTOMER_ID=
GOOGLE_ADS_LOGIN_CUSTOMER_ID=
GOOGLE_ADS_CLIENT_ID=
GOOGLE_ADS_CLIENT_SECRET=
GOOGLE_ADS_REFRESH_TOKEN=
GOOGLE_ADS_CONVERSION_OFFERTE=
GOOGLE_ADS_CONVERSION_STAAL=
GOOGLE_ADS_CONVERSION_BESTELLING=
```

`GOOGLE_ADS_CUSTOMER_ID` is het klantnummer, streepjes mogen. Een conversie-actie is het numerieke id of het volledige pad `customers/{id}/conversionActions/{id}`. Leeg betekent: die gebeurtenis gaat niet naar Ads. `GOOGLE_ADS_LOGIN_CUSTOMER_ID` alleen invullen als de aanroep via een beheeraccount loopt.

In Google Ads de actie van `offertemand_verzonden` als primaire conversie zetten. De andere twee mogen secundair.

Ads krijgt precies één klikcode, in deze volgorde: `gclid`, anders `gbraid`, anders `wbraid`. Zonder klikcode gaat de gebeurtenis niet naar Ads. GA4 krijgt hem nog wel, met het first-party browserkenmerk als `client_id`. Het tijdstip gaat in UTC. E-mail en telefoon worden genormaliseerd en als SHA-256 meegestuurd. Een Gmail-adres verliest punten en het deel na een plus. Een Nederlands nummer dat met 0 begint wordt `+31`. De ruwe waarden en de volledige klikcode komen niet in de log.
