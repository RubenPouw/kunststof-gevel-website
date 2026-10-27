import type { SummaryLine } from "./text";

const WINANSI: Record<string, string> = {
  "é": "\\351",
  "è": "\\350",
  "ê": "\\352",
  "ë": "\\353",
  "á": "\\341",
  "à": "\\340",
  "ä": "\\344",
  "ï": "\\357",
  "í": "\\355",
  "ó": "\\363",
  "ö": "\\366",
  "ü": "\\374",
  "ú": "\\372",
  "ñ": "\\361",
  "ç": "\\347",
  "É": "\\311",
  "Ë": "\\313",
  "Ö": "\\326",
  "Ü": "\\334",
  "’": "'",
  "‘": "'",
  "“": '"',
  "”": '"',
  "–": "-",
  "—": "-",
  "×": "x",
  "²": "\\262",
};

function escapePdfText(value: string) {
  const mapped = [...value].map((char) => WINANSI[char] ?? char).join("");
  return mapped.replace(/\\(?![0-7]{3})/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function textCommands(lines: string[], startY = 800) {
  const commands = ["BT", "/F1 11 Tf", `40 ${startY} Td`, "14 TL"];
  lines.forEach((line, index) => {
    if (index === 0) commands.push(`(${escapePdfText(line)}) Tj`);
    else commands.push(`T* (${escapePdfText(line)}) Tj`);
  });
  commands.push("ET");
  return commands.join("\n");
}

export function buildPdf(lines: string[]) {
  const chunks: string[] = [];
  const pageLines = lines.slice(0, 48);
  const stream = textCommands(pageLines);
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Count 1 /Kids [3 0 R] >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>",
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];
  let cursor = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((body, index) => {
    offsets.push(cursor.length);
    cursor += `${index + 1} 0 obj\n${body}\nendobj\n`;
  });
  const xref = cursor.length;
  cursor += `xref\n0 ${objects.length + 1}\n`;
  cursor += "0000000000 65535 f \n";
  for (let index = 1; index < offsets.length; index += 1) {
    cursor += `${String(offsets[index]).padStart(10, "0")} 00000 n \n`;
  }
  cursor += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  chunks.push(cursor);
  return Buffer.from(chunks.join(""), "latin1");
}

export function quotePdfLines(input: { title: string; lines: SummaryLine[]; reference?: string }) {
  return [
    "kunststof-gevel.nl",
    "Vrijblijvende offerteaanvraag",
    input.reference ? `Kenmerk ${input.reference}` : "Nog zonder kenmerk",
    input.title,
    "",
    ...input.lines.map((line) => `${line.label}: ${line.value}`),
    "",
    "Dit document is een aanvraag. Er staat geen prijs op.",
    "We reageren op werkdagen. Levertijd en garantie bevestigen we in de offerte.",
    "Pouw Online Group B.V., Binnenkamp 7a, 5321 KA Hedel",
    "030 227 1397",
  ];
}

export function measureFormPdfLines() {
  return [
    "kunststof-gevel.nl",
    "Meetformulier kunststof kozijn",
    "Maten in millimeters, buitenwerks. Drie keer meten, de kleinste aanhouden.",
    "",
    "Adres:",
    "Ruimte of gevel:",
    "Nieuwbouw of renovatie:",
    "Stelkozijn aanwezig (ja/nee):",
    "",
    "Breedte boven:",
    "Breedte midden:",
    "Breedte onder:",
    "Hoogte links:",
    "Hoogte midden:",
    "Hoogte rechts:",
    "Diagonaal 1:",
    "Diagonaal 2:",
    "Verschil diagonalen:",
    "",
    "Aanslag of stomp:",
    "Onderdorpel (hoogte en materiaal):",
    "Onderkant glas vanaf de vloer:",
    "Draairichting, van buiten gezien:",
    "",
    "Notities:",
    "",
    "De kleinste breedte en de kleinste hoogte gaan naar de aanvraag.",
  ];
}
