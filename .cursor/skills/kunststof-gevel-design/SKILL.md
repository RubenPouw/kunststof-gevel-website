---
name: kunststof-gevel-design
description: Use this skill to generate well-branded interfaces and assets for Kunststof-gevel.nl (niche van Cavesupplies), either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the site tokens in `src/styles/tokens/` and brand components in `src/components/brand/`. Public mark assets live in `public/brand/`.

Key rules (Cavesupplies Brandbook v1.0 / shop v4): wit `#FFFFFF` is paginagrond, kalk `#F4F2ED` accent, nachtblauw `#1B2838` inkt en primaire knop, signaalgeel `#FFD400` alleen actie op donker, gradient 135° `#FFE45C→#F5B800` één vlak per pagina (feitenstrook + kap van het teken). IBM Plex Sans 400/500/700 voor tekst, IBM Plex Mono 400/500 voor maten, prijzen, weken, artikelnummers. Radius 0, geen schaduwen. Prijzen mét €, listings/PDP excl. btw. Nichenaam in Plex Sans bold onderkast, géén eigen logo.

- **u** op de site, **je** in microcopy onder knoppen en “Kies je kleur”.
- Vinkjes (✓) uit het lettertype; zoeken en tekens inline SVG (stroke 3, miter). Lucide alleen als noodoplossing.
- Afschuining 45° rechtsonder alleen op beelden: 16 px kaart, 24 px hero.
- Focus: `outline: 2px solid #1B2838; outline-offset: 2px`.
- Formulierfouten: nachtblauwe tekst + 1 px nachtblauwe rand (geen rood/oranje).
- Weken, geen “z.s.m.”: `wk 14` in tabellen, `week 14` in zinnen.
