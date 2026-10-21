#!/usr/bin/env python3
"""Build the committed redirect map from the crawled old-site sitemap dump.

Input: data/seo/old-urls.json (pages, images, parent) and data/seo/catalog-handles.json.
Output: data/seo/redirects.csv and data/seo/redirects.json.

A product URL is sent to /producten/{handle} only when the handle is the same
article. Other products go to the brand or category that can actually rank.
"""

from __future__ import annotations

import csv
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SEO = ROOT / "data" / "seo"

PUBLIC_BRANDS = [
    "milinboard",
    "vinyplus",
    "kerrafront",
    "eurotexx",
    "keralit",
    "milexx",
    "unipanel",
    "florence",
    "zierer",
    "profex",
]


def norm(value: str) -> str:
    text = value.lower()
    text = re.sub(r"(?<=\d)-(?=\d)", "DOT", text)
    return re.sub(r"[^a-z0-9]", "", text)


EXPLICIT_PRODUCTS = {
    "vinyplus-vario-299mm-gevelpaneel": "/producten/vinyplus-vario-299mm",
    "vinyplus-quattro": "/producten/vinyplus-quattro-299mm",
    "vinyplus-rondkantpaneel": "/producten/vinyplus-rondkantpaneel-150-mm",
    "vinyplus-rabat": "/producten/vinyplus-rabatdeel-150-mm",
    "keralit-sponning-143-mm": "/producten/keralit-sponningdeel-143mm",
    "keralit-sponning-190-mm": "/producten/keralit-sponningdeel-190mm",
    "keralit-167-mm-sponning-kopen-onderhoudsarm-duurzaam": "/producten/keralit-sponningdeel-167mm",
    "eurotexx-potdeksel-180-mm": "/producten/eurotexx-potdeksel-180-mm-structuur",
    "eurotexx-dubbel-rabat": "/producten/eurotexx-dubbel-rabat-332-mm-structuur",
    "eurotexx-stootvoegverbinding-180-mm-voor-potdeksel": "/producten/eurotexx-stootvoeg-potdeksel-180-mm",
    "eurotexx-stootvoegverbinding-332-mm-voor-dubbel-rabatdeel": "/producten/eurotexx-stootvoeg-dubbel-rabat-332-mm",
    "kerrafront-dubbel-sponningdeel-332-mm": "/producten/kerrafront-modern-wood-dubbel-sponning-332-mm-struct",
    "florence-binnenplafond-paneel-250x10mm-verschillende-lengtes": "/producten/florence-binnenplafond-paneel-250x10mm",
    "kunststof-plafondpaneel-250-mm-ideaal-voor-badkamer-en-binnengebruik": "/producten/florence-binnenplafond-paneel-250x10mm",
    "kunststof-plafondpaneel-250-mm-voor-buiten-plafonds-of-carport": "/producten/florence-buitenplafond-paneel-250x16-5-mm",
    "zierer-steenstrips-wildverband": "/producten/zierer-steenstrip-1096-x-359-mm-wildverband-3-4m2",
    "zierer-steenstrip-grof-34m2": "/producten/zierer-steenstrip-1096-x-359-mm-grof-3-4m2",
    "keralit-aluminium-inhaakstartprofiel": "/producten/inhaakstartprofiel-aluminium",
    "keralit-tweezijdig-ventilatieprofiel": "/producten/tweezijdig-ventilatieprofiel",
    "keralit-dakrand-paneel-350-mm-2": "/producten/keralit-dakrandpaneel-350mm",
}

