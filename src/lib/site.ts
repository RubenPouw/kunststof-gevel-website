export const site = {
  name: "Kunststofgevel",
  tagline: "Gevels met houtlook. Zonder het onderhoud.",
  description:
    "Kunststofgevel adviseert, levert en monteert onderhoudsarme kunststof gevelbekleding voor woningen, aanbouwen en bedrijfspanden in heel Nederland.",
  phone: "085 401 2280",
  phoneHref: "tel:+31854012280",
  email: "info@kunststofgevel.nl",
  emailHref: "mailto:info@kunststofgevel.nl",
  hours: "Ma–vr 08:00–17:00",
  region: "Heel Nederland",
  kvk: "In oprichting",
} as const;

export const nav = [
  { href: "/", label: "Home" },
  { href: "/assortiment", label: "Assortiment" },
  { href: "/projecten", label: "Projecten" },
  { href: "/over-ons", label: "Over ons" },
  { href: "/contact", label: "Contact" },
] as const;

export const profiles = [
  {
    slug: "rabat",
    name: "Rabat",
    summary: "Klassiek overlapping profiel met een warme, landelijke uitstraling.",
    detail:
      "Rabatdelen overlappen elkaar licht, waardoor regenwater goed wegstroomt. Geschikt voor gevels, topgevels en bergingen. Leverbaar in houtlook en strakke unikleuren.",
    use: "Woningen, schuren, dakkapellen",
    priceFrom: 68,
  },
  {
    slug: "sponningdeel",
    name: "Sponningdeel",
    summary: "Strak, modern profiel met een subtiele groef. Minimalistisch en strak.",
    detail:
      "Sponningdelen vallen in elkaar met een sponning. Het resultaat is een rustige gevel zonder grove overlapping. Vaak gekozen bij nieuwbouw en strakke verbouwingen.",
    use: "Nieuwbouw, aanbouwen, moderne gevels",
    priceFrom: 74,
  },
  {
    slug: "potdeksel",
    name: "Potdeksel",
    summary: "Diepe schaduwwerking, extra volume en een stoere, boerderij-achtige look.",
    detail:
      "Potdekselprofielen hebben een duidelijke overlapping. Dat geeft ritme in de gevel en extra waterkering. Populair bij renovatie van jaren-30- en jaren-70-woningen.",
    use: "Renovatie, boerderijen, recreatiewoningen",
    priceFrom: 71,
  },
  {
    slug: "zweeds-rabat",
    name: "Zweeds rabat",
    summary: "Schuine delen met een Scandinavische, houtachtige gevelstructuur.",
    detail:
      "Zweeds rabat combineert een schuine voorkant met een strakke sluiting. Het profiel leest als hout, maar blijft kleurvast en rotvrij. Goed in combinatie met antraciet kozijnen.",
    use: "Villa’s, recreatie, gevelrenovatie",
    priceFrom: 79,
  },
] as const;

export const colors = [
  { name: "Antraciet", hex: "#3A3D41" },
  { name: "Diepzwart", hex: "#1A1B1C" },
  { name: "Kiezelgrijs", hex: "#8B8E8A" },
  { name: "Crème", hex: "#E8DCC8" },
  { name: "Eiken", hex: "#8B5E3C" },
  { name: "Meranti", hex: "#6B3A2A" },
  { name: "Vergrijsd eiken", hex: "#A39480" },
  { name: "Dennengroen", hex: "#2F4A3C" },
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
  image: string;
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
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80",
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
    image:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=80",
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
    image:
      "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1600&q=80",
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
    image:
      "https://images.unsplash.com/photo-1600047509807-ba8d526a5c65?auto=format&fit=crop&w=1600&q=80",
  },
] as const;

export const faqs = [
  {
    q: "Wat kost kunststof gevelbekleding per m²?",
    a: "Materiaal ligt meestal tussen €65 en €95 per m², afhankelijk van profiel en kleur. Inclusief professionele montage rekenen we grofweg €95 tot €140 per m². Hoeken, dakranden en steigerwerk tellen extra. We maken altijd een vaste prijs na opname.",
  },
  {
    q: "Hoe lang gaat het mee?",
    a: "Een goed gemonteerd systeem gaat 25 tot 40 jaar mee. De panelen rotten niet, splinteren niet en hoeven niet geschilderd te worden. Kleurvastheid hangt af van het folie; wij werken met merken die daar 10 tot 15 jaar garantie op geven.",
  },
  {
    q: "Kan ik het zelf monteren?",
    a: "Ja, als je handig bent en het regelwerk, de ventilatie en de dilatatie goed uitvoert. Wij leveren ook alleen materiaal, met een duidelijke montagelijst. Twijfel je over een lastige gevel, dan monteren wij het liever zelf — fouten in de achterconstructie zie je later terug.",
  },
  {
    q: "Is kunststof beter dan hout?",
    a: "Voor onderhoud: ja. Hout moet periodiek geschilderd of gebeitst worden en kan rotten. Kunststof blijft langer strak, maar voelt minder ‘echt’ dan massief hout. Wie de houtlook wil zonder het schilderwerk, kiest kunststof. Wie puur natuur zoekt, kiest hout of een hoogwaardig composiet.",
  },
  {
    q: "Werken jullie in heel Nederland?",
    a: "Ja. Adviesgesprekken kunnen telefonisch of op locatie. Montage plannen we landelijk; bij kleine oppervlakken wegen reiskosten mee in de offerte.",
  },
] as const;

export const steps = [
  {
    n: "01",
    title: "Advies",
    text: "Stuur foto’s of plan een opname. We kijken naar ondergrond, ventilatie, kleur en profiel.",
  },
  {
    n: "02",
    title: "Opname",
    text: "We meten de gevel, checken het regelwerk en noteren hoeken, ramen en dakranden.",
  },
  {
    n: "03",
    title: "Vaste offerte",
    text: "Je krijgt een duidelijke prijs: materiaal, montage, afval en eventueel steiger.",
  },
  {
    n: "04",
    title: "Montage",
    text: "Onze ploeg werkt droog, met ventilatie achter de panelen. Oplevering met garantie.",
  },
] as const;
