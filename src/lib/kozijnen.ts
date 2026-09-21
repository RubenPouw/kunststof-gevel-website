export const KZ_TYPES = [
  {
    name: "Vast glas",
    detail: "geen draaidelen",
    cols: "1fr",
    panes: [{ open: false }],
    factor: 1,
  },
  {
    name: "Draaikiep",
    detail: "1 draaideel",
    cols: "1fr",
    panes: [{ open: true }],
    factor: 1.45,
  },
  {
    name: "Vast + draaikiep",
    detail: "2 delen",
    cols: "1.2fr 1fr",
    panes: [{ open: false }, { open: true }],
    factor: 1.35,
  },
  {
    name: "Dubbel draaikiep",
    detail: "2 draaidelen",
    cols: "1fr 1fr",
    panes: [{ open: true }, { open: true }],
    factor: 1.7,
  },
] as const;

export const KZ_COLORS = [
  { name: "Wit", code: "RAL 9016", hex: "#f2f1ec" },
  { name: "Crème", code: "RAL 9001", hex: "#e9e3d3" },
  { name: "Antraciet", code: "RAL 7016", hex: "#3b3f42" },
  { name: "Zwart", code: "RAL 9005", hex: "#1f2022" },
  { name: "Monumentengroen", code: "RAL 6009", hex: "#2c4a3a" },
  { name: "Golden oak", code: "houtlook", hex: "#a06b3b" },
] as const;

export const KZ_GLASS = [
  { name: "HR++", detail: "U 1,1", extra: 0 },
  { name: "Triple", detail: "U 0,6", extra: 28 },
  { name: "HR++ geluidwerend", detail: "38 dB", extra: 22 },
] as const;

export function clampKozijnMm(value: number) {
  const n = Number.isFinite(value) ? value : 1200;
  return Math.min(3000, Math.max(400, Math.round(n / 10) * 10));
}

export function kozijnM2(widthMm: number, heightMm: number) {
  return (widthMm * heightMm) / 1e6;
}

export function kozijnBasePrice(m2: number, typeIndex: number, colorIndex: number, glassIndex: number) {
  const type = KZ_TYPES[typeIndex] ?? KZ_TYPES[0];
  const colorUp = colorIndex === 0 ? 1 : colorIndex === 1 ? 1.05 : 1.18;
  const glass = KZ_GLASS[glassIndex]?.extra ?? 0;
  return Math.round((95 + m2 * 165 * type.factor) * colorUp + m2 * glass);
}

export function kozijnMountPrice(m2: number) {
  return Math.round(140 + m2 * 60);
}
