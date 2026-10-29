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
