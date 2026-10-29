export const site = {
  name: "kunststof-gevel.nl",
  shortName: "kunststof-gevel.nl",
  tagline: "Nooit meer schilderen.",
  slogan: "Nooit meer schilderen. Vervang hout door kunststof.",
  house: "kunststof-gevel.nl",
  description:
    "Webshop van Pouw Online Group B.V. voor kunststof gevelbekleding, dakranden en kozijnen. Showroom op afspraak in Hedel.",
  phone: "030 227 1397",
  phoneHref: "tel:+31302271397",
  phoneE164: "+31302271397",
  mobile: "06 13639368",
  mobileDisplay: "+31 6 13639368",
  mobileHref: "tel:+31613639368",
  email: "info@kunststof-gevel.nl",
  emailHref: "mailto:info@kunststof-gevel.nl",
  whatsapp: "https://wa.me/31613639368",
  hours: "ma t/m vr 08:00-17:00",
  address: "Binnenkamp 7a, 5321 KA Hedel",
  street: "Binnenkamp 7a",
  postalCode: "5321 KA",
  city: "Hedel",
  addressNote: "Showroom, alleen op afspraak",
  company: "Pouw Online Group B.V.",
  region: "Heel Nederland",
  kvk: "66527376",
  btw: "NL856594842B01",
  freeShippingFrom: 499,
  instagram: "https://www.instagram.com/kunststofgevel",
  instagramHandle: "@kunststofgevel",
  origin: "https://www.kunststof-gevel.nl",
} as const;

export const hero = {
  kicker: "Kunststof gevelbekleding · Keralit · VinyPlus · Eurotexx",
  title: "Kunststof gevelbekleding kopen met heldere prijzen",
  subtitle: "Nooit meer schilderen.",
  body: "Kunststof gevelbekleding, dakranden en kozijnafwerking. Showroom op afspraak in Hedel. Zelf monteren of montage via een offerte.",
  cta: "Bekijk voorraad",
  samples: "Kies gratis kleurstalen",
  micro: "Altijd binnen 24 uur bericht",
} as const;

export const heroStats = [
  { value: "30 jr", label: "levensduur" },
  { value: "10 jr", label: "kleurvast" },
  { value: "24 u", label: "bericht" },
] as const;

export const shopNav = [
  { href: "/gevelbekleding", label: "Gevelbekleding" },
  { href: "/hpl-plaat", label: "HPL platen" },
  { href: "/dakranden", label: "Dakranden" },
  { href: "/kunststof-kozijnen", label: "Kozijnen" },
  { href: "/merken", label: "Merken" },
  { href: "/projecten", label: "Projecten" },
  { href: "/zakelijk", label: "Zakelijk" },
] as const;

export const footerColumns = [
  {
    title: "Assortiment",
    links: [
      { href: "/gevelbekleding", label: "Gevelbekleding" },
      { href: "/hpl-plaat", label: "HPL platen" },
      { href: "/dakranden", label: "Dakranden" },
      { href: "/kunststof-kozijnen", label: "Kunststof kozijnen" },
      { href: "/montage", label: "Bevestiging" },
      { href: "/merken", label: "Merken" },
    ],
  },
  {
    title: "Service",
    links: [
      { href: "/contact", label: "Contact" },
      { href: "/offerte", label: "Offerte" },
      { href: "/stalen", label: "Kleurstalen" },
      { href: "/staalaanvraag", label: "Staalaanvraag" },
      { href: "/blog", label: "Kennis" },
      { href: "/kunststof-kozijnen/kennisbank", label: "Kozijnen kennisbank" },
      { href: "/account", label: "Account" },
    ],
  },
  {
    title: "Bedrijf",
    links: [
      { href: "/over-ons", label: "Over ons" },
      { href: "/projecten", label: "Projecten" },
      { href: "/reviews", label: "Reviews" },
      { href: "/zakelijk", label: "Zakelijk" },
      { href: "/montage", label: "Montage" },
    ],
  },
] as const;

export const legalNav = [
  { href: "/privacy", label: "Privacy" },
  { href: "/algemene-voorwaarden", label: "Algemene voorwaarden" },
  { href: "/herroepingsrecht", label: "Herroepingsrecht" },
  { href: "/verzenden-retour", label: "Verzenden en retour" },
  { href: "/klachtenprocedure", label: "Klachten" },
] as const;

export const footerNav: { href: string; label: string }[] = footerColumns.flatMap((column) => [
  ...column.links,
]);

export function isShopNavActive(pathname: string, href: string) {
  if (pathname === href || pathname.startsWith(`${href}/`)) return true;
  if (href === "/hpl-plaat" && (pathname === "/hpl-platen" || pathname.startsWith("/hpl-platen/"))) return true;
  return false;
}

export const nav = shopNav;

export { siteUsp as facts } from "./usp";

export const uspItems = [
  "Showroom op afspraak in Hedel",
  "Levertijd bevestigen we per bestelling",
  "10 jaar garantie op kleur",
  "Montage via offerte",
] as const;

export const businessPoints = [
  "Zelfde prijs voor aannemer en particulier",
  "Bestellen op rekening na eenmalige check",
  "Voorraad van de merken die we zelf plaatsen",
] as const;

export const faqs = [
  {
    q: "Wat kost kunststof gevelbekleding per m²?",
    a: "Tussen € 65 en € 120 per m² excl. btw, afhankelijk van profiel, merk en kleur. Rechte gevels zonder veel snijwerk zitten aan de onderkant. Wij rekenen het voor uw woning door, binnen 24 uur.",
  },
  {
    q: "Hoe lang gaat kunststof gevelbekleding mee?",
    a: "25 tot 35 jaar. De panelen zijn bestand tegen vocht, temperatuurwisselingen en verkleuring. Schilderen is niet nodig, af en toe reinigen wel.",
  },
  {
    q: "Keralit of VinyPlus?",
    a: "Keralit: stijver paneel, fijnere houtstructuur, hoogste kleurvastheid. VinyPlus: dezelfde garantie, scherpere prijs. Vraag van allebei een staal aan en leg ze naast elkaar.",
  },
] as const;

export const steps = [
  {
    n: "01",
    title: "Kies",
    text: "Kies merk, profiel en kleur. Of stuur foto’s, dan adviseren wij.",
  },
  {
    n: "02",
    title: "Bestel of offerte",
    text: "Zelf monteren: direct uit voorraad. Plaatsing: één vaste prijs na opname.",
  },
  {
    n: "03",
    title: "Levering",
    text: "Standaard binnen een week. Altijd binnen 24 uur bericht.",
  },
  {
    n: "04",
    title: "Montage",
    text: "Zelf met onze handleiding, of onze ploeg werkt droog en ventilatie-open.",
  },
] as const;
