# Technische + on-page SEO-audit — nieuwe kunststof-gevel.nl vs concurrentie
Datum: 29-10-2026 (Europe/Madrid). Read-only: niets gewijzigd. Bronnen: sitemaps, lichte crawl (curl/python, robots.txt gerespecteerd, 0,4–1 s pauze), repo `RubenPouw/kunststof-gevel-website` (main, gelezen).
**Niet meegenomen:** Ahrefs, Google Analytics en Search Console (geen toegang vanuit deze run). Verkeer/posities per URL ontbreken dus; prioriteiten hieronder zijn op basis van techniek en content. Leg vóór go-live de top-URL's uit GSC naast `migratie-urls.csv`.

Bestanden: `migratie-urls.csv` (487 live-URL's getest), `concurrent-structuur.csv` (URL-typen per site), ruwe data `audit_*.jsonl`, `crawl_live.jsonl`, `urls_*.txt`.

---
## 1. Samenvatting

| | Nieuw (onrender) | kunststofbouwmateriaal.nl (gevel) | toeleveringonline.nl (kozijnen) | kunststofplatenshop.nl (HPL) |
|---|---|---|---|---|
| URL's in sitemap | 1.018 | 3.478 | 1.374 | 2.042 |
| Productpagina's | 923 | 2.566 kleurvarianten + 402 kleurmonsters | 532 (configurator) | 679 (op maat) |
| Categorie/subcat. | ~11 + 22 merk + 16 kozijntypes | 74 + 386 | 3 + 93 | 183 + 338 (kleur/dikte/vorm, pad-URL's) |
| Content (blog/kennis) | 12 blog + 12 kozijnen-kennisbank + 7 projecten | 41 blog | 495 kennisbank + 111 inspiratie | ~860 (DIY 347, toepassingen 197, stappenplan 131, blog 70, vergelijk 27) |
| Woorden hoofdcategorie | 559–2.064 (`/gevelbekleding` 2.064, `/kunststof-kozijnen` 559) | 1.305 (gevel), 3.312 (kozijnen), 1.712 (HPL) | 1.257 (kunststof kozijnen) | 1.283 (HPL plaat) |
| Woorden blog (mediaan) | **177** | 1.240 | 900 (kennisbank) | 768 (blog), 1.358 (stappenplan) |
| TTFB mediaan / HTML | **0,14 s / 96 KB** | 0,13 s / 115 KB | 0,23 s / 630–980 KB | 0,2–0,9 s / 550–1.100 KB |
| SSR (content in HTML) | ja | ja | ja | ja |
| AggregateRating | **nee** | nee | ja (sitebreed) | ja (cat./product) |
| Breadcrumb op categorie | **9 %** | 99 % | 100 % | 100 % |
| ItemList/CollectionPage op categorie | **nee** | nee | ja | ja |
| Product: shipping/return in Offer | **nee** | ja (OfferShippingDetails + MerchantReturnPolicy) | nee | nee |
| Indexeerbare facetten | nee (?merk= noindex) | nee (geen param-links, robots blokkeert ?dir/?mode) | nee | ja, maar als **pad-URL's** (/hpl-plaat/vormen/rond/) |
| hreflang | n.v.t. | geen | geen | geen |
| Canonical self | 100 % (→ www) | 100 % | 100 % | ~98 % |

**Kern:** techniek (snelheid, SSR, 1 H1, alt-teksten, canonicals) is beter dan bij alle drie de concurrenten. De migratie zelf is nu het grootste risico: **223 live-URL's geven 404** en **99 gaan via 301 naar een noindex-pagina**. Daarnaast is er **contentverlies** op pagina's die nu ranken (Keralit-categorie 3.754 → 925 woorden, blogs ~1.150 → ~180 woorden), en de homepage-title mist "kunststof gevelbekleding".

---
## 2. Concurrenten (structuur & patronen)

### kunststofbouwmateriaal.nl (Magento) — gevelbekleding
- Structuur: `/kunststof-gevelbekleding` → `/kunststof-gevelbekleding/{merk}` → `/…/{merk}/{serie}`; **elk product per kleur heeft een eigen root-URL** (`/keralit-sponningdeel-143-bruin-redceder-2814`): 2.566 indexeerbare kleur-URL's + 402 kleurmonster-producten. Zo pakt het site de long-tail "{merk} {profiel} {kleur}".
- Title: `{Categorie} kopen | Kunststof Bouwmateriaal`, `{Merk} gevelbekleding prijs | Bestel direct, scherpe prijs`; H1 = zoekterm ("Kunststof gevelbekleding voor buiten"). Homepage-title: "Kunststof Gevelbekleding | Kunststof Bouwmateriaal".
- Categorieën 1.150–1.300 woorden + FAQ; subcategorieën ~716; producten ~234.
- Schema: Organization + WebSite sitebreed, BreadcrumbList, FAQPage (cat.), Product + Offer + **MerchantReturnPolicy + OfferShippingDetails**. Geen reviews/sterren.
- Geen param-links in HTML; robots.txt blokkeert `?dir`, `?mode`, `?limit`.

### toeleveringonline.nl (domein met www, zonder streepje) — kozijnen
- Structuur: `/kozijnen/{materiaal}-kozijnen/{type}/` (draairamen, draaikiepramen, valramen, schuiframen, deurkozijnen, vast glas), `/product/{configurator}/`, **`/kennisbank/…` (495 URL's, tot 6 niveaus diep)**, `/inspiratie/…` (111), 8 pick-up-point-pagina's per vestiging (enige "regio"-pagina's).
- Title: `Kunststof kozijnen bestellen? Geïsoleerd met HR++ glas | Toelevering Online`; H1 kort ("Kunststof kozijnen"). Meta met ✔️-USP's, ISDE-subsidie.
- Schema: **AggregateRating sitebreed** (Organization), CollectionPage + ItemList op categorieën, Article op kennisbank.
- Zwak: HTML 600–980 KB, 55 % van de afbeeldingen zonder alt.

### kunststofplatenshop.nl — HPL
- Structuur: `/hpl-plaat/` + **pad-facetten** `/hpl-plaat/vormen/{vorm}/`, `/{materiaal}/{kleur}/{dikte}/`, 212 URL's met "hpl"; producten `/product/{slug}/` (configurator op maat); enorme content-silo: toepassingen, stappenplannen (HowTo), DIY-award, vergelijkingen ("HPL vs Volkern", "Trespa of Keralit").
- Title: `HPL plaat op maat & snel geleverd | Kunststofplatenshop.nl`; meta met ✓-USP's.
- Schema: AggregateRating, CollectionPage + ItemList + Product/Offer op categorieën, HowTo, FAQPage, WebSite + SearchAction.
- Parameter-URL's (configurator) via robots.txt geblokkeerd.

---
## 3. Nieuwe site (kunststofgevel-website.onrender.com)

### 3.1 Indexatie & techniek
| Check | Bevinding | Oordeel |
|---|---|---|
| robots.txt | Allow /, disallow checkout/account/api/weergave; `Sitemap: https://www.kunststof-gevel.nl/sitemap.xml` | ok voor go-live |
| Onrender-host | `X-Robots-Tag: noindex, nofollow` op alle 1.018 URL's (`proxy.ts`, host eindigt op `.onrender.com` of `NOINDEX=1`) | ok nu; **NOINDEX mag in productie niet aan staan** |
| Canonicals | 1.018/1.018 self-canonical naar `https://www.kunststof-gevel.nl/{pad}` (zonder slash); filters (?merk=, ?type=) → basis-URL | ok |
| sitemap.xml | 1.018 URL's, alle 200, geen noindex-URL's. Alle statische pagina's dezelfde `lastmod` (CONTENT_UPDATED). Geen afbeeldingen | ok / P2 |
| Trailing slash | `/x/` → 301 → `/x` (1 hop). Elke WP-URL heeft een slash, dus **alle 486 gemigreerde URL's krijgen 1 hop**; dat is ook zo omdat bijna alle paden wijzigen. **Geen ketens** (max 1 hop gemeten) | aanvaardbaar |
| http:// | `http://kunststofgevel-website.onrender.com/` geeft **500** (Render/Cloudflare). Op www/apex na DNS-switch testen: 1× 301 naar https://www | controleren bij go-live |
| SSR | Alle content, prijzen en JSON-LD staan in de HTML zonder JS | ok |
| Snelheid | TTFB 0,12–0,34 s, HTML 96 KB mediaan (gzip 35 KB op /gevelbekleding) | beste van de vier |
| H1 | precies 1 H1 op alle pagina's | ok |
| Alt | 7 van 7.308 img zonder alt | ok |
| Meta description | 100 % aanwezig; 20 dubbel; merkpagina's kort (31–60 tekens) | P2 |
| Titles | 110 producttitles > 60 tekens; 12 dubbele titles (varianten, bv. "Milyt HPL plaat 3050 x 1300 x 6 mm" 3×) | P1/P2 |
| 404-pagina | status 404 + noindex, maar title = homepage-title | P2 |
| Losse indexeerbare pagina's | `/kunststof-kozijnen/offertemand` 200, geen canonical, geen noindex, homepage-title; `/merken/overig` 200 indexeerbaar (dun) | P1 |
| lang / OG | `<html lang="nl">`, og:* aanwezig | ok |

### 3.2 Titles/H1 kernpagina's (nieuw vs live WP vs concurrent)
| Pagina | Nieuw title | Nieuw H1 | Woorden nieuw | Live WP | Concurrent |
|---|---|---|---|---|---|
| `/` | "kunststof-gevel.nl, Nooit meer schilderen." | "Nooit meer schilderen. Vervang hout door kunststof." | 681 | T "Kunststof gevelbekleding kopen \| Kunststof-gevel.nl", H1 "Kunststof gevelbekleding, dakranden en vensterbanken", 851 w | KBM home T "Kunststof Gevelbekleding \| …" |
| `/gevelbekleding` | "Kunststof gevelbekleding · kunststof-gevel.nl" | "Gevelbekleding" | 2.064 | (bestond niet; `/kunststof-gevelbekleding/` → home) | KBM 1.305 w, H1 "Kunststof gevelbekleding voor buiten" |
| `/keralit-gevelbekleding` | "Keralit gevelbekleding kopen" | "Keralit gevelbekleding" | 925 | product-categorie Keralit: **3.754 w** | KBM Keralit 1.368 w + FAQ |
| `/merken/keralit` | "Keralit gevelbekleding" | "Keralit" | 944 | – | – |
| `/dakranden` | "Kunststof dakranden" | "Dakranden" | 1.201 | `/keralit-dakranden/` 2.583 w | KBM boeidelen 825 w |
| `/kunststof-kozijnen` | "Kunststof kozijnen op maat" | "Kunststof kozijnen, in één profiel." | **559** | 1.404 w | TLO 1.257 w; KBM 3.312 w |
| `/hpl-platen` | "HPL platen" | "HPL platen" | 1.683 | – | KPS `/hpl-plaat/` 1.283 w |
| `/hpl-plaat` | "HPL plaat op kleur" | "HPL plaat op kleur" | 1.633 | live `/hpl-plaat/` "HPL plaat kopen \| Milyt HPL…", 1.086 w | – |
| `/kunststof-vensterbank` | "Kunststof vensterbank en overzet vensterbank" | idem + "(binnen en buiten)" | 1.254 | – | KBM 1.238 w |

### 3.3 Duplicaten / kannibalisatie (beide 200 + self-canonical + in sitemap)
| Paar | Tekst-overlap | Producten-overlap | Probleem |
|---|---|---|---|
| `/keralit-gevelbekleding` ↔ `/merken/keralit` | 14 % | 36 % | zelfde zoekterm "keralit gevelbekleding" in beide titles |
| `/zierer-steenstrips` ↔ `/merken/zierer` | 40 % | **100 %** | bijna duplicaat |
| `/hpl-platen` ↔ `/hpl-plaat` ↔ `/merken/hpl-compact-exterieur` (+ `/merken/hpl`) | 10–31 % | 32–62 % | 3–4 URL's voor "hpl plaat/platen" |
| `/kunststof-vensterbank` ↔ `/merken/milinboard` | 14 % | 30 % | lichte overlap |
| `/stalen` ↔ `/staalaanvraag` | – | – | 2 dunne pagina's (29/32 woorden), zelfde intent |
| `/kozijnen`, `/assortiment` | – | – | 200 via rewrite met canonical naar `/kunststof-kozijnen` resp. `/gevelbekleding`; beter echte 301 |

### 3.4 Structured data nieuw
- Elke pagina: HomeAndConstructionBusiness/LocalBusiness (hetzelfde blok sitebreed). Geen `Organization`+`WebSite` (+SearchAction) als @graph.
- Product (923): Product + Offer + UnitPriceSpecification + Brand + BreadcrumbList. **Ontbreekt:** `shippingDetails`, `hasMerchantReturnPolicy`, `gtin`/`mpn`, `aggregateRating`/`review`. Productomschrijving in schema is template-tekst ("Product: … Merk: … SKU: …").
- Categorie/merk: FAQPage (82 %), **BreadcrumbList maar 9 %**, geen CollectionPage/ItemList.
- Blog/projecten: Article + Breadcrumb + FAQ, ok. Kennisbank: 1× HowTo (meten).

### 3.5 Facetten / interne links
- `/gevelbekleding` heeft 247 `<a href>` naar `?merk=`/`?type=`/`?kleur=` URL's; `/dakranden` 101, `/hpl-platen` 94. Die zijn `noindex, follow` **én** canonical naar de basis (dubbel signaal) en kosten crawlbudget. Concurrenten hebben 0 param-links; KPS gebruikt pad-facetten.

---
## 4. Migratie-URL-check (`migratie-urls.csv`)
Set: 253 URL's uit de live WP-sitemaps (Yoast: post/page/product/category/brand/product_cat/local) + 225 extra live 200-URL's uit de crawl (vooral WooCommerce-attribuutarchieven, niet in sitemap maar **wel index,follow**) + redirectkaart. Na ontdubbelen (/x en /x/): **487 getest**.

| Verdict | Aantal | Toelichting |
|---|---|---|
| ok | 1 | `/` |
| 301-ok | 164 | 1 hop naar een indexeerbare pagina (10 alleen slash-hop) |
| **301-NOINDEX** | **99** | 301 naar `/montage?merk=…`, `/dakranden?merk=…`, `/gevelbekleding?type=rabat` → noindex → **ranking verdwijnt** |
| **404-BLOCKER** | **223** | 2 uit de sitemap (blogs), 221 attribuut-/kleur-/maatarchieven |

404's per type: `kleur-deel` 67, `keralit-kleuren` 55, `kleur-eurotexx` 15, `kerrafront-kleuren` 13, `hoogte-van-het-paneel` 11, `afmeting-platpaneel` 9, `steenlook-kleuren` 8, `kleur-wildverband` 6, vensterbank diepte/lengte/kleur-type-b 12, milexx-dakrand-kleur 4, overige (torx-maten, soort-epdm, links-rechts, glad-houtnerf, trend-kleur, kleur-steenstrip-grof, kleur-novaboard, kleur-platpaneel) 18, blog `/keralit-boeideel-dakrand-afwerken/` + `/kunststof-gevel-schoonmaken-onderhoud/`, paginering `/kunststof-nieuwtjes/page/2/`, `/laatste-nieuws/algemeen/page/2/`.

301-NOINDEX-voorbeelden die nu ranken: `/keralit-dakranden/` (2.583 w), `/vinyplus-dakranden/`, `/milexx-dakranden/`, `/keralit-montage/`, `/vinyplus-montage-materiaal/`, `/kunststof-rabatdelen/`, 75 `/product/…` (montage/dakrand-onderdelen), 13 `/product-categorie/…`. Kolom `suggestie_doel` bevat per regel een voorstel; ~64 van de 122 niet 1-op-1 gemapte `/product/`-URL's hebben waarschijnlijk wel een eigen `/producten/`-pagina (fuzzy match, handmatig controleren).

Contentverlies (doel < 50 % van live woorden, 43 URL's), o.a.: Keralit-cat. 3.754→925, VinyPlus-cat. 2.504→982, Eurotexx 1.520→495, `/keralit-dakranden/` 2.583→1.033, `/profex-gevelbekleding/` 600→161, `/kunststof-binnenplafonds/` 1.565→427, `/kunststof-kozijnen-op-maat…/` 1.404→634, alle 8 gemigreerde blogs −67 tot −87 %, `/projecten/` 1.024→95, `/zakelijke-klanten/` −86 %.

### 4b. Kruiscontrole met de Ahrefs top-100 (`ours-top100-migratie.csv`, door een parallelle agent in deze map gezet)
Van onze 100 best rankende zoekwoorden komen er **12 uit op een 404** en **9 op een noindex-doel**; nog eens ~20 gaan naar een doel met > 50 % minder tekst. Voorbeelden:
| Zoekwoord (pos.) | Live-URL | Nieuw |
|---|---|---|
| ral 6005 (4) | /kleur-deel/mosgroen-ral-6005/ | 404 |
| gevelbekleding antraciet (4), kunststof gevelbekleding antraciet (6) | /kleur-deel/glad-antraciet/, /kleur-deel/antraciet-ral-7016/ | 404 |
| keralit 7021 (8), basalt grijs (7) | /keralit-kleuren/zwartgrijs-ral-7021/, /kleur-deel/basalt-grijs-ral-7012/ | 404 |
| vinyplus dakrand (6) | /vinyplus-dakranden/ | 301 → /dakranden?merk=vinyplus (noindex) |
| keralit afwerking kozijn (6), afwaterings profiel (1) | /product/keralit-eindprofiel-17-mm/, /product/vinyplus-afwateringsprofiel… | 301 → /montage?merk=… (noindex) |
| beste kunststof gevelbekleding (1) | VinyPlus-categorie | 301 → /merken/vinyplus, −61 % tekst |
| duafort gevelbekleding (1), profex gevelbekleding (3) | /product/profex-duafort-velling-paneel/, /profex-gevelbekleding/ | 301 → /merken/profex (161 w), −69/−74 % |
| kunststof steenstrips (1–5, 6 varianten) | /product/zierer-steenstrips-wildverband/ | 301 ok, −59 % |
Hiermee is bevestigd dat de kleurarchieven (P0-1/P1-3) en de noindex-doelen (P0-3) echt verkeer kosten.

---
## 5. Prioriteiten (implementeerbaar in de Next.js-repo)

### P0 — blokkeert go-live / kost rankings
1. **221 attribuut-archieven → 301 i.p.v. 404.** `src/lib/seo/redirects.ts` → `fallbackTarget()`: prefixregels toevoegen: `keralit-kleuren`→`/merken/keralit`, `kleur-eurotexx`→`/merken/eurotexx`, `kerrafront-kleuren`+`trend-kleur`→`/merken/kerrafront`, `steenlook-kleuren|kleur-type-b|kleur-novaboard|diepte-vensterbank|lengte-vensterbank|links-rechts`→`/kunststof-vensterbank`, `kleur-wildverband|kleur-steenstrip-grof`→`/zierer-steenstrips`, `milexx-dakrand-kleur|hoogte-van-het-paneel|afmeting-platpaneel|kleur-platpaneel`→`/merken/milexx`, `glad-houtnerf`→`/hpl-plaat`, `torx-maten|soort-epdm`→`/montage`, `kleur-deel`→`/gevelbekleding` (tijdelijk; zie P1-3 voor kleurpagina's). Plus regel: `/…/page/{n}` strippen → basis-URL (`/kunststof-nieuwtjes`, `/laatste-nieuws/*` → `/blog`). Test toevoegen in `tests/` die alle 404-regels uit `migratie-urls.csv` laat slagen (`scripts/check-redirects.mjs` kan dit draaien).
2. **2 blogs uit de sitemap geven 404:** `/keralit-boeideel-dakrand-afwerken/` en `/kunststof-gevel-schoonmaken-onderhoud/` toevoegen aan `src/data/blog/migrated.ts` (volledige oude tekst) + rij in `data/seo/redirects.json`.
3. **99 redirects naar noindex-filters vervangen.** Nieuwe statische, indexeerbare routes: `src/app/dakranden/[merk]/page.tsx` (keralit, vinyplus, milexx, unipanel), `src/app/montage/[merk]/page.tsx` (keralit, vinyplus, eurotexx, kerrafront, milexx, profex, unipanel, zierer), `src/app/gevelbekleding/[type]/page.tsx` (rabat, sponning, potdeksel) met `generateStaticParams`, eigen title/H1/intro/FAQ, self-canonical en opname in `src/app/sitemap.ts`. Daarna in `data/seo/redirects.json` alle `→ /montage?merk=x` / `→ /dakranden?merk=x` / `→ /gevelbekleding?type=rabat` omzetten naar die paden; `/product/…` waar een `/producten/…` bestaat 1-op-1 mappen (kolom `suggestie_doel`).
4. **Homepage-title en H1 met "kunststof gevelbekleding".** `src/app/page.tsx`: `export const metadata = { title: { absolute: "Kunststof gevelbekleding kopen | Kunststof-gevel.nl" }, description: "Kunststof gevelbekleding van Keralit, VinyPlus, Eurotexx… Gratis kleurstaal, 10 jaar garantie…" }`; H1 bv. "Kunststof gevelbekleding, dakranden en kozijnen"; "Nooit meer schilderen" als subkop. (Live-title rankt nu zo; dit niet laten vallen.)
5. **Contentverlies op rankende pagina's terugzetten** (vergelijk `live_woorden`/`nieuw_woorden` in CSV): `/keralit-gevelbekleding` (Keralit-categorietekst 3.754 w: series, kleuren, montage, FAQ), `/merken/vinyplus`, `/merken/eurotexx`, `/merken/profex`, `/merken/florence`, `/dakranden/keralit` (nieuw, tekst van `/keralit-dakranden/`), `/kunststof-kozijnen`. Blogs in `src/data/blog/migrated.ts`: oude lengte (1.100–1.200 w) en H2-structuur aanhouden in plaats van de ingekorte rewrites (nu 150–240 w). Doel: minstens gelijk aan live en ≥ concurrent (KBM blog 1.240 w).
6. **Go-live-config:** env `NOINDEX` niet zetten op productie; controleren dat `X-Robots-Tag` niet verschijnt op `www.kunststof-gevel.nl`; `http://`, `kunststof-gevel.nl` en `http://www` → 1× 301 naar `https://www` (http op onrender geeft nu 500); onrender-host na go-live 301 naar www of noindex laten; sitemap opnieuw indienen in GSC + Bing; `migratie-urls.csv` opnieuw draaien tegen www op de dag zelf.

### P1 — nodig om de concurrenten te verslaan
1. **Kannibalisatie oplossen**, één URL per intent: `/merken/keralit` → 301 naar `/keralit-gevelbekleding` (of omgekeerd; de URL met de meeste live-equity kiezen) en hetzelfde voor `/merken/zierer` → `/zierer-steenstrips`. HPL: `/hpl-plaat` (bestaande live-URL) als hub "HPL plaat kopen", `/hpl-platen` → 301 daarnaartoe, `/merken/hpl` → 301, `/merken/hpl-compact-exterieur` als subpagina laten. `/staalaanvraag` ↔ `/stalen` samenvoegen (1 URL, de andere 301). `/kozijnen` en `/assortiment` als echte 301 in `redirects.json` in plaats van een rewrite.
2. **H1/title-templates op zoekterm:** `/gevelbekleding` H1 "Kunststof gevelbekleding", title "Kunststof gevelbekleding kopen | Keralit, VinyPlus & meer"; `/dakranden` "Kunststof dakranden en boeidelen"; `/montage` "Montagemateriaal kunststof gevelbekleding"; merk-H1 "{Merk} gevelbekleding" i.p.v. alleen "{Merk}"; `/kunststof-kozijnen` H1 "Kunststof kozijnen op maat". Title-suffix gelijk trekken (`| Kunststof-gevel.nl`, nu "· kunststof-gevel.nl") in `layout.tsx` (template) en `src/lib/seo/listing-meta.ts`.
3. **Indexeerbare kleurpagina's** (antwoord op KBM's 2.566 kleur-URL's en vervanging voor 182 kleur-archieven): route `src/app/merken/[slug]/kleuren/[kleur]/page.tsx` (bv. `/merken/keralit/kleuren/antraciet-ral-7016`) met kleurstaal-foto, RAL/NCS, producten in die kleur, staal-CTA, uniek intro en Breadcrumb; in sitemap; de P0-1-redirects van `keralit-kleuren/*`, `kleur-eurotexx/*`, `kerrafront-kleuren/*`, `kleur-deel/*` daarna 1-op-1 naar die pagina's.
4. **Structured data:** `src/lib/seo/schema.ts`: (a) `Organization` + `WebSite` (+ `SearchAction` naar `/zoeken?q=`) in een sitebrede @graph, `LocalBusiness` alleen op `/` en `/contact`; (b) `breadcrumbJsonLd` op alle categorie-, merk- en servicepagina's (nu 9 %); (c) `CollectionPage` + `ItemList` (producten) op categorie/merk; (d) `productJsonLd`: `offers.shippingDetails` (OfferShippingDetails: NL, kosten/gratis vanaf €499, levertijd), `offers.hasMerchantReturnPolicy` (14 dagen, conform `/herroepingsrecht`), `mpn`/`gtin` waar bekend, description uit echte producttekst; (e) `aggregateRating`/`review` op producten zodra er productreviews zijn (`/api/reviews` bestaat). TLO en KPS hebben sterren in de SERP.
5. **Facetlinks opschonen:** in de listing-componenten de merk-/type-/kleurfilters renderen als `<button>`/form (of `rel="nofollow"`) in plaats van `<a href="?merk=">`, en de belangrijke facetten als pad-links naar P0-3/P1-3-routes. Op `?`-varianten alleen `noindex, follow` óf canonical gebruiken, niet allebei.
6. **Kozijnen-pijler (vs Toelevering Online):** `/kunststof-kozijnen` naar ≥1.200 woorden (prijsindicaties per type, Aluplast Ideal 7000, HR++/HR+++, ISDE-subsidie, levertijd, FAQ) + ItemList; `/kunststof-kozijnen/[group]` (ramen/deuren/schuifpuien) ≥600 woorden per stuk; kennisbank-artikelen (nu 190–340 w) naar 800+ en uitbreiden (TLO heeft 495 kennisbank-URL's: meten, montage, glas, hang- en sluitwerk per type).
7. **HPL-pijler (vs Kunststofplatenshop):** `/hpl-plaat/kleur-structuur` is nu noindex → per kleur/decor indexeerbare pad-pagina's (`/hpl-plaat/{kleur}`), plus toepassingspagina's (gevel, dakkapel, boeiboord, balkon, schutting) met HowTo/FAQ en een vergelijkingspagina ("HPL vs Trespa/Volkern", "HPL vs Keralit"), want KPS rankt op precies die vergelijkingen.
8. `/kunststof-kozijnen/offertemand` → `robots: { index: false }` in de metadata + `Disallow` in `src/app/robots.ts`; `/merken/overig` → 404 of noindex.
9. **Dubbele/lange producttitles:** in `src/app/producten/[slug]/page.tsx` `generateMetadata`: variant (kleur/lengte/SKU) in de title bij dubbele namen; > 60 tekens inkorten (110 stuks).

### P2
1. `sitemap.ts`: echte `lastModified` per pagina i.p.v. één CONTENT_UPDATED; afbeeldingen meegeven (`images`) voor product/categorie (TLO en KPS hebben een image-sitemap).
2. Meta descriptions merkpagina's (31–60 tekens) naar 140–155 tekens met USP's (✓ gratis staal, ✓ 10 jaar garantie, ✓ levertijd); 20 dubbele descriptions uniek maken.
3. `not-found.tsx`: eigen title "Pagina niet gevonden" + links naar pijlers.
4. Blog: auteur (`Person`) + datum zichtbaar; `/projecten` (95 w) en projectpagina's (~190 w) uitbreiden met locatie, m², merk/kleur en foto's met alt.
5. Showroom/regio: eigen `/showroom-hedel`-pagina (LocalBusiness, route, openingstijden) i.p.v. de 301 van `/showroom-kunststof-gevel/` naar `/contact`; geen massa-stadspagina's (concurrenten hebben die ook niet).
6. Kleurmonster-producten (KBM heeft er 402 indexeerbaar): staal per serie als product met prijs €0 overwegen (`/producten/kleurstaal-{serie}`).
7. Na go-live: Ahrefs/GSC-export van top-URL's en -backlinks naast `migratie-urls.csv` leggen; 404-monitor (`/api/tracking`) of GSC-dekking wekelijks bekijken.
