import type { ReactNode } from "react";

export function MeasureFigures() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Figure title="Dagmaat, sparing, buitenwerks">
        <svg viewBox="0 0 220 140" className="h-auto w-full" role="img" aria-label="Doorsnede van muur, sparing en kozijn">
          <rect x="16" y="24" width="188" height="92" fill="#F4F2ED" stroke="#1B2838" />
          <rect x="48" y="40" width="124" height="60" fill="#FFFFFF" stroke="#1B2838" />
          <rect x="70" y="52" width="80" height="36" fill="#D7DEE4" stroke="#1B2838" />
          <text x="110" y="18" textAnchor="middle" fontSize="11" fontFamily="IBM Plex Mono, ui-monospace, monospace" fill="#1B2838">
            sparing
          </text>
          <text x="110" y="132" textAnchor="middle" fontSize="11" fontFamily="IBM Plex Mono, ui-monospace, monospace" fill="#1B2838">
            buitenwerks
          </text>
        </svg>
      </Figure>
      <Figure title="Drie breedtes, de kleinste telt">
        <svg viewBox="0 0 280 156" className="h-auto w-full" role="img" aria-label="Breedte boven, midden en onder">
          <rect x="128" y="18" width="132" height="120" fill="none" stroke="#1B2838" />
          <path d="M140 42 H248 M140 78 H248 M140 114 H248" stroke="#1B2838" />
          <path d="M140 38 V46 M248 38 V46 M140 74 V82 M248 74 V82 M140 110 V118 M248 110 V118" stroke="#1B2838" />
          <MeasureLabel x={8} y={46} width={96} text="boven" />
          <MeasureLabel x={8} y={82} width={96} text="midden" />
          <MeasureLabel x={8} y={118} width={96} text="onder" />
        </svg>
      </Figure>
      <Figure title="Diagonalen">
        <svg viewBox="0 0 220 140" className="h-auto w-full" role="img" aria-label="Twee diagonalen van de opening">
          <rect x="46" y="20" width="128" height="96" fill="none" stroke="#1B2838" />
          <path d="M52 26 L168 110 M168 26 L52 110" stroke="#1B2838" />
        </svg>
      </Figure>
      <Figure title="Deur en schuifpui">
        <svg viewBox="0 0 220 140" className="h-auto w-full" role="img" aria-label="Een draaiende deur naast een schuivende pui">
          <rect x="18" y="28" width="70" height="92" fill="none" stroke="#1B2838" />
          <path d="M24 116 L82 70 L24 36" fill="none" stroke="#1B2838" />
          <rect x="112" y="36" width="90" height="76" fill="none" stroke="#1B2838" />
          <path d="M124 74 H190" stroke="#1B2838" />
          <path d="M182 69 L190 74 L182 79" fill="none" stroke="#1B2838" />
        </svg>
      </Figure>
    </div>
  );
}

function MeasureLabel({ x, y, width, text }: { x: number; y: number; width: number; text: string }) {
  return (
    <g>
      <rect x={x} y={y - 13} width={width} height={18} fill="#FFFFFF" />
      <text
        x={x + 6}
        y={y}
        fontSize="11"
        fontFamily="IBM Plex Mono, ui-monospace, monospace"
        fill="#1B2838"
        stroke="#FFFFFF"
        strokeWidth="4"
        strokeLinejoin="round"
        paintOrder="stroke fill"
      >
        {text}
      </text>
    </g>
  );
}

function Figure({ title, children }: { title: string; children: ReactNode }) {
  return (
    <figure className="m-0 border border-kg-lijn bg-white p-4">
      {children}
      <figcaption className="mt-2 font-mono text-[12px] text-kg-text-2">{title}</figcaption>
    </figure>
  );
}

export function CornerFigures() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Figure title="Verstek, naad schuin">
        <svg viewBox="0 0 160 140" className="h-auto w-full" role="img" aria-label="Hoek op verstek, de naad loopt schuin">
          <path d="M28 24 H108 V44 H48 V116 H28 Z" fill="#F4F2ED" stroke="#1B2838" />
          <path d="M28 24 L48 44" stroke="#1B2838" />
        </svg>
      </Figure>
      <Figure title="HVL, naad recht">
        <svg viewBox="0 0 160 140" className="h-auto w-full" role="img" aria-label="HVL-hoek, de naad staat recht">
          <path d="M28 24 H108 V44 H28 Z" fill="#F4F2ED" stroke="#1B2838" />
          <path d="M28 44 H48 V116 H28 Z" fill="#F4F2ED" stroke="#1B2838" />
        </svg>
      </Figure>
    </div>
  );
}

export function DirectionFigures() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Figure title="Links, van buiten">
        <svg viewBox="0 0 160 140" className="h-auto w-full" role="img" aria-label="Scharnieren links, van buiten gezien">
          <rect x="30" y="16" width="100" height="108" fill="#F4F2ED" stroke="#1B2838" />
          <path d="M118 24 L42 70 L118 116" fill="none" stroke="#1B2838" />
        </svg>
      </Figure>
      <Figure title="Rechts, van buiten">
        <svg viewBox="0 0 160 140" className="h-auto w-full" role="img" aria-label="Scharnieren rechts, van buiten gezien">
          <rect x="30" y="16" width="100" height="108" fill="#F4F2ED" stroke="#1B2838" />
          <path d="M42 24 L118 70 L42 116" fill="none" stroke="#1B2838" />
        </svg>
      </Figure>
    </div>
  );
}
