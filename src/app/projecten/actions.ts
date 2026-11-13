"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { submitProjectQuoteLead } from "@/lib/leads";
import { projectBrands, type ProjectBrand } from "@/data/projects";
import { safePhotoName } from "@/lib/quote-photos";
import {
  emptyProjectQuote,
  projectQuoteFileError,
  rateLimitProjectQuote,
  validateProjectQuote,
  type ProjectQuoteFile,
} from "@/lib/project-quote";

export type ProjectQuoteState = { error: string | null; quiet: boolean };

const brands = new Set<ProjectBrand>(projectBrands.map((brand) => brand.slug));

function textField(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function listField(formData: FormData, key: string) {
  return formData.getAll(key).flatMap((value) => (typeof value === "string" ? [value] : []));
}

function takenFiles(formData: FormData) {
  const files: File[] = [];
  for (const key of ["foto1", "foto2", "foto3"]) {
    for (const item of formData.getAll(key)) {
      if (item instanceof File && item.size > 0) files.push(item);
    }
  }
  return files;
}

function fileMeta(file: File): ProjectQuoteFile {
  return { name: file.name, type: file.type, size: file.size };
}

function contentType(file: File) {
  if (file.type) return file.type;
  if (/\.pdf$/i.test(file.name)) return "application/pdf";
  if (/\.png$/i.test(file.name)) return "image/png";
  if (/\.heic$/i.test(file.name) || /\.heif$/i.test(file.name)) return "image/heic";
  return "image/jpeg";
}

async function clientIp() {
  const headerList = await headers();
  const forwarded = headerList.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "onbekend";
  return headerList.get("x-real-ip")?.trim() || "onbekend";
}

export async function submitProjectQuote(
  _prev: ProjectQuoteState,
  formData: FormData,
): Promise<ProjectQuoteState> {
  const input = emptyProjectQuote({
    email: textField(formData, "email"),
    bedrijfsnaam: textField(formData, "bedrijfsnaam"),
    voornaam: textField(formData, "voornaam"),
    achternaam: textField(formData, "achternaam"),
    telefoon: textField(formData, "telefoon"),
    adres: textField(formData, "adres"),
    plaats: textField(formData, "plaats"),
    montage: listField(formData, "montage"),
    delen: listField(formData, "deel_van_het_huis"),
    maand: textField(formData, "maand"),
    afmetingen: textField(formData, "afmetingen"),
    companyWebsite: textField(formData, "companyWebsite"),
    attribution: {
      utm_source: textField(formData, "utm_source"),
      utm_medium: textField(formData, "utm_medium"),
      utm_campaign: textField(formData, "utm_campaign"),
      utm_term: textField(formData, "utm_term"),
      utm_content: textField(formData, "utm_content"),
      gclid: textField(formData, "gclid"),
      gbraid: textField(formData, "gbraid"),
      wbraid: textField(formData, "wbraid"),
    },
  });

  if (input.companyWebsite.trim()) return { error: null, quiet: true };

  const invalid = validateProjectQuote(input);
  if (invalid) return { error: invalid, quiet: false };

  const files = takenFiles(formData);
  const fileProblem = projectQuoteFileError(files.map(fileMeta));
  if (fileProblem) return { error: fileProblem, quiet: false };

  if (!rateLimitProjectQuote(await clientIp())) {
    return { error: "Te veel aanvragen. Probeer het over een paar minuten opnieuw.", quiet: false };
  }

  let attachments;
  try {
    attachments = await Promise.all(
      files.map(async (file) => ({
        filename: safePhotoName(file.name),
        contentType: contentType(file),
        content: Buffer.from(await file.arrayBuffer()),
      })),
    );
  } catch {
    return { error: "De bestanden zijn niet meegekomen. Probeer kleinere bestanden.", quiet: false };
  }

  const result = await submitProjectQuoteLead(input, attachments);
  if (!result.ok) return { error: result.error, quiet: false };
  if (result.quiet) return { error: null, quiet: true };

  const query = new URLSearchParams({ verzonden: "1", ref: result.reference });
  const merk = textField(formData, "merk");
  if (brands.has(merk as ProjectBrand)) query.set("merk", merk);
  redirect(`/projecten?${query.toString()}#offerte`);
}
