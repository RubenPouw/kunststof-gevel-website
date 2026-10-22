import { PROFILE } from "./config";
import type { KozijnGroup, Layout } from "./layouts";

export type CopyBlock = { heading: string; paragraphs: string[] };
export type CopyFaq = { q: string; a: string };

export const hubCopy = {
  title: "Kunststof kozijnen op maat",
  description:
    `Kunststof ramen, schuifpuien en deuren in ${PROFILE.name}. Zelf samenstellen en een vrijblijvende offerte aanvragen, zonder account.`,
  lead: `Eén profiel: ${PROFILE.name}. U stelt het kozijn samen op buitenwerkse maat. Een prijs tonen we pas als de inkoopbedragen er zijn. Tot die tijd eindigt de configurator in een vrijblijvende offerte.`,
  sections: [
    {
      heading: "Waarom één profiel",
      paragraphs: [
        `Een kozijn kiezen begint bij de opening, niet bij een lijst merken. ${PROFILE.name} is het kader dat we hier voeren. Daarmee blijven glas, beslag en kleur vergelijkbaar tussen een draaikiepraam en een schuifpui.`,
        "Technische cijfers zoals inbouwdiepte, kamers en Uw-waarde zetten we op deze pagina zodra de leverancier ze bevestigt. Een getal dat we nog niet hebben, laten we weg.",
      ],
    },
    {
      heading: "Samen met de gevel",
      paragraphs: [
        "Antraciet op het kozijn en antraciet op de gevel zijn niet vanzelf dezelfde folie. Bestel een kleurstaal van de gevelbekleding en leg die naast de kozijnkleur in de aanvraag. Dakrand en vensterbank lopen in dezelfde lijn mee.",
        "Het kozijn, de bank en de gevel hoeven niet in één winkelwagen. Ze kunnen wel in één gesprek, met dezelfde kleur als vertrekpunt.",
      ],
    },
    {
      heading: "Van maat tot offerte",
      paragraphs: [
        "U vult de buitenwerkse breedte en hoogte in. De configurator zegt meteen of die maat binnen de online grenzen valt. Daarbuiten versturen we de aanvraag nog steeds, en beoordelen we hem handmatig.",
        "Daarna indeling, hoek, kleur binnen en buiten, glas, ventilatie, dorpel en beslag. De tekening schaalt mee. De link in de adresbalk is te delen. Een account is niet nodig.",
      ],
    },
  ] as CopyBlock[],
  faqs: [
    {
      q: "Kan ik een kozijn direct betalen?",
      a: "Nog niet. De checkout via een Shopify-conceptbestelling is voorbereid en staat uit. U vraagt een vrijblijvende offerte aan.",
    },
    {
      q: "Welke indelingen zitten erin?",
      a: "Vaste ramen, draairamen, draaikiepramen en combinaties. Schuifpuien in twee of vier delen. Achterdeuren en tuindeuren, enkel en dubbel.",
    },
    {
      q: "Meten jullie in?",
      a: "U meet zelf met de meetinstructie, of u zet in de aanvraag dat u een opname wilt. Montage is een aparte offerte.",
    },
    {
      q: "Staat er hang- en sluitwerk op?",
      a: "Ja. We vragen standaard het zwaardere beslag aan. Een keurmerk zetten we er pas bij als de leverancier dat voor dit profiel bevestigt.",
    },
  ] as CopyFaq[],
};

