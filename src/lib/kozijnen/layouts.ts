import { sizeBox, type SizeBox } from "./config";

export type KozijnGroup = "ramen" | "schuifpuien" | "deuren";

export type PaneKind = "vast" | "draai" | "draaikiep" | "schuif" | "deur";

export type LayoutPane = {
  kind: PaneKind;
  flex: number;
};

export type Layout = {
  slug: string;
  group: KozijnGroup;
  title: string;
  menu: string;
  summary: string;
  panes: LayoutPane[];
  /** Stolp: vleugels sluiten op elkaar, dunne naad in de tekening. */
  meeting: boolean;
  chooseSide: boolean;
  chooseDirection: boolean;
  chooseActive: boolean;
  fillings: ("paneel" | "half" | "glas")[];
  defaultDirection: "binnen" | "buiten";
  defaultWidth: number;
  defaultHeight: number;
  limits: SizeBox;
};

const layouts: Layout[] = [
  {
    slug: "vast-raam",
    group: "ramen",
    title: "Vast raam",
    menu: "Vast raam",
    summary: "Glas dat dicht blijft. Licht, zonder draaideel.",
    panes: [{ kind: "vast", flex: 1 }],
    meeting: false,
    chooseSide: false,
    chooseDirection: false,
    chooseActive: false,
    fillings: [],
    defaultDirection: "binnen",
    defaultWidth: 1000,
    defaultHeight: 1200,
    limits: sizeBox("vast-raam"),
  },
  {
    slug: "draairaam",
    group: "ramen",
    title: "Draairaam",
    menu: "Draairaam",
    summary: "Eén vleugel die open draait. Geen kiepstand.",
    panes: [{ kind: "draai", flex: 1 }],
    meeting: false,
    chooseSide: true,
    chooseDirection: true,
    chooseActive: false,
    fillings: [],
    defaultDirection: "binnen",
    defaultWidth: 1000,
    defaultHeight: 1200,
    limits: sizeBox("draairaam"),
  },
  {
    slug: "draaikiepraam",
    group: "ramen",
    title: "Draaikiepraam",
    menu: "Draaikiepraam",
    summary: "Eén vleugel. Open draaien of op kiep.",
    panes: [{ kind: "draaikiep", flex: 1 }],
    meeting: false,
    chooseSide: true,
    chooseDirection: true,
    chooseActive: false,
    fillings: [],
    defaultDirection: "binnen",
    defaultWidth: 1000,
    defaultHeight: 1200,
    limits: sizeBox("draaikiepraam"),
  },
  {
    slug: "draaikiepraam-met-vast-raam",
    group: "ramen",
    title: "Draaikiepraam met vast raam",
    menu: "Draaikiep met vast",
    summary: "Twee vakken. Het draaideel zit links of rechts.",
    panes: [
      { kind: "vast", flex: 1 },
      { kind: "draaikiep", flex: 1 },
    ],
    meeting: false,
    chooseSide: true,
    chooseDirection: true,
    chooseActive: false,
    fillings: [],
    defaultDirection: "binnen",
    defaultWidth: 1500,
    defaultHeight: 1400,
    limits: sizeBox("draaikiepraam-met-vast-raam"),
  },
  {
    slug: "vast-draaikiep-vast",
    group: "ramen",
    title: "Vast, draaikiep, vast",
    menu: "Vast, draaikiep, vast",
    summary: "Drie vakken. Het draaideel zit in het midden.",
    panes: [
      { kind: "vast", flex: 1 },
      { kind: "draaikiep", flex: 1 },
      { kind: "vast", flex: 1 },
    ],
    meeting: false,
    chooseSide: false,
    chooseDirection: true,
    chooseActive: false,
    fillings: [],
    defaultDirection: "binnen",
    defaultWidth: 1800,
    defaultHeight: 1400,
    limits: sizeBox("vast-draaikiep-vast"),
  },
  {
    slug: "draaikiep-vast-draaikiep",
    group: "ramen",
    title: "Draaikiep, vast, draaikiep",
    menu: "Twee draaikiepramen",
    summary: "Drie vakken. Links en rechts een draaideel, vast glas ertussen.",
    panes: [
      { kind: "draaikiep", flex: 1 },
      { kind: "vast", flex: 1 },
      { kind: "draaikiep", flex: 1 },
    ],
    meeting: false,
    chooseSide: false,
    chooseDirection: true,
    chooseActive: true,
    fillings: [],
    defaultDirection: "binnen",
    defaultWidth: 2100,
    defaultHeight: 1400,
    limits: sizeBox("draaikiep-vast-draaikiep"),
  },
  {
    slug: "stolpraam",
    group: "ramen",
    title: "Stolpraam",
    menu: "Stolpraam",
    summary: "Twee vleugels die op elkaar sluiten, zonder vaste tussenstijl.",
    panes: [
      { kind: "draaikiep", flex: 1 },
      { kind: "draaikiep", flex: 1 },
    ],
    meeting: true,
    chooseSide: false,
    chooseDirection: true,
    chooseActive: true,
    fillings: [],
    defaultDirection: "binnen",
    defaultWidth: 1400,
    defaultHeight: 1400,
    limits: sizeBox("stolpraam"),
  },
  {
    slug: "schuifpui-2-delig",
    group: "schuifpuien",
    title: "Schuifpui, 2-delig",
    menu: "2-delig",
    summary: "Eén schuivend deel en één vast deel.",
    panes: [
      { kind: "vast", flex: 1 },
      { kind: "schuif", flex: 1 },
    ],
    meeting: false,
    chooseSide: false,
    chooseDirection: false,
    chooseActive: true,
    fillings: [],
    defaultDirection: "binnen",
    defaultWidth: 2000,
    defaultHeight: 2100,
    limits: sizeBox("schuifpui-2-delig"),
  },
  {
    slug: "schuifpui-4-delig",
    group: "schuifpuien",
    title: "Schuifpui, 4-delig",
    menu: "4-delig",
    summary: "Vier vakken. De schuivende delen kiest u links of rechts.",
    panes: [
      { kind: "vast", flex: 1 },
      { kind: "schuif", flex: 1 },
      { kind: "schuif", flex: 1 },
      { kind: "vast", flex: 1 },
    ],
    meeting: false,
    chooseSide: false,
    chooseDirection: false,
    chooseActive: true,
    fillings: [],
    defaultDirection: "binnen",
    defaultWidth: 4000,
    defaultHeight: 2100,
    limits: sizeBox("schuifpui-4-delig"),
  },
  {
    slug: "achterdeur",
    group: "deuren",
    title: "Achterdeur",
    menu: "Achterdeur",
    summary: "Enkele deur. Paneel, half glas of vol glas.",
    panes: [{ kind: "deur", flex: 1 }],
    meeting: false,
    chooseSide: true,
    chooseDirection: true,
    chooseActive: false,
    fillings: ["paneel", "half", "glas"],
    defaultDirection: "binnen",
    defaultWidth: 1000,
    defaultHeight: 2200,
    limits: sizeBox("achterdeur"),
  },
  {
    slug: "dubbele-achterdeur",
    group: "deuren",
    title: "Dubbele achterdeur",
    menu: "Dubbele achterdeur",
    summary: "Twee deuren. Eén is de loopdeur.",
    panes: [
      { kind: "deur", flex: 1 },
      { kind: "deur", flex: 1 },
    ],
    meeting: true,
    chooseSide: false,
    chooseDirection: true,
    chooseActive: true,
    fillings: ["paneel", "half", "glas"],
    defaultDirection: "binnen",
    defaultWidth: 1600,
    defaultHeight: 2200,
    limits: sizeBox("dubbele-achterdeur"),
  },
  {
    slug: "tuindeur",
    group: "deuren",
    title: "Tuindeur",
    menu: "Tuindeur",
    summary: "Enkele tuindeur, meestal met veel glas.",
    panes: [{ kind: "deur", flex: 1 }],
    meeting: false,
    chooseSide: true,
    chooseDirection: true,
    chooseActive: false,
    fillings: ["half", "glas", "paneel"],
    defaultDirection: "buiten",
    defaultWidth: 1000,
    defaultHeight: 2200,
    limits: sizeBox("tuindeur"),
  },
  {
    slug: "openslaande-tuindeuren",
    group: "deuren",
    title: "Openslaande tuindeuren",
    menu: "Openslaand",
    summary: "Twee tuindeuren die naar binnen of naar buiten slaan.",
    panes: [
      { kind: "deur", flex: 1 },
      { kind: "deur", flex: 1 },
    ],
    meeting: true,
    chooseSide: false,
    chooseDirection: true,
    chooseActive: true,
    fillings: ["glas", "half", "paneel"],
    defaultDirection: "buiten",
    defaultWidth: 1600,
    defaultHeight: 2200,
    limits: sizeBox("openslaande-tuindeuren"),
  },
];

