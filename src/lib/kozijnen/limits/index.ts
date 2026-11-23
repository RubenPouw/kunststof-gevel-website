import type { SizeBox } from "./types";
import { limits as achterdeur } from "./achterdeur";
import { limits as draaikiepVastDraaikiep } from "./draaikiep-vast-draaikiep";
import { limits as draaikiepraamMetVast } from "./draaikiepraam-met-vast-raam";
import { limits as draaikiepraam } from "./draaikiepraam";
import { limits as draairaam } from "./draairaam";
import { limits as dubbeleAchterdeur } from "./dubbele-achterdeur";
import { limits as openslaandeTuindeuren } from "./openslaande-tuindeuren";
import { limits as schuifpuiTwee } from "./schuifpui-2-delig";
import { limits as schuifpuiVier } from "./schuifpui-4-delig";
import { limits as stolpraam } from "./stolpraam";
import { limits as tuindeur } from "./tuindeur";
import { limits as vastDraaikiepVast } from "./vast-draaikiep-vast";
import { limits as vastRaam } from "./vast-raam";

export type { SizeBox } from "./types";

/** Eén bestand per type. Een leeg object betekent: geen gepubliceerde grens. */
export const SIZE_LIMITS: Record<string, SizeBox> = {
  "vast-raam": vastRaam,
  draairaam,
  draaikiepraam,
  "draaikiepraam-met-vast-raam": draaikiepraamMetVast,
  "vast-draaikiep-vast": vastDraaikiepVast,
  "draaikiep-vast-draaikiep": draaikiepVastDraaikiep,
  stolpraam,
  "schuifpui-2-delig": schuifpuiTwee,
  "schuifpui-4-delig": schuifpuiVier,
  achterdeur,
  "dubbele-achterdeur": dubbeleAchterdeur,
  tuindeur,
  "openslaande-tuindeuren": openslaandeTuindeuren,
};

export function sizeBox(slug: string): SizeBox {
  return SIZE_LIMITS[slug] ?? {};
}
