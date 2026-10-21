export type Block = { heading: string; paragraphs: string[] };
export type Faq = { q: string; a: string };
export type LinkItem = { href: string; label: string };

export type Article = {
  slug: string;
  title: string;
  description: string;
  kicker: string;
  sections: Block[];
  faqs: Faq[];
  links: LinkItem[];
  howTo?: { name: string; text: string }[];
};

const sharedLinks: LinkItem[] = [
  { href: "/kunststof-kozijnen", label: "Alle kozijnen" },
  { href: "/gevelbekleding", label: "Gevelbekleding" },
  { href: "/dakranden", label: "Dakranden" },
  { href: "/kozijnafwerking", label: "Vensterbanken" },
  { href: "/staalaanvraag", label: "Kleurstalen gevel" },
];

export const articles: Article[] = [
  {
    slug: "hoe-moet-je-meten",
    title: "Hoe moet u een kozijn meten",
    description:
      "Stap voor stap de buitenwerkse maat opnemen: renovatie, nieuwbouw, dagmaat, sparing, stelkozijn, speling en haaksheid.",
    kicker: "Meten",
    howTo: [
      { name: "Kies renovatie of nieuwbouw", text: "Bij renovatie meet u het gat dat overblijft. Bij nieuwbouw meet u de sparing of het stelkozijn dat er al staat." },
      { name: "Meet de breedte op drie hoogtes", text: "Boven, midden en onder. Noteer millimeters. De kleinste maat is de maat die u doorgeeft." },
      { name: "Meet de hoogte op drie plekken", text: "Links, midden en rechts. Ook hier telt de kleinste maat." },
      { name: "Controleer de diagonalen", text: "Twee diagonalen. Een verschil groter dan een paar millimeter betekent dat het gat niet haaks is." },
      { name: "Noteer dorpel en aanslag", text: "Hoogte van de onderdorpel, en of het kozijn stomp in de opening valt of een aanslag heeft." },
      { name: "Houd speling aan", text: "Rondom een paar millimeter speling, zodat het kozijn te stellen is. De te bestellen maat is niet de kale dagmaat." },
    ],
    sections: [
      {
        heading: "Eerst weten wat u meet",
        paragraphs: [
          "Een kozijn bestelt u op de buitenwerkse maat: de buitenkant van het nieuwe kader, in millimeters. Dat is niet het glas, en niet de maat die u binnen op de vensterbank ziet.",
          "Renoveert u, dan haalt u het oude kozijn eruit of u laat het zitten als stelkozijn. Nieuwbouw heeft een sparing in de muur, soms al met een stelkozijn. Die twee situaties geeft u niet dezelfde millimeters.",
        ],
      },
      {
        heading: "Dagmaat, sparing en stelkozijn",
        paragraphs: [
          "De dagmaat is de vrije opening waar u doorheen kijkt, van binnenkant kader tot binnenkant kader. De sparing is het gat in de muur. Een stelkozijn is een vast kader in dat gat. Het nieuwe kozijn valt daarin, of ervoor.",
          "Meet u een bestaand houten kozijn dat blijft zitten, dan is dat uw stelkozijn. Meet de opening daarbinnen, niet de buitenmaat van het hout. Het nieuwe kozijn moet daarin passen, met speling.",
          "Haalt u het oude kozijn helemaal weg, meet dan de sparing in de muur. Metselwerk is zelden recht. Daarom meet u niet één keer.",
        ],
      },
      {
        heading: "Drie keer, en de kleinste aanhouden",
        paragraphs: [
          "Breedte: boven, op het midden en onder. Hoogte: links, op het midden en rechts. Zet alle zes de getallen op het formulier. De kleinste breedte en de kleinste hoogte zijn de maten voor de aanvraag.",
          "Een grotere maat past niet. Een iets kleinere maat stelt u met pur en band. Daarom wint de kleinste meting, niet het gemiddelde.",
        ],
      },
      {
        heading: "Speling per zijde",
        paragraphs: [
          "Tussen kozijn en stelkozijn of muur hoort speling, zodat u kunt stellen en kitten. Reken een paar millimeter per zijde, links, rechts, boven en onder. Die speling zit niet in de buitenwerkse maat die u bestelt. U trekt hem af van de kleinste gemeten opening.",
          "Hoeveel millimeter bij uw aansluiting hoort, hangt af van stelkozijn, aanslag en dorpel. Twijfelt u, stuur de zes maten en een foto mee. We rekenen de bestelmaat dan met u na. We noemen hier geen vaste aftrek alsof die voor elk huis geldt.",
        ],
      },
      {
        heading: "Haaksheid",
        paragraphs: [
          "Meet de twee diagonalen, van hoek tot hoek. Zijn ze gelijk, dan is de opening haaks. Loopt het verschil op, dan staat de opening scheef. Een kozijn is haaks. Het verschil vangt u op in de speling en in de afwerking, niet door het kozijn scheef te bestellen.",
          "Een groot verschil is een reden om te bellen voordat u bestelt. Soms moet de sparing eerst recht.",
        ],
      },
      {
        heading: "Dorpel en onderdorpel",
        paragraphs: [
          "De onderkant is de plek waar het misgaat. Meet tot op de dorpel die blijft, of tot de vloer als de dorpel mee vernieuwd wordt. Noteer het materiaal en de hoogte. Een lage dorpel bij een deur is een andere maat dan een doorlopend kader.",
          "Water moet naar buiten. Een dorpel die hoger is dan de vloer binnen houdt dat zo. Zet dat op de tekening, ook als u de exacte hoogte nog niet weet.",
        ],
      },
      {
        heading: "Schuifpui is geen deur",
        paragraphs: [
          "Een schuifpui is breder en heeft een andere onderdorpel dan een tuindeur. Meet de volle breedte van de opening, niet de breedte van één vleugel. De hoogte loopt van de dorpel tot de bovenkant van de sparing, op drie plekken.",
          "Een enkele deur meet u als één opening. Openslaande deuren zijn één kozijn met twee vleugels, dus ook één breedte en één hoogte, niet twee losse deuren opgeteld zonder de naad.",
        ],
      },
      {
        heading: "Fouten die we vaak zien",
        paragraphs: [
          "Alleen de dagmaat doorgeven, zonder speling. Eén meting in het midden, terwijl de bovenkant smaller is. De maat inclusief vensterbank. Binnenwerks en buitenwerks door elkaar. Een schuifpui meten alsof het twee ramen zijn.",
          "En de diagonaal overslaan. Een opening die niet haaks is, ziet u op de rolmaat pas als u beide hoeken meet.",
        ],
      },
    ],
    faqs: [
      {
        q: "Meet ik binnen of buiten?",
        a: "U meet de opening waar het nieuwe kozijn in komt. De bestelmaat is buitenwerks: de buitenkant van het kader. De tekening in de configurator is het aanzicht van buiten.",
      },
      {
        q: "Wat als de drie breedtes verschillen?",
        a: "Noteer ze alle drie. De kleinste gaat naar de aanvraag. Het verschil vangt de speling op.",
      },
      {
        q: "Kan ik een maat buiten de online grenzen aanvragen?",
        a: "Ja. De configurator waarschuwt. U verstuurt de aanvraag toch. We beoordelen die maat handmatig.",
      },
    ],
    links: sharedLinks,
  },
  {
    slug: "draairichting-en-aanslag",
    title: "Draairichting en aanslag",
    description: "Van buiten kijken: links of rechts, naar binnen of naar buiten, stomp of met aanslag.",
    kicker: "Richting",
    sections: [
      {
        heading: "U kijkt van buiten",
        paragraphs: [
          "In deze configurator staat u buiten, met het gezicht naar de gevel. Links is links vanaf die plek. De scharnieren zitten aan de kant die u kiest.",
          "Dat is bewust één afspraak. Een tekening van binnen geeft dezelfde deur de andere hand. Daarom staat het erbij op de tekening.",
        ],
      },
      {
        heading: "Naar binnen of naar buiten",
        paragraphs: [
          "Een raam draait in huis meestal naar binnen, zodat u het vanaf de ladder niet hoeft te wassen aan de buitenkant van de vleugel. Een tuindeur slaat vaak naar buiten, zodat de vleugel niet in de kamer staat.",
          "Beide kan. De keuze zit in de configurator en verandert de tekening. De scharnieren en de dichting volgen die keuze.",
        ],
      },
      {
        heading: "Stomp of aanslag",
        paragraphs: [
          "Stomp betekent dat het kozijn in de opening valt, zonder een lip die over de muur slaat. Met aanslag heeft het kader een rand die tegen de muur of het stelkozijn aankomt. Die rand zit in de buitenwerkse maat.",
          "Meet u een opening mét aanslag, dan is de maat inclusief die rand. Het artikel over meten zet de volgorde.",
        ],
      },
      {
        heading: "Stolp en loopdeur",
        paragraphs: [
          "Bij een stolpraam en bij openslaande deuren sluiten twee vleugels op elkaar. Er is geen vaste tussenstijl. Eén vleugel is de loopdeur: die opent u dagelijks. De andere zit vast met een sluiting en gaat open als u de volle breedte nodig hebt.",
        ],
      },
    ],
    faqs: [
      {
        q: "Waarom geen aparte pagina voor links en rechts?",
        a: "Het is dezelfde indeling. Links of rechts is een keuze in de configurator, geen tweede product.",
      },
      {
        q: "Wat is een aanslag waard in de maat?",
        a: "De aanslag hoort bij de buitenwerkse maat. Hoe diep het profiel is, publiceren we pas als EKO dat cijfer bevestigt.",
      },
    ],
    links: [
      { href: "/kunststof-kozijnen/kennisbank/hoe-moet-je-meten", label: "Meetinstructie" },
      ...sharedLinks,
    ],
  },
  {
    slug: "glas",
    title: "Glas: HR++, triple en veiligheidsglas",
    description: "Isolatieglas, gelaagd en gehard glas, en wanneer NEN 3569 veiligheidsglas vraagt.",
    kicker: "Glas",
    sections: [
      {
        heading: "HR++ en triple",
        paragraphs: [
          "HR++ is dubbel isolatieglas met een coating en een gasvulling. Triple heeft drie ruiten. Triple isoleert verder en dempt meer geluid, en het pakket is dikker en zwaarder.",
          "Of het EKO NL Profiel elk pakket pakt, bevestigen we bij de offerte. We zetten hier geen Ug-waarde neer zolang die niet vaststaat.",
        ],
      },
      {
        heading: "Gelaagd en gehard",
        paragraphs: [
          "Gelaagd glas heeft een folie tussen de ruiten. Breekt het, dan blijft de ruit in de folie hangen. Gehard glas springt in kleine korrels. Voor een deur of een lage ruit waar iemand tegenaan kan lopen, is gelaagd de keuze die de opening dicht houdt.",
          "Geluid lost u niet alleen op met een folie. Een zwaarder of asymmetrisch pakket dempt meer. Dat is een aparte glasopbouw. Vraag het erbij als de gevel aan een drukke weg staat. We noemen geen decibel alsof die voor elk pakket geldt.",
        ],
      },
      {
        heading: "NEN 3569",
        paragraphs: [
          "NEN 3569 beschrijft waar veiligheidsglas hoort, zodat een botsing geen snijwond geeft. Het gaat om plaatsen waar mensen het glas kunnen raken: deuren, zijlichten naast deuren, en glas dat laag in de wand begint.",
          "In de praktijk zetten we gelaagd glas voor als de onderkant van de ruit lager zit dan 85 cm vanaf de vloer, en bij deuren en schuifpuien aan beide kanten. De norm kijkt naar de hele situatie. Een tekenaar of de gemeente kan een zwaardere eis stellen. De configurator volgt uw antwoord op die 85 cm en legt de keuze vast in de aanvraag.",
        ],
      },
    ],
    faqs: [
      {
        q: "Is triple altijd beter?",
        a: "Niet in elk kozijn en niet voor elk huis. Het weegt meer en het profiel moet het pakket kunnen dragen. We bevestigen dat per aanvraag.",
      },
      {
        q: "Moet een vast raam boven 85 cm ook gelaagd?",
        a: "Meestal niet vanwege stootbelasting. Wel als het glas een andere risicoplaats is, bijvoorbeeld naast een deur. Zet het erbij in de opmerking.",
      },
    ],
    links: sharedLinks,
  },
  {
    slug: "ventilatie",
    title: "Ventilatie in het kozijn",
    description: "Roosters en de basis van het Bouwbesluit, zonder een verzonnen capaciteit.",
    kicker: "Lucht",
    sections: [
      {
        heading: "Waarom een rooster",
        paragraphs: [
          "Een nieuw kozijn sluit luchtdichter dan het hout dat eruit komt. De kamer heeft nog steeds verse lucht nodig. Een zelfregulerend rooster in het kader laat lucht toe en trekt dicht als de wind opsteekt.",
          "Het Bouwbesluit is opgegaan in het Besluit bouwwerken leefomgeving. De eis blijft: een verblijfsruimte moet verse lucht kunnen krijgen. Hoeveel, hangt af van de vloeroppervlakte en van het gebruik. Dat rekenen we niet in de configurator, omdat we de kamer niet kennen.",
        ],
      },
      {
        heading: "Waar het rooster zit",
        paragraphs: [
          "Meestal boven in het kozijn, over de breedte van een vak. Bij een draaikiep kan kiepen een deel van de lucht geven, maar een kiepstand is geen vervanging van de eis voor de hele ruimte. Een rooster blijft de rustige keuze voor de nacht.",
          "De kleur van het rooster volgt zo veel mogelijk het kozijn. De exacte typen en capaciteiten zetten we pas in de lijst als de leverancier ze bevestigt.",
        ],
      },
    ],
    faqs: [
      {
        q: "Kan ik het rooster weglaten?",
        a: "Ja, in de configurator. Doet u dat, dan hoort de ventilatie ergens anders vandaan te komen: een ander rooster, een klep, of een installatie. Dat is aan het ontwerp van de woning.",
      },
    ],
    links: sharedLinks,
  },
  {
    slug: "hang-en-sluitwerk",
    title: "Hang- en sluitwerk en inbraakwerendheid",
    description: "Wat RC2 en het Politiekeurmerk betekenen, en wat we standaard aanvragen.",
    kicker: "Beslag",
    sections: [
      {
        heading: "Wat erop zit",
        paragraphs: [
          "Een draaiend deel heeft scharnieren, een sluiting en een kruk. Een deur heeft daar een cilinder bij. Meerpuntsluiting trekt de vleugel op meerdere hoogtes in het kader.",
          "In de configurator staat het zwaardere beslag als vertrekpunt, richting weerstandsklasse RC2. RC2 komt uit NEN-EN 1627 en zegt iets over hoe lang een opportunistische inbraak wordt vertraagd. Het is een klasse van het element, niet een sticker die u los koopt.",
        ],
      },
      {
        heading: "PKVW en SKG",
        paragraphs: [
          "Het Politiekeurmerk Veilig Wonen kijkt naar de hele woning, niet alleen naar één raam. SKG-sterren horen bij cilinders en beslag. Een ster op een cilinder maakt het kozijn nog niet vanzelf een PKVW-element.",
          "Of het EKO NL Profiel een KOMO-, SKG- of PKVW-certificaat heeft, staat nog niet vast. We vragen het zwaardere beslag aan en zetten op de offerte wat er geleverd wordt. We tonen geen keurmerk dat we niet kunnen laten zien.",
        ],
      },
    ],
    faqs: [
      {
        q: "Zit de kruk erbij?",
        a: "Ja, de aanvraag bevat een kruk. Afsluitbaar is een keuze. De kleur van de kruk bevestigen we met het beslag.",
      },
      {
        q: "Is RC2 verplicht op de begane grond?",
        a: "Een verzekeraar of het Politiekeurmerk kan het eisen. De configurator zet het zwaardere beslag klaar. De certificaten bevestigen we per offerte.",
      },
    ],
    links: sharedLinks,
  },
  {
    slug: "profielen-en-kleuren",
    title: "Profiel en kleur",
    description: "Eén kunststof profiel, folie aan binnen- en buitenkant, en wat onderhoud daarvan vraagt.",
    kicker: "Profiel",
    sections: [
      {
        heading: "Eén profiel",
        paragraphs: [
          "U kiest geen merk. Elk kozijn in deze sectie is EKO NL Profiel. Dat houdt de tekening, het beslag en de offerte vergelijkbaar.",
          "Inbouwdiepte, aantal kamers en de Uw-waarde publiceren we pas als EKO die cijfers bevestigt. Tot die tijd staan ze niet op de pagina, ook niet als een richtgetal.",
        ],
      },
      {
        heading: "Kleur en folie",
        paragraphs: [
          "Wit is door-en-door of folie, afhankelijk van de uitvoering. Antraciet, zwart en houtlook zijn folie op het profiel. Binnen en buiten kunnen verschillen, en de vleugel kan anders zijn dan het kader.",
          "De lijst in de configurator is een richting, geen gesloten kleurenkaart. De foliecode bevestigen we op de offerte. Een staal van de gevelbekleding legt u ernaast. Zo ziet u of antraciet op de gevel dezelfde indruk geeft als antraciet op het kozijn.",
        ],
      },
      {
        heading: "Onderhoud",
        paragraphs: [
          "Kunststof schildert u niet. Een of twee keer per jaar afnemen met water en een mild middel houdt de folie en de rubbers schoon. Geen schuurmiddel, geen hogedruk op de rubbers.",
          "De rubbers en het beslag controleert u als u toch de ramen wast. Een druppel olie op de sluitpunten, als de leverancier dat voor dat beslag voorschrijft.",
        ],
      },
    ],
    faqs: [
      {
        q: "Kan de binnenkant wit blijven?",
        a: "Ja. Buiten een folie en binnen wit is een gewone combinatie. U zet beide kleuren apart.",
      },
    ],
    links: [
      { href: "/staalaanvraag", label: "Kleurstaal van de gevel" },
      { href: "/gevelbekleding", label: "Gevelbekleding" },
      ...sharedLinks,
    ],
  },
  {
    slug: "montage",
    title: "Plaatsen en het oude kozijn afvoeren",
    description: "Zelf plaatsen of laten doen, wat u nodig hebt, en wat er met het oude kozijn gebeurt.",
    kicker: "Plaatsing",
    sections: [
      {
        heading: "Zelf of laten doen",
        paragraphs: [
          "Een los kozijn leveren we. Plaatsen kan zelf, als u het stellen, het ankaren en het afdichten aandurft. Montage door ons loopt via een offerte, niet via deze configurator.",
          "Bij een schuifpui of een deur is het gewicht en de dorpel de reden om hulp te vragen. Een vast raam in een bestaande sparing is het meest overzichtelijk.",
        ],
      },
      {
        heading: "Wat u bij de hand hebt",
        paragraphs: [
          "Stelkozijn of ankers, stelschroeven, comprimatieband of purschuim dat bij de aansluiting hoort, een waterpas, wiggen en een kit die buiten mag. De schroeven in het metselwerk horen bij de muur, niet bij het glas.",
          "Het kozijn moet haaks en te lood staan voordat u fixeert. Een kier die u vol pur spuit, stelt u niet meer bij.",
        ],
      },
      {
        heading: "Het oude kozijn",
        paragraphs: [
          "Hout en glas gaan niet bij het huisvuil. Glas is apart, hout kan naar de milieustraat of met de montage mee. Zet in de aanvraag of het oude kozijn weg moet. We zetten geen tarief op deze pagina.",
        ],
      },
    ],
    faqs: [
      {
        q: "Leveren jullie het stelkozijn mee?",
        a: "Alleen als de offerte dat zegt. In de standaard aanvraag zit het nieuwe kozijn met glas, beslag en kruk. Ankers en stelkozijn zijn een vraag erbij.",
      },
    ],
    links: [
      { href: "/offerte", label: "Montage via offerte" },
      { href: "/contact", label: "Contact" },
      ...sharedLinks,
    ],
  },
  {
    slug: "subsidie-en-isolatie",
    title: "Subsidie en isolatie",
    description: "ISDE en isolatiewaarde, in algemene termen. Geen bedragen.",
    kicker: "Isolatie",
    sections: [
      {
        heading: "Wat isolatie hier betekent",
        paragraphs: [
          "Een kozijn verliest warmte via het glas en via het profiel. HR++ of triple verlaagt het verlies via het glas. Hoe ver, hangt af van het pakket en van het kader. De Uw-waarde van dit profiel publiceren we pas als EKO hem bevestigt.",
          "Kieren rond het oude hout zijn vaak een groter verlies dan de keuze tussen twee coatings. Stellen en afdichten hoort bij de winst.",
        ],
      },
      {
        heading: "ISDE",
        paragraphs: [
          "De ISDE is de landelijke subsidie voor isolatie. Glas en soms kozijnen kunnen daaronder vallen, met voorwaarden over de isolatiewaarde, de oppervlakte en het bestaande huis. Die voorwaarden wijzigt het Rijk. Kijk op de site van RVO voor het lopende jaar.",
          "We noemen hier geen eurobedrag en geen drempel. Een bedrag dat vorig jaar klopte, is dit jaar een leugen. Op de offerte kunnen we wel aangeven welk glas u aanvraagt, zodat u dat met de voorwaarden kunt vergelijken.",
        ],
      },
    ],
    faqs: [
      {
        q: "Regelen jullie de subsidie?",
        a: "Nee. U vraagt de subsidie zelf aan. Wij leveren de specificatie van het kozijn dat u bestelt, zodra die vaststaat.",
      },
    ],
    links: sharedLinks,
  },
  {
    slug: "levertijd-en-garantie",
    title: "Levertijd, levering en garantie",
    description: "Wat er al vaststaat, en wat nog op de offerte moet landen.",
    kicker: "Levering",
    sections: [
      {
        heading: "Wat we nu kunnen zeggen",
        paragraphs: [
          "U hoort op werkdagen binnen 24 uur iets terug op een aanvraag. De levertijd van het kozijn bevestigen we per offerte. Een kleur in folie kan langer duren dan wit. Hoeveel langer, zetten we er pas bij als EKO dat aantal dagen geeft.",
          "Levering is in overleg, in heel Nederland. Afhalen kan in de showroom in Utrecht, op afspraak. Verzendkosten hangen af van de maat en staan niet als vast tarief op deze site.",
        ],
      },
      {
        heading: "Garantie",
        paragraphs: [
          "De garantie op het kozijn, het glas en het beslag komt op de offerte te staan. We publiceren geen jaren zolang EKO die niet per onderdeel bevestigt.",
          "Op kleur van gevelbekleding geldt op deze site 10 jaar. Dat is een andere productgroep. Die termijn plakken we niet op het kozijn.",
        ],
      },
    ],
    faqs: [
      {
        q: "Kan ik de configuratie bewaren?",
        a: "De link in de adresbalk is de configuratie. U kunt hem kopiëren of meesturen. Op dit apparaat blijft een concept staan, tot u opnieuw begint.",
      },
    ],
    links: [
      { href: "/contact", label: "Contact" },
      { href: "/verzenden-retour", label: "Verzenden en retour" },
      ...sharedLinks,
    ],
  },
  {
    slug: "veelgestelde-vragen",
    title: "Vragen over kunststof kozijnen",
    description: "Antwoorden over meten, glas, kleur, plaatsing en de offerte.",
    kicker: "Vragen",
    sections: [
      {
        heading: "Kort",
        paragraphs: [
          "De lange uitleg staat in de artikelen hiernaast. Hier staan de vragen die we het vaakst krijgen, in hetzelfde Nederlands als de configurator.",
        ],
      },
    ],
    faqs: [
      {
        q: "Welk profiel leveren jullie?",
        a: "Alleen EKO NL Profiel. Er is geen merkmenu.",
      },
      {
        q: "Waarom zie ik geen prijs?",
        a: "De prijslijst van EKO is er nog niet. De configurator eindigt in een vrijblijvende offerte. We verzinnen geen bedrag.",
      },
      {
        q: "Moet ik een account aanmaken?",
        a: "Nee. De link deelt de configuratie. De aanvraag gaat met naam, mail en telefoon.",
      },
      {
        q: "Zit het glas erin?",
        a: "Ja. U kiest HR++ of triple, en of het gelaagd is. Het kozijn komt beglaasd, tenzij de offerte iets anders zegt.",
      },
      {
        q: "Kan ik binnen en buiten een andere kleur?",
        a: "Ja. Kozijn en vleugel ook apart. De folie bevestigen we op de offerte.",
      },
      {
        q: "Leveren jullie voordeuren met briefplaat?",
        a: "Nog niet in deze versie. Wel achterdeuren, tuindeuren en schuifpuien. Een voordeur vragen we via de gewone offerte.",
      },
      {
        q: "Plaatsen jullie ook?",
        a: "Montage loopt via een aparte offerte. In de configurator stelt u het kozijn samen.",
      },
      {
        q: "Hoe meet ik?",
        a: "Buitenwerks, drie breedtes en drie hoogtes, de kleinste aanhouden, plus de diagonalen. De meetinstructie zet het stap voor stap.",
      },
    ],
    links: [
      { href: "/kunststof-kozijnen/kennisbank/hoe-moet-je-meten", label: "Meetinstructie" },
      ...sharedLinks,
    ],
  },
];

export function getArticle(slug: string) {
  return articles.find((article) => article.slug === slug) ?? null;
}
