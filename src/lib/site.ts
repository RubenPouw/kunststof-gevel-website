export const site = {
  name: "kunststof-gevel.nl",
  shortName: "kunststof-gevel.nl",
  tagline: "Nooit meer schilderen.",
  slogan: "Nooit meer schilderen. Vervang hout door kunststof.",
  house: "Cavesupplies",
  description:
    "Webshop voor kunststof gevelbekleding, dakranden en kozijnen. Op voorraad in Hedel, levering in vaste weken. Zelf zetten of een Caveman erbij. Onderdeel van Cavesupplies, Cavemen BV.",
  phone: "085 401 2280",
  phoneHref: "tel:+31854012280",
  email: "info@kunststof-gevel.nl",
  emailHref: "mailto:info@kunststof-gevel.nl",
  whatsapp: "https://wa.me/31854012280",
  hours: "Ma–vr 08:00–17:00",
  address: "Binnenkamp 7a, 5321 KA Hedel",
  company: "Cavemen BV",
  region: "Heel Nederland",
  kvk: "In oprichting",
  freeShippingFrom: 499,
  googleScore: "9,3",
  googleReviews: 312,
  instagram: "https://www.instagram.com/kunststofgevel",
  instagramHandle: "@kunststofgevel",
  gevelsDelivered: "1.200+",
  since: 2016,
  articleCount: 214,
} as const;

export const hero = {
  kicker: "Kunststof gevelbekleding · Keralit · VinyPlus · Eurotexx",
  title: "Nooit meer schilderen.",
  subtitle: "Vervang hout door kunststof.",
  body: "Kunststof gevelbekleding, dakranden en kozijnafwerking. Op voorraad in Hedel, levering in vaste weken. Zelf zetten of een Caveman erbij.",
  cta: "Bekijk voorraad",
  samples: "Kies gratis kleurstalen",
  micro: "Altijd binnen 24 uur bericht",
} as const;

export const heroStats = [
  { value: "30 jr", label: "levensduur" },
  { value: "10 jr", label: "kleurvast" },
  { value: "24 u", label: "bericht" },
] as const;

export const paymentMethods = ["iDEAL", "Visa", "Mastercard", "PayPal", "Klarna"] as const;

export const shopNav = [
  { href: "/gevelbekleding", label: "Gevelbekleding" },
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
      { href: "/zakelijk", label: "Zakelijk account" },
      { href: "/montage", label: "Montage-instructies" },
    ],
  },
  {
    title: "Cavesupplies",
    links: [
      { href: "/over-ons", label: "Over het huis" },
      { href: "/montage", label: "Cavemen · plaats een klus" },
      { href: "/zakelijk", label: "Word Caveman" },
      { href: "/projecten", label: "Projecten" },
    ],
  },
] as const;

export const footerNav: { href: string; label: string }[] = footerColumns.flatMap((column) => [
  ...column.links,
]);

export const nav = shopNav;

export const facts = [
  { k: "214", v: "artikelen op voorraad" },
  { k: "Levering", v: "in vaste weken" },
  { k: "10 jaar", v: "garantie" },
  { k: "Cavemen", v: "per klus erbij" },
] as const;

export const uspItems = [
  "214 artikelen op voorraad",
  "Levering in vaste weken",
  "10 jaar garantie",
  "Cavemen per klus erbij",
] as const;

export const businessPoints = [
  "Zelfde prijs voor aannemer en particulier",
  "Bestellen op rekening na eenmalige check",
  "Voorraad van de merken die we zelf plaatsen",
] as const;

export const reviews = [
  {
    quote: "Binnen een dag een heldere offerte. Bij aflevering klopte alles tot het laatste profiel.",
    author: "Familie de Wit · Houten",
    score: "10",
  },
  {
    quote: "Zelf gemonteerd met het montageschema. Gevel staat strak, geen schilder meer nodig.",
    author: "Mark B. · Amersfoort",
    score: "9",
  },
  {
    quote: "Kleurstalen vooraf gekregen. Scheelde ons een verkeerde keuze van 80 m².",
    author: "Bouwbedrijf Kramer",
    score: "10",
  },
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
