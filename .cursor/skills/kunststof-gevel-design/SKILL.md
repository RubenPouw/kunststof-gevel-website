---
name: kunststof-gevel-design
description: Use this skill to generate well-branded interfaces and assets for Kunststof-gevel.nl (webshop voor kunststof gevelbekleding), either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the site tokens in `src/styles/tokens/` and brand components in `src/components/brand/`. Public logo assets live in `public/brand/`.

Key rules: blauw (#2457FF) is merk, oranje (#FF6A1F) is uitsluitend actie en komt één keer per scherm voor; radius 0; Barlow Condensed koppen, Barlow tekst; prijzen zonder euroteken; segmentbalk 3:2:1 op −24° is het enige grafische element.

- **u** op de site en in offertes, **je** in microcopy onder knoppen.
- Vinkjes (✓) uit het lettertype; Lucide alleen voor winkelwagen, zoeken en chat (stroke 1.5, één kleur).
- Geen box-shadows behalve `--shadow-action` op de oranje CTA in een donkere hero.
- Focus: `outline: 2px solid #2457FF; outline-offset: 2px`.
- Formulierfouten: inkt-tekst + 1 px inkt-rand (geen rood/oranje).
