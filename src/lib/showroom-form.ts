import { isBannedSampleText } from "@/lib/staal/banned";
import { formatProjectPostcode } from "@/lib/project-quote";
import { site } from "@/lib/site";

export const SHOWROOM_TAG = "showroomafspraak";
export const SHOWROOM_HORIZON_DAYS = 183;

export const SHOWROOM_PARTS = ["Ochtend", "Middag"] as const;

export const SHOWROOM_INTERESTS = [
  "Gevelbekleding",
  "Dakranden",
  "Kozijnen",
  "HPL",
  "Vensterbanken",
  "Montage door Cavemen",
] as const;

/** Projectfoto uit de repo. Er is geen aparte showroomfoto. */
export const SHOWROOM_PHOTO = {
  src: "/projecten/vinyplus-quattro-uitbouw.webp",
  alt: "Uitbouw met VinyPlus Quattro in lichte houtlook, horizontaal geplaatst",
} as const;

export const SHOWROOM_DESCRIPTION = `Alleen op afspraak aan de ${site.address}. Zie en voel gevelpanelen, kleuren, dakranden en HPL. Bel ${site.phone} of app ${site.mobileDisplay}.`;

export const showroomLinks = [
  { href: "/gevelbekleding", label: "Gevelbekleding" },
  { href: "/boeidelen", label: "Dakranden" },
  { href: "/hpl-plaat", label: "HPL platen" },
  { href: "/kunststof-vensterbank", label: "Vensterbanken" },
  { href: "/kunststof-kozijnen", label: "Kozijnen" },
  { href: "/staalaanvraag", label: "Gratis kleurstalen" },
  { href: "/projecten", label: "Projecten" },
  { href: "/offerte", label: "Offerte" },
  { href: "/contact", label: "Contact" },
] as const;

export const showroomFaqs = [
  {
    q: "Moet ik een afspraak maken voor de showroom?",
    a: `Ja. De showroom aan de ${site.address} is alleen op afspraak. Stuur het formulier, bel ${site.phone} of app ${site.mobileDisplay}. Het formulier is een aanvraag. Wij bevestigen de dag.`,
  },
  {
    q: "Wat kan ik in de showroom zien en voelen?",
    a: "Gevelpanelen en kleuren, dakranden en HPL. U kunt het materiaal zelf vasthouden. Kozijnen liggen erbij, als afwerking naast de gevel. De koffie staat klaar. We rekenen samen uit hoeveel materiaal u nodig heeft.",
  },
  {
    q: "Wanneer kan ik langskomen?",
    a: `Alleen op afspraak. We zijn bereikbaar op maandag tot en met vrijdag van 08:00 tot 17:00. Op zondag plannen we geen afspraak. De dag en het dagdeel, ochtend of middag, bevestigen we nadat uw aanvraag binnen is.`,
  },
  {
    q: "Helpen jullie ook met de berekening en de plaatsing?",
    a: "Ja. We maken een berekening zodat u weet hoeveel materiaal u nodig heeft, en we geven advies dat bij uw situatie past. Doet u het zelf, dan leggen we uit hoe u te werk gaat. Wilt u het laten plaatsen, dan kan dat via montage door Cavemen, in een offerte.",
  },
] as const;

export type ShowroomInput = {
  name: string;
  email: string;
  phone: string;
  postcode: string;
  day: string;
  part: string;
  interests: string[];
  message: string;
  includeSamples: boolean;
  samples: string[];
  companyWebsite: string;
};

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const dayRe = /^(\d{4})-(\d{2})-(\d{2})$/;
export function showroomMapHref() {
  const query = encodeURIComponent(`${site.street}, ${site.postalCode} ${site.city}`);
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

export function showroomToday(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Amsterdam",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function parseShowroomDay(value: string) {
  const match = dayRe.exec(value.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
    return null;
  }
  return { iso: `${match[1]}-${match[2]}-${match[3]}`, sunday: date.getUTCDay() === 0 };
}

export function addShowroomDays(iso: string, days: number) {
  const parsed = parseShowroomDay(iso);
  if (!parsed) return iso;
  const [year, month, day] = parsed.iso.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days));
  return date.toISOString().slice(0, 10);
}

export function cleanShowroomReference(value: string | undefined) {
  if (!value) return "";
  return /^SR-[0-9A-Z]{4,20}$/.test(value) ? value : "";
}

function oneLine(value: string, max: number) {
  return value.replace(/[\r\n\0]/g, " ").trim().slice(0, max);
}

function cleanPart(value: string) {
  const text = value.trim().toLowerCase();
  if (text === "ochtend") return "Ochtend";
  if (text === "middag") return "Middag";
  return "";
}

function cleanInterests(values: string[]) {
  const unique: string[] = [];
  for (const value of values) {
    const clean = oneLine(value, 40);
    if (!SHOWROOM_INTERESTS.includes(clean as (typeof SHOWROOM_INTERESTS)[number])) continue;
    if (unique.includes(clean)) continue;
    unique.push(clean);
  }
  return unique;
}

