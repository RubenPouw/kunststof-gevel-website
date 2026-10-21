import { colorById } from "@/lib/kozijnen/config";
import type { Layout } from "@/lib/kozijnen/layouts";
import { panesFor, type KozijnConfig } from "@/lib/kozijnen/model";

export function KozijnDrawing({
  layout,
  config,
  caption = true,
}: {
  layout: Layout;
  config: KozijnConfig;
  caption?: boolean;
}) {
  const panes = panesFor(layout, config);
  const padX = 46;
  const padY = 36;
  const maxW = 320;
  const maxH = 360;
  const scale = Math.min(maxW / Math.max(config.width, 1), maxH / Math.max(config.height, 1));
  const w = Math.max(72, config.width * scale);
  const h = Math.max(72, config.height * scale);
  const frame = Math.max(7, Math.min(w, h) * 0.055);
  const meeting = layout.meeting;
  const mullion = meeting ? 1.5 : Math.max(5, frame * 0.65);
  const gaps = Math.max(0, panes.length - 1);
  const innerW = w - frame * 2 - mullion * gaps;
  const innerH = h - frame * 2;
  const flex = panes.reduce((sum, pane) => sum + pane.flex, 0) || 1;
  const frameHex = colorById(config.frameOut).hex;
  const sashHex = colorById(config.sashOut).hex;
  const label = `${layout.title}, ${config.width} bij ${config.height} millimeter, van buiten gezien`;

  const paneBoxes = panes.reduce<
    { kind: (typeof panes)[number]["kind"]; flex: number; x: number; y: number; width: number; height: number }[]
  >((boxes, pane) => {
    const previous = boxes[boxes.length - 1];
    const x = previous ? previous.x + previous.width + mullion : frame;
    const width = (innerW * pane.flex) / flex;
    return [...boxes, { ...pane, x, y: frame, width, height: innerH }];
  }, []);

  return (
    <figure className="m-0">
      <svg
        viewBox={`0 0 ${w + padX * 2} ${h + padY * 2}`}
        className="mx-auto block h-auto max-h-[440px] w-auto max-w-full"
        role="img"
        aria-label={label}
      >
        <rect x={padX} y={padY} width={w} height={h} fill={frameHex} />
        {paneBoxes.map((pane, index) => {
          const open = pane.kind !== "vast";
          const inset = open ? Math.max(4, frame * 0.45) : 0;
          const gx = padX + pane.x + inset;
          const gy = padY + pane.y + inset;
          const gw = Math.max(4, pane.width - inset * 2);
          const gh = Math.max(4, pane.height - inset * 2);
          const hingeRight = hingeOnRight(layout, config, index, panes.length);
          const glass = glassRects(config.filling, pane.kind, gx, gy, gw, gh);
          return (
            <g key={`${pane.kind}-${index}`}>
              {open ? <rect x={padX + pane.x} y={padY + pane.y} width={pane.width} height={pane.height} fill={sashHex} /> : null}
              {glass.map((rect) => (
                <rect key={rect.key} x={rect.x} y={rect.y} width={rect.w} height={rect.h} fill={rect.fill} />
              ))}
              {pane.kind === "draai" || pane.kind === "draaikiep" || pane.kind === "deur" ? (
                <OpeningMark
                  x={gx}
                  y={gy}
                  w={gw}
                  h={gh}
                  hingeRight={hingeRight}
                  tilt={pane.kind === "draaikiep"}
                  outward={config.direction === "buiten"}
                />
              ) : null}
              {pane.kind === "schuif" ? <SlideMark x={gx} y={gy} w={gw} h={gh} toRight={!hingeRight} /> : null}
              {pane.kind === "deur" ? <Handle x={gx} y={gy} w={gw} h={gh} hingeRight={hingeRight} /> : null}
            </g>
          );
        })}
        <Dimension x1={padX} x2={padX + w} y={padY + h + 18} label={String(config.width)} />
        <Dimension x1={padY} x2={padY + h} y={18} label={String(config.height)} vertical />
      </svg>
      {caption ? (
        <figcaption className="mt-2 font-mono text-[12px] text-kg-text-2">Van buiten gezien · mm</figcaption>
      ) : null}
    </figure>
  );
}

