export const site = {
  name: "kunststof-gevel.nl",
  shortName: "kunststof-gevel.nl",
  tagline: "Nooit meer schilderen.",
  slogan: "Nooit meer schilderen. Vervang hout door kunststof.",
  house: "kunststof-gevel.nl",
  description:
    "Webshop van Pouw Online Group B.V. voor kunststof gevelbekleding, dakranden en kozijnen. Showroom op afspraak in Utrecht.",
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
  address: "Spinsterlaan 6A, 3454 WZ Utrecht",
  street: "Spinsterlaan 6A",
  postalCode: "3454 WZ",
  city: "Utrecht",
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
  title: "Nooit meer schilderen.",
  subtitle: "Vervang hout door kunststof.",
  body: "Kunststof gevelbekleding, dakranden en kozijnafwerking. Showroom op afspraak in Utrecht. Zelf monteren of montage via een offerte.",
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
  { href: "/hpl-platen", label: "HPL platen" },
  { href: "/dakranden", label: "Dakranden" },
  { href: "/kozijnen", label: "Kozijnen" },
  { href: "/merken", label: "Merken" },
  { href: "/zakelijk", label: "Zakelijk" },
] as const;

export const footerColumns = [
  {
    title: "Assortiment",
    links: [
      { href: "/gevelbekleding", label: "Gevelbekleding" },
      { href: "/hpl-platen", label: "HPL platen" },
      { href: "/dakranden", label: "Dakranden" },
      { href: "/kozijnen", label: "Kunststof kozijnen" },
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
      { href: "/blog", label: "Kennis" },
      { href: "/account", label: "Account" },
    ],
  },
  {
    title: "Bedrijf",
    links: [
      { href: "/over-ons", label: "Over ons" },
      { href: "/projecten", label: "Projecten" },
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

export const nav = shopNav;

export const facts = [
  { k: "Showroom", v: "op afspraak in Utrecht" },
  { k: "Levering", v: "in overleg" },
  { k: "10 jaar", v: "garantie op kleur" },
  { k: "Montage", v: "via offerte" },
] as const;

export const uspItems = [
  "Showroom op afspraak in Utrecht",
  "Levertijd bevestigen we per bestelling",
  "10 jaar garantie op kleur",
  "Montage via offerte",
] as const;

export const businessPoints = [
  "Zelfde prijs voor aannemer en particulier",
  "Bestellen op rekening na eenmalige check",
  "Voorraad van de merken die we zelf plaatsen",
] as const;

export type Project = {
  slug: string;
  title: string;
  location: string;
  profile: string;
  color: string;
  area: string;
  year: string;
  summary: string;
  palette: string[];
};

export const projects: Project[] = [
  {
    slug: "villa-bergen",
    title: "Villa in Bergen",
    location: "Bergen, Noord-Holland",
    profile: "Zweeds rabat",
    color: "Vergrijsd eiken",
    area: "186 m²",
    year: "2025",
    summary:
      "Volledige gevelrenovatie van een jaren-70-villa. Houten rabat was verweerd; we vervingen het door zweeds rabat in vergrijsd eiken, inclusief hoekprofielen en ventilatielatten.",
    palette: ["#A39480", "#B3A490", "#8E8170", "#C4B6A2"],
  },
  {
    slug: "aanbouw-amersfoort",
    title: "Aanbouw in Amersfoort",
    location: "Amersfoort, Utrecht",
    profile: "Sponningdeel",
    color: "Antraciet",
    area: "42 m²",
    year: "2025",
    summary:
      "Strakke aanbouw met keuken en bijkeuken. Antraciet sponningdeel sluit aan op bestaande aluminium kozijnen. Montage in twee dagen, inclusief dakrandafwerking.",
    palette: ["#3A3D41", "#45484C", "#323538", "#4C5055"],
  },
  {
    slug: "woning-deventer",
    title: "Jaren-30-woning in Deventer",
    location: "Deventer, Overijssel",
    profile: "Potdeksel",
    color: "Meranti",
    area: "98 m²",
    year: "2024",
    summary:
      "Topgevels en achtergevel kregen potdeksel in meranti-houtlook. De voorgevel bleef steen, zodat de karakteristieke uitstraling aan de straatkant behouden bleef.",
    palette: ["#5C2E22", "#6B3828", "#4E261C", "#7A4330"],
  },
  {
    slug: "recreatie-veluwe",
    title: "Recreatiewoning op de Veluwe",
    location: "Nunspeet, Gelderland",
    profile: "Rabat",
    color: "Eiken",
    area: "64 m²",
    year: "2024",
    summary:
      "Chalet met rondom rabat in eiken. Lichtgewicht, onderhoudsvrij en bestand tegen vocht uit het bos. Eigenaar hoeft niet meer te beitsen.",
    palette: ["#7A4E2E", "#8C5A36", "#6E4326", "#9A6840"],
  },
];

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