export const groupCopy: Record<KozijnGroup, { title: string; description: string; lead: string; sections: CopyBlock[]; faqs: CopyFaq[] }> = {
  ramen: {
    title: "Kunststof ramen op maat",
    description: `Vaste ramen, draairamen, draaikiepramen en combinaties in ${PROFILE.name}. Links of rechts is een keuze, geen aparte pagina.`,
    lead: "Een raam is een vak of een reeks vakken in één kader. U kiest de indeling, daarna de maat. U kijkt van buiten: links is de scharnierzijde links. Het raam draait naar binnen.",
    sections: [
      {
        heading: "Vast, draai of draaikiep",
        paragraphs: [
          "Een vast vak geeft licht en gaat niet open. Een draairaam opent volledig. Een draaikiepraam doet beide: wassen in de draaistand, luchten op kiep.",
          "Combinaties zetten een draaideel naast vast glas. Zo ventileert u één vak en houdt u de rest dicht. Links of rechts is dezelfde pagina.",
        ],
      },
      {
        heading: "Stolp",
        paragraphs: [
          "Een stolpraam heeft twee vleugels die op elkaar sluiten. Er zit geen vaste tussenstijl in het zicht. Eén vleugel is de loopvleugel. De andere opent u als u de volle breedte wilt.",
        ],
      },
    ],
    faqs: [
      {
        q: "Wat is het verschil tussen een draairaam en een draaikiepraam?",
        a: "Een draairaam heeft alleen de draaistand. Een draaikiepraam kiept ook. Het beslag verschilt, de opening in de muur niet.",
      },
      {
        q: "Kan ik drie vakken in één kozijn?",
        a: "Ja. Vast met draaikiep in het midden, of twee draaikiepramen met vast glas ertussen. Elke indeling heeft een eigen pagina.",
      },
    ],
  },
  schuifpuien: {
    title: "Kunststof schuifpuien",
    description: `Schuifpuien in twee of vier delen, in ${PROFILE.name}. Gelaagd glas staat standaard aan.`,
    lead: "Een schuifpui schuift opzij in plaats van de kamer in. Twee delen voor een gewone pui, vier delen als de opening breed is.",
    sections: [
      {
        heading: "Twee of vier",
        paragraphs: [
          "Bij twee delen schuift één vleugel voor de andere. Bij vier delen verdeelt u de breedte. Welk deel beweegt, kiest u in de configurator. De tekening toont dat van buiten.",
        ],
      },
      {
        heading: "Glas en dorpel",
        paragraphs: [
          "Een pui is een deur die mensen raken. Daarom staat gelaagd glas aan beide kanten als voorstel. De onderdorpel is laag, zodat de stap naar buiten klein blijft. De exacte dorpelhoogte publiceren we pas als de leverancier die bevestigt.",
        ],
      },
    ],
    faqs: [
      {
        q: "Is een schuifpui hetzelfde als openslaande deuren?",
        a: "Nee. Openslaande deuren draaien. Een schuifpui rijdt. De sparing lijkt op elkaar, het beslag en de dorpel niet.",
      },
      {
        q: "Hoe breed kan vierdelig?",
        a: "Online vragen we vierdelig aan tussen de grenzen die op de maatstap staan. Daarbuiten beoordelen we de maat handmatig.",
      },
    ],
  },
  deuren: {
    title: "Kunststof achterdeuren en tuindeuren",
    description: `Enkele en dubbele achterdeuren en tuindeuren in ${PROFILE.name}. Paneel, half glas of vol glas.`,
    lead: "Een deur in hetzelfde profiel als het raam ernaast. Enkel of dubbel, met een vulling die u kiest.",
    sections: [
      {
        heading: "Achterdeur en tuindeur",
        paragraphs: [
          "De achterdeur is de dagelijkse deur, vaak met een paneel of een glasstrook. De tuindeur is de deur naar het terras, meestal met meer glas. Beide kunnen enkel of als paar. Of de vleugel naar binnen of naar buiten draait, kiest u zelf.",
        ],
      },
      {
        heading: "Naar binnen of naar buiten",
        paragraphs: [
          "Een achterdeur draait vaak naar binnen. Een tuindeur slaat vaak naar buiten, zodat de vleugel de keuken niet in komt. U zet de richting vast terwijl u van buiten naar de gevel kijkt.",
        ],
      },
    ],
    faqs: [
      {
        q: "Zit de cilinder erbij?",
        a: "De aanvraag bevat meerpuntsluiting en een cilinder. Welk type, bevestigen we op de offerte. We beloven geen sterren die nog niet vaststaan.",
      },
      {
        q: "Kan de vulling half glas zijn?",
        a: "Ja. Paneel, half glas of vol glas. Bij half glas geldt dezelfde vraag over gelaagd glas onder 85 cm.",
      },
    ],
  },
};