function hingeOnRight(layout: Layout, config: KozijnConfig, index: number, count: number) {
  if (layout.slug === "draaikiepraam-met-vast-raam") return config.side === "rechts";
  if (layout.slug === "vast-draaikiep-vast") return true;
  if (layout.slug === "draaikiep-vast-draaikiep") return index === count - 1;
  if (layout.meeting) return config.active === "rechts" ? index === count - 1 : index === 0;
  if (layout.chooseSide) return config.side === "rechts";
  return index >= count / 2;
}

function glassRects(
  filling: KozijnConfig["filling"],
  kind: string,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  if (kind !== "deur" || filling === "glas") {
    return [{ key: "g", x, y, w, h, fill: "#D7DEE4" }];
  }
  if (filling === "paneel") {
    return [{ key: "p", x, y, w, h, fill: "#C9C4B8" }];
  }
  const split = h * 0.45;
  return [
    { key: "g", x, y, w, h: split, fill: "#D7DEE4" },
    { key: "p", x, y: y + split, w, h: h - split, fill: "#C9C4B8" },
  ];
}

function OpeningMark({
  x,
  y,
  w,
  h,
  hingeRight,
  tilt,
  outward,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  hingeRight: boolean;
  tilt: boolean;
  outward: boolean;
}) {
  const hingeX = hingeRight ? x + w : x;
  const openX = hingeRight ? x : x + w;
  const dash = outward ? "4 3" : undefined;
  return (
    <g fill="none" stroke="#1B2838" strokeWidth="1.25" strokeDasharray={dash}>
      <path d={`M ${openX} ${y} L ${hingeX} ${y + h / 2} L ${openX} ${y + h}`} />
      {tilt ? <path d={`M ${x} ${y + h} L ${x + w / 2} ${y} L ${x + w} ${y + h}`} /> : null}
    </g>
  );
}

function SlideMark({ x, y, w, h, toRight }: { x: number; y: number; w: number; h: number; toRight: boolean }) {
  const yMid = y + h / 2;
  const x1 = toRight ? x + w * 0.25 : x + w * 0.75;
  const x2 = toRight ? x + w * 0.75 : x + w * 0.25;
  return (
    <g fill="none" stroke="#1B2838" strokeWidth="1.25">
      <path d={`M ${x1} ${yMid} L ${x2} ${yMid}`} />
      <path d={toRight ? `M ${x2 - 8} ${yMid - 5} L ${x2} ${yMid} L ${x2 - 8} ${yMid + 5}` : `M ${x2 + 8} ${yMid - 5} L ${x2} ${yMid} L ${x2 + 8} ${yMid + 5}`} />
    </g>
  );
}

function Handle({ x, y, w, h, hingeRight }: { x: number; y: number; w: number; h: number; hingeRight: boolean }) {
  const hx = hingeRight ? x + 10 : x + w - 14;
  const hy = y + h * 0.48;
  return <rect x={hx} y={hy} width="4" height="22" fill="#1B2838" />;
}

function Dimension({
  x1,
  x2,
  y,
  label,
  vertical = false,
}: {
  x1: number;
  x2: number;
  y: number;
  label: string;
  vertical?: boolean;
}) {
  if (vertical) {
    const mid = (x1 + x2) / 2;
    return (
      <g fill="#1B2838" stroke="#1B2838" strokeWidth="1">
        <path d={`M ${y} ${x1} L ${y} ${x2}`} />
        <text
          x={y - 8}
          y={mid}
          fontFamily="IBM Plex Mono, ui-monospace, monospace"
          fontSize="11"
          fill="#1B2838"
          stroke="none"
          textAnchor="middle"
          transform={`rotate(-90 ${y - 8} ${mid})`}
        >
          {label}
        </text>
      </g>
    );
  }
  const mid = (x1 + x2) / 2;
  return (
    <g fill="none" stroke="#1B2838" strokeWidth="1">
      <path d={`M ${x1} ${y} L ${x2} ${y}`} />
      <text
        x={mid}
        y={y + 14}
        fontFamily="IBM Plex Mono, ui-monospace, monospace"
        fontSize="11"
        fill="#1B2838"
        stroke="none"
        textAnchor="middle"
      >
        {label}
      </text>
    </g>
  );
}