PAGES = {
    "/": ("/", "same-url", 200),
    "/contact": ("/contact", "same-url", 200),
    "/projecten": ("/projecten", "same-url", 200),
    "/algemene-voorwaarden": ("/algemene-voorwaarden", "same-url", 200),
    "/herroepingsrecht": ("/herroepingsrecht", "same-url", 200),
    "/klachtenprocedure": ("/klachtenprocedure", "same-url", 200),
    "/showroom-kunststof-gevel": ("/contact", "showroom-staat-op-contact", 301),
    "/webshop": ("/gevelbekleding", "shop-is-category", 301),
    "/shop": ("/gevelbekleding", "shop-is-category", 301),
    "/offerte-aanvragen": ("/offerte", "same-job", 301),
    "/verzenden-retourneren": ("/verzenden-retour", "same-job", 301),
    "/zakelijke-klanten": ("/zakelijk", "same-job", 301),
    "/privacy-policy": ("/privacy", "same-job", 301),
    "/staalaanvraag": ("/stalen", "same-job", 301),
    "/betaalmethodes": ("/algemene-voorwaarden", "betaling-staat-in-de-voorwaarden", 301),
    "/track-order": ("/contact", "geen-losse-ordertracking", 301),
    "/klantenservice-advies-ondersteuning-voor-kunststof-gevelbekleding": ("/contact", "service-is-contact", 301),
    "/locations.kml": ("/contact", "locatiebestand", 301),
    "/kunststof-dakranden": ("/dakranden", "category", 301),
    "/milexx-dakranden": ("/dakranden?merk=milexx", "category-brand", 301),
    "/vinyplus-dakranden": ("/dakranden?merk=vinyplus", "category-brand", 301),
    "/keralit-dakranden": ("/dakranden?merk=keralit", "category-brand", 301),
    "/kunststof-vensterbank": ("/kozijnafwerking", "category", 301),
    "/kozijn-vensterbank-afwerking": ("/kozijnafwerking", "category", 301),
    "/kunststof-rabatdelen": ("/gevelbekleding?type=rabat", "category-profile", 301),
    "/kunststof-binnenplafonds": ("/merken/florence", "plafond-merk", 301),
    "/overstek-en-plafondpanelen": ("/merken/florence", "plafond-merk", 301),
    "/unipanel-bouwpaneel": ("/merken/unipanel", "brand", 301),
    "/profex-gevelbekleding": ("/merken/profex", "brand", 301),
    "/kerrafront-gevelbekleding": ("/merken/kerrafront", "brand", 301),
    "/eurotexx-gevelbekleding": ("/merken/eurotexx", "brand", 301),
    "/hpl-plaat": ("/blog/hpl-plaat", "uitleg-in-plaats-van-dunne-landingspagina", 301),
    "/kunststof-kozijnen-op-maat-prijs-berekenen-snel-geleverd": ("/kozijnen", "same-job", 301),
    "/keralit-montage": ("/montage?merk=keralit", "montage-brand", 301),
    "/kerrafront-montage": ("/montage?merk=kerrafront", "montage-brand", 301),
    "/eurotexx-montage": ("/montage?merk=eurotexx", "montage-brand", 301),
    "/milexx-montage": ("/montage?merk=milexx", "montage-brand", 301),
    "/zierer-montage": ("/montage?merk=zierer", "montage-brand", 301),
    "/unipanel-montage": ("/montage?merk=unipanel", "montage-brand", 301),
    "/vinyplus-montage-materiaal": ("/montage?merk=vinyplus", "montage-brand", 301),
    "/sitemap_index.xml": ("/sitemap.xml", "old-sitemap", 301),
    "/post-sitemap.xml": ("/sitemap.xml", "old-sitemap", 301),
    "/page-sitemap.xml": ("/sitemap.xml", "old-sitemap", 301),
    "/product-sitemap.xml": ("/sitemap.xml", "old-sitemap", 301),
    "/category-sitemap.xml": ("/sitemap.xml", "old-sitemap", 301),
    "/product_brand-sitemap.xml": ("/sitemap.xml", "old-sitemap", 301),
    "/product_cat-sitemap.xml": ("/sitemap.xml", "old-sitemap", 301),
    "/local-sitemap.xml": ("/sitemap.xml", "old-sitemap", 301),
    "/kunststof-nieuwtjes": ("/blog", "blog-index", 301),
    "/laatste-nieuws/algemeen": ("/blog", "blog-index", 301),
    "/vinyplus-turners-eiken-mooi-op-ieder-project": ("/blog/vinyplus-turners-eiken", "rewritten-article", 301),
    "/nieuw-paneel-keralit-167-mm-de-moderne-strakke-keuze-voor-elke-gevel": ("/blog/keralit-sponningdeel-167", "rewritten-article", 301),
    "/hpl-gevelplaat-toepassingen-montage": ("/blog/hpl-plaat", "rewritten-article", 301),
    "/kunststof-vensterbank-binnen-condens-afwerking": ("/blog/condens-op-vensterbank", "rewritten-article", 301),
    "/overzet-vensterbank-meten-monteren": ("/blog/overzet-vensterbank-meten", "rewritten-article", 301),
    "/kunststof-rabatdelen-horizontaal-verticaal-onderhoud": ("/blog/rabat-horizontaal-of-verticaal", "rewritten-article", 301),
    "/vinyplus-quattro-gevelbekleding-nu-al-de-hit-van-2025": ("/blog/vinyplus-quattro", "rewritten-article", 301),
    "/keralit-of-kunststof-gevelbekleding": ("/blog/keralit-of-vinyplus", "duplicate-of-comparison", 301),
    "/kunststof-gevelbekleding-in-houtlook-keralit-vinyplus-zijn-de-toppers": ("/blog/keralit-of-vinyplus", "duplicate-of-comparison", 301),
    "/alles-over-kunststof-gevelbekleding-voordelen-toepassingen-en-onderhoud": ("/gevelbekleding", "keyword-stuffed-overview", 301),
    "/kunststof-gevelbekleding-soorten-voordelen": ("/gevelbekleding", "keyword-stuffed-overview", 301),
    "/kunststof-gevelbekleding-van-topkwaliteit-duurzaam-onderhoudsvrij-en-esthetisch": ("/gevelbekleding", "keyword-stuffed-overview", 301),
}


