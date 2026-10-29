# SEO-basis: migratie zonder verlies + gap-pagina's

## Keralit canonical

Live check op 29 okt 2026, zonder de redirect te volgen:

| URL | Live |
|---|---|
| `/keralit-gevelbekleding/` | 301 naar `/product-categorie/kunststof-gevelbekleding/keralit-gevelbekleding/` |
| `/keralit-gevelbekleding` | 301 naar dezelfde categorie-URL |
| `/product-categorie/kunststof-gevelbekleding/keralit-gevelbekleding/` | 200, canonical naar zichzelf |
| `/product-categorie/kunststof-gevelbekleding/keralit-gevelbekleding` | 301 naar de variant met slash (alleen de slash) |

De categorie-URL is de canonical. De korte slug is dat niet.

De nieuwe site had dit omgekeerd: de categorie-URL 301'de naar `/keralit-gevelbekleding`, en die korte URL was self-canonical.

| | Voor | Na |
|---|---|---|
| Canonical | `/keralit-gevelbekleding` | `/product-categorie/kunststof-gevelbekleding/keralit-gevelbekleding` |
| `/keralit-gevelbekleding` | 200, self-canonical | 301 naar de categorie-URL |
| `/product-categorie/kunststof-gevelbekleding/keralit-gevelbekleding` | 301 naar de korte slug | 200, self-canonical |
| `/merken/keralit` en `/merk/keralit` | 301 naar de korte slug | 301 in één hop naar de categorie-URL |
| Overige redirects die op de korte slug eindigden | doel `/keralit-gevelbekleding` | doel de categorie-URL, geen tweede hop |

De nieuwe site haalt de slash van elke URL af. De canonical is daarom dezelfde padnaam als live, zonder slash. Een aanvraag met slash is één 301 naar die canonical.

## Kleurarchieven die nu op 4 staan

Deze vier eindigen in één 301 op een indexeerbare kleurpagina:

| Van | Naar |
|---|---|
| `/kleur-deel/antraciet-ral-7016/` | `/gevelbekleding/kleuren/antraciet-ral-7016` |
| `/kleur-deel/mosgroen-ral-6005/` | `/gevelbekleding/kleuren/mosgroen-ral-6005` |
| `/keralit-kleuren/antraciet-ral-7016/` | `/merken/keralit/kleuren/antraciet-ral-7016` |
| `/keralit-kleuren/mosgroen/` | `/merken/keralit/kleuren/mosgroen` |

## Vervolg op deze branch

Migratie: 487/487, elke doel-URL heeft een `page.tsx` en is indexeerbaar, hoogstens één hop. Homepage-redirect alleen voor `/kunststof-gevelbekleding/`.

Nieuwe routes: `/dakranden/[merk]`, `/montage/[merk]`, `/gevelbekleding/[type]`, `/kunststof-vensterbank/kleuren/[kleur]`, `/zierer-steenstrips/kleuren/[kleur]`, `/hpl-plaat/[kleur]`, plus gap-pagina's `/overzet-vensterbank`, `/boeidelen`, `/boeiboord`, `/schroten`, `/kunststof-plafond`, `/badkamerplafond`, `/hpl-plaat/6-mm`, `/hpl-plaat/boeiboord`, `/hpl-plaat/dakoverstek`, `/hpl-plaat/gevel`, `/hpl-plaat/balkon`, `/hpl-vs-trespa`. `/rabatdelen` 301't naar `/gevelbekleding/rabat`.

Overgeslagen: andere HPL-diktes dan 6 mm (niet in de shop). Trespa-specificaties (we verkopen het niet).

Homepage title (absolute): Kunststof gevelbekleding kopen | Heldere prijzen per plank. H1: Kunststof gevelbekleding kopen met heldere prijzen. H2: Op zoek naar de goedkoopste kunststof gevelbekleding?

Kozijn-H1: Kunststof kozijnen op maat. Kennisbank erbij: stelkozijn, isde-subsidie, kosten-kunststof-kozijnen, profielmerken.

Open: TODO-RUBEN voor levertijd, ISDE-bedragen, kozijnprijzen, een tweede profielmerk, HPL-diktes buiten 6 mm, balkonbevestiging en een Trespa-vergelijking.