const layoutBody: Record<string, { paragraphs: string[]; faqs: CopyFaq[] }> = {
  "vast-raam": {
    paragraphs: [
      "Een vast raam heeft geen scharnier en geen kruk. Het kader draagt alleen het glas. Dat houdt de lijn van de gevel rustig en het onderhoud klein.",
      "Gebruik het waar u licht wilt en geen ventilatie via dat vak: naast een deur, in een trapgat, of als zijlicht. Ventilatie regelt u dan in een ander vak of met een rooster.",
      "De maat is buitenwerks. Onder de 85 cm vanaf de vloer zetten we gelaagd glas voor, omdat iemand het glas kan raken.",
    ],
    faqs: [
      { q: "Kan een vast raam later alsnog open?", a: "Niet door een kruk toe te voegen. De indeling is een ander kozijn. Kies dan een draaikiepraam of een combinatie." },
      { q: "Zit er een kruk bij?", a: "Nee. Er is geen draaiend deel. Wel glas, kader en de kleur die u kiest." },
    ],
  },
  draairaam: {
    paragraphs: [
      "Een draairaam opent helemaal, naar binnen of naar buiten. Er is geen kiepstand. Dat is genoeg voor een berging, een slaapkamer die u volledig wilt openzetten, of een raam dat u alleen wast op de draai.",
      "De scharnierzijde kiest u van buitenaf. Links betekent scharnieren aan de linkerkant als u voor de gevel staat.",
    ],
    faqs: [
      { q: "Waarom geen kiep?", a: "Dat is het draaikiepraam. Dezelfde opening, ander beslag. U stapt daar in één pagina naartoe." },
      { q: "Naar welke kant slaat hij veilig open?", a: "Naar binnen blijft de vleugel uit de wind en uit de loop op de stoep. Naar buiten kan, als er ruimte is." },
    ],
  },
  draaikiepraam: {
    paragraphs: [
      "Dit is het raam dat de meeste kamers nodig hebben. Op kiep lucht u zonder de vleugel in de kamer, op draai wast u de buitenkant vanaf binnen.",
      "Eén vak, één kruk, één scharnierzijde. De online maatgrenzen staan op de eerste stap. Een groter gat wordt een combinatie of een handmatige aanvraag.",
    ],
    faqs: [
      { q: "Kan ik hem op de badkamer zetten?", a: "Ja. Kies dan meteen of het glas mat moet. Mat glas zet u in de opmerking. De glasstap kiest isolatie en gelaagdheid." },
      { q: "Welk beslag staat erop?", a: "Standaard het zwaardere beslag. De certificaten bevestigen we op de offerte." },
    ],
  },
  "draaikiepraam-met-vast-raam": {
    paragraphs: [
      "Twee vakken in één kader. Het ene draait en kiept, het andere blijft dicht. Zo houdt u een brede raamopening zonder twee kozijnen naast elkaar te stellen.",
      "Het draaideel zet u links of rechts. Dat is een optie, geen tweede URL. De tekening wisselt mee, gezien van buiten.",
    ],
    faqs: [
      { q: "Zijn de vakken even breed?", a: "In de tekening wel. Een andere verdeling zet u in de opmerking. We bevestigen of het profiel die stijlpositie pakt." },
      { q: "Telt dit als één kozijn?", a: "Ja. Eén buitenwerkse breedte en één hoogte voor het hele kader." },
    ],
  },
  "vast-draaikiep-vast": {
    paragraphs: [
      "Drie vakken, het draaideel in het midden. Links en rechts blijft het glas dicht. Dat past bij een brede gevel waar u in het midden wilt luchten en wassen.",
      "De scharnierzijde van het middelste deel volgt de tekening. U kiest of dat deel naar binnen of naar buiten draait.",
    ],
    faqs: [
      { q: "Kan het middelste deel smaller?", a: "De tekening verdeelt gelijkelijk. Een vaste vleugelmaat noteert u bij de aanvraag." },
      { q: "Moet elk vak een rooster?", a: "Nee. Eén rooster in het kader is meestal genoeg. De capaciteit hangt af van de kamer, niet van het aantal vakken." },
    ],
  },
  "draaikiep-vast-draaikiep": {
    paragraphs: [
      "Links en rechts een draaikiepraam, vast glas ertussen. U lucht aan twee kanten en houdt het midden dicht. Handig naast een keukenblad of boven een vensterbank die vrij moet blijven.",
      "Eén van de twee is de hoofdvleugel in de aanvraag. Beide kunnen open.",
    ],
    faqs: [
      { q: "Zitten er twee krukken op?", a: "Ja. Elk draaiend vak heeft een kruk. Het vaste vak niet." },
      { q: "Is dit een stolp?", a: "Nee. Hier zit vast glas tussen de vleugels, met stijlen. Een stolp sluit vleugel op vleugel." },
    ],
  },
  stolpraam: {
    paragraphs: [
      "Twee vleugels, geen vaste tussenstijl. Dicht is het één glasvlak met een naad. Open is het de volle breedte. Eén vleugel gebruikt u dagelijks, de andere zet u vast met de sluiting.",
      "Een stolp is hoger en breder dan een enkel draaikiepraam. De online grenzen staan op de maatstap. Daarbuiten kijken we handmatig.",
    ],
    faqs: [
      { q: "Welke vleugel gaat het eerst open?", a: "De loopvleugel, links of rechts van buiten gezien. De andere is de standvleugel." },
      { q: "Kan een stolp op kiep?", a: "De loopvleugel wel, als draaikiep. De standvleugel opent u als draai wanneer beide vrij zijn." },
    ],
  },
  "schuifpui-2-delig": {
    paragraphs: [
      "Eén deel schuift, één deel blijft staan. Het schuivende deel kiest u links of rechts, van buitenaf. De vleugel rijdt voor het vaste deel langs.",
      "Gelaagd glas staat aan beide kanten aan. Een pui is een deur. De dorpel zetten we laag, zodat de stap naar buiten klein is.",
    ],
    faqs: [
      { q: "Schuift hij naar binnen of naar buiten?", a: "Het vlak schuift evenwijdig aan de gevel, niet de kamer in. Bediening is aan de binnenzijde, tenzij u in de opmerking ook een greep buiten vraagt." },
      { q: "Zit er een hor in?", a: "Een plisséhor of inzethor is een keuze op de laatste stappen. Niet elke maat pakt elke hor. We bevestigen dat." },
    ],
  },
  "schuifpui-4-delig": {
    paragraphs: [
      "Vier vakken over een brede opening. In de tekening schuiven twee delen aan de kant die u actief noemt. De andere twee blijven in de basis vast. Een andere verdeling schrijft u in de opmerking.",
      "Vier delen zijn zwaar en vragen een rechte dorpel. Meet de volle breedte, niet de breedte van één vak. De meetinstructie zet het verschil met een deur.",
    ],
    faqs: [
      { q: "Schuift de pui de kamer in?", a: "Nee. Het vlak blijft in de gevel en rijdt opzij. U kiest welk deel beweegt, van buiten gezien." },
      { q: "Hoe meet ik vier delen?", a: "Eén breedte en één hoogte voor het hele kader. Drie breedtes, drie hoogtes, de kleinste aanhouden." },
    ],
  },
  achterdeur: {
    paragraphs: [
      "Een enkele achterdeur in hetzelfde profiel als de ramen. Kies een dicht paneel, half glas of vol glas. De scharnieren zitten links of rechts, van buiten gezien.",
      "Standaard draait hij naar binnen. Naar buiten kan, als de stoep of het pad dat toelaat. Gelaagd glas staat aan, omdat een deur in de loop zit.",
    ],
    faqs: [
      { q: "Kan de deur naar buiten?", a: "Ja. Een achterdeur staat standaard naar binnen. U zet de richting om in de configurator." },
      { q: "Welke dorpel?", a: "Een lage dorpel als vertrekpunt. Een doorlopend kader kan ook, als de waterkering dat vraagt." },
    ],
  },
  "dubbele-achterdeur": {
    paragraphs: [
      "Twee deuren in één kader, vleugel op vleugel. Eén is de loopdeur met de kruk, de andere opent u als de opening breed moet. Paneel, half glas of vol glas geldt voor beide, tenzij u in de opmerking splitst.",
      "Meet één breedte. Tel niet twee deuren op en vergeet de naad.",
    ],
    faqs: [
      { q: "Kunnen beide deuren een eigen cilinder?", a: "De loopdeur heeft de cilinder. De standdeur sluit met de sluitkommen. Een tweede cilinder vraagt u in de opmerking." },
      { q: "Draaien ze naar buiten?", a: "Dat kiest u. Van buiten gezien blijft links links." },
    ],
  },
  tuindeur: {
    paragraphs: [
      "Een enkele tuindeur, standaard met vol glas en een draairichting naar buiten. Half glas of een paneel kan ook, als de gevel meer dicht vlak nodig heeft.",
      "Zet hem in lijn met de gevelbekleding. Een staal van het paneel naast de folie van de deur voorkomt twee antracieten die niet bij elkaar horen.",
    ],
    faqs: [
      { q: "Is een tuindeur een achterdeur?", a: "Zelfde profiel, andere gewoonte. De tuindeur heeft hier vol glas als eerste vulling en draait standaard naar buiten. U wijzigt beide." },
      { q: "Hoe laag is de dorpel?", a: "Laag, als voorstel. De millimeterhoogte publiceren we pas als de leverancier die bevestigt." },
    ],
  },
  "openslaande-tuindeuren": {
    paragraphs: [
      "Twee deuren die open slaan, zonder vaste tussenstijl. Open is het terras één opening. Dicht blijft een naad in het midden. De loopdeur kiest u links of rechts.",
      "Standaard naar buiten, vol glas, gelaagd aan beide kanten. Een hor is een plissé over de opening, als de maat dat toelaat.",
    ],
    faqs: [
      { q: "Blijft de standdeur op slot?", a: "Ja, tot u hem opent. Dagelijks gebruikt u de loopdeur." },
      { q: "Verschilt dit van een vierdelige schuifpui?", a: "Ja. Deze deuren draaien en vragen ruimte op het terras of in de kamer. Een schuifpui blijft in het vlak." },
    ],
  },
};

export function layoutCopy(layout: Layout) {
  return layoutBody[layout.slug];
}