def brand_of(slug: str) -> str | None:
    text = slug.lower()
    if "duafort" in text or "canexel" in text:
        return "profex"
    for brand in PUBLIC_BRANDS:
        if brand in text:
            return brand
    return None


def family_target(slug: str) -> tuple[str, str]:
    text = slug.lower()
    brand = brand_of(text)
    if any(token in text for token in ("dakrand", "boei", "boeideel")):
        if brand:
            return f"/dakranden?merk={brand}", "dakrand-family"
        return "/dakranden", "dakrand-family"
    if any(token in text for token in ("vensterbank", "overzet", "novaboard", "werzalit")):
        if brand:
            return f"/kozijnafwerking?merk={brand}", "vensterbank-family"
        return "/kozijnafwerking", "vensterbank-family"
    if "plafond" in text or brand == "florence":
        return "/merken/florence", "plafond-family"
    if any(token in text for token in ("steenstrip", "leisteen")) or brand == "zierer":
        return "/merken/zierer", "steenstrip-family"
    accessory = (
        "profiel",
        "schroef",
        "clip",
        "lijm",
        "primer",
        "tape",
        "kit",
        "ventilatie",
        "start",
        "hoek",
        "eind",
        "verbinding",
        "stootvoeg",
        "montage",
        "stift",
        "reiniger",
        "folie",
        "sealer",
        "voeg",
    )
    if any(token in text for token in accessory):
        if brand:
            return f"/montage?merk={brand}", "accessory-family"
        return "/montage", "accessory-family"
    if "hpl" in text or "plaat" in text:
        return "/kozijnafwerking", "plaat-family"
    if brand:
        return f"/merken/{brand}", "brand-family"
    return "/gevelbekleding", "category-family"


def product_target(slug: str, by_norm: dict[str, list[str]]) -> tuple[str, str]:
    if slug in EXPLICIT_PRODUCTS:
        return EXPLICIT_PRODUCTS[slug], "same-article"
    hits = by_norm.get(norm(slug), [])
    if len(hits) == 1:
        return f"/producten/{hits[0]}", "same-handle"
    target, reason = family_target(slug)
    return target, reason


def image_target(path: str, parent: str, page_target: dict[str, str]) -> str:
    name = path.lower()
    if "eurotexx" in name:
        return "/merken/eurotexx"
    if "milexx" in name:
        return "/merken/milexx"
    if "vinyplus" in name:
        return "/merken/vinyplus"
    if "keralit" in name:
        return "/merken/keralit"
    if "kerrafront" in name:
        return "/merken/kerrafront"
    if "florence" in name or "plafond" in name:
        return "/merken/florence"
    if "unipanel" in name:
        return "/merken/unipanel"
    if "dakrand" in name:
        return "/dakranden"
    if "portret" in name or "portrait" in name:
        return "/over-ons"
    if "vensterbank" in name:
        return "/kozijnafwerking"
    target = page_target.get(parent, "/gevelbekleding")
    if target in {"/", ""}:
        return "/gevelbekleding"
    return target