function cleanSamples(values: string[]) {
  const unique: string[] = [];
  for (const value of values) {
    const clean = oneLine(value, 120);
    if (!clean || isBannedSampleText(clean) || unique.includes(clean)) continue;
    unique.push(clean);
    if (unique.length >= 4) break;
  }
  return unique;
}

export function emptyShowroom(raw: {
  name?: string;
  email?: string;
  phone?: string;
  postcode?: string;
  day?: string;
  part?: string;
  interests?: string[];
  message?: string;
  includeSamples?: boolean;
  samples?: string[];
  companyWebsite?: string;
}): ShowroomInput {
  const parsedDay = parseShowroomDay(raw.day ?? "");
  const includeSamples = raw.includeSamples === true;
  return {
    name: oneLine(raw.name ?? "", 80),
    email: oneLine(raw.email ?? "", 400),
    phone: oneLine(raw.phone ?? "", 40),
    postcode: formatProjectPostcode(raw.postcode ?? "") || oneLine(raw.postcode ?? "", 20),
    day: parsedDay?.iso ?? oneLine(raw.day ?? "", 20),
    part: cleanPart(raw.part ?? ""),
    interests: cleanInterests(raw.interests ?? []),
    message: (raw.message ?? "").replace(/\0/g, "").trim().slice(0, 2000),
    includeSamples,
    samples: includeSamples ? cleanSamples(raw.samples ?? []) : [],
    companyWebsite: raw.companyWebsite ?? "",
  };
}

export function validateShowroom(input: ShowroomInput, now = new Date()): string | null {
  if (input.name.trim().length < 2) return "Vul uw naam in.";
  const email = input.email.trim();
  if (!email || email.length > 400 || !emailRe.test(email)) return "Vul een geldig e-mailadres in.";
  const digits = input.phone.replace(/\D/g, "");
  if (digits.length < 8 || digits.length > 15) return "Vul een telefoonnummer in.";
  if (!formatProjectPostcode(input.postcode)) return "Vul de postcode in als 1234 AB.";
  const day = parseShowroomDay(input.day);
  if (!day) return "Kies een geldige voorkeursdag.";
  const today = showroomToday(now);
  if (day.iso < today) return "Kies vandaag of een latere dag.";
  if (day.iso > addShowroomDays(today, SHOWROOM_HORIZON_DAYS)) return "Kies een dag binnen een half jaar.";
  if (day.sunday) return "Op zondag plannen we geen showroomafspraak. Kies een andere dag.";
  if (!SHOWROOM_PARTS.includes(input.part as (typeof SHOWROOM_PARTS)[number])) return "Kies ochtend of middag.";
  if (!input.interests.length) return "Kies waar u naar wilt kijken.";
  for (const interest of input.interests) {
    if (!SHOWROOM_INTERESTS.includes(interest as (typeof SHOWROOM_INTERESTS)[number])) {
      return "Kies een onderwerp uit de lijst.";
    }
  }
  if (input.message.trim().length > 2000) return "Houd de opmerking onder 2000 tekens.";
  return null;
}

export function showroomShopText(input: ShowroomInput, reference: string) {
  const samples =
    input.includeSamples && input.samples.length ? input.samples.map((line) => `- ${line}`).join("\n") : "-";
  return [
    `Bron: Showroomafspraak`,
    `Referentie: ${reference}`,
    `Naam: ${input.name.trim()}`,
    `E-mail: ${input.email.trim()}`,
    `Telefoon: ${input.phone.trim()}`,
    `Postcode: ${formatProjectPostcode(input.postcode) || input.postcode.trim()}`,
    `Voorkeursdag: ${input.day}`,
    `Dagdeel: ${input.part}`,
    `Interesse: ${input.interests.join(", ")}`,
    `Opmerking: ${input.message.trim() || "-"}`,
    `Stalen meenemen: ${input.includeSamples ? "ja" : "nee"}`,
    "Stalen:",
    samples,
    `Showroom: ${site.address}. Alleen op afspraak.`,
  ].join("\n");
}

export function showroomCustomerText(input: ShowroomInput, reference: string) {
  const lines = [
    "Bedankt. Uw aanvraag voor een showroomafspraak is binnen.",
    "Dit is nog geen bevestigde afspraak. Wij nemen contact op om de dag te bevestigen.",
    "",
    `Referentie: ${reference}`,
    `Voorkeursdag: ${input.day}`,
    `Dagdeel: ${input.part}`,
    `Interesse: ${input.interests.join(", ")}`,
  ];
  if (input.includeSamples && input.samples.length) {
    lines.push("Stalen die u mee wilt nemen:", ...input.samples.map((line) => `- ${line}`));
  }
  if (input.message.trim()) lines.push(`Opmerking: ${oneLine(input.message, 2000)}`);
  lines.push(
    "",
    `Showroom: ${site.address}. Alleen op afspraak.`,
    `Vragen? Bel ${site.phone} of WhatsApp ${site.mobileDisplay}.`,
    site.name,
    site.company,
  );
  return lines.join("\n");
}

