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
        <svg viewBox="0 0 220 140" className="h-auto w-full" role="img" aria-label="Breedte boven, midden en onder">
          <rect x="50" y="18" width="120" height="100" fill="none" stroke="#1B2838" />
          <path d="M58 36 H162 M54 68 H166 M60 100 H158" stroke="#1B2838" />
          <text x="18" y="40" fontSize="11" fontFamily="IBM Plex Mono, ui-monospace, monospace" fill="#1B2838">boven</text>
          <text x="18" y="72" fontSize="11" fontFamily="IBM Plex Mono, ui-monospace, monospace" fill="#1B2838">midden</text>
          <text x="18" y="104" fontSize="11" fontFamily="IBM Plex Mono, ui-monospace, monospace" fill="#1B2838">onder</text>
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

function Figure({ title, children }: { title: string; children: ReactNode }) {
  return (
    <figure className="m-0 border border-kg-lijn bg-white p-4">
      {children}
      <figcaption className="mt-2 font-mono text-[12px] text-kg-text-2">{title}</figcaption>
    </figure>
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