def category_target(path: str) -> tuple[str, str]:
    text = path.lower()
    if "binnenplafond" in text:
        return "/merken/florence", "category"
    if "buitenplafond" in text or "overstek" in text or "plafond" in text:
        return "/merken/florence", "category"
    if "vensterbank" in text or "plaat" in text:
        return "/kozijnafwerking", "category"
    if "dakrand" in text or "boei" in text:
        brand = brand_of(text)
        if brand:
            return f"/dakranden?merk={brand}", "category"
        return "/dakranden", "category"
    if "montage" in text:
        brand = brand_of(text)
        if brand:
            return f"/montage?merk={brand}", "category"
        return "/montage", "category"
    if "steenstrip" in text or "zierer" in text:
        return "/merken/zierer", "category"
    brand = brand_of(text)
    if brand:
        return f"/merken/{brand}", "category"
    return "/gevelbekleding", "category"


def main() -> None:
    handles = json.loads((SEO / "catalog-handles.json").read_text())
    canonical = []
    handle_set = set(handles)
    for handle in handles:
        match = re.fullmatch(r"(.+)-\d+", handle)
        if match and match.group(1) in handle_set:
            continue
        canonical.append(handle)
    by_norm: dict[str, list[str]] = {}
    for handle in canonical:
        by_norm.setdefault(norm(handle), []).append(handle)

    for slug, target in EXPLICIT_PRODUCTS.items():
        handle = target.rsplit("/", 1)[-1]
        if handle not in handle_set and handle not in canonical:
            raise SystemExit(f"explicit target missing from catalog: {slug} -> {target}")

    old = json.loads((SEO / "old-urls.json").read_text())
    rows: list[dict[str, str]] = []
    seen: set[str] = set()

    def add(path: str, target: str, reason: str, status: int) -> None:
        if path in seen:
            return
        seen.add(path)
        rows.append({"from": path, "to": target, "status": str(status), "reason": reason})

    for item in old["pages"]:
        path = item["path"]
        if path in PAGES:
            target, reason, status = PAGES[path]
            add(path, target, reason, status)
            continue
        if path.startswith("/product/"):
            slug = path.split("/product/", 1)[1]
            target, reason = product_target(slug, by_norm)
            add(path, target, reason, 301)
            continue
        if path.startswith("/merk/"):
            slug = path.split("/merk/", 1)[1]
            if slug in PUBLIC_BRANDS:
                add(path, f"/merken/{slug}", "brand", 301)
            else:
                add(path, "/merken", "brand-index", 301)
            continue
        if path.startswith("/product-categorie/"):
            target, reason = category_target(path)
            add(path, target, reason, 301)
            continue
        add(path, "/gevelbekleding", "unmapped-page", 301)

    page_target = {row["from"]: row["to"] for row in rows}
    for item in old["images"]:
        target = image_target(item["path"], item["parent"], page_target)
        add(item["path"], target, "image-to-parent-page", 301)

    missing_pages = [path for path in PAGES if path not in seen and path not in {item["path"] for item in old["pages"]}]
    # Pages we map even if the crawl missed them (aliases).
    for path, (target, reason, status) in PAGES.items():
        add(path, target, reason, status)

    rows.sort(key=lambda row: row["from"])
    homepage = [row for row in rows if row["to"] in {"/", "/?"} and row["from"] != "/"]
    if homepage:
        raise SystemExit(f"homepage redirects are not allowed: {homepage}")

    csv_path = SEO / "redirects.csv"
    with csv_path.open("w", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=["from", "to", "status", "reason"])
        writer.writeheader()
        writer.writerows(rows)
    (SEO / "redirects.json").write_text(json.dumps(rows, ensure_ascii=False, indent=2) + "\n")

    print(f"rows {len(rows)}")
    print("reasons", {row["reason"] for row in rows})
    if missing_pages:
        print("alias pages not in crawl", missing_pages)


if __name__ == "__main__":
    main()
