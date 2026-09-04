export const site = {
  name: "kunststof-gevel.nl",
  shortName: "Kunststof-gevel",
  tagline: "Kunststof gevelbekleding, ga ervoor!",
  slogan: "Geniet langer van uw huis, ga voor kunststof",
  description:
    "Webshop voor kunststof gevelbekleding, dakranden en kozijnafwerking. Onderhoudsvrij, uit voorraad, of wij regelen de plaatsing. Onderdeel van Cavemen BV.",
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
} as const;

export const shopNav = [
  { href: "/gevelbekleding", label: "Gevelbekleding" },
  { href: "/dakranden", label: "Dakranden" },
  { href: "/kozijnafwerking", label: "Kozijnafwerking" },
  { href: "/merken", label: "Merken" },
  { href: "/zakelijk", label: "Zakelijk" },
] as const;

export const footerNav = [
  ...shopNav,
  { href: "/projecten", label: "Projecten" },
  { href: "/over-ons", label: "Over ons" },
  { href: "/offerte", label: "Offerte" },
  { href: "/contact", label: "Contact" },
] as const;

export const nav = shopNav;

export const uspItems = [
  "Onderhoudsvrij en duurzaam",
  "Standaard 10 jaar garantie",
  "Direct uit voorraad leverbaar",
  "Google 4,9 / 5",
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
    a: "Materiaal ligt meestal tussen 65 en 95 per m², afhankelijk van profiel en kleur. Inclusief professionele montage rekenen we grofweg 95 tot 140 per m². Hoeken, dakranden en steigerwerk tellen extra. We maken altijd een vaste prijs na opname.",
  },
  {
    q: "Hoe lang gaat het mee?",
    a: "Een goed gemonteerd systeem gaat 25 tot 40 jaar mee. De panelen rotten niet, splinteren niet en hoeven niet geschilderd te worden. Kleurvastheid hangt af van het folie; wij werken met merken die daar 10 tot 15 jaar garantie op geven.",
  },
  {
    q: "Kan ik het zelf monteren?",
    a: "Ja, als u handig bent en het regelwerk, de ventilatie en de dilatatie goed uitvoert. Wij leveren ook alleen materiaal, met een duidelijke montagelijst. Twijfelt u over een lastige gevel, dan monteren wij het liever zelf.",
  },
  {
    q: "Werken jullie in heel Nederland?",
    a: "Ja. Adviesgesprekken kunnen telefonisch of op locatie. Montage plannen we landelijk; bij kleine oppervlakken wegen reiskosten mee in de offerte.",
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
