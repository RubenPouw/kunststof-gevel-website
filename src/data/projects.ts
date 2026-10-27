export type ProjectPhoto = {
  src: string;
  alt: string;
  /** CSS object-position, so the crop keeps the subject. */
  position?: string;
};

export type ProjectBrand = "keralit" | "vinyplus" | "kerrafront";

export type Project = {
  slug: string;
  title: string;
  date: string;
  brand: string;
  brandSlug: ProjectBrand;
  color: string;
  /** One quiet line on the card. */
  card: string;
  paragraphs: string[];
  photos: ProjectPhoto[];
  /** Match a gevel product in the catalog for the sample link. */
  product?: { brandSlug: string; includes: string[] };
};

export const projectBrands: { slug: ProjectBrand; label: string }[] = [
  { slug: "keralit", label: "Keralit" },
  { slug: "vinyplus", label: "VinyPlus" },
  { slug: "kerrafront", label: "Kerrafront" },
];

export const projects: Project[] = [
  {
    slug: "vinyplus-quattro-uitbouw",
    title: "Uitbouw in VinyPlus Quattro",
    date: "2024-11-05",
    brand: "VinyPlus",
    brandSlug: "vinyplus",
    color: "Houtlook",
    card: "Uitbouw in lichte houtlook.",
    product: { brandSlug: "vinyplus", includes: ["quattro"] },
    photos: [
      {
        src: "/projecten/vinyplus-quattro-uitbouw.webp",
        alt: "Uitbouw met VinyPlus Quattro in lichte houtlook, horizontaal geplaatst",
        position: "center 46%",
      },
      {
        src: "/projecten/vinyplus-quattro-uitbouw-detail.webp",
        alt: "Detail van VinyPlus Quattro panelen in houtlook op een uitbouw",
        position: "center",
      },
    ],
    paragraphs: [
      "Deze uitbouw is bekleed met VinyPlus Quattro in houtlook. De panelen liggen horizontaal, in een lichte houttint, tegen de gevel van de aanbouw. Quattro is een breed profiel. Daardoor telt de wand weinig naden en blijft het vlak rustig, ook op een kleinere uitbouw.",
      "De foto's tonen de uitbouw vanaf de tuin en een detail van de panelen. De nerf is zichtbaar. De voegen lopen strak door. Het kunststof hoeft niet geschilderd te worden. Af en toe reinigen is het onderhoud. Geen beits, geen jaarlijkse schilderbeurt.",
      "VinyPlus Quattro past bij een uitbouw waar u een houtuitstraling wilt zonder het werk van hout. De folie is kleurvast en kan tegen vocht. Regen en zon vragen geen extra laag. Hoeken en aansluitingen komen uit dezelfde VinyPlus-lijn, zodat het paneel en de profielen bij elkaar horen.",
      "Wilt u de houtlook eerst in het echt zien, vraag dan een staal aan. Voor een prijs op uw eigen gevel vraagt u een offerte. Wij rekenen paneel, lengte en hulpstukken door.",
    ],
  },
  {
    slug: "keralit-190mm-plafond-overkapping",
    title: "Plafond in Keralit 190 mm",
    date: "2026-09-21",
    brand: "Keralit",
    brandSlug: "keralit",
    color: "Houtlook",
    card: "Plafond onder een overkapping.",
    product: { brandSlug: "keralit", includes: ["190"] },
    photos: [
      {
        src: "/projecten/keralit-190mm-plafond-overkapping.webp",
        alt: "Overkapping met Keralit 190 mm als plafond boven een terras in België",
        position: "center 20%",
      },
      {
        src: "/projecten/keralit-190mm-plafond-detail.webp",
        alt: "Keralit 190 mm plafond in lichte houtlook, van dichtbij",
        position: "center",
      },
    ],
    paragraphs: [
      "Boven dit terras is het plafond gemaakt van Keralit 190 mm. De panelen liggen in de overkapping, in een lichte houtlook. Het project staat in België. Wij leveren daar ook.",
      "Een plafond onder een overkapping krijgt regen langs de randen en vocht uit de tuin. Hout vraagt daar schilderwerk. Keralit 190 mm is een breed sponningdeel. De nerf blijft zichtbaar, de naden blijven rustig, en schilderen hoeft niet. Reinigen met water is het onderhoud.",
      "De foto's tonen het plafond van dichtbij en de overkapping in het geheel. U ziet hoe het paneel de ruimte boven de zitplek afwerkt, licht van kleur, zonder een verflaag. Het vlak loopt door tot de rand van de kap.",
      "Keralit 190 mm gebruiken we ook op de gevel. Dezelfde kleur kan doorlopen van wand naar plafond, zodat overkapping en huis één lijn houden. Vraag een staal van de kleur, of een offerte als u het plafond of de gevel wilt laten uitrekenen.",
    ],
  },
  {
    slug: "kerrafront-chalet",
    title: "Chalet in Kerrafront",
    date: "2026-06-14",
    brand: "Kerrafront",
    brandSlug: "kerrafront",
    color: "Houtlook",
    card: "Chalet in houtlook, antraciet kozijnen.",
    photos: [
      {
        src: "/projecten/kerrafront-chalet-gevel.webp",
        alt: "Chalet met Kerrafront gevelbekleding in houtlook en antraciet kozijnen",
        position: "center",
      },
      {
        src: "/projecten/kerrafront-chalet-zijgevel.webp",
        alt: "Zijgevel van een chalet in Kerrafront houtlook met een antraciet raam",
        position: "center",
      },
    ],
    paragraphs: [
      "Dit chalet is rondom vernieuwd met Kerrafront gevelbekleding. Kerrafront is een lijn van Milin. De gevel is houtlook. De kozijnen zijn antraciet. Levering en montage zijn door ons team gedaan.",
      "De nieuwe huid bestaat uit horizontale panelen met een zichtbare houtnerf en een egale kleur. Antraciet in de kozijnen zet daar een rustig contrast tegen. Het geheel oogt als hout, zonder dat u hoeft te schilderen.",
      "Kunststof gevelbekleding is onderhoudsarm. Vocht trekt niet in het paneel zoals in hout. U reinigt de gevel als hij vuil wordt. Een nieuwe verflaag hoort niet bij het onderhoud.",
      "Op de foto's ziet u de voorgevel en de zijgevel. De panelen lopen door langs de ramen. De antraciet kozijnen houden de lijnen van het chalet. Welk Kerrafront-profiel past, kiest u op de breedte en de naad die u zoekt. Dat staat op de merkpagina.",
      "Een staal laat de houtlook naast antraciet zien. Voor de hele gevel rekenen we een offerte, met montage als u die wilt.",
    ],
  },
  {
    slug: "vinyplus-quattro-turner-eiken",
    title: "Quattro in Turner eiken",
    date: "2026-06-10",
    brand: "VinyPlus",
    brandSlug: "vinyplus",
    color: "Turner eiken",
    card: "Zelf geplaatst, Turner eiken.",
    product: { brandSlug: "vinyplus", includes: ["quattro"] },
    photos: [
      {
        src: "/projecten/vinyplus-quattro-turner-eiken.webp",
        alt: "VinyPlus Quattro in Turner eiken, zelf geplaatst langs een raam en een houten deur",
        position: "center",
      },
    ],
    paragraphs: [
      "Deze gevel is door de klant zelf geplaatst. Het paneel is VinyPlus Quattro in Turner eiken. Wij leverden het materiaal. De montage deed de klant.",
      "Turner eiken is een warme houtlook. Quattro is breed, dus de gevel heeft weinig naden. Op de foto ziet u de panelen horizontaal, met de nerf in het zicht, langs een raam en een houten deur. Het kunststof sluit aan op bestaand houtwerk. De gevel zelf hoeft niet meer geschilderd te worden.",
      "Zelf monteren kan als de ondergrond recht is en u de profielen van het systeem aanhoudt. Start, hoek en eind horen bij het paneel. Die bestelt u mee, in dezelfde lijn. Het paneel is licht ten opzichte van hout. Achter de gevel blijft ventilatie nodig, zoals bij elke kunststof bekleding.",
      "Onderhoud blijft beperkt tot reinigen. Turner eiken vraagt geen beits. Wie de kleur eerst wil vergelijken, vraagt een staal. Wie de aantallen wil laten uitrekenen, vraagt een offerte. De plaatsing kunt u daarna zelf doen of uitbesteden.",
    ],
  },
  {
    slug: "vinyplus-turners-eiken-antraciet",
    title: "Turners eiken en antraciet",
    date: "2026-02-19",
    brand: "VinyPlus",
    brandSlug: "vinyplus",
    color: "Turners eiken",
    card: "Turners eiken met antraciet.",
    photos: [
      {
        src: "/projecten/vinyplus-turner-eiken-antraciet.webp",
        alt: "Woning met VinyPlus gevel in Turners eiken en een antraciet kader",
        position: "center",
      },
    ],
    paragraphs: [
      "Een gevel in VinyPlus Turners eiken, met antraciet in het kader. Het werk hoort bij nieuwbouw of renovatie. Beide komen voor: een nieuwe huid op een bestaand huis, of bekleding op een nieuw volume. Welke van de twee dit is, staat niet bij de foto. Het resultaat wel.",
      "Turners eiken geeft de wand een houttint. Antraciet maakt de lijnen hard en rustig. Samen is dat een combinatie die vaak terugkomt: warm paneel, koel accent. Het paneel is kunststof. Schilderen vervalt. Reinigen blijft.",
      "Op de foto staat het huis met de gevel in het zicht. Het antraciet is de tegenhanger van het eiken. U ziet het na de plaatsing, niet een los staal.",
      "VinyPlus levert deze folie op meerdere profielen. Welk profiel past, hangt af van de naad die u wilt en van de hulpstukken. Een staal van Turners eiken legt u naast antraciet. Een offerte rekent de gevel door, of het nu nieuwbouw is of een renovatie.",
    ],
  },
  {
    slug: "keralit-190mm-gevel-renovatie",
    title: "Gevel in Keralit 190 mm",
    date: "2026-01-30",
    brand: "Keralit",
    brandSlug: "keralit",
    color: "Houtlook",
    card: "Gevel vernieuwd in 190 mm.",
    product: { brandSlug: "keralit", includes: ["190"] },
    photos: [
      {
        src: "/projecten/keralit-190mm-gevel-renovatie.webp",
        alt: "Keralit gevelpaneel 190 mm in houtlook, detail na vernieuwing van de gevel",
        position: "center",
      },
    ],
    paragraphs: [
      "De gevel is vernieuwd met Keralit gevelpanelen van 190 mm. Het paneel is een breed sponningdeel in houtlook. De nerf is fijn, de kleur licht, de naad regelmatig.",
      "190 mm is een brede maat. Op een gevel betekent dat minder naden dan een smal deel. Het vlak oogt rustiger, zeker op een groot wanddeel. Keralit is stijf en kleurvast. Het onderhoud is reinigen, niet schilderen. Hout dat aan vervanging toe was, maakt zo plaats voor een gevel die niet elke paar jaar een nieuwe laag vraagt.",
      "De foto is een detail van de geplaatste panelen. U ziet de richting van de nerf en hoe de delen op elkaar aansluiten. Dat is het beeld na de vernieuwing.",
      "Keralit 190 mm zit in dezelfde lijn als de smallere sponningdelen. De hulpstukken horen bij die breedte. Vraag een staal als u de houtlook wilt zien, of een offerte als de hele gevel uitgerekend moet worden.",
    ],
  },
  {
    slug: "vinyplus-rondkant-overstek-entree",
    title: "Overstek in rondkantpaneel",
    date: "2026-01-08",
    brand: "VinyPlus",
    brandSlug: "vinyplus",
    color: "Turners eiken shadow",
    card: "Overstek bij de entree.",
    product: { brandSlug: "vinyplus", includes: ["rondkantpaneel"] },
    photos: [
      {
        src: "/projecten/vinyplus-rondkant-overstek-entree.webp",
        alt: "Overstek bij de entree in VinyPlus rondkantpaneel, Turners eiken shadow",
        position: "center 24%",
      },
    ],
    paragraphs: [
      "Het overstek boven deze entree is afgewerkt met VinyPlus rondkantpaneel in Turners eiken shadow. Shadow is de donkere, vergrijsde kant van die eikenfolie. Het paneel zit in het plafond boven de deur.",
      "Een overstek krijgt spatwater en schaduw. Hout vergrijst daar ongelijk en vraagt beits. Het rondkantpaneel blijft egaal. De ronde kant van het profiel maakt de naad zachter dan een scherpe sponning. Onder een entree, waar u van dichtbij kijkt, is dat een rustig plafond.",
      "Op de foto ziet u het overstek van onderen, met de panelen in de lengte en de voordeur eronder. Turners eiken shadow sluit aan op houttinten. Onderhoud is afnemen als stof of spinrag blijft hangen. Schilderen hoeft niet.",
      "Hetzelfde rondkantpaneel gebruiken we ook op de gevel. Wie plafond en wand in één folie wil, houdt Turners eiken shadow aan. Een staal laat de tint zien. Een offerte rekent het overstek of de gevel uit.",
    ],
  },
];

export function getProject(slug: string) {
  return projects.find((project) => project.slug === slug);
}

export function projectWordCount(project: Project) {
  return project.paragraphs.join(" ").split(/\s+/).filter(Boolean).length;
}
