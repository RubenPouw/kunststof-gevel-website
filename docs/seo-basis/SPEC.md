# SEO-basis nieuwe kunststof-gevel.nl (akkoord Ruben 29 okt 2026)

Doel: de nieuwe site wint SEO per pijler van: gevelbekleding -> kunststofbouwmateriaal.nl, kozijnen -> toeleveringonline.nl, HPL -> kunststofplatenshop.nl. Bij migratie nul rankingverlies.

Bronnen in deze map: audit-technisch.md (sectie 5 = takenlijst P0/P1/P2, volg die), migratie-urls.csv (alle 487 live URL's met verdict + suggestie_doel), rapport.md + gap-*.csv + ours-top100-migratie.csv (Ahrefs), structuur-concurrenten.csv.

## Besluiten Ruben
- Homepage title: "Kunststof gevelbekleding kopen | Heldere prijzen per plank" (absolute). H1: "Kunststof gevelbekleding kopen met heldere prijzen". Prijsblok-H2: "Op zoek naar de goedkoopste kunststof gevelbekleding?". Dit vervangt P0-4 uit de audit.
- Keralit-title: "Keralit gevelbekleding kopen | Vanaf €90,49, gratis staal".
- Homepage blijft eigenaar van 'kunststof gevelbekleding'; /kunststof-gevelbekleding/ blijft 301 naar /.
- Kleurpagina's zijn ons voordeel: bouw P1-3 (indexeerbare kleurpagina's) en laat kleur-archieven 1-op-1 daarheen 301'en, niet naar een generieke categorie als er een kleurpagina is.
- Geen enkele redirect naar een noindex-URL of naar de homepage (behalve /kunststof-gevelbekleding/).

## Scope
Alle P0 en P1 uit audit-technisch.md sectie 5, plus de gap-pagina's: vensterbanken (vensterbank 12K, overzet vensterbank), rabatdelen, boeidelen/boeiboord, plafond/badkamerplafond, schroten; HPL per dikte en per toepassing (boeidelen, boeiboord, dakoverstek, gevel, balkon) en "HPL vs Trespa"; kozijnen-pijler + kennisbank (subsidie/ISDE, stelkozijn, prijzen/kosten, profielmerken). P2 alleen als tijd over.

## Regels voor content
- Tekst terugzetten = oude live tekst van www.kunststof-gevel.nl (fetch), niet verzinnen.
- Nieuwe pagina's: alleen feiten uit de site/productdata. Geen verzonnen levertijden, garanties, prijzen, subsidiebedragen of reviews. Waar een feit ontbreekt: placeholder `TODO-RUBEN:` en noteer het in de PR.
- Adres overal Binnenkamp 7a, 5321 KA Hedel (ook showroom). Nooit Utrecht. Telefoon 030 227 1397 / +31 6 13639368. Nooit 085-4010650 of 06-46011057.
- Geen em dash (—) in zichtbare tekst.
- Geen AggregateRating zonder echte productreviews.

## Oplevering
- Test/script dat migratie-urls.csv tegen de build draait: elke rij 200 of 1x 301 naar een indexeerbare 200 (geen noindex). Resultaat in PR-body.
- PR-body: lijst nieuwe routes, alle redirect-wijzigingen (voor/na tabel), title/H1 voor/na per pijler, open TODO-RUBEN punten.
- Niet mergen.