for (const layout of layouts) {
  if (layout.group === "ramen") {
    layout.chooseDirection = false;
    layout.defaultDirection = "binnen";
  }
}

export const GROUPS: { id: KozijnGroup; title: string; href: string; lead: string }[] = [
  {
    id: "ramen",
    title: "Ramen",
    href: "/kunststof-kozijnen/ramen",
    lead: "Vast, draai, draaikiep en combinaties.",
  },
  {
    id: "schuifpuien",
    title: "Schuifpuien",
    href: "/kunststof-kozijnen/schuifpuien",
    lead: "Twee of vier delen, op maat.",
  },
  {
    id: "deuren",
    title: "Deuren",
    href: "/kunststof-kozijnen/deuren",
    lead: "Achterdeur en tuindeur, enkel of dubbel.",
  },
];

export function allLayouts() {
  return layouts;
}

export function layoutsIn(group: KozijnGroup) {
  return layouts.filter((layout) => layout.group === group);
}

export function getLayout(group: string, slug: string) {
  return layouts.find((layout) => layout.group === group && layout.slug === slug) ?? null;
}

export function getLayoutBySlug(slug: string) {
  return layouts.find((layout) => layout.slug === slug) ?? null;
}

export function layoutPath(layout: Pick<Layout, "group" | "slug">) {
  return `/kunststof-kozijnen/${layout.group}/${layout.slug}`;
}
